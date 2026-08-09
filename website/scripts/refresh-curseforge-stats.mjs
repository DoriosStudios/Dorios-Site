#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import projects from '../src/data/curseForgeProjects.json' with {type: 'json'};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(scriptDirectory, '..', 'src', 'data', 'curseForgeStats.json');
const apiKey = process.env.CURSEFORGE_API_KEY?.trim();

function abbreviatedDownloadCount(value) {
  const count = Math.max(0, Math.floor(Number(value) || 0));
  if (count < 100) return '<100';
  if (count < 1000) return `${Math.floor(count / 100) * 100}+`;
  const units = [[1_000_000_000, 'B'], [1_000_000, 'M'], [1_000, 'K']];
  const [size, suffix] = units.find(([unitSize]) => count >= unitSize);
  const truncated = Math.floor((count / size) * 10) / 10;
  return `${Number.isInteger(truncated) ? truncated.toFixed(0) : truncated.toFixed(1)}${suffix}+`;
}

async function cachedStats() {
  try {
    return JSON.parse(await fs.readFile(outputPath, 'utf8'));
  } catch {
    return {};
  }
}

async function fetchProject({id, modId}) {
  const endpoint = `https://api.curseforge.com/v1/mods/${modId}`;
  const response = await fetch(endpoint, {
    headers: {Accept: 'application/json', 'x-api-key': apiKey},
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`CurseForge API returned ${response.status} for ${id}`);
  const payload = await response.json();
  const downloads = Number(payload?.data?.downloadCount);
  if (!Number.isFinite(downloads)) throw new Error(`CurseForge returned no downloadCount for ${id}`);
  return {
    modId,
    downloads,
    display: abbreviatedDownloadCount(downloads),
    source: 'curseforge',
    updatedAt: new Date().toISOString(),
  };
}

const previous = await cachedStats();
const next = {...previous};
let refreshed = 0;

if (!apiKey) {
  console.warn('[curseforge-stats] CURSEFORGE_API_KEY is not set; using committed cached totals.');
} else {
  for (const project of projects) {
    try {
      next[project.id] = await fetchProject(project);
      refreshed += 1;
    } catch (error) {
      if (!previous[project.id]) throw error;
      console.warn(`[curseforge-stats] ${error.message}; keeping cached data.`);
    }
  }
}

await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
console.log(`[curseforge-stats] Refreshed ${refreshed}/${projects.length} projects; ${Object.keys(next).length} cached totals available.`);
