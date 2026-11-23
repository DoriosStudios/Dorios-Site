import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile as callback} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
import {readJson, validImage} from './bedrock-pack.mjs';
import {projectSourcePath, utilitycraftSourcePath} from './wiki-source-paths.mjs';
import {collectVanillaAssets} from './vanilla-assets.mjs';
import {generateEntityRenders} from './generate-bedrock-entity-renders.mjs';

const execFile = promisify(callback);
const website = path.resolve(import.meta.dirname, '..');
const exists = async file => fs.access(file).then(() => true, () => false);
const configFile = path.join(import.meta.dirname, 'wiki-visual-sources.config.json');

export async function prepareWikiVisuals({downloadSources = false, offline = false, project, log = console.log} = {}) {
  const config = await readJson(configFile);
  const vanilla = await collectVanillaAssets({offline});
  const roots = new Map(), summaries = [];
  for (const entry of config.projects) {
    const local = entry.id === 'utilitycraft' ? utilitycraftSourcePath() : projectSourcePath(entry.bridgeProject);
    const cached = path.join(website, '.cache-loader/wiki-render-sources', entry.id, entry.revision);
    let source = await exists(path.join(local, 'RP')) && await exists(path.join(local, 'BP')) ? local : null;
    if (!source && (downloadSources || await exists(path.join(cached, '.git')))) {
      if (!/^[a-f0-9]{40}$/.test(entry.revision) || !/^https:\/\/github\.com\/DoriosStudios\/[\w-]+\.git$/.test(entry.repository)) throw new Error(`Invalid pinned wiki source: ${entry.id}`);
      await fs.mkdir(cached, {recursive:true});
      const git = args => execFile('git', ['-c','gc.auto=0','-c','maintenance.auto=false',...args], {cwd:cached,maxBuffer:8*1024*1024});
      let head; try { head = (await git(['rev-parse','HEAD'])).stdout.trim(); } catch {}
      if (head !== entry.revision) {
        if (offline) throw new Error(`Wiki source unavailable offline: ${entry.id}@${entry.revision}`);
        await git(['init']); await git(['fetch','--depth=1',entry.repository,entry.revision]); await git(['checkout','--detach','FETCH_HEAD']);
      }
      const dirty = (await git(['status','--porcelain','--untracked-files=no','--','BP','RP','Assets'])).stdout.trim();
      if (dirty) throw new Error(`Cached pinned wiki source changed: ${entry.id}`);
      source = cached;
    }
    if (source) roots.set(entry.id, source);
  }
  for (const entry of config.projects.filter(entry => !project || entry.id === project)) {
    const source = roots.get(entry.id), manifest = path.join(website, 'src/wiki/projects', entry.id, 'manifest.json');
    if (!source || !await exists(manifest)) { summaries.push({project:entry.id,status:'sourceUnavailable'}); continue; }
    try {
      const report = await generateEntityRenders({source, manifest, output:path.join(website,'static/img/wiki',entry.id),
        vanilla:vanilla.root, dependencies:(entry.dependencies ?? []).map(id => {
          if (!roots.has(id)) throw new Error(`Missing configured dependency ${id}`);
          return roots.get(id);
        }), overrides:entry.overrides ?? {}, log:() => {}});
      summaries.push({project:entry.id,status:'processed',...report.counts,coverage:report.coverage});
    } catch (error) { summaries.push({project:entry.id,status:'error',message:error.message}); }
  }
  const report = {schemaVersion:1,vanillaVersion:vanilla.inventory.bedrockVersion,vanillaRevision:vanilla.inventory.revision,projects:summaries};
  const output = path.join(website,'.cache-loader/wiki-visuals/report.json');
  await fs.mkdir(path.dirname(output),{recursive:true}); await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
  for (const summary of summaries) log(`[wiki-visuals] ${JSON.stringify(summary)}`);
  return report;
}

export async function validateVisualCoverage({strict = false, log = console.log} = {}) {
  const {projects} = await readJson(configFile), results = [];
  for (const project of projects) {
    const manifest = await readJson(path.join(website,'src/wiki/projects',project.id,'manifest.json'));
    for (const record of manifest.content?.entities ?? []) {
      const formats = {};
      for (const field of ['render','portrait','face']) {
        const reference = record[field];
        const file = reference?.startsWith('/img/') ? path.join(website,'static',reference) : reference ? path.resolve(website,'static/img/wiki',project.id,reference) : null;
        formats[field] = !!file && file.startsWith(path.join(website,'static')+path.sep) && await validImage(file);
      }
      results.push({project:project.id,identifier:record.identifier,...formats});
    }
  }
  const missing = results.filter(record => !record.render || !record.portrait || !record.face);
  log(`[wiki-visuals] ${results.length} entities; ${results.filter(record=>record.render).length} full bodies; ${results.filter(record=>record.portrait).length} portraits; ${results.filter(record=>record.face).length} faces; ${missing.length} incomplete`);
  const target=path.join(website,'.cache-loader/wiki-visuals/coverage.json');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify({results,missing},null,2)+'\n');
  if (strict && missing.length) throw new Error(`${missing.length} entities need visual configuration; see ${target}`);
  return {results,missing};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args=process.argv.slice(2), selected=args.indexOf('--project');
    for (let i=0;i<args.length;i++) { if (args[i]==='--project') {if (!args[++i]) throw new Error('--project needs a value');} else if (!['--coverage','--strict','--download-sources','--offline'].includes(args[i])) throw new Error(`Unknown argument ${args[i]}`); }
    if (args.includes('--coverage')) await validateVisualCoverage({strict:args.includes('--strict')});
    else await prepareWikiVisuals({downloadSources:args.includes('--download-sources'),offline:args.includes('--offline'),project:selected>=0?args[selected+1]:undefined});
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
