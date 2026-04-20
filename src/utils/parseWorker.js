import { workerData, parentPort } from "node:worker_threads";
import { readFileSync } from "node:fs";
import { parseSync } from "oxc-parser";

const STD_NODE_TYPES = new Set([
    "ImportDeclaration",
    "ExportNamedDeclaration",
    "ExportAllDeclaration",
    "ImportExpression"
]);

const packageName = v =>
    v
        .split("/")
        .slice(0, v.startsWith("@") ? 2 : 1)
        .join("/");

function walk(node, onEnter) {
    if (!node || typeof node !== "object") return;
    onEnter(node);
    for (const key of Object.keys(node)) {
        const child = node[key];
        if (Array.isArray(child)) child.forEach(c => walk(c, onEnter));
        else if (child?.type) walk(child, onEnter);
    }
}

function extractDeps(filePath) {
    const src = readFileSync(filePath, "utf8");
    const { program } = parseSync(filePath, src);
    const deps = new Set();
    walk(program, node => {
        let value;
        if (STD_NODE_TYPES.has(node.type)) {
            value = node.source?.value;
        } else if (node.type === "CallExpression" && node.callee?.name === "require") {
            value = node.arguments?.[0]?.value;
        }
        if (value && !value.startsWith(".")) deps.add(packageName(value));
    });
    return [...deps];
}

const results = workerData.paths.map(filePath => {
    try {
        return extractDeps(filePath);
    } catch {
        return [];
    }
});

parentPort.postMessage(results);
