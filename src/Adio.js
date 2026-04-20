import { globSync, glob } from "glob";
import path from "node:path";
import { cpus } from "node:os";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { readFile } from "node:fs/promises";
import { extractDepsFromPackageJson, isIgnoredDep } from "./utils/testPackage.js";
import extractSrcDeps from "./utils/extractSrcDeps.js";

const WORKER_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "utils/parseWorker.js");
const WORKER_COUNT = Math.min(cpus().length, 8);

function runWorker(paths) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(WORKER_PATH, { workerData: { paths } });
        worker.on("message", resolve);
        worker.on("error", reject);
    });
}

async function loadLocalAdioRc(dir, packageJson) {
    if (packageJson.adio) return packageJson.adio;

    for (const filename of [".adiorc.js", ".adiorc.json"]) {
        const filepath = path.join(dir, filename);
        try {
            if (filename.endsWith(".js")) {
                return (await import(filepath)).default;
            }
            return JSON.parse(await readFile(filepath, "utf8"));
        } catch {}
    }
    return null;
}

function isIgnoredPath({ filePath, instance, adioRc }) {
    const dirs = [...(instance?.config?.ignoreDirs || []), ...(adioRc?.ignoreDirs || [])];
    return dirs.some(dir => filePath.includes(dir));
}

function buildErrors({ packageJson, dir, srcDeps, packageJsonDeps, adioRc, instance }) {
    const errors = {
        count: 0,
        deps: {
            src: srcDeps.filter(dep => {
                if (dep === packageJson.name) return false;
                if (
                    packageJsonDeps.dependencies.includes(dep) ||
                    packageJsonDeps.devDependencies.includes(dep) ||
                    packageJsonDeps.peerDependencies.includes(dep)
                )
                    return false;
                return !isIgnoredDep({ type: "src", instance, adioRc, dep });
            }),
            dependencies: packageJsonDeps.dependencies.filter(dep => {
                if (srcDeps.includes(dep)) return false;
                return !isIgnoredDep({ type: "dependencies", instance, adioRc, dep });
            }),
            devDependencies: packageJsonDeps.devDependencies.filter(dep => {
                if (srcDeps.includes(dep)) return false;
                return !isIgnoredDep({ type: "devDependencies", instance, adioRc, dep });
            }),
            peerDependencies: packageJsonDeps.peerDependencies.filter(dep => {
                if (srcDeps.includes(dep)) return false;
                return !isIgnoredDep({ type: "peerDependencies", instance, adioRc, dep });
            })
        }
    };
    errors.count =
        errors.deps.src.length +
        errors.deps.dependencies.length +
        errors.deps.devDependencies.length +
        errors.deps.peerDependencies.length;
    return { packageJson, dir, errors };
}

export class Adio {
    constructor(config) {
        this.config = { ignoreDirs: ["node_modules"], cwd: process.cwd(), ...config };
    }

