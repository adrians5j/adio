import parse from "adio/utils/parse";
import mockImports from "./mocks/multiple.imports";
import mockRequires from "./mocks/multiple.requires";

test("must correctly return all imported packages", () => {
    const packages = parse({ src: mockImports });

    expect(packages).toEqual([
        "react",
        "lodash.get",
        "lodash",
        "bytes",
        "@commodo/fields",
        "@commodo/fields-storage",
        "repropose",
        "testing-default-exports-pckg"
    ]);
});

test("must correctly return all required packages", () => {
    const packages = parse({ src: mockRequires });

    expect(packages).toEqual([
        "react",
        "lodash.get",
        "lodash",
        "bytes",
        "@commodo/fields",
        "@commodo/fields-storage"
    ]);
});
