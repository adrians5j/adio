const baseConfig = require("./config.base");

// Create a module map to point packages to the build output
const moduleNameMapper = {};

moduleNameMapper["^adio/(.*)$"] = "<rootDir>dist/$1";
moduleNameMapper["^adio$"] = "<rootDir>dist";

module.exports = Object.assign({}, baseConfig, {
    moduleNameMapper
});
