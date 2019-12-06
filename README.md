# GitHub API

An implementation of a GitHub API which handles rate limit hits by waiting for
the rate limit reset and streams collection results across pages using as async
interator.

Useful for long-running scripts.

## Instalation

`npm install https://github.com/TomasHubelbauer/github-api`

## Usage

```js
const GitHub = require('github-api');
for await (let repository of GitHub.getUsersUserRepos('TomasHubelbauer')) {
  // …
}
```

## Development

The test program in `test` depends on the main library using a Git dependency.
To avoid having to launder the library through GitHub for each change, use
linking:

1. Go to the root repository directory and run `npm link`
2. Go to the `test` directory and run `npm link github-api`

## To-Do

### Add a GitHub actions workflow running the test

Pass the integration PAT in for a rate limit of 5000.

### Use this in GitHub Digest

### Transfer over the rate limit reset wait logic from `index.ts` and delete it

Less important now when the PATs in GitHub Actions workflows have the rate limit
of 5000, but will still be useful for public-only read accesses with no PAT.
