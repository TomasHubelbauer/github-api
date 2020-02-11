# GitHub API

[**WEB**](https://tomashubelbauer.github.io/github-api)

An implementation of a GitHub API which handles rate limit hits by waiting for
the rate limit reset and streams collection results across pages using as async
interator.

Useful for long-running scripts.

## Instalation

`npm install https://github.com/TomasHubelbauer/github-api`

## Usage

```js
const github = require('github-api');
// `token` can be left `undefined` to use the API with public access rate limits
for await (const repository of github.getUsersUserRepos('TomasHubelbauer', { token })) {
  // …
}
```

- [`get(url, { token, accept, onLimitChange, onPageChange }): AsyncIterableIterator`](#geturl--token-accept-onlimitchange-onpagechange--asynciterableiterator)
- [`getUserRepos({ type, token, onLimitChange, onPageChange }): AsyncIterableIterator`](#getuserrepos-type-token-onlimitchange-onpagechange--asynciterableiterator)
- [`getUserStarred({ sort, token, onLimitChange, onPageChange }): AsyncIterableIterator`](#getuserstarred-sort-token-onlimitchange-onpagechange--asynciterableiterator)
- [`getUsersUserRepos(user, { token, onLimitChange, onPageChange }): AsyncIterableIterator`](#getusersuserreposuser--token-onlimitchange-onpagechange--asynciterableiterator)
- [`getUsersUserStarred(user, { token, onLimitChange, onPageChange }): AsyncIterableIterator`](#getusersuserstarrreduser--token-onlimitchange-onpagechange--asynciterableiterator)
- [`getReposOwnerRepoStargazers(fullName, { token, onLimitChange, onPageChange }): AsyncIterableIterator`](#getreposownerrepostargazersfullname--token-onlimitchange-onpagechange--asynciterableiterator)
- [`getReposOwnerRepoWatchers(fullName, { token, onLimitChange, onPageChange }): AsyncIterableIterator`](#getreposownerrepowatchersfullname--token-onlimitchange-onpagechange--asynciterableiterator)
- [`getReposOwnerRepoProjects(fullName, { token, onLimitChange, onPageChange }); AsyncIterableIterator`](#getreposownerrepoprojectsfullname--token-onlimitchange-onpagechange--asynciterableiterator)
- [`getReposOwnerRepoReleases(fullName, { token, onLimitChange, onPageChange }); AsyncIterableIterator`](#getreposownerreporeleasesfullname--token-onlimitchange-onpagechange--asynciterableiterator)
- [`patchReposOwnerRepo(fullName, token, body): Promise<void>`](#patchreposownerrepofullname-token-body-promisevoid)

### `get(url, { token, accept, onLimitChange, onPageChange }): AsyncIterableIterator`

Returns an async iterator. If the API URL returns a collection, the iterator yields the
collections items one by one across the pages until all the pages have been drained.
If the API URL returns an object, the iterator yields once, only the returned object.

`token` is for the GitHub API PAT which bumps the rate limit from 60 to 5000.

`accept` is for the `Accept` HTTP header for features in preview.

`onLimitChange` is a callback for the rate limit information.

- `remaining` the number of remaining requests in the limit (until the reset)
- `limit` the total number of requests available per the limit reset period
  - With no PAT, the limit is 600
  - With a custom PAT, the limit is 5000
  - With an integration PAT (`secrets.GITHUB_TOKEN`), the limit is 1000
- `reset` a `Date` object of the next API rate limit reset

```js
function onLimitChange({ remaining, limit, reset }) {
  console.log(remaining, 'of', limit, 'resetting at', reset);
}
```

`onPageChange` is a callback for the page being fetched of a collection request

- `page` is the number of the page being fetched currently
- `total` is the number of pages until all the items have been yield - not known on page #1
- `url` the API URL being fetched
- `attempt` the attempt number in case the request failed and is being retried

```js
function onPageChange({ page, total, url, attempt }) {
  console.log(page, '/', total, 'of', url, 'attempt', attempt);
}
```

### `getUserRepos({ type, token, onLimitChange, onPageChange }): AsyncIterableIterator`

### `getUserStarred({ sort, token, onLimitChange, onPageChange }): AsyncIterableIterator`

### `getUsersUserRepos(user, { token, onLimitChange, onPageChange }): AsyncIterableIterator`

### `getUsersUserStarred(user, { token, onLimitChange, onPageChange }): AsyncIterableIterator`

### `getReposOwnerRepoStargazers(fullName, { token, onLimitChange, onPageChange }): AsyncIterableIterator`

### `getReposOwnerRepoWatchers(fullName, { token, onLimitChange, onPageChange }): AsyncIterableIterator`

### `getReposOwnerRepoProjects(fullName, { token, onLimitChange, onPageChange }); AsyncIterableIterator`

### `getReposOwnerRepoReleases(fullName, { token, onLimitChange, onPageChange }); AsyncIterableIterator`

### `patchReposOwnerRepo(fullName, token, body): Promise<void>`

## Development

The test program in `test` depends on the main library using a Git dependency.
To avoid having to launder the library through GitHub for each change, use
linking:

1. Go to the root repository directory and run `npm link`
2. Go to the `test` directory and run `npm link github-api`

## To-Do

### Fix the failing test

### Add more API methods

### Report both the original API URL and the current, paged URL in `onPageChange`
