const fetch = require('node-fetch');

let limit;

module.exports = {
  // TODO: Split into two instead of the `Array.isArray` heuristic?: getPaged + get
  async *get(url, { token, accept, onLimitChange, onPageChange }) {
    let links = { next: { url, page: 1 } };
    let attempt = 1;
    do {
      if (onPageChange) {
        onPageChange({ page: links.next.page, total: links.last ? links.last.page : undefined, url, attempt });
      }

      const response = await fetch(links.next.url, { headers: { Authorization: token ? `token ${token}` : undefined, Accept: accept } });
      if (!response.ok) {
        if (attempt === 10) {
          throw new Error(`Failing at ${links.next.url} non-ok ${response.status} ${response.statusText} response!`);
        }

        // Note that this means the request was rate limited and did not provide data
        if (response.status === 403 && limit.remaining === 0) {
          attempt++;

          // TODO: Wait with backoff
          await new Promise(resolve => window.setTimeout(resolve, limit.reset.valueOf() - Date.now()));

          // Retry with the same URL but an increased attempt number
          continue;
        }

        // Note that this means the request was load balanced and did not provide data
        if (response.status === 502 && limit.limit === 0 && limit.remaining === 0 /* TODO: `&& limit.reset === '1970-01-01T00:00:00.000Z'` */) {
          attempt++;

          // TODO: Wait with backoff

          // Retry with the same URL but an increased attempt number
          continue;
        }
      }

      // Reset the attempt counter on each successful fetch
      attempt = 1;

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
        limit: Number(response.headers.get('x-ratelimit-limit')),
        remaining: Number(response.headers.get(['x-ratelimit-remaining'])),
        reset: new Date(Number(response.headers.get(['x-ratelimit-reset'])) * 1000)
      };

      if (onLimitChange) {
        onLimitChange(limit);
      }

      if (limit.remaining === 0 && links.next !== undefined) {
        // Wait for the rate limit to reset before trying to go for the next page
        await new Promise(resolve => window.setTimeout(resolve, limit.reset.valueOf() - Date.now()));
      }
    } while (links.next);
  },

  getUserRepos({ type, token }) {
    let url = 'https://api.github.com/user/repos';
    if (type) {
      url += '?type=' + type;
    }

    return this.get(url, { token, accept: 'application/vnd.github.mercy-preview+json' });
  },

  getUsersUserRepos(user, { token }) {
    return this.get(`https://api.github.com/users/${user}/repos`, { token, accept: 'application/vnd.github.mercy-preview+json' });
  },

  getReposOwnerRepoStargazers(fullName, { token }) {
    return this.get(`https://api.github.com/repos/${fullName}/stargazers`, { token });
  },

  getReposOwnerRepoWatchers(fullName, { token }) {
    return this.get(`https://api.github.com/repos/${fullName}/subscribers`, { token });
  },

  getReposOwnerRepoProjects(fullName, { token }) {
    return this.get(`https://api.github.com/repos/${fullName}/projects`, { token, accept: 'application/vnd.github.inertia-preview+json' });
  },

  async patchReposOwnerRepo(fullName, token, body) {
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
