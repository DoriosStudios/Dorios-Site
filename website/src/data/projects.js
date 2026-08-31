import catalog from './projectCatalog.json';
import githubReleaseStats from './githubReleaseStats.json';
import curseForgeStats from './curseForgeStats.json';

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

function downloadsFor(projectId) {
  const curseForgeRecord = curseForgeStats[projectId];
  const githubRecord = githubReleaseStats[projectId];
  const curseForge = Math.max(0, Number(curseForgeRecord?.downloads) || 0);
  const github = Math.max(0, Number(githubRecord?.downloads) || 0);
  const total = curseForge + github;
  return {
    curseForge,
    github,
    total,
    display: formatDownloadCount(total),
    hasCurseForge: Boolean(curseForgeRecord),
    hasGitHub: Boolean(githubRecord),
    updatedAt: [curseForgeRecord?.updatedAt, githubRecord?.updatedAt].filter(Boolean).sort().at(-1) ?? null,
  };
}

export const projectCatalog = catalog.projects.map((project) => {
  const downloadStats = downloadsFor(project.id);
  return {
    ...project,
    version: githubReleaseStats[project.id]?.version ?? project.version,
    downloadStats,
    metrics: {downloads: downloadStats.total, ...project.metrics},
  };
});
export const listedProjects = projectCatalog.filter((project) => project.visibility !== 'unlisted');
export const featuredProjects = listedProjects
  .filter((project) => Number.isInteger(project.featuredRank))
  .sort((left, right) => left.featuredRank - right.featuredRank);

export function getProject(projectSlug) {
  const route = projectSlug.startsWith('/') ? projectSlug : `/projects/${projectSlug}`;
  return projectCatalog.find((project) => (
    project.slug === projectSlug
    || project.routes.project === route
    || project.aliases.includes(route)
  ));
}

export function getProjectByWikiPath(wikiPath) {
  return projectCatalog.find((project) => project.routes.wiki === wikiPath);
}

export function relatedProjects(project, limit = 3) {
  return listedProjects
    .filter((candidate) => candidate.id !== project.id)
    .map((candidate) => ({
      ...candidate,
      relevance: Number(candidate.category === project.category) * 3
        + Number(candidate.kind === project.kind) * 2
        + Number(candidate.requires.some((requirement) => requirement.includes(project.name))),
    }))
    .sort((left, right) => right.relevance - left.relevance || left.name.localeCompare(right.name))
    .slice(0, limit);
}

export const projectInventory = catalog.inventory;
