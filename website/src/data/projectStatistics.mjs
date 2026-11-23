import {aggregateSources, legacySources, normalizeSource, validCounter, validMetric} from './downloadSources.mjs';
export const projectStatsUrl = 'https://raw.githubusercontent.com/DoriosStudios/Dorios-Site/site-stats/project-stats-v2.json';

export function formatDownloadCount(value) {
  const count = Math.max(0, Math.floor(Number(value) || 0));
  if (count === 0) return '0';
  if (count < 100) return '<100';
  if (count < 1000) return `${Math.floor(count / 100) * 100}+`;
  const units = [[1_000_000_000, 'B'], [1_000_000, 'M'], [1_000, 'K']];
  const [size, suffix] = units.find(([unitSize]) => count >= unitSize);
  const truncated = Math.floor((count / size) * 10) / 10;
  return `${Number.isInteger(truncated) ? truncated.toFixed(0) : truncated.toFixed(1)}${suffix}+`;
}

export function validProjectStatistics(value) {
  if (value?.schemaVersion === 2) {
    return value.projects && typeof value.projects === 'object' && !Array.isArray(value.projects)
      && Object.values(value.projects).every(project => Array.isArray(project?.sources)
        && new Set(project.sources.map(source => source?.id)).size === project.sources.length
        && project.sources.every(source => source && typeof source.id === 'string' && typeof source.provider === 'string'
          && typeof source.name === 'string' && typeof source.countingKey === 'string' && validMetric(source.metric)
          && typeof source.enabled === 'boolean' && typeof source.countable === 'boolean'
          && (source.value === null || validCounter(source.value))
          && (source.value === null || Number.isFinite(Date.parse(source.updatedAt)))));
  }
  if (value?.schemaVersion !== 1) return false;
  return ['githubReleaseStats', 'curseForgeStats'].every(key => {
    const records = value[key];
    return records && typeof records === 'object' && !Array.isArray(records)
      && Object.values(records).every(record => record && Number.isSafeInteger(record.downloads)
        && record.downloads >= 0 && (record.version == null || typeof record.version === 'string'));
  });
}

export function withProjectStatistics(project, statistics) {
  if (!project) return project;
  if (!statistics && project.downloadStats?.sources) return project;
  const oldSources = project.downloadStats?.sources ?? [];
  const incoming = statistics?.schemaVersion === 2 ? statistics.projects[project.id]?.sources : legacySources(project, statistics);
  if (!incoming) return project;
  const sources = incoming.map(source => {
    const cached = oldSources.find(row => row.id === source.id);
    const row = normalizeSource(source, source.value === null || source.status === 'unavailable' ? null
      : {value: source.value, metric: source.metric, updatedAt: source.updatedAt, metadata: source.metadata}, cached);
    if (source.status === 'stale' && row.value !== null) row.status = 'stale';
    return row;
  });
  const totals = aggregateSources(sources);
  const versionSource = totals.sources.find(source => source.enabled && typeof source.metadata?.version === 'string');
  return {...project, version: versionSource?.metadata.version ?? project.version,
    downloadStats: {...totals, display: totals.available ? formatDownloadCount(totals.total) : '—'},
    metrics: {...project.metrics, downloads: totals.available ? totals.total : null}};
}
