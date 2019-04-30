const baseConfig = require("./config.base");

// Create a module map to point packages to the build output
const moduleNameMapper = {};

moduleNameMapper["^all-deps-in-order/(.*)$"] = "<rootDir>dist/$1";
moduleNameMapper["^all-deps-in-order$"] = "<rootDir>dist";

module.exports = Object.assign({}, baseConfig, {
    moduleNameMapper
});
