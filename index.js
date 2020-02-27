const fetch = require('node-fetch');

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

  async wait(reset, onWaitChange, waitInterval) {
    // Wait it all out in one timeout if more granularity is not requested
    waitInterval = waitInterval || (reset - Date.now());

    do {
      if (onWaitChange) {
        if (onWaitChange === true) {
          const humanInterval = this.format(waitInterval);
          const humanReset = this.format(reset - Date.now());
          console.log(`Waiting ${humanInterval} for reset at ${reset.toLocaleTimeString('en-us')} (${humanReset})…`);
        }
        else {
          onWaitChange(reset);
        }
      }

      await new Promise(resolve => setTimeout(resolve, waitInterval));
    } while (reset > Date.now());
  },

  async *get(path, { params = {}, token, accept, pageSize, pageLimit, onLimitChange, onPageChange, waitInterval, onWaitChange } = {}) {
    // Default to the maximum page size to save on rate limit when iterating over the entire collection
    params['per_page'] = pageSize || 100;

    let query = '';
    const keys = Object.keys(params);
    for (const key of keys) {
      const value = params[key];
      query += (query ? '&' : '?') + key + '=' + value;
    }

    const url = `https://api.github.com/` + path + query;
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

      const limit = Number(response.headers.get('x-ratelimit-limit'));
      const remaining = Number(response.headers.get(['x-ratelimit-remaining']));
      const reset = new Date(Number(response.headers.get(['x-ratelimit-reset'])) * 1000);

      if (onLimitChange) {
        if (onLimitChange === true) {
          const humanReset = this.format(reset - Date.now());
          const humanInstant = new Date().toDateString() === reset.toDateString()
            ? reset.toLocaleTimeString()
            : reset.toLocaleString();
          console.log(`Limit ${remaining}/${limit}, resetting at ${humanInstant} (${humanReset})`);
        }
        else {
          onLimitChange({ limit, remaining, reset });
        }
      }

      if (!response.ok) {
        if (attempt === 10) {
          throw new Error(`Failing at ${links.next.url} non-ok ${response.status} ${response.statusText} response!`);
        }

        // Note that this means the request was rate limited and did not provide data
        if (response.status === 403 && remaining === 0) {
          attempt++;

          // Wait for the rate limit to reset before trying to go for the next page
          await this.wait(reset, onWaitChange, waitInterval);

          // Retry with the same URL but an increased attempt number
          continue;
        }

        // Note that this means the request was load balanced and did not provide data
        if (response.status === 502 && limit === 0 && remaining === 0 /* TODO: `&& reset === '1970-01-01T00:00:00.000Z'` */) {
          attempt++;

          // Retry with the same URL but an increased attempt number
          continue;
        }
      }

      // Reset the attempt counter on each successful fetch
      attempt = 1;

      const items = await response.json();
      if (!Array.isArray(items)) {
        throw new Error(JSON.stringify(items));
      }

      for (const item of items) {
        yield item;
      }

      links = {};
      const link = response.headers.get('link');
      const regex = /<(?<url>https:\/\/api\.github\.com(\/\w+)+\?(\w+=\w+&)*page=(?<page>\d+))>;\srel="(?<rel>\w+)"(,\s)?/g;
      let match;
      while (match = regex.exec(link)) {
        const { url, page, rel } = match.groups;
        links[rel] = { page, url };
      }

      if (remaining === 0 && links.next !== undefined) {
        // Wait for the rate limit to reset before trying to go for the next page
        await this.wait(reset, onWaitChange, waitInterval);
      }
    } while (links.next && (pageLimit === undefined || --pageLimit > 0));
  },

  getUserRepos({ type, token, ...rest } = {}) {
    const params = { type };

    // Include the repository topics using the Mercy preview flag
    return this.get('user/repos', { params, token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getUserStarred({ sort, token, ...rest } = {}) {
    const params = { sort };

    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    // Include the starred date using the Star preview flag: `application/vnd.github.v3.star+json`
    return this.get('user/starred', { params, token, accept: 'application/vnd.github.v3.star+json', ...rest });
  },

  getUserSubscriptions({ token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    return this.get('user/subscriptions', { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getUserFollowers({ token, ...rest } = {}) {
    return this.get('user/followers', { token, ...rest });
  },

  getUsersUserRepos(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag
    return this.get(`users/${user}/repos`, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getUsersUserStarred(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    // Include the starred date using the Star preview flag: `application/vnd.github.v3.star+json`
    return this.get(`users/${user}/starred`, { token, accept: 'application/vnd.github.v3.star+json', ...rest });
  },

  getUsersUserSubscriptions(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    return this.get(`users/${user}/subscriptions`, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  getUsersUserFollowers(user, { token, ...rest } = {}) {
    return this.get(`users/${user}/followers`, { token, ...rest });
  },

  getReposOwnerRepoStargazers(fullName, { token, ...rest } = {}) {
    return this.get(`repos/${fullName}/stargazers`, { token, ...rest });
  },

  getReposOwnerRepoWatchers(fullName, { token, ...rest } = {}) {
    return this.get(`repos/${fullName}/subscribers`, { token, ...rest });
  },

  getReposOwnerRepoProjects(fullName, { token, ...rest } = {}) {
    // Include the repository projects using the Inertia preview flag
    return this.get(`repos/${fullName}/projects`, { token, accept: 'application/vnd.github.inertia-preview+json', ...rest });
  },

  getReposOwnerRepoReleases(fullName, { token, ...rest } = {}) {
    return this.get(`repos/${fullName}/releases`, { token, ...rest });
  },

  async getReposOwnerRepoSubscription(fullName, token) {
    try {
      const response = await fetch(`https://api.github.com/repos/${fullName}/subscription`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/json',
        }
      });

      return response.json();
    }
    catch (error) {
      // TODO: Do more specific checking
      return null;
    }
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
