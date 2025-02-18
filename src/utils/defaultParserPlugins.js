const DEFAULT_PARSER_PLUGINS = ["typescript", "classProperties"];

export const defaultParserPlugins = plugins => [
    ...new Set([...DEFAULT_PARSER_PLUGINS, ...(plugins || [])])
];
