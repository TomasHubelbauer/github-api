const fetch = require('node-fetch');

let limit;

module.exports = {
  // TODO: Split into two instead of the `Array.isArray` heuristic?: getPaged + get
  // TODO: Add the rate-limit awaiting logic from `index.ts`
  // TODO: Add a callback for the rate limit and reset waits reporting
  async *get(token, url, accept) {
    let links = { next: { url, page: 1 } };
    do {
      const response = await fetch(links.next.url, { headers: { Authorization: token ? `token ${token}` : undefined, Accept: accept } });
      if (!response.ok) {
        throw new Error(`Failing at ${links.next.url} non-ok ${response.status} ${response.statusText} response!`);
      }

      const json = await response.json();
      if (Array.isArray(json)) {
        for (const item of json) {
          yield item;
        }
      }
      else {
        yield json;
        return;
      }

      links = {};
      const link = response.headers.get('link');
      const regex = /<(?<url>https:\/\/api\.github\.com(\/\w+)+\?(\w+=\w+&)*page=(?<page>\d+))>;\srel="(?<rel>\w+)"(,\s)?/g;
      let match;
      while (match = regex.exec(link)) {
        const { url, page, rel } = match.groups;
        links[rel] = { page, url };
      }

      limit = {
        limit: response.headers.get('x-ratelimit-limit'),
        remaining: response.headers.get(['x-ratelimit-remaining']),
        reset: response.headers.get(['x-ratelimit-reset'])
      };
    } while (links.next);
  },

  getUserRepos(token, type) {
    let url = 'https://api.github.com/user/repos';
    if (type) {
      url += '?type=' + type;
    }

    return this.get(token, url, 'application/vnd.github.mercy-preview+json');
  },

  getUsersUserRepos(token, user) {
    return this.get(token, `https://api.github.com/users/${user}/repos`, 'application/vnd.github.mercy-preview+json');
  },

  getReposOwnerRepoStargazers(token, fullName) {
    return this.get(token, `https://api.github.com/repos/${fullName}/stargazers`);
  },

  getReposOwnerRepoWatchers(token, fullName) {
    return this.get(token, `https://api.github.com/repos/${fullName}/subscribers`);
  },

  getReposOwnerRepoProjects(token, fullName) {
    return this.get(token, `https://api.github.com/repos/${fullName}/projects`, 'application/vnd.github.inertia-preview+json');
  },

  async patchReposOwnerRepo(token, fullName, body) {
    const response = await fetch(`https://api.github.com/repos/${fullName}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      console.log(response.status, response.statusText);
    }
  }
};
