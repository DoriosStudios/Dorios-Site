import catalog from './projectCatalog.json';
import githubReleaseStats from './githubReleaseStats.json';
import curseForgeStats from './curseForgeStats.json';
import {withProjectStatistics} from './projectStatistics.mjs';
export {formatDownloadCount} from './projectStatistics.mjs';

export const projectCatalog = catalog.projects.map(project => withProjectStatistics(
  {...project, metrics: {downloads: 0, ...project.metrics},
    downloadStats: {curseForge: 0, github: 0, total: 0, display: '0', hasCurseForge: false, hasGitHub: false, updatedAt: null}},
  {githubReleaseStats, curseForgeStats},
));
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
