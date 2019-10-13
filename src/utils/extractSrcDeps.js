const glob = require("glob");
const fs = require("fs");
const get = require("lodash.get");
const parse = require("./parse");

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

module.exports = ({ dir, instance, adioRc }) => {
    const paths = glob.sync(dir + "/**/*.js");
    const deps = [];
    paths.forEach(path => {
        if (isIgnoredPath({ path, instance, adioRc })) {
            return true;
        }

        const src = fs.readFileSync(path, "utf8");
        const importsRequires = parse({
            src,
            config: {
                parser: {
                    ...get(instance, "config.parser", {}),
                    ...get(adioRc, "parser", {})
                }
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
