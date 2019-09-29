import parser from "adio/utils/parser";
import mockImports from "./mocks/multiple.imports";
import mockRequires from "./mocks/multiple.requires";

test("must correctly return all imported packages", () => {
    const packages = parser(mockImports);

    expect(packages).toEqual([
        "react",
        "lodash.get",
        "lodash",
        "bytes",
        "@commodo/fields",
        "@commodo/fields-storage"
    ]);
});

test("must correctly return all required packages", () => {
    const packages = parser(mockRequires);

    expect(packages).toEqual([
        "react",
        "lodash.get",
        "lodash",
        "bytes",
        "@commodo/fields",
        "@commodo/fields-storage"
    ]);
});
