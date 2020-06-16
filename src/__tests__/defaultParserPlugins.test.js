const defaultParserPlugins = require('../utils/defaultParserPlugins')

test('must merge the plugins', () => {
    expect(defaultParserPlugins(['foo'])).toEqual(['typescript', 'classProperties', 'foo'])
})

test('must dedupe the plugins', () => {
    expect(defaultParserPlugins(['foo', 'typescript'])).toEqual(['typescript', 'classProperties', 'foo'])
})

test('must handle undefined plugins', () => {
    expect(defaultParserPlugins(undefined)).toEqual(['typescript', 'classProperties'])
})

test('must handle null plugins', () => {
    expect(defaultParserPlugins(null)).toEqual(['typescript', 'classProperties'])
})

test('must handle empty plugins', () => {
    expect(defaultParserPlugins([])).toEqual(['typescript', 'classProperties'])
})
