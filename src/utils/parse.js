const parser = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const name = require("require-package-name");
const relative = require("relative-require-regex");
const isRelative = value => relative().test(value);
const get = require("lodash.get");

const STD_NODE_TYPES = ["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"];

module.exports = ({ src, config = {} }) => {
    const ast = parser.parse(src, {
        sourceType: "module",
        ...config.parser
    });

    const imports = {};
    traverse(ast, {
        enter(path) {
            const { node } = path;
            if (STD_NODE_TYPES.includes(node.type)) {
                const value = get(node, "source.value");
                if (value && !isRelative(value)) {
                    imports[name(value)] = true;
                }
                return;
            }

            if (node.type === "CallExpression") {
                if (get(node, "callee.name") === "require") {
                    let value = get(node, "arguments.0.value");
                    if (value && !isRelative(value)) {
                        imports[name(value)] = true;
                    }
                }
            }
        }
    });

    return Object.keys(imports);
};
