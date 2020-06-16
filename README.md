# adio
[![Build Status](https://travis-ci.org/doitadrian/adio.svg?branch=master)](https://travis-ci.org/doitadrian/adio)
[![Coverage Status](https://coveralls.io/repos/github/doitadrian/adio/badge.svg?branch=master)](https://coveralls.io/github/doitadrian/adio?branch=master)
[![](https://img.shields.io/npm/dw/adio.svg)](https://www.npmjs.com/package/adio) 
[![](https://img.shields.io/npm/v/adio.svg)](https://www.npmjs.com/package/adio)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
  
`adio` (all-dependencies-in-order) is a small library that checks your code
for dependencies that are not listed in the package.json and vice-versa,
checks package.json files for dependencies that are not used in code. 

<p align="center">
  <img src="./docs/preview.png"/>
</p>

## Install
```
npm install --save adio
```

Or if you prefer yarn: 
```
yarn add adio
```

## Basic usage
Once you've installed the library, you can run the `adio` command like
so:

```adio --packages "components/*" --packages "packages/*"```

This will check all folders located in `packages` folder, eg. 
`packages/something-1` and `packages/something-2`. If all dependencies
are in order, the process will exit with the exit code `0`, and will 
print a success message. Otherwise, the exit code `1` will be returned, 
and a list of all issues will be printed in the console.

## Configuration files
Even though it can be done via the CLI, parameters can also
be set via the `.adiorc.js` or similar [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) supported config 
types (eg. `.adiorc.json` or even via the `adio` key in `package.json`), 
placed in the current working directory. This is often a better 
alternative to passing parameters inline via the CLI.

By just creating a following `.adiorc.json` file in the current working
directory...

```json
{
  "packages": ["packages/*", "components/*", "..."]
}
```

and then running the `adio` command in the same directory, we can 
achieve the same effect as by manually running the previsuly shown 
`adio --packages "components/*" --packages "packages/*"` command.

This way will also make it easier to pass in additional config parameters.

## Additional configuration parameters

- **ignoreDirs**: Array containing directories to ignore. By default, `adio` ignores `['node_modules']`
- **ignore**: Object containing dependencies for `adio` to ignore.
  - **src**: dependencies to ignore in source files. This can be an array of strings or simply `true` to ignore checking all deps in source files
  - **dependencies**: ignore `dependencies` in `package.json`. This can be an array of strings, to ignore certain deps, or simply `true` to ignore checking all `dependencies` from `package.json`
  - **devDependencies**: ignore `devDependencies` in `package.json`. This can be an array of strings, to ignore certain deps, or simply `true` to ignore checking all `devDependencies` from `package.json`
  - **peerDependencies**: ignore `peerDependencies` in `package.json`. This can be an array of strings, to ignore certain deps, or simply `true` to ignore checking all `peerDependencies` from `package.json`
- **parser**: any options to pass to `@babel/parser` see [here](https://babeljs.io/docs/en/babel-parser#options) for available options

A more comprehensive `.adiorc` might look like this:

```json
{
  "packages": ["packages/*"],
  "ignoreDirs": ["node_modules", "dist", "coverage"],
  "ignore": {
    "src": ["path", "url", "http"],
    "devDependencies": true,
    "peerDependencies": true
  },
  "parser": {
    "plugins": ["typescript", "optionalChaining", "numericSeparator", "classProperties"]
  }
}
```

### Configuration Overriding

It is common to have an `adio` configuration at the root of a monorepo. Then, say I did want `adio` to check `peerDependencies` usage in a particular package, I could extend the configuration above by adding a package local `packages/*/.adiorc` like so:

```json
{
  "ignore": {
    "peerDependencies": false
  }
}
```

## Parameters reference
The following shows 

## Contributors

Thanks goes to these wonderful people



 

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/5121148?v=4" width="100px;"/><br /><sub><b>Adrian Smijulj</b></sub>](https://github.com/doitadrian)<br />[💻](https://github.com/doitadrian/adio/commits?author=doitadrian "Code") [📖](https://github.com/doitadrian/adio/commits?author=doitadrian "Documentation") [💡](#example-doitadrian "Examples") [👀](#review-doitadrian "Reviewed Pull Requests") [⚠️](https://github.com/doitadrian/adio/commits?author=doitadrian "Tests") |
| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
