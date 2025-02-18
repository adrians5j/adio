// Create a module map to point packages to the build output
const moduleNameMapper = {};

moduleNameMapper["^adio/(.*)$"] = "<rootDir>src/$1";
moduleNameMapper["^adio$"] = "<rootDir>src";

export default {
    rootDir: process.cwd(),
    testMatch: ["**/*.test.js", "**/*.test.mjs"],
    transform: {},
    moduleNameMapper,
    coverageReporters: ["lcov", "html"],
    coveragePathIgnorePatterns: ["__tests__", "/node_modules/"],
    collectCoverageFrom: ["src/**/*.js"],
    collectCoverage: process.env.COVERAGE === "true"
};
