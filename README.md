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
