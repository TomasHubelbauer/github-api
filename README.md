# GitHub API

An implementation of a GitHub API repository fetcher which handles rate limit
hits by waiting for the rate limit reset all while streaming the results using
as async interator. Useful for long-running scripts.

```typescript
const repositories = getArray<Repository>('users/tomashubelbauer/repos');
for await (let repository of repositories) {
  // Repositories show up one by one
  // - paged as necessary
  // - stalled to reset rate limit as necessary
  // - retried on network failures
}
```

## To-Do

There are also `TODO` comments in the code.

Pull out the checks to a different repository using this as a library.

Add another check - if the repository has mirroring set up in GitLab.

Improve the watch notifications to recognize if I'm a watcher not just
that the repo has at least one watcher (same for starrers).

Find repos which I am watching but they have releases so I could just
watch the releases.
