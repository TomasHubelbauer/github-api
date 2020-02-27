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

  let repos = 0;
  for await (const repo of github.getUsersUserRepos('TomasHubelbauer', rest)) {
    void repo;
    repos++;
  }
  console.log('Repos', repos);

  let starred = 0;
  for await (const { starred_at, repo } of github.getUsersUserStarred('TomasHubelbauer', rest)) {
    void starred_at;
    void repo;
    starred++;
  }
  console.log('Starred repos', starred);

  let watched = 0;
  for await (const repo of github.getUsersUserSubscriptions('TomasHubelbauer', rest)) {
    void repo;
    watched++;
  }
  console.log('Watched repos', watched);

  let followers = 0;
  for await (const repo of github.getUsersUserFollowers('TomasHubelbauer', rest)) {
    void repo;
    followers++;
  }
  console.log('Followers', followers);
}()
