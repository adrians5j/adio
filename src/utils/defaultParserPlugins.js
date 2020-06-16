
const DEFAULT_PARSER_PLUGINS = ['typescript', 'classProperties'];

module.exports = plugins => [
    ...new Set([...DEFAULT_PARSER_PLUGINS, ...(plugins || [])])
];
