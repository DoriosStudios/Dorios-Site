import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {flipbookTimeline, flipbookVersion, writeFlipbookRender} from './bedrock-flipbook.mjs';
import {compileGeometry, rasterize, rendererVersion, studioLighting, keyDirections} from './bedrock-renderer.mjs';
import {readJson, filesUnder, resolveVisual, loadResourcePacks, evaluateExpression, digest, validImage} from './bedrock-pack.mjs';

export {validImage} from './bedrock-pack.mjs';
async function atomicJson(file, value) {
  await fs.mkdir(path.dirname(file), {recursive: true});
  const temporary = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(value, null, 2) + '\n');
  await fs.rename(temporary, file);
}
function localAsset(folder, reference) {
  if (typeof reference !== 'string' || /^(?:https?:|data:)/.test(reference)) return null;
  const file = path.resolve(folder, reference);
  return file.startsWith(path.resolve(folder) + path.sep) ? file : null;
}
export function stableRenderKey(identifier) {
  return identifier.replace(/[^a-z0-9_-]/gi, '_') + '-' + digest(identifier).slice(0, 12);
}

export async function generateMissingRenders({source, output, manifest: manifestPath, dependencies = [], vanilla,
  block: selectedBlock, states = {}, size = 128, refresh = false, force = false, camera, lighting = studioLighting,
  shadows = true, itemVisual = true, preview = false, animate = false, tick = 0, log = console.log} = {}) {
  if (!source || !output) throw new Error('source and output are required');
  if (!Number.isInteger(size) || size < 16 || size > 2048) throw new Error('Size must be an integer from 16 to 2048');
  if (preview && !selectedBlock) throw new Error('Preview requires --block');
  if (!Number.isFinite(tick) || tick < 0 || (animate && tick !== 0)) throw new Error('Use a non-negative --tick or --animate');
  source = path.resolve(source); output = path.resolve(output);
  const settings = {size, camera, lighting, shadows, itemVisual};
  const configuration = digest(JSON.stringify({rendererVersion, flipbookVersion, animate, tick, ...settings, keyDirections}));
  const indexPath = path.join(output, 'auto-renders/index.json');
  let index;
  try { index = await readJson(indexPath); }
  catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
  index = index?.schemaVersion === 1 ? index : {schemaVersion: 1, rendererVersion, blocks: {}};
  index.rendererVersion = rendererVersion;
  const manifest = manifestPath ? await readJson(manifestPath) : undefined;
  let records = manifest?.content?.blocks;
  const discoveryErrors = [];
  if (!records) {
    records = [];
    for (const file of await filesUnder(path.join(source, 'BP/blocks'))) {
      try {
        const identifier = (await readJson(file))['minecraft:block']?.description?.identifier;
        if (identifier) records.push({identifier, source: path.relative(source, file)});
      } catch (error) { discoveryErrors.push({block: path.relative(source, file), status: 'error', message: error.message}); }
    }
  }
  const manualFiles = await filesUnder(path.join(source, 'Assets/Renders'), '');
  const manual = new Map(manualFiles.filter(f => /\.(?:png|jpg|jpeg|webp|tga)$/i.test(f)).map(f => [path.parse(f).name, f]));
  const results = [...discoveryErrors];
  let packs;
  const variant = Object.keys(states).length ? digest(JSON.stringify(Object.entries(states).sort())).slice(0, 12) : '';
  const selected = records.filter(r => !selectedBlock || r.identifier === selectedBlock || r.id === selectedBlock);
  if (selectedBlock && selected.length !== 1) throw new Error(`Block selection must match exactly one block: ${selectedBlock} (${selected.length} matches)`);
  let manifestChanged = false;
  for (const record of selected) {
    const identifier = record.identifier, key = identifier + (preview ? '@preview' : '') + (variant ? `@${variant}` : '');
    const previous = index.blocks[key];
    const updateRecord = relative => {
      if (!variant && !preview && record.render !== relative) { record.render = relative; manifestChanged = true; }
    };
    try {
      // An existing manual association has precedence over even --force.
      const associated = record.render && !record.render.startsWith('auto-renders/') && localAsset(output, record.render);
      let manualFile = associated && await validImage(associated) ? associated : null;
      const localId = identifier.split(':').slice(1).join(':');
      if (!manualFile) for (const candidate of [manual.get(localId), manual.get(`${localId}_render`)]) {
        if (candidate && await validImage(candidate)) { manualFile = candidate; break; }
      }
      if (manualFile && !preview) {
        let relative = path.relative(output, manualFile).replaceAll(path.sep, '/');
        if (relative.startsWith('../')) {
          relative = 'renders/' + path.relative(path.join(source, 'Assets/Renders'), manualFile).replaceAll(path.sep, '/');
          const target = path.join(output, relative);
          // Copy only when absent/invalid. Never rewrite a valid manual render.
          if (!await validImage(target)) { await fs.mkdir(path.dirname(target), {recursive: true}); await fs.copyFile(manualFile, target); }
        }
        updateRecord(relative);
        index.blocks[key] = {identifier, kind: 'manual', path: relative};
        results.push({block: key, status: 'ignored', reason: 'valid manual render', path: relative});
        continue;
      }
      if (!force && !refresh && previous?.kind === 'generated' && previous.configuration === configuration
        && previous.path.startsWith('auto-renders/') && await validImage(localAsset(output, previous.path), size)) {
        updateRecord(previous.path);
        results.push({block: key, status: 'reused', path: previous.path});
        continue;
      }
      packs ??= await loadResourcePacks({source, dependencies, vanilla});
      const file = localAsset(source, record.source);
      if (!file) throw new Error(`Invalid block source: ${record.source}`);
      const block = (await readJson(file))['minecraft:block'];
      if (block?.description?.identifier !== identifier) throw new Error(`Block identifier mismatch: ${identifier}`);
      const visual = resolveVisual(block, states, {itemVisual, legacy: packs.legacyBlocks.get(identifier)});
      const geometry = packs.geometries.get(visual.descriptor.identifier);
      if (!geometry) throw new Error(`Missing or unsupported geometry: ${visual.descriptor.identifier}`);
      const textures = new Map();
      const textureFor = async material => {
        const texture = await packs.textureFor(material);
        textures.set(JSON.stringify(material), [texture.digest, texture.method, texture.doubleSided, texture.faceDimming, texture.ambientOcclusion]);
        return texture;
      };
      // Compile once to resolve exactly the materials used, then hash all visual
      // inputs. The raster pass uses the same compile/raster pipeline as Atelier.
      const compiled = await compileGeometry({geometry, visibility: visual.descriptor.bone_visibility, transformation: visual.transformation,
        materials: visual.materials, textureFor, evaluate: value => evaluateExpression(value, visual.states), camera, lighting});
      const hash = digest(JSON.stringify({rendererVersion, configuration, geometry, visual, textures: [...textures].sort()}));
      const animatedTextures = compiled.faces.map(face => face.texture).filter(texture => texture.animation);
      const timeline = animate ? flipbookTimeline(animatedTextures, size) : null;
      if (animate && animatedTextures.length && !timeline) {
        throw new Error('Flipbook timeline exceeds the preview limit; use --tick for a still or a smaller --size');
      }
      const extension = timeline ? 'webp' : 'png';
      const relative = `auto-renders/${stableRenderKey(key)}-${hash.slice(0, 24)}.${extension}`;
      const target = path.join(output, relative);
      let status = 'reused';
      if (force || !await validImage(target, size)) {
        await fs.mkdir(path.dirname(target), {recursive: true});
        const temporary = `${target}.${process.pid}.tmp`;
        const render = tick => rasterize(compiled.faces, geometry, {}, compiled.volumes, {...settings, tick});
        await writeFlipbookRender(render, size, temporary, timeline, tick);
        await fs.rename(temporary, target);
        status = 'generated';
      }
      index.blocks[key] = {identifier, kind: 'generated', path: relative, hash, configuration,
        states: visual.states, geometry: visual.descriptor.identifier, stats: compiled.stats};
      updateRecord(relative);
      results.push({block: key, status, path: relative, stats: compiled.stats});
    } catch (error) {
      // Preserve a previous valid image on a failed explicit refresh.
      if (previous?.kind === 'generated' && await validImage(localAsset(output, previous.path), size)) updateRecord(previous.path);
      results.push({block: key, status: 'error', message: error.message});
    }
  }
  await atomicJson(indexPath, index);
  if (manifestPath && manifestChanged) await atomicJson(manifestPath, manifest);
  const counts = Object.fromEntries(['generated', 'reused', 'ignored', 'error'].map(status => [status, results.filter(r => r.status === status).length]));
  const report = {rendererVersion, counts, results, resourceIssues: packs?.issues ?? []};
  await atomicJson(path.join(output, 'auto-renders/report.json'), report);
  log(`[bedrock-renders] ${JSON.stringify(counts)}`);
  for (const result of results.filter(r => r.status === 'error')) log(`[bedrock-renders] ${result.block}: ${result.message}`);
  for (const issue of report.resourceIssues) log(`[bedrock-renders] resource: ${issue}`);
  return report;
}

