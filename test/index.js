const github = require('..');

void async function () {
  console.log('The first 45 items of user repos (~1.5 pages):');
  let reposLimit = 0;
  for await (const repo of github.getUserRepos({ token: process.argv[2], onPageChange: true, onLimitChange: true })) {
    console.log(repo.full_name);
    if (reposLimit++ === 45) {
      break;
    }
  }

  console.log('The first 45 items of user starred repos (~1.5 pages):');
  let starredLimit = 0;
  for await (const repo of github.getUserStarred({ token: process.argv[2], onPageChange: true, onLimitChange: true })) {
    console.log(repo.full_name);
    if (starredLimit++ === 45) {
      break;
    }
  }
}()