    async test() {
        const { ignoreDirs } = this.config;

        const normalizedPackagesList = this.__normalizePackagesList();
        const packages = [];
        normalizedPackagesList.forEach(dir => {
            globSync(dir, { cwd: this.config.cwd, ignore: ignoreDirs }).forEach(packageJsonDir => {
                packages.push(path.join(this.config.cwd, packageJsonDir));
            });
        });
        packages.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        if (packages.length === 0) {
            throw new Error(`No packages detected.
Did you specify the correct path via the --package or --packages params?
For example: adio --package=src/my-package
Hint: you can also specify these params via the .adiorc.js config or package.json.`);
        }

        // Phase 1: read all package.json + configs + glob source files in parallel
        const packageData = await Promise.all(
            packages.map(async dir => {
                let packageJson;
                try {
                    packageJson = JSON.parse(
                        await readFile(path.join(dir, "package.json"), "utf8")
                    );
                } catch (e) {
                    if (e instanceof SyntaxError)
                        throw Error(`Could not parse package.json located at ${dir}.`);
                    throw Error(`Could not open package.json located at ${dir}.`);
                }
                const adioRc = await loadLocalAdioRc(dir, packageJson);
                const hasCustomTraverse = !!(adioRc?.traverse ?? this.config.traverse);
                const paths = hasCustomTraverse
                    ? []
                    : (await glob(dir + "/**/*.{js,ts,tsx}")).filter(
                          filePath => !isIgnoredPath({ filePath, instance: this, adioRc })
                      );
                return { dir, packageJson, adioRc, paths, hasCustomTraverse };
            })
        );

        // Phase 2: dispatch all files to workers in one batch
        const allPaths = packageData.flatMap(p => p.paths);
        const chunkSize = Math.ceil(allPaths.length / WORKER_COUNT);
        const chunks = Array.from({ length: WORKER_COUNT }, (_, i) =>
            allPaths.slice(i * chunkSize, (i + 1) * chunkSize)
        ).filter(c => c.length > 0);

        const workerResults = await Promise.all(chunks.map(runWorker));

        // Build path → deps map from worker results
        const pathToDeps = new Map();
        let idx = 0;
        for (const chunkResult of workerResults) {
            for (const deps of chunkResult) {
                pathToDeps.set(allPaths[idx++], deps);
            }
        }

        // Phase 3: for packages with custom traverse, fall back to main thread
        const fallbackPackages = packageData.filter(p => p.hasCustomTraverse);
        if (fallbackPackages.length > 0) {
            await Promise.all(
                fallbackPackages.map(async p => {
                    const deps = await extractSrcDeps({
                        dir: p.dir,
                        adioRc: p.adioRc,
                        instance: this
                    });
                    // Store as pre-computed srcDeps
                    p.srcDeps = deps;
                })
            );
        }

        // Phase 4: aggregate deps per package and build results
        return packageData.map(
            ({ dir, packageJson, adioRc, paths, hasCustomTraverse, srcDeps }) => {
                let finalSrcDeps;
                if (hasCustomTraverse) {
                    finalSrcDeps = srcDeps || [];
                } else {
                    const seen = new Set();
                    finalSrcDeps = [];
                    for (const p of paths) {
                        for (const dep of pathToDeps.get(p) || []) {
                            if (!seen.has(dep)) {
                                seen.add(dep);
                                finalSrcDeps.push(dep);
                            }
                        }
                    }
                    finalSrcDeps.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
                }

                return buildErrors({
                    packageJson,
                    dir,
                    srcDeps: finalSrcDeps,
                    packageJsonDeps: extractDepsFromPackageJson(packageJson),
                    adioRc,
                    instance: this
                });
            }
        );
    }

    async testPackage(dir) {
        let packageJson;
        try {
            packageJson = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
        } catch (e) {
            if (e instanceof SyntaxError)
                throw Error(`Could not parse package.json located at ${dir}.`);
            throw Error(`Could not open package.json located at ${dir}.`);
        }

        const adioRc = await loadLocalAdioRc(dir, packageJson);

        const srcDeps = await extractSrcDeps({ dir, adioRc, instance: this });

        return buildErrors({
            packageJson,
            dir,
            srcDeps,
            packageJsonDeps: extractDepsFromPackageJson(packageJson),
            adioRc,
            instance: this
        });
    }

    __normalizePackagesList() {
        const normalizedPackagesList = [];
        const { package: singlePackage, packages: multiplePackages } = this.config;

        if (typeof singlePackage === "string") {
            normalizedPackagesList.push(singlePackage);
        } else if (Array.isArray(singlePackage)) {
            normalizedPackagesList.push(...singlePackage);
        }

        if (typeof multiplePackages === "string") {
            !normalizedPackagesList.includes(multiplePackages) &&
                normalizedPackagesList.push(multiplePackages);
        } else if (Array.isArray(multiplePackages)) {
            multiplePackages.forEach(item => {
                !normalizedPackagesList.includes(item) && normalizedPackagesList.push(item);
            });
        }

        return normalizedPackagesList;
    }
}
