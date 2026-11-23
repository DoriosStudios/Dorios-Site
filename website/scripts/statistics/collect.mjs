import {providers, projectSources, legacySources, migrateStatistics, normalizeSource} from '../../src/data/downloadSources.mjs';

export async function collectStatistics({projects, previous, fallback, offline = false, adapters = {}, request = fetch, env = process.env}) {
  const migrated = migrateStatistics(previous, projects);
  const output = {schemaVersion: 2, generatedAt: new Date().toISOString(), projects: {}};
  for (const project of projects) {
    const seeds = legacySources(project, fallback);
    const old = migrated.projects?.[project.id]?.sources ?? [];
    const rows = [];
    for (const source of projectSources(project)) {
      const candidates = [...seeds, ...old].filter(row => row.id === source.id && row.countingKey === source.countingKey);
      const cached = candidates.sort((a, b) => (b.value ?? -1) - (a.value ?? -1))[0];
      let result;
      if (source.enabled && source.countable && !offline) {
        try {
          const file = providers[source.provider]?.adapter;
          if (!adapters[source.provider] && (!file || !/^[a-z0-9-]+\.mjs$/.test(file))) throw new Error('provider-not-configured');
          const adapter = adapters[source.provider] ?? await import(new URL(`./providers/${file}`, import.meta.url));
          result = await adapter.collect(source, {project, previous: cached, request, env});
        } catch (error) { result = {error: error.message}; }
      }
      rows.push(normalizeSource(source, result, cached, output.generatedAt));
    }
    output.projects[project.id] = {sources: rows};
  }
  // Older deployed clients still consume these maps from the same data branch.
  for (const [key, provider] of [['githubReleaseStats', 'github-releases'], ['curseForgeStats', 'curseforge']]) {
    output[key] = {};
    for (const project of projects) {
      const source = output.projects[project.id].sources.find(row => row.provider === provider && row.enabled && row.value !== null);
      if (source) output[key][project.id] = {...source.metadata, downloads: source.value, updatedAt: source.updatedAt};
    }
  }
  return output;
}
