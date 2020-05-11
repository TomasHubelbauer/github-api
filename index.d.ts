declare const _exports: {
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
    get(path: string, { params, token, accept, pageSize, pageLimit, onLimitChange, onPageChange, waitInterval, onWaitChange }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/repos/#list-repositories-for-the-authenticated-user
     *
     * @param {string} type The type of repositories to include.
     * @param {string} token The API token if not included in `rest`.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUserRepos({ type, token, ...rest }?: string): any;
    /**
     * https://developer.github.com/v3/activity/starring/#list-repositories-starred-by-the-authenticated-user
     *
     * @param {string} sort The sort ordering.
     * @param {string} token The API token if not included in `rest`.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUserStarred({ sort, token, ...rest }?: string): any;
    /**
     * https://developer.github.com/v3/activity/watching/#list-repositories-watched-by-the-authenticated-user
     *
     * @param {string} token The API token if not included in `rest`.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUserSubscriptions({ token, ...rest }?: string): any;
    /**
     * https://developer.github.com/v3/users/followers/#list-followers-of-the-authenticated-user
     *
     * @param {string} token The API token if not included in `rest`.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUserFollowers({ token, ...rest }?: string): any;
    /**
     * https://developer.github.com/v3/repos/#list-repositories-for-a-user
     *
     * @param {string} user The
     * @param {string} token The API token if not included in `rest`.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUsersUserRepos(user: string, { token, ...rest }?: string): any;
    /**
     * https://developer.github.com/v3/activity/starring/#list-repositories-starred-by-a-user
     *
     * @param {string} user The user to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUsersUserStarred(user: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/activity/watching/#list-repositories-watched-by-a-user
     *
     * @param {string} user The user to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUsersUserSubscriptions(user: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/users/followers/#list-followers-of-a-user
     *
     * @param {string} user The user to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getUsersUserFollowers(user: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/activity/starring/#list-stargazers
     *
     * @param {string} fullName The repo to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getReposOwnerRepoStargazers(fullName: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/activity/watching/#list-watchers
     *
     * @param {string} fullName The repo to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getReposOwnerRepoWatchers(fullName: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/projects/#list-repository-projects
     *
     * @param {string} fullName The repo to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getReposOwnerRepoProjects(fullName: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/repos/releases/#list-releases-for-a-repository
     *
     * @param {string} fullName The repo to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getReposOwnerRepoReleases(fullName: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
     *
     * @param {string} fullName The repo to get the data for.
     * @param {GetOptions} rest See GetOptions atop.
     * @returns {AsyncIterableIterator<unknown>}
     */
    getReposOwnerRepoCommits(fullName: string, { token, ...rest }?: {
        /**
         * The query string parameters.
         */
        params: string[];
        /**
         * The GitHub API authentication PAT which bumps the rate limit from 60 to 5000.
         */
        token: string;
        /**
         * The HTTP Accept header value for opting in to experimental API bits (preview features).
         */
        accept: string;
        /**
         * The maximum number of items to return per page - the default is 100 - the maximum.
         */
        pageSize: number;
        /**
         * The maximum number of pages to automatically page through.
         */
        pageLimit: number;
        /**
         * See LimitChangeCallback atop.
         */
        onLimitChange: true | ((remaining: number, limit: number, reset: Date) => void);
        /**
         * See PageChangeCallback atop.
         */
        onPageChange: true | ((pageNumber: number, pageCount: number, url: string, pageUrl: string, attempt: number) => void);
        /**
         * The interval at which the reset waiting callback is called.
         */
        waitInterval: number;
        /**
         * See WaitChangeCallback atop.
         */
        onWaitChange: true | ((reset: Date) => void);
    }): any;
    /**
     * https://developer.github.com/v3/activity/watching/#get-a-repository-subscription
     *
     * @param {string} fullName The repo to get the data for.
     * @param {string} token The GitHub API PAT.
     */
    getReposOwnerRepoSubscription(fullName: string, token: string): Promise<any>;
    /**
     * https://developer.github.com/v3/repos/#update-a-repository
     *
     * @param {string} fullName The repo to get the data for.
     * @param {string} token The GitHub API PAT.
     * @param {unknown} body The request body.
     */
    patchReposOwnerRepo(fullName: string, token: string, body: unknown): Promise<void>;
};
export = _exports;
// Mon May 11 19:52:05 UTC 2020
