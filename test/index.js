const GitHub = require('github-api');

void async function () {
  for await (const repo of GitHub.getUsersUserRepos(undefined, 'TomasHubelbauer')) {
    console.log(repo.full_name);
  }
}()
