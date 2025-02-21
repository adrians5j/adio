#! /usr/bin/env node
import yargs from "yargs";
import chalk from "chalk";
import { Adio } from "../Adio.js";
import { cosmiconfig } from "cosmiconfig";

(async () => {
    const explorer = cosmiconfig("adio");
    const rootConfig = (await explorer.search(process.cwd())) || {};

    try {
        const adio = new Adio({ ...rootConfig.config, ...yargs.argv });
        const results = await adio.test();

        const packagesWithErrors = results.filter(r => r.errors.count);
        if (packagesWithErrors.length === 0) {
            console.log(chalk.green("✅  All dependencies in order!"));
            process.exit(0);
        }

        packagesWithErrors.forEach((pckg, index) => {
            console.log(
                chalk.red(
                    `${index + 1}. ${pckg.packageJson.name || "🚨 Package name missing."} (${pckg.dir})`
                )
            );

            if (pckg.errors.deps.src.length) {
                console.log(
                    chalk.cyan("Packages used in source code, but not listed in package.json:")
                );
                pckg.errors.deps.src.forEach((item, index) => {
                    console.log(`${index + 1}. ${item}`);
                });
            }

            if (pckg.errors.deps.dependencies.length) {
                console.log(
                    chalk.cyan(
                        "Packages listed as a dependency in package.json, but not used in source code:"
                    )
                );
                pckg.errors.deps.dependencies.forEach((item, index) => {
                    console.log(`${index + 1}. ${item}`);
                });
            }

            if (pckg.errors.deps.devDependencies.length) {
                console.log(
                    chalk.cyan(
                        "Packages listed as a devDependency in package.json, but not used in source code:"
                    )
                );
                pckg.errors.deps.devDependencies.forEach((item, index) => {
                    console.log(`${index + 1}. ${item}`);
                });
            }

            if (pckg.errors.deps.peerDependencies.length) {
                console.log(
                    chalk.cyan(
                        "Packages listed as a peerDependency in package.json, but not used in source code:"
                    )
                );
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
})();
