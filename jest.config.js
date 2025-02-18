export default {
    rootDir: process.cwd(),
    testMatch: ["**/*.test.js"],
    transform: {},
    coverageReporters: ["lcov", "html"],
    coveragePathIgnorePatterns: ["__tests__", "/node_modules/"],
    collectCoverageFrom: ["src/**/*.js"],
    collectCoverage: process.env.COVERAGE === "true"
};
