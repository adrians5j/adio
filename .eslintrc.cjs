module.exports = {
    env: {
        node: true,
        es6: true,
        jest: true
    },
    parser: "babel-eslint",
    extends: ["eslint:recommended"],
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: "module"
    },
    rules: {
        indent: ["error", 4],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"]
    }
};
