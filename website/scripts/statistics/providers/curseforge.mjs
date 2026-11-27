import {fetchProject} from '../../refresh-curseforge-stats.mjs';
export async function collect(source, {project, previous, request, env}) {
  const record = await fetchProject({...project, curseforgeProjectId: source.modId,
    links: {...project.links, curseforge: source.url}}, previous?.metadata, request, env);
  return {value: record.downloads, updatedAt: record.updatedAt, metadata: record};
}
