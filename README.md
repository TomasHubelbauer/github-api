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

- [ ] Finalize including code comments
- [ ] See if GitHub API stil gives watchers count (it's hidden on the site now) and in any case find a way to check if I'm the one watcher/starrer of the repo, not just that it has a non-zero number
