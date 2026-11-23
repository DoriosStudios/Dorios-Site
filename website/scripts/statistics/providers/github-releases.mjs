import {fetchReleaseStats} from '../../refresh-github-release-stats.mjs';
export async function collect(source, {project, request}) {
  const url = new URL(source.url);
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || !/^\/[^/]+\/[^/]+\/?$/.test(url.pathname)) throw new Error('Invalid repository URL');
  const record = await fetchReleaseStats({id: project.id, repository: url.pathname.replace(/^\/|\/$/g, '')}, request);
  return {value: record.downloads, updatedAt: record.updatedAt, metadata: record};
}
