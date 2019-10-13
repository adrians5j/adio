const glob = require("glob");
const path = require("path");
const cosmiconfig = require("cosmiconfig");
const fs = require("fs");
const explorer = cosmiconfig("adio");
const { extractDepsFromPackageJson, isIgnoredDep } = require("./utils/testPackage");
const { extractSrcDeps } = require("./utils/extractSrcDeps");

class Adio {
    constructor(config) {
        this.config = { ignoreDirs: ["node_modules"], cwd: process.cwd(), ...config };
    }

    test() {
        const { ignoreDirs } = this.config;

        const normalizedPackagesList = this.__normalizePackagesList();
        const packages = [];
        normalizedPackagesList.forEach(dir => {
            glob.sync(dir, {
                cwd: this.config.cwd,
                ignore: ignoreDirs
            }).forEach(packageJsonPath => {
                packages.push(path.join(this.config.cwd, packageJsonPath));
            });
        });

        const checks = [];
        for (let i = 0; i < packages.length; i++) {
            checks.push(this.testPackage(packages[i]));
        }

        return checks;
    }

    testPackage(dir) {
        let packageJson;
        try {
            packageJson = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
        } catch (e) {
            throw Error("Could not parse package.json located at " + dir);
        }

        const adioRc = (explorer.searchSync(dir) || {}).config;

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

module.exports = Adio;
