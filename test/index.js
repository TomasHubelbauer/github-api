const GitHub = require('github-api');

void async function () {
  for await (const repo of GitHub.getUsersUserRepos('TomasHubelbauer', { token: process.argv[2], onPageChange, onLimitChange })) {
    console.log(repo.full_name);
  }
}()

function onPageChange({ page, total, url, attempt }) {
  console.log(page, '/', total, 'of', url, 'attempt', attempt);
}

function onLimitChange({ remaining, limit, reset }) {
  console.log(remaining, 'of', limit, 'resetting at', reset);
}
