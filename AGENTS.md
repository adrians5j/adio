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
  index.js             # Public API entry point
  bin/adio.js          # CLI entry point (invoked as the `adio` command)
  utils/
    extractSrcDeps.js  # Extracts import/require names from source files (custom traverse path)
    parse.js           # Parses a single file with oxc-parser, returns dep names
    parseWorker.js     # Worker thread wrapper around parse.js
    testPackage.js     # Reads package.json deps and applies ignore rules
  __tests__/
    parser.test.js     # Unit tests for dep extraction logic
    monorepo.test.js   # Integration test using a zipped monorepo fixture
    mocks/             # Sample JS files and a monorepo.zip fixture
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
