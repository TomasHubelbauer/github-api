import fetch from 'node-fetch';

async function getRepos(user: string) {
  const response = await fetch(`https://api.github.com/users/tomashubelbauer/repos`);
  const rateLimitLimit = Number(response.headers.get('x-ratelimit-limit'));
  const rateLimitRemaining = Number(response.headers.get('x-ratelimit-remaining'));
  const rateLimitReset = new Date(Number(response.headers.get('x-ratelimit-reset')));
  const link = response.headers.get('link');
  let links: { [rel: string]: string } = {};
  const regexp = /<https:\/\/api\.github\.com\/([^>]*)>; rel="([^"]*)"/g; // TODO: Use named capture group
  let match: RegExpExecArray | null = null;
  while ((match = regexp.exec(link)) !== null) {
    links[match.groups[1]] = match.groups[0];
  }

  console.log({ rateLimitLimit, rateLimitRemaining, rateLimitReset, link, links });
  const data = await response.json();

  return data.length;
}

getRepos('tomashubelbauer').then(console.log);
