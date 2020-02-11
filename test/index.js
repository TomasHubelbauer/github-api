const GitHub = require('github-api');

void async function () {
  console.log('The first 45 items of user repos (~1.5 pages):');
  let reposLimit = 45;
  for await (const repo of GitHub.getUserRepos({ token: process.argv[2], onPageChange, onLimitChange })) {
    console.log(repo.full_name);
    if (reposLimit++ === 45) {
      break;
    }
  }
  
  console.log('The first 45 items of user starred repos (~1.5 pages):');
  let starredLimit = 45;
  for await (const repo of GitHub.getUserStarred({ token: process.argv[2], onPageChange, onLimitChange })) {
    console.log(repo.full_name);
    if (starredLimit++ === 45) {
      break;
    }
  }
}()

function onPageChange({ page, total, url, attempt }) {
  console.log(page, '/', total, 'of', url, 'attempt', attempt);
}

function onLimitChange({ remaining, limit, reset }) {
  console.log(remaining, 'of', limit, 'resetting at', reset);
}
