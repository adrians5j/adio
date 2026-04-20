import { parseSync } from "oxc-parser";
import chalk from "chalk";

const STD_NODE_TYPES = ["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"];

const packageName = value =>
    value.split("/").slice(0, value.startsWith("@") ? 2 : 1).join("/");

function walk(node, onEnter) {
    if (!node || typeof node !== "object") return;
    onEnter(node);
    for (const key of Object.keys(node)) {
        const child = node[key];
        if (Array.isArray(child)) child.forEach(c => walk(c, onEnter));
        else if (child?.type) walk(child, onEnter);
    }
}

export default ({ src, path = "file.js", config = {} }) => {
    try {
        const { program } = parseSync(path, src);
        const dependencies = {};
        const push = value => {
            if (value && !value.startsWith(".")) {
                dependencies[packageName(value)] = true;
            }
        };
        const traverse = config.traverse;
        walk(program, node => {
            if (STD_NODE_TYPES.includes(node.type) || node.type === "ImportExpression") {
                push(node.source?.value);
            } else if (node.type === "CallExpression" && node.callee?.name === "require") {
                push(node.arguments?.[0]?.value);
            }
            typeof traverse === "function" &&
                traverse({ node, isRelative: v => v.startsWith("."), push });
        });
        return Object.keys(dependencies);
    } catch (e) {
        console.log(chalk.red(`Error occurred while parsing the file (${path}):`));
        console.log(e.stack);
        process.exit(1);
    }
};
