import Adio from "adio";

test("must correctly detect all inconsistencies in a monorepo", () => {
    const adio = new Adio({
        cwd: __dirname,
        packages: "mocks/monorepo/packages/*",
        ignore: {
            dependencies: ["@emotion/core"],
            devDependencies: true
        }
    });

    const results = adio.test();

    expect(results).toEqual([
        {
            "packageJson": {
                "name": "a",
                "version": "1.0.0",
                "main": "index.js",
                "license": "MIT",
                "dependencies": {
                    "@world/something": "1.0.0",
                    "@emotion/core": "^10.0.21",
                    "@emotion/styled": "^10.0.17",
                    "@babel/runtime": "^7.6.3"
                },
                "devDependencies": {
                    "@babel/runtime": "^7.6.3"
                }
            },
            "dir": "/Users/adrian/dev/adio/src/__tests__/mocks/monorepo/packages/a",
            "errors": {
                "count": 0,
                "deps": {
                    "src": [],
                    "dependencies": [],
                    "devDependencies": [],
                    "peerDependencies": []
                }
            }
        },
        {
            "packageJson": {
                "name": "b",
                "version": "1.0.0",
                "main": "index.js",
                "license": "MIT",
                "dependencies": {
                    "lodash": "^4.17.15"
                },
                "devDependencies": {
                    "@babel/runtime": "^7.6.3"
                }
            },
            "dir": "/Users/adrian/dev/adio/src/__tests__/mocks/monorepo/packages/b",
            "errors": {
                "count": 3,
                "deps": {
                    "src": [
                        "sanitize-filename",
                        "repropose"
                    ],
                    "dependencies": [
                        "lodash"
                    ],
                    "devDependencies": [],
                    "peerDependencies": []
                }
            }
        },
        {
            "packageJson": {
                "name": "c",
                "version": "1.0.0",
                "main": "index.js",
                "license": "MIT"
            },
            "dir": "/Users/adrian/dev/adio/src/__tests__/mocks/monorepo/packages/c",
            "errors": {
                "count": 1,
                "deps": {
                    "src": [
                        "os"
                    ],
                    "dependencies": [],
                    "devDependencies": [],
                    "peerDependencies": []
                }
            }
        }
    ]);
});
