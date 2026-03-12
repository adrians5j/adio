/**
 * For self testing.
 */
import get from "lodash.get";

export default {
    parser: {
        plugins: ["jsx", "classProperties", "dynamicImport", "throwExpressions", "typescript"]
    },
    traverse: ({ path, push }) => {
        const { node } = path;
        if (node.type === "CallExpression") {
            if (
                get(node, "callee.property.name") === "resolve" &&
                get(node, "callee.object.name") === "require"
            ) {
                const possiblePackage = get(node, "arguments.0.value");
                if (typeof possiblePackage === "string") {
                    return push(possiblePackage);
                }
            }
        }
    },
    ignore: {
        src: [
            "~tests",
            "~",
            "async_hooks",
            "aws-sdk",
            "buffer",
            "child_process",
            "crypto",
            "events",
            "follow-redirects",
            "fs",
            "http",
            "https",
            "module",
            "inspector",
            "node:fs",
            "node:timers",
            "node:path",
            "node:stream",
            "os",
            "path",
            "readline",
            "stream",
            "util",
            "url",
            "worker_threads"
        ],
        dependencies: [],
        devDependencies: true,
        peerDependencies: true
    },
    ignoreDirs: ["node_modules/", "dist/", "build/", "nextjs/"],
    packages: ["./"]
};