export function parseArguments(args) {
  const options = {dependencies: [], states: {}};
  const flags = new Map([['--source', 'source'], ['--output', 'output'], ['--manifest', 'manifest'], ['--block', 'block'], ['--vanilla-rp', 'vanilla']]);
  for (let i = 0; i < args.length; i++) {
    const argument = args[i];
    const next = () => { const value = args[++i]; if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`); return value; };
    if (flags.has(argument)) options[flags.get(argument)] = next();
    else if (argument === '--dependency') options.dependencies.push(next());
    else if (argument === '--size') options.size = Number(next());
    else if (argument === '--tick') options.tick = Number(next());
    else if (argument === '--animate') options.animate = true;
    else if (argument === '--state') {
      const value = next(), separator = value.indexOf('=');
      if (separator < 1) throw new Error('State must use name=value');
      const raw = value.slice(separator + 1);
      try { options.states[value.slice(0, separator)] = JSON.parse(raw); }
      catch { options.states[value.slice(0, separator)] = raw; }
    } else if (argument === '--refresh') options.refresh = true;
    else if (argument === '--force') options.force = true;
    else if (argument === '--preview') options.preview = true;
    else if (argument === '--allow-errors') options.allowErrors = true;
    else if (argument === '--placed') options.itemVisual = false;
    else if (argument === '--no-shadows') options.shadows = false;
    else if (argument === '--help') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (options.size !== undefined && (!Number.isInteger(options.size) || options.size < 16 || options.size > 2048)) throw new Error('Size must be an integer from 16 to 2048');
  return options;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) console.log('node scripts/generate-bedrock-renders.mjs --source PROJECT --output ASSETS [--manifest FILE] [--block namespace:id] [--dependency PROJECT] [--vanilla-rp RP] [--state name=value] [--size 128] [--tick N | --animate] [--placed] [--refresh] [--force] [--preview] [--no-shadows] [--allow-errors]');
    else { const report = await generateMissingRenders(options); if (report.counts.error && !options.allowErrors) process.exitCode = 1; }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
