const fetch = require('node-fetch');

module.exports = {
  /**
   * Called when the rate limit information changes.
   * 
   * If the provided value is `true` instead of a custom function, the default is used,
   * which `console.log`s messages similar to this:
   * 
   * > Limit 59/60, resetting at 9:05:18 PM (59:55)
   * 
   * @typedef {(((remaining: number, limit: number, reset: Date) => void) | true)} LimitChangeCallback
   * @param {number} remaining The number of remaining requests in the limit (until the reset)
   * @param {number} limit the total number of requests available per the limit reset period.
   * - With no PAT, the limit is 600
   * - With custom PAT, the limit is 5000
   * - With integration PAT (`secrets.GITHUB_TOKEN`), the limit is 1000
   * @param {Date} reset The date and time of the API rate limit reset
   */

  /**
   * Called when the current page of all the response pages being fetched changes.
   * 
   * If the provided value is `true`, instead of a custom function, the default is used,
   * which `console.log`s a message similar to this:
   * 
   * > Page 2/5 of https://api.github.com/user/repos, attempt #1 (https://api.github.com/user/repos?page=2)
   * 
   * @typedef {(((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void) | true)} PageChangeCallback 
   * @param {number} pageNumber The number of the page being fetched currently
   * @param {number} pageCount The number of pages until all the items have been yield - not known on page #1
   * @param {string} url The API URL being fetched
   * @param {string} pageUrl The API URL of the current page being fetched
   * @param {number} attempt The attempt number in case the request failed and is being retried
   */

  /**
   * Called when the rate limit waiting changes.
   * 
   * If the provided value is `true`, instead of a custom function, the default is used,
   * which `console.log`s a message similar to this:
   * 
   * > Waiting :01 for reset at 8:05:10 PM (:11)…
   * 
   * @typedef {(((reset: Date) => void) | true)} WaitChangeCallback
   * @param {Date} reset The date and time of the API rate limit reset 
   */

  /**
   * @typedef {object} GetOptions
   * @property {string[]} params The query string parameters.
   * @property {string} token The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
   * @property {string} accept The HTTP Accept header value for opting in to experimental API bits (preview features).
   * @property {number} pageSize The maximum number of items to return per page - the default is 100 - the maximum.
   * @property {number} pageLimit The maximum number of pages to automatically page through.
   * @property {LimitChangeCallback} onLimitChange See LimitChangeCallback atop.
   * @property {PageChangeCallback} onPageChange See PageChangeCallback atop.
   * @property {number} waitInterval The interval at which the reset waiting callback is called.
   * @property {WaitChangeCallback} onWaitChange See WaitChangeCallback atop.
   */

  /**
   * Queries the given API endpoint and yield the items of the resultant array.
   * 
   * Pages the response as needed automatically until all pages are exhausted.
   * 
   * Throws if the response is not an array.
   * Includes the original response in the thrown `Error`'s `data` field.
   * 
   * @param {string} path A relative GitHub API URL route string.
   * @param {GetOptions} options See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
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
          const humanReset = format(reset - Date.now());
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
          await wait(reset, onWaitChange, waitInterval);

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
        const error = new Error(`The returned response is not an array.`);
        error.data = items;
        throw error;
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
        await wait(reset, onWaitChange, waitInterval);
      }
    } while (links.next && (pageLimit === undefined || --pageLimit > 0));
  },

  /**
   * https://developer.github.com/v3/repos/#list-repositories-for-the-authenticated-user
   * 
   * @param {string} type The type of repositories to include.
   * @param {string} token The API token if not included in `rest`.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUserRepos({ type, token, ...rest } = {}) {
    const params = { type };

    // Include the repository topics using the Mercy preview flag
    return this.get('user/repos', { params, token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  /**
   * https://developer.github.com/v3/activity/starring/#list-repositories-starred-by-the-authenticated-user
   * 
   * @param {string} sort The sort ordering.
   * @param {string} token The API token if not included in `rest`.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUserStarred({ sort, token, ...rest } = {}) {
    const params = { sort };

    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    // Include the starred date using the Star preview flag: `application/vnd.github.v3.star+json`
    return this.get('user/starred', { params, token, accept: 'application/vnd.github.v3.star+json', ...rest });
  },

  /**
   * https://developer.github.com/v3/activity/watching/#list-repositories-watched-by-the-authenticated-user
   * 
   * @param {string} token The API token if not included in `rest`.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUserSubscriptions({ token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    return this.get('user/subscriptions', { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  /**
   * https://developer.github.com/v3/users/followers/#list-followers-of-the-authenticated-user
   * 
   * @param {string} token The API token if not included in `rest`.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUserFollowers({ token, ...rest } = {}) {
    return this.get('user/followers', { token, ...rest });
  },

  /**
   * https://developer.github.com/v3/repos/#list-repositories-for-a-user
   * 
   * @param {string} user The 
   * @param {string} token The API token if not included in `rest`.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUsersUserRepos(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag
    return this.get(`users/${user}/repos`, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  /**
   * https://developer.github.com/v3/activity/starring/#list-repositories-starred-by-a-user
   * 
   * @param {string} user The user to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUsersUserStarred(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    // Include the starred date using the Star preview flag: `application/vnd.github.v3.star+json`
    return this.get(`users/${user}/starred`, { token, accept: 'application/vnd.github.v3.star+json', ...rest });
  },

  /**
   * https://developer.github.com/v3/activity/watching/#list-repositories-watched-by-a-user
   * 
   * @param {string} user The user to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUsersUserSubscriptions(user, { token, ...rest } = {}) {
    // Include the repository topics using the Mercy preview flag: `application/vnd.github.mercy-preview+json`
    return this.get(`users/${user}/subscriptions`, { token, accept: 'application/vnd.github.mercy-preview+json', ...rest });
  },

  /**
   * https://developer.github.com/v3/users/followers/#list-followers-of-a-user
   * 
   * @param {string} user The user to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getUsersUserFollowers(user, { token, ...rest } = {}) {
    return this.get(`users/${user}/followers`, { token, ...rest });
  },

  /**
   * https://developer.github.com/v3/activity/starring/#list-stargazers
   * 
   * @param {string} fullName The repo to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getReposOwnerRepoStargazers(fullName, { token, ...rest } = {}) {
    return this.get(`repos/${fullName}/stargazers`, { token, ...rest });
  },

  /**
   * https://developer.github.com/v3/activity/watching/#list-watchers
   * 
   * @param {string} fullName The repo to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getReposOwnerRepoWatchers(fullName, { token, ...rest } = {}) {
    return this.get(`repos/${fullName}/subscribers`, { token, ...rest });
  },

  /**
   * https://developer.github.com/v3/projects/#list-repository-projects
   * 
   * @param {string} fullName The repo to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getReposOwnerRepoProjects(fullName, { token, ...rest } = {}) {
    // Include the repository projects using the Inertia preview flag
    return this.get(`repos/${fullName}/projects`, { token, accept: 'application/vnd.github.inertia-preview+json', ...rest });
  },

  /**
   * https://developer.github.com/v3/repos/releases/#list-releases-for-a-repository
   * 
   * @param {string} fullName The repo to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getReposOwnerRepoReleases(fullName, { token, ...rest } = {}) {
    return this.get(`repos/${fullName}/releases`, { token, ...rest });
  },

  /**
   * https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
   * 
   * @param {string} fullName The repo to get the data for.
   * @param {GetOptions} rest See GetOptions atop. 
   * @returns {AsyncIterableIterator<unknown>}
   */
  getReposOwnerRepoCommits(fullName, { token, ...rest } = {}) {
    return this.get(`repos/${fullName}/commits`, { token, ...rest });
  },

  /**
   * https://developer.github.com/v3/activity/watching/#get-a-repository-subscription
   * 
   * @param {string} fullName The repo to get the data for.
   * @param {string} token The GitHub API PAT.
   */
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

  /**
   * https://developer.github.com/v3/repos/#update-a-repository
   * 
   * @param {string} fullName The repo to get the data for.
   * @param {string} token The GitHub API PAT.
   * @param {unknown} body The request body.
   */
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

function format(duration) {
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
}

async function wait(reset, onWaitChange, waitInterval) {
  // Wait it all out in one timeout if more granularity is not requested
  waitInterval = waitInterval || (reset - Date.now());

  do {
    if (onWaitChange) {
      if (onWaitChange === true) {
        const humanInterval = format(waitInterval);
        const humanReset = format(reset - Date.now());
        console.log(`Waiting ${humanInterval} for reset at ${reset.toLocaleTimeString('en-us')} (${humanReset})…`);
      }
      else {
        onWaitChange(reset);
      }
    }

    await new Promise(resolve => setTimeout(resolve, waitInterval));
  } while (reset > Date.now());
}
