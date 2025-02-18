import glob from "glob";
import fs from "fs";
import get from "lodash.get";
import parse from "./parse.js";
import { defaultParserPlugins } from "./defaultParserPlugins.js";

const isIgnoredPath = ({ path, instance, adioRc }) => {
    let dirs = get(instance, "config.ignoreDirs") || [];
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (path.includes(dir)) {
            return true;
        }
    }

    dirs = get(adioRc, "ignoreDirs") || [];
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (path.includes(dir)) {
            return true;
        }
    }

    return false;
};

export default ({ dir, instance, adioRc }) => {
    const fileExtensions = ["js", "ts", "tsx"];
    const paths = [];
    for (let i = 0; i < fileExtensions.length; i++) {
        let fileExtension = fileExtensions[i];
        paths.push(...glob.sync(dir + `/**/*.${fileExtension}`));
    }

    const deps = [];
    paths.forEach(path => {
        if (isIgnoredPath({ path, instance, adioRc })) {
            return true;
        }

        const src = fs.readFileSync(path, "utf8");
        const importsRequires = parse({
            path,
            src,
            config: {
                parser: {
                    ...get(adioRc, "parser", get(instance, "config.parser", {})),
                    // include commonly needed plugins
                    plugins: defaultParserPlugins(
                        get(adioRc, "parser.plugins", get(instance, "config.parser.plugins", []))
                    )
                },
                traverse: get(adioRc, "traverse", get(instance, "config.traverse"))
            }
        });

        importsRequires.forEach(name => {
            // is relative import?
            if (!name || name.startsWith(".")) {
                return true;
            }

            // already included in deps?
            if (deps.includes(name)) {
                return true;
            }

            deps.push(name);
        });
    });

    return deps;
};
