# GitHub API

An implementation of a GitHub API which handles rate limit hits by waiting for
the rate limit reset and streams collection results across pages using as async
interator.

Useful for long-running scripts.

## Instalation

`npm install TomasHubelbauer/github-api`

## Usage

```js
const github = require('github-api');
// `token` can be left `undefined` to use the API with public access rate limits
for await (const repository of github.getUsersUserRepos('TomasHubelbauer', { token })) {
  // …
}
```

## Documentation

See [`index.d.ts`](index.d.ts) (auto-generated).

## Testing

`node test`
