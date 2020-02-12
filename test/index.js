const github = require('..');

void async function () {
  console.log('The initial page of user repos (30 items):');
  for await (const repo of github.getUserRepos({ token: process.argv[2], pageLimit: 1, onPageChange: true, onLimitChange: true })) {
    console.log(repo.full_name);
  }

  console.log('The initial page of user starred repos (30 items):');
  for await (const repo of github.getUserStarred({ token: process.argv[2], pageLimit: 1, onPageChange: true, onLimitChange: true })) {
    console.log(repo.full_name);
  }
}()
