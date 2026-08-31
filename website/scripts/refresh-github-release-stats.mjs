#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import catalog from '../src/data/projectCatalog.json' with {type: 'json'};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(scriptDirectory, '..', 'src', 'data', 'githubReleaseStats.json');
const projects = catalog.projects
  .filter((project) => project.links?.repository)
  .map((project) => ({
    id: project.id,
    repository: new URL(project.links.repository).pathname.replace(/^\/+|\/+$/g, ''),
  }));

function abbreviatedDownloadCount(value) {
  const count = Math.max(0, Math.floor(Number(value) || 0));
  if (count < 100) return '<100';
  if (count < 1000) return `${Math.floor(count / 100) * 100}+`;
  const units = [
    {size: 1_000_000_000, suffix: 'B'},
    {size: 1_000_000, suffix: 'M'},
    {size: 1_000, suffix: 'K'},
  ];
  const unit = units.find(({size}) => count >= size);
  const truncated = Math.floor((count / unit.size) * 10) / 10;
  const compact = Number.isInteger(truncated) ? truncated.toFixed(0) : truncated.toFixed(1);
  return `${compact}${unit.suffix}+`;
}

function releaseVersion(release) {
  const source = String(release?.tag_name || release?.name || '').trim();
  const semanticVersion = source.match(/v?(\d+\.\d+\.\d+)/i);
  return semanticVersion?.[1] ?? null;
}

async function cachedStats() {
  try {
    return JSON.parse(await fs.readFile(outputPath, 'utf8'));
  } catch {
    return {};
  }
}

async function fetchReleaseStats({id, repository}) {
  const releases = [];
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Dorios-Site',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  for (let page = 1; ; page += 1) {
    const endpoint = `https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`;
    const response = await fetch(endpoint, {headers, signal: AbortSignal.timeout(15_000)});
    if (!response.ok) throw new Error(`GitHub API returned ${response.status} for ${repository}`);
    const batch = await response.json();
    releases.push(...batch);
    if (batch.length < 100) break;
  }

  const assets = releases.flatMap((release) => release.assets ?? []);
  const downloads = assets.reduce((total, asset) => total + (Number(asset.download_count) || 0), 0);
  const latestRelease = releases.find((release) => !release.draft) ?? null;
  return {
    id,
    repository,
    endpoint: `https://api.github.com/repos/${repository}/releases`,
    downloads,
    display: abbreviatedDownloadCount(downloads),
    releases: releases.length,
    assets: assets.length,
    version: releaseVersion(latestRelease),
    latestReleaseTag: latestRelease?.tag_name ?? null,
    latestReleaseName: latestRelease?.name ?? null,
    latestReleaseUrl: latestRelease?.html_url ?? null,
    latestReleasePublishedAt: latestRelease?.published_at ?? null,
    updatedAt: new Date().toISOString(),
  };
}

const previous = await cachedStats();
const next = {...previous};
let refreshed = 0;

for (const project of projects) {
  try {
    next[project.id] = await fetchReleaseStats(project);
    refreshed += 1;
  } catch (error) {
    if (previous[project.id]) {
      console.warn(`[github-stats] ${error.message}; keeping cached data for ${project.id}.`);
      continue;
    }
    next[project.id] = {
      id: project.id,
      repository: project.repository,
      endpoint: `https://api.github.com/repos/${project.repository}/releases`,
      downloads: 0,
      display: '0',
      releases: 0,
      assets: 0,
      version: null,
      available: false,
      error: error.message,
      updatedAt: new Date().toISOString(),
    };
    console.warn(`[github-stats] ${error.message}; recording zero public release downloads for ${project.id}.`);
  }
}

await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
console.log(`[github-stats] Refreshed ${refreshed}/${projects.length} projects.`);
Object.values(next).forEach((stats) => console.log(`[github-stats] ${stats.id}: ${stats.display} (${stats.downloads} asset downloads).`));
