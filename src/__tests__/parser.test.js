import { extractImportsRequires } from "adio/utils/extractSrcDeps";
import mockImports from "./mocks/multiple.imports";
import mockRequires from "./mocks/multiple.requires";

test("must correctly return all imported packages", () => {
    const packages = extractImportsRequires(mockImports);

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
    const packages = extractImportsRequires(mockRequires);

    expect(packages).toEqual([
        "react",
        "lodash.get",
        "lodash",
        "bytes",
        "@commodo/fields",
        "@commodo/fields-storage"
    ]);
});
