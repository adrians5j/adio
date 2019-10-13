export default `
    import React from "react";
    import get from "lodash.get";
    import cloneDeep from "lodash/cloneDeep";
    import { merge } from "lodash";
    import "bytes";
    import { withFields, string, number } from "@commodo/fields";
    import createField from "@commodo/fields/fields/createField";
    import relFile from "./relFile";
    import withId from "@commodo/fields-storage/utils/withId";
    export * from "repropose";
    export { default as testDefaultExport } from "testing-default-exports-pckg";
    export const resolveGetSettings = () => {};
`;
