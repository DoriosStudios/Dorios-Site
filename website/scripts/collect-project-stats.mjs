import fs from 'node:fs/promises';
import path from 'node:path';
import catalog from '../src/data/projectCatalog.json' with {type: 'json'};
import {validProjectStatistics} from '../src/data/projectStatistics.mjs';
import {collectStatistics} from './statistics/collect.mjs';

const website = path.resolve(import.meta.dirname, '..');
const argument = name => {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  if (!process.argv[index + 1] || process.argv[index + 1].startsWith('--')) throw new Error(`Missing ${name} path`);
  return path.resolve(process.argv[index + 1]);
};
const output = argument('--output') ?? path.join(website, '.cache-loader/project-stats');
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'));
let previous;
const previousFile = argument('--previous');
if (previousFile) {
  try { previous = await read(previousFile); if (!validProjectStatistics(previous)) throw new Error('Invalid previous feed'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const fallback = {githubReleaseStats: await read(path.join(website, 'src/data/githubReleaseStats.json')),
  curseForgeStats: await read(path.join(website, 'src/data/curseForgeStats.json'))};
const payload = await collectStatistics({projects: catalog.projects, previous, fallback, offline: process.argv.includes('--offline')});
if (!validProjectStatistics(payload)) throw new Error('Collected statistics are invalid');
await fs.mkdir(output, {recursive: true});
await fs.writeFile(path.join(output, 'project-stats-v2.json'), JSON.stringify(payload) + '\n');
// Keep the original schema/URL readable by websites deployed before schema 2.
await fs.writeFile(path.join(output, 'project-stats.json'), JSON.stringify({schemaVersion:1,
  generatedAt:payload.generatedAt,githubReleaseStats:payload.githubReleaseStats,curseForgeStats:payload.curseForgeStats}) + '\n');
const summary = ['## Project download statistics', '', '| Project | Refreshed | Cached | Unavailable / excluded |', '| --- | ---: | ---: | ---: |'];
for (const [id, {sources}] of Object.entries(payload.projects)) {
  const counts = ['available', 'stale'].map(status => sources.filter(row => row.status === status).length);
  summary.push(`| ${id} | ${counts[0]} | ${counts[1]} | ${sources.length - counts[0] - counts[1]} |`);
  console.log(`[project-stats] ${id}: ${sources.map(row => `${row.id}=${row.value ?? 'unavailable'} (${row.status})`).join('; ')}`);
}
summary.push('', 'Feed prepared without a Docusaurus build.');
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary.join('\n') + '\n');
