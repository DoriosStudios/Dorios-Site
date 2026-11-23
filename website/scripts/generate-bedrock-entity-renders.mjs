import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import {readJson, filesUnder, digest, validImage} from './bedrock-pack.mjs';
import {stableRenderKey} from './generate-bedrock-renders.mjs';
import {loadEntityPacks, resolveEntityVisual, renderEntity, entityVisualHash, entityRendererVersion, entityLighting} from './bedrock-entity.mjs';

const formatsAvailable = ['fullBody','portrait','face'];
const fieldFor = format => format === 'fullBody' ? 'render' : format;
const safeAsset = (root, reference) => {
  if (typeof reference !== 'string' || /^(?:https?:|data:)/i.test(reference)) return null;
  const target = path.resolve(root, reference);
  return target.startsWith(path.resolve(root) + path.sep) ? target : null;
};
async function atomicJson(file, value) {
  await fs.mkdir(path.dirname(file), {recursive:true});
  const temporary = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(value, null, 2) + '\n');
  await fs.rename(temporary, file);
}

export async function generateEntityRenders({source, output, manifest: manifestPath, dependencies = [], vanilla,
  entity: selectedEntity, formats = formatsAvailable, size = 128, overrides = {}, config, force = false,
  replaceManual = false, log = console.log} = {}) {
  if (!source || !output) throw new Error('source and output are required');
  if (!Number.isInteger(size) || size < 16 || size > 2048) throw new Error('Entity render size must be from 16 to 2048');
  if (!Array.isArray(formats) || !formats.length || formats.some(format => !formatsAvailable.includes(format))) throw new Error(`Formats must be selected from ${formatsAvailable.join(', ')}`);
  source = path.resolve(source); output = path.resolve(output);
  if (config) overrides = await readJson(config);
  const manifest = manifestPath ? await readJson(manifestPath) : undefined;
  const discoveryErrors = [], behaviors = new Map();
  for (const file of await filesUnder(path.join(source, 'BP/entities'))) {
    try {
      const behavior = (await readJson(file))['minecraft:entity'];
      if (behavior?.description?.identifier) behaviors.set(behavior.description.identifier, {behavior, file});
    } catch (error) { discoveryErrors.push({entity:path.relative(source,file),status:'error',code:'invalidBehavior',message:error.message}); }
  }
  let records = manifest?.content?.entities ?? [...behaviors].map(([identifier,{file}]) => ({identifier,source:path.relative(source,file)}));
  if (selectedEntity) {
    records = records.filter(record => record.identifier === selectedEntity || record.id === selectedEntity);
    if (records.length !== 1) throw new Error(`Entity selection must match exactly one entry: ${selectedEntity} (${records.length} matches)`);
  }
  const indexFile = path.join(output, 'auto-entities/index.json');
  let index;
  try { index = await readJson(indexFile); } catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
  if (index?.schemaVersion !== 1) index = {schemaVersion:1,entityRendererVersion,entities:{}};
  index.entityRendererVersion = entityRendererVersion;
  const results = [...discoveryErrors];
  let packs;
  const variantName = overrides.variant;
  let changed = false;
  for (const record of records) {
    const identifier = record.identifier, specific = overrides.entities?.[identifier] ?? {};
    const override = {...overrides.defaults,...specific};
    // A named variant has its own namespace and does not replace default paths.
    const variant = specific.variant ?? variantName;
    const key = identifier + (variant ? `@${variant}` : '');
    const previous = index.entities[key] ?? {};
    let visual, visualError;
    const update = (format, relative) => {
      if (variant) {
        record.renderVariants ??= {};
        record.renderVariants[variant] ??= {};
        if (record.renderVariants[variant][fieldFor(format)] !== relative) { record.renderVariants[variant][fieldFor(format)] = relative; changed = true; }
      } else if (record[fieldFor(format)] !== relative) { record[fieldFor(format)] = relative; changed = true; }
    };
    for (const format of [...new Set(formats)]) {
      const field = fieldFor(format), existing = variant ? record.renderVariants?.[variant]?.[field] : record[field];
      try {
        // A flat client texture (image:textures/entity/...) is deliberately not
        // treated as a portrait/manual render. Existing image stays compatible.
        const associated = existing && !existing.startsWith('auto-entities/') ? safeAsset(output, existing) : null;
        const manualImage = format === 'fullBody' && !record.render && record.imageKind !== 'texture'
          && record.image && !record.image.startsWith('textures/')
          && !record.image.startsWith('auto-entities/') ? safeAsset(output,record.image) : null;
        let manual = associated && await validImage(associated) ? associated : manualImage && await validImage(manualImage) ? manualImage : null;
        // Optional source assets follow an explicit entity directory convention;
        // full-body images also accept the existing block-render convention.
        const localId = identifier.split(':').slice(1).join(':');
        if (!manual) for (const relative of [`Assets/EntityRenders/${localId}/${format}.png`,
          ...(format === 'fullBody' ? [`Assets/Renders/${localId}.png`,`Assets/Renders/${localId}_render.png`] : [])]) {
          const candidate = safeAsset(source,relative);
          if (!candidate || !await validImage(candidate)) continue;
          const targetRelative = `renders/entities/${stableRenderKey(identifier)}/${format}.png`;
          const target = path.join(output,targetRelative);
          if (!await validImage(target)) { await fs.mkdir(path.dirname(target),{recursive:true}); await fs.copyFile(candidate,target); }
          manual = target;
          break;
        }
        if (manual && !replaceManual) {
          const relative = path.relative(output,manual).replaceAll(path.sep,'/');
          update(format,relative);
          index.entities[key] ??= {};
          index.entities[key][format] = {identifier,variant,kind:'manual',path:relative};
          results.push({entity:identifier,variant,format,status:'ignored',reason:'valid manual render',path:relative});
          continue;
        }
        const behavior = behaviors.get(identifier)?.behavior;
        if (!behavior) throw Object.assign(new Error(`No Behavior Pack entity matching ${identifier}`),{code:'missingBehavior'});
        if (!visual && !visualError) {
          try { packs ??= await loadEntityPacks({source,dependencies,vanilla}); visual = await resolveEntityVisual({identifier,behavior,packs,override}); }
          catch (error) { visualError = error; }
        }
        if (visualError) throw visualError;
        const formatOptions = override.formats?.[format] ?? {};
        const settings = {size,head:override.headBones,portraitBones:override.portraitBones,lighting:entityLighting,
          ...override.render,...formatOptions,format};
        const hash = entityVisualHash(visual,{...settings,variant});
        const relative = `auto-entities/${stableRenderKey(key)}/${format}-${hash.slice(0,24)}.png`;
        const target = path.join(output,relative);
        let status = 'reused', renderStats = previous[format]?.stats;
        if (force || !await validImage(target, settings.size)) {
          const rendered = await renderEntity(visual,settings);
          await fs.mkdir(path.dirname(target),{recursive:true});
          const temporary = `${target}.${process.pid}.tmp`;
          await sharp(rendered.pixels,{raw:{width:rendered.width,height:rendered.height,channels:4}}).png().toFile(temporary);
          await fs.rename(temporary,target);
          status = 'generated'; renderStats = rendered.stats;
        }
        index.entities[key] ??= {};
        index.entities[key][format] = {identifier,variant,kind:'generated',path:relative,hash,settings,stats:renderStats,
          geometries:visual.layers.map(layer => layer.geometryId),textures:visual.layers.map(layer => layer.texturePath),warnings:visual.warnings};
        update(format,relative);
        results.push({entity:identifier,variant,format,status,path:relative,warnings:visual.warnings});
      } catch (error) {
        // Refresh failure must never discard the last valid visual association.
        const old = previous[format];
        if (old?.path && await validImage(safeAsset(output,old.path))) update(format,old.path);
        results.push({entity:identifier,variant,format,status:'error',code:error.code ?? 'renderFailure',message:error.message});
      }
    }
  }
  await atomicJson(indexFile,index);
  if (manifestPath && changed) await atomicJson(manifestPath,manifest);
  const counts = Object.fromEntries(['generated','reused','ignored','error'].map(status => [status,results.filter(result => result.status === status).length]));
  const coverage = {entitiesFound:records.length,missingGeometry:0,missingTexture:0,unresolvedController:0,unsupportedVariant:0,renderFailure:0};
  for (const result of results.filter(result => result.status === 'error')) coverage[result.code] = (coverage[result.code] ?? 0) + 1;
  const report = {schemaVersion:1,entityRendererVersion,counts,coverage,results,resourceIssues:packs?.issues ?? []};
  await atomicJson(path.join(output,'auto-entities/report.json'),report);
  log(`[entity-renders] ${JSON.stringify(counts)}`);
  for (const result of results.filter(result => result.status === 'error')) log(`[entity-renders] ${result.entity}/${result.format}: ${result.code}: ${result.message}`);
  return report;
}

