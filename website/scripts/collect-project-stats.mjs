import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {validProjectStatistics} from '../src/data/projectStatistics.mjs';

const website = path.resolve(import.meta.dirname, '..');
const argument = name => {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  if (!process.argv[index + 1] || process.argv[index + 1].startsWith('--')) throw new Error(`Missing ${name} path`);
  return path.resolve(process.argv[index + 1]);
};
const output = argument('--output') ?? path.join(website, '.cache-loader/project-stats');
const previousFile = argument('--previous');
const working = path.join(website, '.cache-loader/project-stats-source');
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
let previous;
if (previousFile) {
  try {
    previous = await readJson(previousFile);
    if (!validProjectStatistics(previous)) throw new Error('Previous published statistics are invalid');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}

await fs.mkdir(working, {recursive: true});
const sources = [['githubReleaseStats', 'refresh-github-release-stats.mjs'], ['curseForgeStats', 'refresh-curseforge-stats.mjs']];
const seeds = {};
for (const [key] of sources) {
  const fallback = await readJson(path.join(website, 'src/data', `${key}.json`));
  seeds[key] = {...fallback, ...previous?.[key]};
  await fs.writeFile(path.join(working, `${key}.json`), JSON.stringify(seeds[key]));
}

await Promise.all(sources.map(([key, script]) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(website, 'scripts', script), '--output', path.join(working, `${key}.json`)],
    {cwd: website, env: process.env, stdio: 'inherit'});
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${script} exited with code ${code}`)));
})));

const payload = {schemaVersion: 1, generatedAt: new Date().toISOString()};
for (const [key] of sources) payload[key] = await readJson(path.join(working, `${key}.json`));
if (!validProjectStatistics(payload)) throw new Error('Collected statistics are invalid');
await fs.mkdir(output, {recursive: true});
const bytes = JSON.stringify(payload);
await fs.writeFile(path.join(output, 'project-stats.json'), bytes + '\n');
console.log(`[project-stats] Published payload prepared: ${Buffer.byteLength(bytes)} bytes; no website build required.`);
const summary = ['## Project download statistics', '', '| Provider | Refreshed | Kept cached |', '| --- | ---: | ---: |'];
for (const [key, label] of [['githubReleaseStats', 'GitHub'], ['curseForgeStats', 'CurseForge']]) {
  const records = Object.entries(payload[key]);
  const refreshed = records.filter(([id, record]) => record.available !== false && record.updatedAt !== seeds[key][id]?.updatedAt).length;
  const cached = records.length - refreshed;
  summary.push(`| ${label} | ${refreshed} | ${cached} |`);
  if (cached && process.env.GITHUB_ACTIONS === 'true') console.warn(`::warning title=${label} statistics::${cached} projects kept cached counters; see provider logs for details.`);
}
summary.push('', `Published ${Buffer.byteLength(bytes)} bytes to the statistics feed. No Docusaurus build was run.`);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary.join('\n') + '\n');
