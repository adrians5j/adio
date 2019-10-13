const glob = require("glob");
const fs = require("fs");
const parser = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");

const name = require("require-package-name");
const relative = require("relative-require-regex");
const isRelative = value => relative().test(value);

const extractImportsRequires = source => {
    const ast = parser.parse(source, {
        sourceType: "module"
    });

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
        }
    });

    return Object.keys(imports);
};

const isIgnoredPath = ({ path, instance, adioRc }) => {
    let dirs = instance.config.ignoreDirs || [];
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (path.includes(dir)) {
            return true;
        }
    }

    dirs = adioRc.ignoreDirs || [];
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (path.includes(dir)) {
            return true;
        }
    }
    return false;
};

const extractSrcDeps = ({ dir, instance, adioRc }) => {
    const paths = glob.sync(dir + "/**/*.js");
    const deps = [];
    paths.forEach(path => {
        if (isIgnoredPath({ path, instance, adioRc })) {
            return true;
        }

        const src = fs.readFileSync(path, "utf8");
        const importsRequires = extractImportsRequires(src);
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

module.exports = {
    extractSrcDeps,
    extractImportsRequires
};
