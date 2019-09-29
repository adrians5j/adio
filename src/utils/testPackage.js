const extractSrcDeps = require("./extractSrcDeps");
const fs = require("fs");
const path = require("path");
const cosmiconfig = require("cosmiconfig");
const explorer = cosmiconfig("adio");

const extractDepsFromPackageJson = ({
    dependencies = {},
    devDependencies = {},
    peerDependencies = {}
}) => {
    return {
        dependencies: Object.keys(dependencies),
        devDependencies: Object.keys(devDependencies),
        peerDependencies: Object.keys(peerDependencies)
    };
};

const extractIgnoredDepsFromConfig = (config = {}) => {
    const ignore = config.ignore || {};
    return {
        src: ignore.src || [],
        dependencies: ignore.dependencies || [],
        devDependencies: ignore.devDependencies || [],
        peerDependencies: ignore.peerDependencies || []
    };
};

const isIgnoredDep = ({ type, dep, config, packageConfig }) => {
    let ignored = extractIgnoredDepsFromConfig(packageConfig);

    if (ignored[type]) {
        if (ignored[type] === true) {
            return true;
        }

        if (Array.isArray(ignored[type]) && ignored[type].includes(dep)) {
            return true;
        }
    }

    ignored = extractIgnoredDepsFromConfig(config);

    if (ignored[type]) {
        if (ignored[type] === true) {
            return true;
        }

        if (Array.isArray(ignored[type]) && ignored[type].includes(dep)) {
            return true;
        }
    }

    return false;
};

module.exports = packageJsonPath => {
    const config = {};

    let packageJsonContent;
    try {
        packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    } catch (e) {
        throw Error("Could not parse package.json located at " + packageJsonPath + "/package.json");
    }

    const packageConfig = explorer.searchSync(packageJsonPath) || {};

    const deps = {
        src: extractSrcDeps({
            dir: path.dirname(packageJsonPath),
            packageConfig,
            packageJson: packageJsonContent,
            config
        }),
        packageJson: extractDepsFromPackageJson(packageJsonContent)
    };

    console.log(deps);
    const output = {
        packageJson: packageJsonContent,
        dir: packageJsonPath,
        errors: {
            count: 0,
            deps: {
                src: deps.src.filter(dep => {
                    if (dep === packageJsonContent.name) {
                        return false;
                    }

                    if (
                        deps.packageJson.dependencies.includes(dep) ||
                        deps.packageJson.devDependencies.includes(dep) ||
                        deps.packageJson.peerDependencies.includes(dep)
                    ) {
                        return false;
                    }

                    if (isIgnoredDep({ type: "src", config, packageConfig, dep })) {
                        return false;
                    }

                    return true;
                }),
                dependencies: deps.packageJson.dependencies.filter(dep => {
                    if (deps.src.includes(dep)) {
                        return false;
                    }

                    if (isIgnoredDep({ type: "dependencies", config, packageConfig, dep })) {
                        return false;
                    }

                    return true;
                }),
                devDependencies: deps.packageJson.devDependencies.filter(dep => {
                    if (deps.src.includes(dep)) {
                        return false;
                    }

                    if (isIgnoredDep({ type: "devDependencies", config, packageConfig, dep })) {
                        return false;
                    }

                    return true;
                }),
                peerDependencies: deps.packageJson.peerDependencies.filter(dep => {
                    if (deps.src.includes(dep)) {
                        return false;
                    }

                    if (isIgnoredDep({ type: "peerDependencies", config, packageConfig, dep })) {
                        return false;
                    }

                    return true;
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
};
