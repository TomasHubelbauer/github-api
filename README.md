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
