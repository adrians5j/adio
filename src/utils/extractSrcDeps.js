const glob = require("glob");
const fs = require("fs");
const { parseSync, traverse } = require("@babel/core");
const name = require("require-package-name");
const relative = require("relative-require-regex");
const isRelative = value => relative().test(value);

const extractImportsRequires = source => {
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
        }
    });

    return Object.keys(imports);
};

const isIgnoredPath = ({ path, config, packageConfig }) => {
    let dirs = config.ignoredDirs || [];
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (path.includes(dir)) {
            return true;
        }
    }

    dirs = packageConfig.ignoredDirs || [];
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (path.includes(dir)) {
            return true;
        }
    }
    return false;
};

module.exports = ({ dir, config, packageConfig }) => {
    const paths = glob.sync(dir + "/**/*.js");
    const deps = [];
    paths.forEach(path => {
        if (isIgnoredPath({ path, config, packageConfig })) {
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
