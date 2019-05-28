import fetch, { Response } from 'node-fetch';

async function* get<T>(url: string): AsyncIterableIterator<Readonly<T>> {
  let attempt = 1;
  do {
    const response = await fetch('https://api.github.com/' + url, { headers: { 'Accept': 'application/vnd.github.mercy-preview+json' /* `topics` */ } });
    const rateLimit = parseRateLimit(response);
    if (response.ok) {
      yield await response.json() as T;

      const links = parseLinks(response);
      if (rateLimit.remaining === 0 && links.next !== undefined) {
        // Wait for the rate limit to reset before trying to go for the next page
        await wait(rateLimit.reset);
      }

      url = links.next;
      attempt = 0;
      continue;
    }

    if (attempt === 10) {
      throw new Error('Too many attempts in a row failed');
    }

    // Note that this means the request was rate limited and did not provide data
    if (response.status === 403 && rateLimit.remaining === 0) {
      await wait(rateLimit.reset);
      attempt++;
      // TODO: Wait with backoff
      continue;
    }

    // Note that this means the request was load balanced and did not provide data
    if (response.status === 502 && rateLimit.limit === 0 && rateLimit.remaining === 0 /* TODO: && rateLimit.reset === '1970-01-01T00:00:00.000Z' */) {
      attempt++;
      // TODO: Wait with backoff
      continue;
    }

    throw new Error('Request failed with an unknown error');
  } while (url !== undefined);
}

async function* getArray<T>(url: string): AsyncIterableIterator<Readonly<T>> {
  for await (const page of get<T[]>(url)) {
    yield* page;
  }
}

function wait(reset: Date) {
  return new Promise(resolve => window.setTimeout(resolve, reset.valueOf() - Date.now()));
}

function parseRateLimit(response: Response): Readonly<RateLimit> {
  const limit = Number(response.headers.get('x-ratelimit-limit'));
  const remaining = Number(response.headers.get('x-ratelimit-remaining'));
  const reset = new Date(Number(response.headers.get('x-ratelimit-reset')) * 1000);
  return { limit, remaining, reset };
}

function parseLinks(response: Response): Readonly<Links> {
  const link = response.headers.get('link');
  const links: Links = {};
  const regexp = /<https:\/\/api\.github\.com\/([^>]*)>; rel="([^"]*)"/g; // TODO: Use named capture groups when supported in Node
  let match: RegExpExecArray | null = null;
  while ((match = regexp.exec(link)) !== null) {
    links[match[2]] = match[1];
  }

  return links;
}

void async function main() {
  const repositories = getArray<Repository>('users/tomashubelbauer/repos');
  for await (let repository of repositories) {
    if (repository.stargazers_count === 0) {
      console.log(repository.name, 'is not starred');
    }

    if (repository.watchers_count === 0) {
      console.log(repository.name, 'is not watched');
    }

    if (repository.fork) {
      console.log(repository.name, 'is a fork');
    }

    // TODO: If the repository has GitHub Pages, check this matches their URL (or custom domain - maybe by CNAME file?)
    if (repository.homepage === null) {
      console.log(repository.name, 'does not have a home page');
    }

    if (repository.description === null) {
      console.log(repository.name, 'does not have a description');
    }

    // TODO: Decide how to handle marking repositories for the site with topics and check that
    // TODO: See if `topics` can ever be a valid but empty array of if the `undefined` check suffices
    if (repository.topics === undefined || repository.topics.length === 0) {
      console.log(repository.name, 'has no topics');
    }

    // TODO: Figure out how to handle abbreviations in titles which should be okay
    // TODO: Find a way to fetch the README and pull the main heading from it
    const title = repository.name; // TODO: Slugify the title
    if (title !== repository.name) {
      console.log(repository.name, 'title does not match slug');
    }

    // TODO: Figure out if I need both of these
    if (repository.open_issues > 0 || repository.open_issues_count > 0) {
      console.log(repository.name, 'has open issues');
    }

    // TODO: Add a method for getting repositories I watch but which have releases so that I can watch just the releases
  }
}()

type RateLimit = {
  limit: Number;
  remaining: Number;
  reset: Date;
};

type Links = {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
};

type Repository = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: User;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: string;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  topics: string[];
  license: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
};

type User = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
};
