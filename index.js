const fetch = require('node-fetch');

let limit;

module.exports = {
  format(duration) {
    let human = '';
    // Get the duration in seconds
    let seconds = ~~(duration / 1000);
    // Get the duration in minutes
    const minutes = ~~(seconds / 60);
    if (minutes > 0) {
      human += minutes < 10 ? '0' + minutes : minutes;
    }

    // Get the reset duration in remaining seconds
    seconds = seconds % 60;
    human += ':' + (seconds < 10 ? '0' + seconds : seconds);

    return human;
  },

  async wait(onWaitChange, waitInterval) {
    do {
      if (onWaitChange) {
        if (onWaitChange === true) {
          const humanInterval = this.format(waitInterval);
          const humanReset = this.format(limit.reset - Date.now());
          console.log(`Waiting ${humanInterval} for reset at ${limit.reset.toLocaleTimeString('en-us')} (${humanReset})…`);
        }
        else {
          onWaitChange(limit.reset);
        }
      }

      await new Promise(resolve => setTimeout(resolve, waitInterval));
    } while (limit.reset > Date.now());
  },

  // TODO: Split into two instead of the `Array.isArray` heuristic?: getPaged + get
  async *get(url, { token, accept, pageLimit, onLimitChange, onPageChange, waitInterval, onWaitChange } = {}) {
    let links = { next: { url, page: 1 } };
    let attempt = 1;
    do {
      if (onPageChange) {
        const pageNumber = links.next.page;
        const pageCount = links.last ? links.last.page : undefined;
        const pageUrl = links.next.url;
        if (onPageChange === true) {
          console.log(`${pageCount ? `Page ${pageNumber}/${pageCount}` : `Initial page`} of ${url}, attempt #${attempt}${pageCount ? ` (${pageUrl})` : ''}`);
        }
        else {
          onPageChange({ pageNumber, pageCount, url, pageUrl, attempt });
        }
      }

      const response = await fetch(links.next.url, { headers: { Authorization: token ? `token ${token}` : undefined, Accept: accept } });

      limit = {
        limit: Number(response.headers.get('x-ratelimit-limit')),
        remaining: Number(response.headers.get(['x-ratelimit-remaining'])),
        reset: new Date(Number(response.headers.get(['x-ratelimit-reset'])) * 1000)
      };

      if (onLimitChange) {
        if (onLimitChange === true) {
          const humanReset = this.format(limit.reset - Date.now());
          const humanInstant = new Date().toDateString() === limit.reset.toDateString()
            ? limit.reset.toLocaleTimeString()
            : limit.reset.toLocaleString();
          console.log(`Limit ${limit.remaining}/${limit.limit}, resetting at ${humanInstant} (${humanReset})`);
        }
        else {
          onLimitChange(limit);
        }
      }

      if (!response.ok) {
        if (attempt === 10) {
          throw new Error(`Failing at ${links.next.url} non-ok ${response.status} ${response.statusText} response!`);
        }

        // Note that this means the request was rate limited and did not provide data
        if (response.status === 403 && limit.remaining === 0) {
          attempt++;

          // Wait for the rate limit to reset before trying to go for the next page
          await this.wait(onWaitChange, waitInterval || (limit.reset - Date.now()));

          // Retry with the same URL but an increased attempt number
          continue;
        }

        // Note that this means the request was load balanced and did not provide data
        if (response.status === 502 && limit.limit === 0 && limit.remaining === 0 /* TODO: `&& limit.reset === '1970-01-01T00:00:00.000Z'` */) {
          attempt++;

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

      if (limit.remaining === 0 && links.next !== undefined) {
        // Wait for the rate limit to reset before trying to go for the next page
        await this.wait(onWaitChange, waitInterval || (limit.reset - Date.now()));
      }
    } while (links.next && (pageLimit === undefined || --pageLimit > 0));
  },

  getUserRepos({ type, token, ...rest } = {}) {
    let url = 'https://api.github.com/user/repos';
    if (type) {
      url += '?type=' + type;
    }

    // Include the repository topics using the Mercy preview flag
    return this.get(url, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getUserStarred({ sort, token, ...rest } = {}) {
    let url = 'https://api.github.com/user/starred';
    if (sort) {
      url += '?sort=' + sort;
    }

    // Include the repository topics using the Mercy preview flag
    return this.get(url, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getUsersUserRepos(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag
    return this.get(`https://api.github.com/users/${user}/repos`, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getUsersUserStarred(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag
    return this.get(`https://api.github.com/users/${user}/starred`, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getReposOwnerRepoStargazers(fullName, { token, ...rest } = {}) {
    return this.get(`https://api.github.com/repos/${fullName}/stargazers`, { token, ...rest });
  },

  getReposOwnerRepoWatchers(fullName, { token, ...rest } = {}) {
    return this.get(`https://api.github.com/repos/${fullName}/subscribers`, { token, ...rest });
  },

  getReposOwnerRepoProjects(fullName, { token, ...rest } = {}) {
    // Include the repository projects using the Inertia preview flag
    return this.get(`https://api.github.com/repos/${fullName}/projects`, { token, accept: 'application/vnd.github.inertia-preview+json', ...rest });
  },

  getReposOwnerRepoReleases(fullName, { token, ...rest } = {}) {
    return this.get(`https://api.github.com/repos/${fullName}/releases`, { token, ...rest });
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
