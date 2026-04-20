import { globSync } from "glob";
import fs from "fs";
import parse from "./parse.js";

const isIgnoredPath = ({ path, instance, adioRc }) => {
    let dirs = instance?.config?.ignoreDirs || [];
    for (let i = 0; i < dirs.length; i++) {
        if (path.includes(dirs[i])) return true;
    }
    dirs = adioRc?.ignoreDirs || [];
    for (let i = 0; i < dirs.length; i++) {
        if (path.includes(dirs[i])) return true;
    }
    return false;
};

export default ({ dir, instance, adioRc }) => {
    const fileExtensions = ["js", "ts", "tsx"];
    const paths = [];
    for (let i = 0; i < fileExtensions.length; i++) {
        let fileExtension = fileExtensions[i];
        paths.push(
            ...globSync(dir + `/**/*.${fileExtension}`, {
                sort: true
            }).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        );
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
                traverse: adioRc?.traverse ?? instance?.config?.traverse
            }
        });

        importsRequires.forEach(name => {
            if (!name || name.startsWith(".")) {
                return true;
            }
            if (deps.includes(name)) {
                return true;
            }
            deps.push(name);
        });
    });

    return deps;
};
