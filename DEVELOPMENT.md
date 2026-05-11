# Development

## Dev commands

| Command | What it does |
|---------|-------------|
| `yarn test` | Run Jest tests |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn lint` | Run oxlint on `src/` |
| `yarn format` | Check formatting with oxfmt on `src/` (run `oxfmt src/` to fix) |

## Releasing

Releases are automated via the `release.yml` CI workflow on every push to `master` (stable) or `beta` (prerelease). [semantic-release](https://semantic-release.gitbook.io/) determines the version bump from commit messages following [Conventional Commits](https://www.conventionalcommits.org/).

Required repo secrets: `GH_TOKEN` (GitHub classic token with `repo` scope) and `NPM_TOKEN` (npm publish token).

To trigger a release, merge a PR with the appropriate commit type into `master`:
- `fix:` → patch release
- `feat:` → minor release
- `feat!:` or `BREAKING CHANGE:` footer → major release

To release manually (e.g. for testing):

```sh
NPM_TOKEN=<your-npm-token> GH_TOKEN=<your-gh-token> yarn semantic-release --no-ci
```
