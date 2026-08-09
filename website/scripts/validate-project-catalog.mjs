import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(websiteRoot, 'src', 'data', 'projectCatalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const errors = [];
const ids = new Set();
const slugs = new Set();
const routes = new Map();
const wikiRoutes = new Map();
const allowedVisibilities = new Set(['public', 'community', 'unlisted']);

if (catalog.schemaVersion !== 1) errors.push(`Unsupported schemaVersion: ${catalog.schemaVersion}`);
if (!Array.isArray(catalog.projects) || catalog.projects.length === 0) errors.push('Catalog has no projects.');
if (catalog.inventory?.classifiedBridgeProjects !== catalog.inventory?.discoveredBridgeProjects) {
  errors.push('Not every discovered bridge workspace has an explicit publication or exclusion decision.');
}

for (const project of catalog.projects ?? []) {
  if (!project.id || ids.has(project.id)) errors.push(`Duplicate or missing id: ${project.id}`);
  if (!project.slug || slugs.has(project.slug)) errors.push(`Duplicate or missing slug: ${project.slug}`);
  ids.add(project.id);
  slugs.add(project.slug);

  if (!allowedVisibilities.has(project.visibility)) errors.push(`Invalid visibility for ${project.id}: ${project.visibility}`);
  if (project.routes?.project !== `/projects/${project.slug}`) errors.push(`Non-canonical project route for ${project.id}.`);
  for (const route of [project.routes?.project, ...(project.aliases ?? [])].filter(Boolean)) {
    if (routes.has(route)) errors.push(`Route collision: ${route} (${routes.get(route)}, ${project.id})`);
    routes.set(route, project.id);
  }
  if (project.routes?.wiki) {
    if (wikiRoutes.has(project.routes.wiki)) errors.push(`Wiki route collision: ${project.routes.wiki}`);
    wikiRoutes.set(project.routes.wiki, project.id);
  }

  for (const mediaKey of ['cover', 'icon']) {
    const mediaPath = project.media?.[mediaKey];
    if (!mediaPath) continue;
    if (!mediaPath.startsWith('/')) {
      errors.push(`Non-local ${mediaKey} for ${project.id}: ${mediaPath}`);
      continue;
    }
    const localPath = path.join(websiteRoot, 'static', mediaPath.replace(/^\/+/, ''));
    if (!fs.existsSync(localPath)) errors.push(`Missing ${mediaKey} for ${project.id}: ${mediaPath}`);
  }
}

if (errors.length) {
  console.error(`[catalog] Validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `[catalog] ${catalog.projects.length} project records, ${routes.size} project routes, `
  + `${wikiRoutes.size} wiki/documentation targets, 100% bridge coverage.`,
);
