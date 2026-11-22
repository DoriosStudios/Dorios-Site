export const projectStatsUrl = 'https://raw.githubusercontent.com/DoriosStudios/Dorios-Site/site-stats/project-stats.json';

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
  if (value?.schemaVersion !== 1) return false;
  return ['githubReleaseStats', 'curseForgeStats'].every(key => {
    const records = value[key];
    return records && typeof records === 'object' && !Array.isArray(records)
      && Object.values(records).every(record => record && Number.isSafeInteger(record.downloads)
        && record.downloads >= 0 && (record.version == null || typeof record.version === 'string'));
  });
}

export function withProjectStatistics(project, statistics) {
  if (!project || !statistics) return project;
  const previous = project.downloadStats;
  const fresher = (record, cachedAt) => Number.isFinite(Date.parse(cachedAt))
    && !(Date.parse(record?.updatedAt) >= Date.parse(cachedAt)) ? undefined : record;
  const curseForgeRecord = fresher(statistics.curseForgeStats[project.id], previous?.curseForgeUpdatedAt);
  const githubRecord = fresher(statistics.githubReleaseStats[project.id], previous?.githubUpdatedAt);
  if (!curseForgeRecord && !githubRecord) return project;
  const curseForge = Math.max(0, Number(curseForgeRecord?.downloads ?? previous?.curseForge) || 0);
  const github = Math.max(0, Number(githubRecord?.downloads ?? previous?.github) || 0);
  const total = curseForge + github;
  const downloadStats = {
    curseForge, github, total, display: formatDownloadCount(total),
    hasCurseForge: Boolean(curseForgeRecord || previous?.hasCurseForge),
    hasGitHub: Boolean(githubRecord || previous?.hasGitHub),
    curseForgeUpdatedAt: curseForgeRecord?.updatedAt ?? previous?.curseForgeUpdatedAt ?? null,
    githubUpdatedAt: githubRecord?.updatedAt ?? previous?.githubUpdatedAt ?? null,
    updatedAt: [curseForgeRecord?.updatedAt, githubRecord?.updatedAt, previous?.updatedAt].filter(Boolean).sort().at(-1) ?? null,
  };
  return {...project, version: githubRecord?.version ?? project.version, downloadStats,
    metrics: {...project.metrics, downloads: total}};
}
