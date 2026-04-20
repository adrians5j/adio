import { glob } from "glob";
import { readFile } from "node:fs/promises";
import parse from "./parse.js";

const isIgnoredPath = ({ path, instance, adioRc }) => {
    const dirs = [...(instance?.config?.ignoreDirs || []), ...(adioRc?.ignoreDirs || [])];
    return dirs.some(dir => path.includes(dir));
};

export default async ({ dir, instance, adioRc }) => {
    const paths = (await glob(dir + "/**/*.{js,ts,tsx}")).filter(
        path => !isIgnoredPath({ path, instance, adioRc })
    );

    const traverseConfig = adioRc?.traverse ?? instance?.config?.traverse;

    const results = await Promise.all(
        paths.map(async path => {
            const src = await readFile(path, "utf8");
            return parse({ path, src, config: { traverse: traverseConfig } });
        })
    );

    const seen = new Set();
    const deps = [];
    for (const names of results) {
        for (const name of names) {
            if (!seen.has(name)) {
                seen.add(name);
                deps.push(name);
            }
        }
    }
    return deps.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};
