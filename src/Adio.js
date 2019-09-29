const testPackage = require("./utils/testPackage");
const glob = require("glob");
const path = require("path");

class Adio {
    constructor(options) {
        this.options = { ignoreNodeModules: false, ignoreDirs: null, packageJson: [], ...options };
    }

    test() {
        const { packageJson, ignoreDirs, ignoreNodeModules } = this.options;

        const packageJsonPaths = [];
        packageJson.forEach(packageJsonPath => {
            glob.sync(packageJsonPath, {
                ignore: ignoreDirs
            }).forEach(packageJsonPath => {
                if (ignoreNodeModules && packageJsonPath.includes("node_modules")) {
                    return true;
                }
                packageJsonPaths.push(path.join(process.cwd(), packageJsonPath));
            });
        });

        const checks = [];
        for (let i = 0; i < packageJsonPaths.length; i++) {
            let packageJsonPath = packageJsonPaths[i];
            checks.push(testPackage(packageJsonPath));
            process.exit();
        }

        return checks;
    }
}

module.exports = Adio;
