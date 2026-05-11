# adio — Agent Onboarding

## What This Repo Is

`adio` (all-dependencies-in-order) is a Node.js CLI and library that checks whether the dependencies declared in a `package.json` match the imports/requires found in source code — catching both undeclared deps used in code and declared deps unused in code.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >=20 | Runtime |
| Yarn | 4.13.0 (Berry) | Package manager |
| Jest | ^30 | Test runner |
| oxlint | ^1 | Linting (`.oxlintrc.json`) |
| oxfmt | ^0.48 | Formatting (`.oxfmtrc.json`) |
| oxc-parser | ^0.129 | Fast JS/TS AST parser for dep extraction |
| semantic-release | ^25 | Automated versioning and npm publishing |

Package type is `"type": "module"` — all source files use ESM (`import`/`export`).

## Source Layout

```
src/
  Adio.js              # Main class — package scanning, worker dispatch, error aggregation
  index.js             # Public API entry point (re-exports Adio)
  bin/adio.js          # CLI entry point — parses args, calls Adio.test(), prints results
  utils/
    extractSrcDeps.js  # Single-threaded dep extraction; used when a custom `traverse` fn is set
    parse.js           # Parses one file with oxc-parser; supports custom `traverse` hook
    parseWorker.js     # Worker thread that batches parse calls (no custom traverse support)
    testPackage.js     # Extracts deps from package.json and evaluates ignore rules
  __tests__/
    parser.test.js     # Unit tests for import/require/dynamic-import parsing
    monorepo.test.js   # Integration test: extracts monorepo.zip, runs Adio against it
    mocks/             # JS fixtures (imports, requires, dynamic-imports) + monorepo.zip
```

`Adio.test()` runs in four phases:
1. Read all `package.json` files + configs + glob source files (parallel)
2. Dispatch all source files to worker threads in chunks for parallel parsing
3. For packages with a custom `traverse` function, fall back to main-thread extraction
4. Aggregate per-package deps and build error lists

## Configuration

adio reads its own config via [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) — `.adiorc.js`, `.adiorc.json`, or an `adio` key in `package.json`.

Root `.adiorc.js` configures adio to check itself:

```js
export default {
    ignore: { dependencies: [], devDependencies: true, peerDependencies: true },
    ignoreDirs: ["node_modules/", "dist/", "build/"],
    packages: ["./"]
};
```

Config keys:
- `packages` / `package` — glob patterns for package directories to scan
- `ignoreDirs` — directory name fragments to skip (merged with the default `["node_modules"]`)
- `ignore.src` — dep names to ignore when checking source imports (array or `true`)
- `ignore.dependencies` / `ignore.devDependencies` / `ignore.peerDependencies` — analogous for package.json sections
- `traverse` — `({ node, isRelative, push }) => void` — custom AST hook called for every node; call `push(specifier)` to register imports the default walker would miss. When set, the single-threaded `extractSrcDeps` path is used instead of workers.

## Dev Commands

| Command | What it does |
|---------|-------------|
| `yarn test` | Run Jest (requires `--experimental-vm-modules` — set via `NODE_OPTIONS` in the script) |
| `yarn test:coverage` | Run tests with coverage report (lcov + html) |
| `yarn lint` | Run oxlint on `src/` |
| `yarn format` | Check formatting with oxfmt on `src/` (use `oxfmt src/` to fix) |

## CI Workflows

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | PRs + push to `master`/`beta` | Validates conventional commits (PRs only), runs lint/format/tests on Node 20 + 22, AI auto-fix on static analysis failure |
| `release.yml` | Push to `master`/`beta` | Runs `semantic-release` to publish to npm and create GitHub releases |
| `codeql.yml` | Push to `master`, PRs, weekly | CodeQL JavaScript security scan |

The `aiFixStaticAnalysis` job in `ci.yml` requires the `ANTHROPIC_API_KEY` secret to be set in the repo.

## Release Process

Automated via `semantic-release` triggered on push to `master` (stable releases) or `beta` (prerelease: `3.1.0-beta.1`). Requires `GH_TOKEN` and `NPM_TOKEN` secrets.

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) for semantic-release to determine the version bump. This is enforced by CI on PRs via `webiny/action-conventional-commits`.

## Code Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, etc.)
- **Formatting**: oxfmt — double quotes, 4-space indent, no trailing commas (see `.oxfmtrc.json`)
- **Linting**: oxlint with `curly` off and no-unused-vars as warn (see `.oxlintrc.json`)
- **Pre-commit**: husky + lint-staged — runs oxfmt + oxlint --fix + related jest tests on staged `.js` files

## Important Files

| File | Purpose |
|------|---------|
| `.adiorc.js` | adio self-check config |
| `.oxlintrc.json` | oxlint config |
| `.oxfmtrc.json` | oxfmt config |
| `.releaserc.js` | semantic-release branches config |
| `jest.config.js` | Jest config (no transform, coverage from `src/**/*.js`) |
| `.yarnrc.yml` | Yarn Berry config (node-modules linker) |
