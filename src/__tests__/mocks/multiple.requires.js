export default `
    const React = require("react");
    const get = require("lodash.get");
    const cloneDeep = require("lodash/cloneDeep");
    const { merge } = require("lodash");
    require("bytes");
    const { withFields, string, number } = require("@commodo/fields");
    const createField = require("@commodo/fields/fields/createField");
    const relFile = require("./relFile")
    const withId = require("@commodo/fields-storage/utils/withId");
`;
