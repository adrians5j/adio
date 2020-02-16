import Adio from "adio";
import path from "path";
import rimraf from "rimraf";
import extract from "extract-zip";

beforeAll(() => {
    return new Promise((resolve, reject) => {
        extract(
            path.join(__dirname, "/mocks/monorepo.zip"),
            { dir: path.join(__dirname, "/mocks") },
            e => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve();
            }
        );
    });
});

afterAll(() => {
    return new Promise((resolve, reject) => {
        rimraf(path.join(__dirname, "/mocks/monorepo"), e => {
            if (e) {
                reject(e);
                return;
            }
            resolve();
        });
    });
});

test("must correctly detect all inconsistencies in a monorepo", () => {
    const adio = new Adio({
        cwd: __dirname,
        ignoreDirs: ["node-modules"],
        packages: "mocks/monorepo/packages/*",
        ignore: {
            dependencies: ["@emotion/core"],
            devDependencies: true
        }
    });

    const results = adio.test();

    expect(results).toEqual([
        {
            packageJson: {
                name: "a",
                version: "1.0.0",
                main: "index.js",
                license: "MIT",
                dependencies: {
                    "@world/something": "1.0.0",
                    "@emotion/core": "^10.0.21",
                    "@emotion/styled": "^10.0.17",
                    "@babel/runtime": "^7.6.3"
                },
                devDependencies: {
                    "@babel/runtime": "^7.6.3"
                }
            },
            dir: path.join(__dirname, "/mocks/monorepo/packages/a"),
            errors: {
                count: 0,
                deps: {
                    src: [],
                    dependencies: [],
                    devDependencies: [],
                    peerDependencies: []
                }
            }
        },
        {
            packageJson: {
                name: "b",
                version: "1.0.0",
                main: "index.js",
                license: "MIT",
                dependencies: {
                    lodash: "^4.17.15"
                },
                devDependencies: {
                    "@babel/runtime": "^7.6.3"
                }
            },
            dir: path.join(__dirname, "/mocks/monorepo/packages/b"),
            errors: {
                count: 3,
                deps: {
                    src: ["sanitize-filename", "repropose"],
                    dependencies: ["lodash"],
                    devDependencies: [],
                    peerDependencies: []
                }
            }
        },
        {
            packageJson: {
                name: "c",
                version: "1.0.0",
                main: "index.js",
                license: "MIT"
            },
            dir: path.join(__dirname, "/mocks/monorepo/packages/c"),
            errors: {
                count: 0,
                deps: {
                    src: [],
                    dependencies: [],
                    devDependencies: [],
                    peerDependencies: []
                }
            }
        }
    ]);
});
