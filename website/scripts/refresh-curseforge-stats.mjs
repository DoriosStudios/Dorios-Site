#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import catalog from '../src/data/projectCatalog.json' with {type: 'json'};

const scriptPath = fileURLToPath(import.meta.url);
const scriptDirectory = path.dirname(scriptPath);
const outputArgument = process.argv.indexOf('--output');
if (outputArgument >= 0 && !process.argv[outputArgument + 1]) throw new Error('Missing --output path');
const outputPath = outputArgument >= 0 ? path.resolve(process.argv[outputArgument + 1])
  : path.join(scriptDirectory, '..', 'src', 'data', 'curseForgeStats.json');
const requestHeaders = {
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent': 'Mozilla/5.0 (compatible; DoriosSiteStats/1.0; +https://doriosstudios.com)',
};

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

function decodeHtmlEntities(value) {
  const namedEntities = new Map([
    ['amp', '&'],
    ['apos', "'"],
    ['gt', '>'],
    ['lt', '<'],
    ['nbsp', ' '],
    ['quot', '"'],
  ]);

  return value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== '#') return namedEntities.get(code.toLowerCase()) ?? entity;
    const hexadecimal = code[1]?.toLowerCase() === 'x';
    const number = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
  });
}

function htmlTextLines(html) {
  return decodeHtmlEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, '\n'),
  )
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function parseExactDownloadCount(value) {
  const exactCount = value.match(/^(?:\d{1,3}(?:,\d{3})+|\d+)$/)?.[0];
  if (!exactCount) return null;
  const count = Number(exactCount.replaceAll(',', ''));
  return Number.isSafeInteger(count) ? count : null;
}

export function extractDetailsDownloadCount(html) {
  const lines = htmlTextLines(html);

  for (let detailsIndex = 0; detailsIndex < lines.length; detailsIndex += 1) {
    if (lines[detailsIndex].toLowerCase() !== 'details') continue;

    const sectionEnd = Math.min(lines.length, detailsIndex + 80);
    for (let labelIndex = detailsIndex + 1; labelIndex < sectionEnd; labelIndex += 1) {
      const sameLine = lines[labelIndex].match(/^Downloads\s+(.+)$/i);
      if (sameLine) {
        const count = parseExactDownloadCount(sameLine[1]);
        if (count !== null) return count;
      }

      if (lines[labelIndex].toLowerCase() !== 'downloads') continue;
      for (let valueIndex = labelIndex + 1; valueIndex <= labelIndex + 5 && valueIndex < sectionEnd; valueIndex += 1) {
        const count = parseExactDownloadCount(lines[valueIndex]);
        if (count !== null) return count;
      }
    }
  }

  throw new Error('could not find an exact Details → Downloads value in the page HTML');
}

function publicCurseForgeUrl(project) {
  const value = project.links?.curseforge;
  if (!value) return null;

  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'www.curseforge.com') {
    throw new Error(`invalid CurseForge URL for ${project.id}`);
  }
  return url.href;
}

export async function fetchProject(project, cached, request = fetch, env = process.env) {
  const modId = project.curseforgeProjectId ?? cached?.modId;
  const apiKeys = [...new Set([env.CURSEFORGE_API_KEY, env.CURSEFORGE_API_TOKEN].filter(Boolean))];
  let apiFailure;
  if (apiKeys.length && Number.isSafeInteger(modId)) {
    let status;
    for (const apiKey of apiKeys) {
      const response = await request(`https://api.curseforge.com/v1/mods/${modId}`, {
        headers: {Accept: 'application/json', 'x-api-key': apiKey}, signal: AbortSignal.timeout(15_000),
      });
      status = response.status;
      if (!response.ok) {
        if (status === 401 || status === 403) continue;
        throw new Error(`CurseForge API returned HTTP ${status}`);
      }
      const {data} = await response.json();
      if (data?.id !== modId || !Number.isSafeInteger(data.downloadCount) || data.downloadCount < 0) {
        throw new Error('CurseForge API returned an invalid download counter');
      }
      return {modId, downloads: data.downloadCount, display: abbreviatedDownloadCount(data.downloadCount),
        source: 'curseforge-api', updatedAt: new Date().toISOString()};
    }
    apiFailure = `CurseForge API authentication failed (HTTP ${status})`;
  }
  const pageUrl = publicCurseForgeUrl(project);
  let downloads;
  try {
    const response = await request(pageUrl, {headers: requestHeaders, signal: AbortSignal.timeout(15_000)});
    if (!response.ok) throw new Error(`public page returned HTTP ${response.status}`);
    downloads = extractDetailsDownloadCount(await response.text());
  } catch (error) {
    throw new Error(apiFailure ? `${apiFailure}; ${error.message}` : `CurseForge: ${error.message}`);
  }
  return {
    ...(Number.isSafeInteger(modId) ? {modId} : {}),
    downloads,
    display: abbreviatedDownloadCount(downloads),
    source: 'curseforge',
    updatedAt: new Date().toISOString(),
  };
}

async function main() {
  const projects = catalog.projects.filter((project) => project.links?.curseforge);
  const previous = await cachedStats();
  const next = {...previous};
  let refreshed = 0;
  let cached = 0;

  for (const project of projects) {
    try {
      const record = await fetchProject(project, previous[project.id]);
      if (Number.isSafeInteger(previous[project.id]?.downloads) && record.downloads < previous[project.id].downloads) throw new Error('counter regression');
      next[project.id] = record;
      refreshed += 1;
      console.log(
        `[curseforge-stats] ${project.id} updated: ${next[project.id].downloads.toLocaleString('en-US')} downloads.`,
      );
    } catch (error) {
      if (previous[project.id]) {
        cached += 1;
        console.warn(
          `[curseforge-stats] ${project.id} failed (${error.message}); kept cached value: `
          + `${previous[project.id].downloads.toLocaleString('en-US')} downloads.`,
        );
      } else {
        console.warn(`[curseforge-stats] ${project.id} failed (${error.message}); no cached value is available.`);
      }
    }
  }

  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(
    `[curseforge-stats] Updated ${refreshed}/${projects.length} projects; `
    + `${cached} kept cached values; ${Object.keys(next).length} totals available.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await main();
}
