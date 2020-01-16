const parser = require("@babel/parser");
const { default: babelTraverse } = require("@babel/traverse");
const getPackageName = require("require-package-name");
const relative = require("relative-require-regex");
const isRelative = value => relative().test(value);
const get = require("lodash.get");
const chalk = require("chalk");

const STD_NODE_TYPES = ["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"];

module.exports = ({ src, path, config = {} }) => {
    try {
        const ast = parser.parse(src, {
            sourceType: "module",
            ...config.parser
        });

        const dependencies = {};
        const push = value => {
            if (value && !isRelative(value)) {
                dependencies[getPackageName(value)] = true;
            }
        };

        const traverse = get(config, "traverse");

        babelTraverse(ast, {
            enter(path) {
                const { node } = path;
                if (STD_NODE_TYPES.includes(node.type)) {
                    return push(get(node, "source.value"));
                }

                if (node.type === "CallExpression" && get(node, "callee.name") === "require") {
                    return push(get(node, "arguments.0.value"));
                }

                typeof traverse === "function" &&
                    traverse({
                        path,
                        isRelative,
                        push
                    });
            }
        });

        return Object.keys(dependencies);
    } catch (e) {
        console.log(chalk.red(`Error occurred while parsing the file (${path}):`));
        console.log(e.stack);
        process.exit(1);
    }
};
