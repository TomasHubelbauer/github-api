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

- [`get(url, { token, ...rest }): AsyncIterableIterator`](#geturl--token-rest--asynciterableiterator)
- [`getUserRepos({ type, ...rest }): AsyncIterableIterator`](#getuserrepos-type-rest--asynciterableiterator)
- [`getUserStarred({ sort, ...rest }): AsyncIterableIterator`](#getuserstarred-sort-rest--asynciterableiterator)
- [`getUsersUserRepos(user, { ...rest }): AsyncIterableIterator`](#getusersuserreposuser--rest--asynciterableiterator)
- [`getUsersUserStarred(user, { ...rest }): AsyncIterableIterator`](#getusersuserstarreduser--rest--asynciterableiterator)
- [`getUsersUserSubscriptions(user, { ...rest }): AsyncIterableIterator`](#getusersusersubscriptionsuser--rest--asynciterableiterator)
- [`getReposOwnerRepoStargazers(fullName, { ...rest }): AsyncIterableIterator`](#getreposownerrepostargazersfullname--rest--asynciterableiterator)
- [`getReposOwnerRepoWatchers(fullName, { ...rest }): AsyncIterableIterator`](#getreposownerrepowatchersfullname--rest--asynciterableiterator)
- [`getReposOwnerRepoProjects(fullName, { ...rest }); AsyncIterableIterator`](#getreposownerrepoprojectsfullname--rest--asynciterableiterator)
- [`getReposOwnerRepoReleases(fullName, { ...rest }); AsyncIterableIterator`](#getreposownerreporeleasesfullname--rest--asynciterableiterator)
- [`getReposOwnerRepoSubscription(fullName, token): Promise<null | object>`](#getreposownerreposubscriptionfullname-token-promisenull--object)
- [`patchReposOwnerRepo(fullName, token, body): Promise<void>`](#patchreposownerrepofullname-token-body-promisevoid)

### `onLimitChange({ remaining, limit, reset }): void` Callback

Called when the rate limit information changes.

If the provided value is `true`, instead of a custom function, the default
is used, which `console.log`s a message similar to this:

> Limit 59/60, resetting at 9:05:18 PM (59:55)

- `remaining` the number of remaining requests in the limit (until the reset)
- `limit` the total number of requests available per the limit reset period
  - With no PAT, the limit is 600
  - With a custom PAT, the limit is 5000
  - With an integration PAT (`secrets.GITHUB_TOKEN`), the limit is 1000
- `reset` a `Date` object of the next API rate limit reset

### `onPageChange({ pageNumber, pageCount, url, pageUrl, attempt }): void` Callback

Called when the current page being fetched of a paged response changes.

If the provided value is `true`, instead of a custom function, the default
is used, which `console.log`s a message similar to this:

> Page 2/5 of https://api.github.com/user/repos, attempt #1 (https://api.github.com/user/repos?page=2)

- `pageNumber` is the number of the page being fetched currently
- `pageCount` is the number of pages until all the items have been yield - not known on page #1
- `url` the API URL being fetched
- `pageUrl` the API URL of the current page being fetched
- `attempt` the attempt number in case the request failed and is being retried

### `onWaitChange(reset): void` Callback

Called when the rate limit waiting changes.

If the provided value is `true`, instead of a custom function, the default
is used, which `console.log`s a message similar to this:

> Waiting :01 for reset at 8:05:10 PM (:11)…

- `reset` a `Date` object of the next API rate limit reset

### `...rest` Arguments Of `get`-based Methods

- `token` is for the GitHub API PAT which bumps the rate limit from 60 to 5000.
- `accept` is for the `Accept` HTTP header for features in preview.
- `pageLimit` is the cap on the number of pages of the paged response to fetch.
- [`onLimitChange`](#onlimitchange-remaining-limit-reset--void-callback)
- [`onPageChange`](#onpagechange-pagenumber-pagecount-url-pageurl-attempt--void-callback)
- `waitInterval` is the interval at which the reset waiting callback is called.
- [`onWaitChange`](#onwaitchange-reset--void-callback)

### `get(url, { token, ...rest }): AsyncIterableIterator`

Returns an async iterator which yields the API response array items one by one
across all the pages until all the pages have been drained.

Throws if the API response is not an array.

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getUserRepos({ type, ...rest }): AsyncIterableIterator`

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getUserStarred({ sort, ...rest }): AsyncIterableIterator`

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getUserSubscriptions({ sort, ...rest }): AsyncIterableIterator`

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getUsersUserRepos(user, { ...rest }): AsyncIterableIterator`

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getUsersUserStarred(user, { ...rest }): AsyncIterableIterator`

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getReposOwnerRepoStargazers(fullName, { ...rest }): AsyncIterableIterator`

- `fullName` the name of the repository

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getReposOwnerRepoWatchers(fullName, { ...rest }): AsyncIterableIterator`

- `fullName` the name of the repository

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getReposOwnerRepoProjects(fullName, { ...rest }); AsyncIterableIterator`

- `fullName` the name of the repository

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getReposOwnerRepoReleases(fullName, { ...rest }); AsyncIterableIterator`

- `fullName` the name of the repository

See [`...rest` Arguments Of `get`-based Methods](#rest-arguments-of-get-based-methods)
for information on the rest arguments of this method.

### `getReposOwnerRepoSubscription(fullName, token): Promise<null | object>`

- `fullName` the name of the repository

### `patchReposOwnerRepo(fullName, token, body): Promise<void>`

- `fullName` the name of the repository

## Development

The test program in `test` depends on the main library using a Git dependency.
To avoid having to launder the library through GitHub for each change, use
linking:

1. Go to the root repository directory and run `npm link`
2. Go to the `test` directory and run `npm link github-api`

## To-Do

### Allow configuring page size and default it to the maximum - 100

https://developer.github.com/v3/guides/traversing-with-pagination/#changing-the-number-of-items-received

This will help save some rate limit on things such as downloading a
list of all my repositories or all repositories I star. Will reduce
the rate limit by 66.6 %.

### Add GitHub API docs URLs to each API method in readme and JSDoc

### Fix URL fragments of the links in this documents
