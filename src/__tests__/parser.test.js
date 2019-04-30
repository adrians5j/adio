import parser from "all-deps-in-order/utils/parser";
import mock from "./mocks/multiple";

test("must correctly detect all required packages", () => {
    const packages = parser(mock);

    expect(packages).toEqual([
        "bytes",
        "~material-components-web",
        "reactive",
        "react",
        "lodash.get",
        "lodash",
        "@commodo/fields",
        "cosmiconfig",
        "@commodo/fields-storage"
    ]);
});
