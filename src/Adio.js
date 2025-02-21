import glob from "glob";
import path from "path";
import { cosmiconfig } from "cosmiconfig";
import fs from "fs";
import { extractDepsFromPackageJson, isIgnoredDep } from "./utils/testPackage.js";
import extractSrcDeps from "./utils/extractSrcDeps.js";

const explorer = cosmiconfig("adio");

export class Adio {
    constructor(config) {
        this.config = { ignoreDirs: ["node_modules"], cwd: process.cwd(), ...config };
    }

    async test() {
        const { ignoreDirs } = this.config;

        const normalizedPackagesList = this.__normalizePackagesList();
        const packages = [];
        normalizedPackagesList.forEach(dir => {
            glob.sync(dir, {
                cwd: this.config.cwd,
                ignore: ignoreDirs
            }).forEach(packageJsonDir => {
                packages.push(path.join(this.config.cwd, packageJsonDir));
            });
        });

        if (packages.length === 0) {
            throw new Error(`No packages detected.
Did you specify the correct path via the --package or --packages params?
For example: adio --package=src/my-package
Hint: you can also specify these params via the .adiorc.js config or package.json.`);
        }

        return Promise.all(packages.map(pkg => this.testPackage(pkg)));
    }

    async testPackage(dir) {
        let packageJson;
        try {
            packageJson = fs.readFileSync(path.join(dir, "package.json"), "utf8");
        } catch (e) {
            throw Error(`Could not open package.json located at ${dir}.`);
        }

        try {
            packageJson = JSON.parse(packageJson);
        } catch (e) {
            throw Error(`Could not parse package.json located at ${dir}.`);
        }

        let adioRc = await explorer.search(dir);
        if (adioRc) {
            adioRc = adioRc.config;
        }

        const deps = {
            src: extractSrcDeps({
                dir,
                adioRc,
                packageJson: packageJson,
                instance: this
            }),
            packageJson: extractDepsFromPackageJson(packageJson)
        };

        const output = {
            packageJson,
            dir: dir,
            errors: {
                count: 0,
                deps: {
                    src: deps.src.filter(dep => {
                        if (dep === packageJson.name) {
                            return false;
                        }

                        if (
                            deps.packageJson.dependencies.includes(dep) ||
                            deps.packageJson.devDependencies.includes(dep) ||
                            deps.packageJson.peerDependencies.includes(dep)
                        ) {
                            return false;
                        }

                        return !isIgnoredDep({ type: "src", instance: this, adioRc, dep });
                    }),
                    dependencies: deps.packageJson.dependencies.filter(dep => {
                        if (deps.src.includes(dep)) {
                            return false;
                        }

                        return !isIgnoredDep({ type: "dependencies", instance: this, adioRc, dep });
                    }),
                    devDependencies: deps.packageJson.devDependencies.filter(dep => {
                        if (deps.src.includes(dep)) {
                            return false;
                        }

                        return !isIgnoredDep({
                            type: "devDependencies",
                            instance: this,
                            adioRc,
                            dep
                        });
                    }),
                    peerDependencies: deps.packageJson.peerDependencies.filter(dep => {
                        if (deps.src.includes(dep)) {
                            return false;
                        }

                        return !isIgnoredDep({
                            type: "peerDependencies",
                            instance: this,
                            adioRc,
                            dep
                        });
                    })
                }
            }
        };

        output.errors.count =
            output.errors.deps.src.length +
            output.errors.deps.dependencies.length +
            output.errors.deps.devDependencies.length +
            output.errors.deps.peerDependencies.length;

        return output;
    }

    __normalizePackagesList() {
        const normalizedPackagesList = [];
        const { package: singlePackage, packages: multiplePackages, ignoreDirs } = this.config;

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
