import name from "require-package-name";
import relative from "relative-require-regex";
import { parseSync, traverse } from "@babel/core";
const isRelative = value => relative().test(value);

export default source => {
    const ast = parseSync(source);

    const imports = {};
    traverse(ast, {
        enter(path) {
            const { node } = path;
            if (node.type === "ImportDeclaration") {
                let { value } = node.source;
                if (!isRelative(value)) {
                    imports[name(value)] = true;
                }
            }

            if (node.type === "CallExpression") {
                if (node.callee.name === "require") {
                    let { value } = node.arguments[0];
                    if (!isRelative(value)) {
                        imports[name(value)] = true;
                    }
                }
            }
            const baja = node;
        }
    });

    return Object.keys(imports);
};