export function parseEntityArguments(args) {
  const options = {dependencies:[]};
  const keys = {'--source':'source','--output':'output','--manifest':'manifest','--entity':'entity','--vanilla-rp':'vanilla','--config':'config'};
  for (let index=0; index<args.length; index++) {
    const argument = args[index];
    const next = () => { const value=args[++index]; if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`); return value; };
    if (keys[argument]) options[keys[argument]]=next();
    else if (argument==='--dependency') options.dependencies.push(next());
    else if (argument==='--format') { options.formats ??= []; options.formats.push(...next().split(',')); }
    else if (argument==='--size') options.size=Number(next());
    else if (argument==='--force') options.force=true;
    else if (argument==='--replace-manual') options.replaceManual=true;
    else if (argument==='--allow-errors') options.allowErrors=true;
    else if (argument==='--help') options.help=true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}
if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options=parseEntityArguments(process.argv.slice(2));
    if (options.help) console.log('node scripts/generate-bedrock-entity-renders.mjs --source PROJECT --output ASSETS [--manifest FILE] [--entity namespace:id] [--dependency PROJECT] [--vanilla-rp RP] [--format fullBody,portrait,face] [--config FILE] [--size 128] [--force] [--replace-manual] [--allow-errors]');
    else { const report=await generateEntityRenders(options); if(report.counts.error && !options.allowErrors) process.exitCode=1; }
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
