import providers from './downloadProviders.json' with {type: 'json'};

export {providers};
export const validCounter = value => Number.isSafeInteger(value) && value >= 0;
export const validMetric = value => ['downloads', 'download-starts', 'clicks'].includes(value);
export function projectSources(project) {
  const automatic = Object.entries(providers).filter(([, p]) => p.link && project.links?.[p.link])
    .map(([provider, p]) => ({id: provider, provider, url: project.links[p.link], modId: project.curseforgeProjectId}));
  const sources = new Map(automatic.map(source => [source.id, source]));
  for (const source of project.statisticsSources ?? []) sources.set(source.id, source);
  return [...sources.values()].map(source => {
    const p = providers[source.provider] ?? {};
    const identity = source.url?.replace(/\/$/, '').toLowerCase() ?? `${project.id}:${source.event ?? source.id}`;
    return {name: p.name ?? source.provider, icon: p.icon ?? 'platform', enabled: true,
      countable: p.countable !== false, metric: p.metric ?? 'downloads', ...source,
      countingKey: source.countingKey ?? `${source.provider}:${identity}`};
  });
}

export function normalizeSource(source, result, previous, now = new Date().toISOString()) {
  const same = previous?.provider === source.provider && previous?.countingKey === source.countingKey
    && previous?.metric === source.metric;
  const cached = same && validCounter(previous.value) ? previous : null;
  const usable = result && result.available !== false && validCounter(result.value)
    && (!result.metric || result.metric === source.metric) && Number.isFinite(Date.parse(result.updatedAt));
  const regressed = usable && cached && result.value < cached.value;
  const older = usable && cached && Date.parse(result.updatedAt) < Date.parse(cached.updatedAt);
  const fresh = usable && !regressed && !older;
  return {...source, value: fresh ? result.value : cached?.value ?? null,
    updatedAt: fresh ? result.updatedAt : cached?.updatedAt ?? null, checkedAt: now,
    status: !source.enabled ? 'disabled' : !source.countable ? 'not-counted' : fresh ? 'available' : cached ? 'stale' : 'unavailable',
    metadata: fresh ? result.metadata ?? {} : cached?.metadata ?? {},
    error: fresh ? null : regressed ? 'counter-regression' : older ? 'older-snapshot' : result?.error ?? (source.countable ? 'unavailable' : null)};
}

export function aggregateSources(sources) {
  const seen = new Set();
  let total = 0, clicks = 0, counted = 0;
  const rows = sources.map(source => {
    const eligible = source.enabled && source.countable && validCounter(source.value);
    const duplicate = eligible && seen.has(source.countingKey);
    if (eligible && !duplicate) {
      seen.add(source.countingKey);
      if (source.metric === 'clicks') clicks += source.value;
      else { total += source.value; counted++; }
    }
    return {...source, included: Boolean(eligible && !duplicate), duplicate: Boolean(duplicate)};
  });
  if (!Number.isSafeInteger(total) || !Number.isSafeInteger(clicks)) throw new Error('Counter total exceeds safe integer range');
  return {sources: rows, total, clicks, available: counted > 0,
    updatedAt: rows.filter(row => row.included).map(row => row.updatedAt).filter(Boolean).sort().at(-1) ?? null};
}

export function legacySources(project, statistics) {
  const legacy = {'github-releases': statistics?.githubReleaseStats?.[project.id], curseforge: statistics?.curseForgeStats?.[project.id]};
  return projectSources(project).map(source => {
    const record = source.id === source.provider && source.url === project.links?.[providers[source.provider]?.link]
      ? legacy[source.provider] : undefined;
    return normalizeSource(source, record?.available !== false && validCounter(record?.downloads)
      ? {value: record.downloads, updatedAt: record.updatedAt, metadata: record} : null);
  });
}

export function migrateStatistics(statistics, projects) {
  if (statistics?.schemaVersion === 2) return statistics;
  return {schemaVersion: 2, generatedAt: statistics?.generatedAt ?? null,
    projects: Object.fromEntries(projects.map(project => [project.id, {sources: legacySources(project, statistics)}]))};
}
