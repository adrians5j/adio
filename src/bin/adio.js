#! /usr/bin/env node
const { argv } = require("yargs");
const chalk = require("chalk");
const Adio = require("./..");
const cosmiconfig = require("cosmiconfig");
const explorer = cosmiconfig("adio");
const rootConfig = explorer.searchSync(process.cwd()) || {};

const adio = new Adio({ ...rootConfig.config, ...argv });

try {
    const results = adio.test();

    const packagesWithErrors = results.filter(r => r.errors.count);
    if (packagesWithErrors.length === 0) {
        console.log(chalk.green("✅  All dependencies in order!"));
        return process.exit(0);
    }

    packagesWithErrors.forEach((pckg, index) => {
        console.log(chalk.red(`${index + 1}. ${pckg.packageJson.name} (${pckg.dir})`));

        if (pckg.errors.deps.src.length) {
            console.log(chalk.gray("[src] Source code"));
            pckg.errors.deps.src.forEach((item, index) => {
                console.log(`${index + 1}. ${item}`);
            });
        }

        if (pckg.errors.deps.dependencies.length) {
            console.log(chalk.gray("[package.json] dependencies:"));
            pckg.errors.deps.dependencies.forEach((item, index) => {
                console.log(`${index + 1}. ${item}`);
            });
        }

        if (pckg.errors.deps.devDependencies.length) {
            console.log(chalk.gray("[package.json] devDependencies:"));
            pckg.errors.deps.devDependencies.forEach((item, index) => {
                console.log(`${index + 1}. ${item}`);
            });
        }

        if (pckg.errors.deps.peerDependencies.length) {
            console.log(chalk.gray("[package.json] peerDependencies:"));
            pckg.errors.deps.peerDependencies.forEach((item, index) => {
                console.log(`${index + 1}. ${item}`);
            });
        }

        console.log();
    });

    process.exit(1);
} catch (e) {
    console.log(chalk.red(e.message));
}
