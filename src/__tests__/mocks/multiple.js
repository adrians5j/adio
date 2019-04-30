export default `
    import React from "react";
    import get from "lodash.get";
    import cloneDeep from "lodash/cloneDeep";
    import { merge } from "lodash";
    import "bytes";
    import { withFields, string, number } from "@commodo/fields";
    import createField from "@commodo/fields/fields/createField";
    @import "~material-components-web/material-components-web.scss";
    import relFile from "./relFile";

    const React = require("react");
    const get = require("lodash.get");
    const cloneDeep = require("lodash/cloneDeep");
    const { merge } = require("lodash");
    require("bytes");
    const { withFields, string, number } = require("@commodo/fields");
    const createField from "@commodo/fields/fields/createField";
    require("~material-components-web/material-components-web.scss");
    const relFile = require("./relFile")
    
    import CosmicConfig from "cosmiconfig";
    import "reactive";
    import { withStorage } from "@commodo/fields-storage";
    import withId from "@commodo/fields-storage/utils/withId";
    
    const CosmicConfig = require("cosmiconfig");
    require("reactive");
    const { withStorage } = require("@commodo/fields-storage");
    const withId from "@commodo/fields-storage/utils/withId";
`;