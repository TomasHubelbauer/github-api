const github = require('..');

void async function () {
  const token = process.argv[2];
  const rest = {
    token,
    pageLimit: 1, // Fetch only the initial page of a paged response
    onPageChange: true, // Use the default callback - `console.log`
    onLimitChange: true, // Use the default callback - `console.log`
    waitInterval: 1000, // Report rate limit reset waiting every second
    onWaitChange: true, // Use the default callback - `console.log`
  };

  console.log('The initial page of user repos (30 items):');
  for await (const repo of github.getUserRepos(rest)) {
    console.log(repo.full_name);
  }

  console.log('The initial page of user starred repos (30 items):');
  for await (const repo of github.getUserStarred(rest)) {
    console.log(repo.full_name);
  }
  
  const subscription = await github.getReposUserRepoSubscription('microsoft/vscode', token);
  if (subscription === null) {
    throw new Error('The subscription endpoint failed.');
  }
  
  console.log(subscription);
}()
