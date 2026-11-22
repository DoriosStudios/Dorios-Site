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
for (const [key] of sources) {
  const fallback = await readJson(path.join(website, 'src/data', `${key}.json`));
  await fs.writeFile(path.join(working, `${key}.json`), JSON.stringify({...fallback, ...previous?.[key]}));
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
