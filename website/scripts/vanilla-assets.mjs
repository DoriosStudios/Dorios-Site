import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile as callback} from 'node:child_process';
import {promisify} from 'node:util';
import sharp from 'sharp';
import {readJson, filesUnder, digest, validImage} from './bedrock-pack.mjs';
const execFile = promisify(callback);
export const websiteRoot = path.resolve(import.meta.dirname, '..');
export const defaultVanillaConfig = path.join(import.meta.dirname, 'vanilla-source.config.json');
const publicBase = '/img/wiki/vanilla/';

export function safeAssetPath(root, relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || path.isAbsolute(relative)) throw new Error(`Invalid asset path: ${relative}`);
  const full = path.resolve(root, relative);
  if (full === path.resolve(root) || !full.startsWith(path.resolve(root) + path.sep)) throw new Error(`Asset path escapes root: ${relative}`);
  return full;
}
async function writeChanged(file, value) {
  const bytes = `${JSON.stringify(value, null, 2)}\n`;
  try { if (await fs.readFile(file, 'utf8') === bytes) return false; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file, bytes); return true;
}
// Preserve project > dependencies > vanilla priority, including when an add-on
// supplies a custom texture for a geometry defined in the vanilla fallback.
export async function resolveResourceReference(relative, roots, extensions = ['', '.png', '.tga', '.json']) {
  for (const root of roots.filter(Boolean)) for (const extension of extensions) {
    const file = safeAssetPath(root, relative + extension);
    try { if ((await fs.stat(file)).isFile()) return file; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return null;
}
export async function inventoryResourcePack(root, {version, revision = null} = {}) {
  if (!version) throw new Error('An explicit Bedrock version is required');
  const inventory = {schemaVersion: 1, bedrockVersion: version, revision, entities: {}, geometries: {}, blocks: {}, textures: {}, materials: {}, renderControllers: {}, animations: {}, animationControllers: {}, files: {}, issues: []};
  const folders = ['entity', 'models', 'textures', 'materials', 'render_controllers', 'animations', 'animation_controllers'];
  const nested = (await Promise.all(folders.map(folder => filesUnder(path.join(root, folder), null)))).flat();
  const paths = [...new Set(['manifest.json', 'blocks.json', ...nested.map(file => path.relative(root, file).replaceAll('\\', '/'))])].sort();
  for (const relative of paths) {
    if (!/\.(?:json|material|png|tga|jpg|jpeg|webp)$/i.test(relative)) continue;
    const file = safeAssetPath(root, relative); let bytes;
    try { bytes = await fs.readFile(file); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    inventory.files[relative] = digest(bytes);
    if (!/\.(json|material)$/i.test(relative)) continue;
    try {
      const payload = await readJson(file), description = payload['minecraft:client_entity']?.description;
      if (description?.identifier) inventory.entities[description.identifier] = {path: relative, geometry: description.geometry ?? {}, textures: description.textures ?? {}, materials: description.materials ?? {}, renderControllers: description.render_controllers ?? [], animations: description.animations ?? {}, scripts: description.scripts ?? {}};
      for (const geometry of payload['minecraft:geometry'] ?? []) if (geometry.description?.identifier) inventory.geometries[geometry.description.identifier] = {path: relative, textureWidth: geometry.description.texture_width, textureHeight: geometry.description.texture_height};
      for (const [key, value] of Object.entries(payload)) if (key.startsWith('geometry.') && value?.bones) inventory.geometries[key] = {path: relative, legacy: true, textureWidth: value.texturewidth, textureHeight: value.textureheight};
      if (relative === 'blocks.json') for (const [id, block] of Object.entries(payload)) if (id !== 'format_version') inventory.blocks[id.includes(':') ? id : `minecraft:${id}`] = {path: relative, ...block};
      if (relative === 'textures/terrain_texture.json') inventory.textures = payload.texture_data ?? {};
      for (const [field, destination] of [['render_controllers', 'renderControllers'], ['animations', 'animations'], ['animation_controllers', 'animationControllers'], ['materials', 'materials']]) for (const key of Object.keys(payload[field] ?? {})) if (key !== 'version') inventory[destination][key] = {path: relative};
    } catch (error) { inventory.issues.push({path: relative, error: error.message}); }
  }
  inventory.contentHash = digest(JSON.stringify(inventory.files)); return inventory;
}
export async function collectVanillaAssets({source, version, config = defaultVanillaConfig, cacheRoot = path.join(websiteRoot, '.cache-loader/vanilla'), offline = false} = {}) {
  const pin = typeof config === 'string' ? await readJson(config) : config;
  if (source && !version) throw new Error('Local Resource Packs require an explicit Bedrock version');
  version ??= pin.bedrockVersion;
  if (!/^\d+(?:\.\d+){2,3}$/.test(version ?? '')) throw new Error('Invalid explicit Bedrock version');
  if (!source && version !== pin.bedrockVersion) throw new Error('Official source version differs from the configured pin');
  const directory = path.join(cacheRoot, version, source ? 'local' : pin.revision); let root;
  if (source) {
    await fs.access(path.join(source, 'manifest.json'));
    const local = await inventoryResourcePack(path.resolve(source), {version});
    root = path.join(directory, local.contentHash, 'resource_pack');
    for (const relative of Object.keys(local.files)) {
      const destination = safeAssetPath(root, relative);
      try { if (digest(await fs.readFile(destination)) === local.files[relative]) continue; } catch (error) { if (error.code !== 'ENOENT') throw error; }
      await fs.mkdir(path.dirname(destination), {recursive: true}); await fs.copyFile(safeAssetPath(source, relative), destination);
    }
  } else {
    if (pin.repository !== 'https://github.com/Mojang/bedrock-samples.git' || !/^[a-f0-9]{40}$/.test(pin.revision)) throw new Error('Official source requires the Mojang repository and immutable 40-character commit');
    const checkout = path.join(directory, 'source'); root = safeAssetPath(checkout, pin.resourcePack); let exists = false;
    try { exists = (await execFile('git', ['rev-parse', 'HEAD'], {cwd: checkout})).stdout.trim() === pin.revision; } catch {}
    if (!exists) {
      if (offline) throw new Error(`Pinned vanilla source unavailable offline: ${root}`);
      await fs.mkdir(checkout, {recursive: true});
      const git = args => execFile('git', ['-c', 'gc.auto=0', ...args], {cwd: checkout, maxBuffer: 8 * 1024 * 1024});
      await git(['init']); await git(['fetch', '--depth=1', pin.repository, pin.revision]); await git(['checkout', '--detach', 'FETCH_HEAD']);
    }
    const dirty = await execFile('git', ['status', '--porcelain', '--untracked-files=no', '--', pin.resourcePack], {cwd: checkout});
    if (dirty.stdout.trim()) throw new Error('Pinned vanilla source has local modifications; use a separate --source import instead');
    const release = await readJson(path.join(checkout, 'version.json'));
    if (release.latest?.version !== version) throw new Error(`Official commit declares Bedrock ${release.latest?.version}, not ${version}`);
  }
  const inventoryPath = path.join(path.dirname(root), 'inventory.json');
  const inventory = await inventoryResourcePack(root, {version, revision: source ? null : pin.revision});
  const changed = await writeChanged(inventoryPath, inventory);
  await writeChanged(path.join(cacheRoot, 'active.json'), {schemaVersion: 1, bedrockVersion: version, revision: inventory.revision, resourcePack: root, inventory: inventoryPath, contentHash: inventory.contentHash, publication: 'private-source-only'});
  return {root, inventoryPath, inventory, reused: !changed};
}
export async function resolveBlockFace(inventory, root, identifier, face = 'up', variant) {
  const block = inventory.blocks[identifier]; if (!block) throw new Error(`Unknown vanilla block: ${identifier}`);
  let texture = block.textures;
  if (typeof texture === 'object' && !Array.isArray(texture)) texture = texture[face] ?? texture.side ?? texture.all;
  if (typeof texture !== 'string') throw new Error(`No declared ${face} face for ${identifier}`);
  let record = inventory.textures[texture]?.textures ?? inventory.textures[texture] ?? texture;
  if (Array.isArray(record)) { if (record.length > 1 && variant === undefined) throw new Error(`Texture ${texture} requires an explicit variant`); record = record[variant ?? 0]; }
  const reference = typeof record === 'string' ? record : record?.path;
  if (!reference) throw new Error(`Unresolved face texture: ${identifier}/${face}`);
  const file = await resolveResourceReference(reference, [root]); if (!file) throw new Error(`Missing face texture: ${reference}`);
  return {identifier, type: 'blockFace', renderType: `${({up: 'top', down: 'bottom'})[face] ?? face}Face`, vanillaVersion: inventory.bedrockVersion, texture: reference, file, variant: variant ?? null};
}
export async function extractVanillaFaces({root, inventory, selections, output = path.join(websiteRoot, '.cache-loader/vanilla/faces')}) {
  const results = [], issues = [];
  for (const selection of selections) {
    try {
      const face = await resolveBlockFace(inventory, root, selection.identifier, selection.face, selection.variant);
      const filename = `${selection.identifier.replace(':', '/')}/${selection.face}${selection.variant === undefined ? '' : `-${selection.variant}`}.png`;
      const destination = safeAssetPath(output, filename); await fs.mkdir(path.dirname(destination), {recursive: true});
      const bytes = await fs.readFile(face.file), hash = digest(bytes);
      const stamp = destination + '.asset.json'; let previous;
      try { previous = await readJson(stamp); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      const reused = previous?.hash === hash && await validImage(destination);
      if (!reused) await sharp(bytes).png().toFile(destination);
      const {file, ...metadata} = face;
      await writeChanged(stamp, {...metadata, path: filename, hash, publication: 'private-source-only'});
      results.push({...metadata, path: destination, hash, reused});
    } catch (error) { issues.push({...selection, error: error.message}); }
  }
  return {results, issues};
}
// The universal index contains locally published resources. External URLs and
// inline data remain in their original manifests but are not public files.
export function publicAssetPath(reference, publicRoot) {
  if (typeof reference !== 'string' || !reference || reference.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(reference)) return null;
  const clean = reference.replaceAll('\\', '/');
  if (clean.split('/').includes('..')) return null;
  return clean.startsWith('/') ? clean : `${publicRoot.replace(/\/$/, '')}/${clean.replace(/^\.\//, '')}`;
}
async function optionalIndex(file) {
  try { return await readJson(file); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
}
function visualMetadata(entry, index) {
  return Object.fromEntries(Object.entries({geometry: entry.geometry, geometries: entry.geometries,
    texture: entry.texture, textures: entry.textures, materials: entry.materials,
    variant: entry.variant, hash: entry.hash, kind: entry.kind, settings: entry.settings,
    states: entry.states, configuration: entry.configuration,
    rendererVersion: index.entityRendererVersion ?? index.rendererVersion}).filter(([, value]) => value !== undefined));
}
export async function buildVanillaAssetIndex({assetRoot = path.join(websiteRoot, 'static/img/wiki/vanilla'), legacyOutput = path.join(websiteRoot, 'src/data/vanillaAssetIndex.json'), manifests = []} = {}) {
  const legacy = {}, assets = [];
  for (const [folder, type, renderType] of [['Items', 'item', 'icon'], ['Renders', 'block', 'render']]) for (const file of await filesUnder(path.join(assetRoot, folder), '.png')) {
    const name = path.basename(file, '.png'), relative = path.relative(assetRoot, file).replaceAll('\\', '/'), publicPath = publicBase + relative;
    legacy[name] ??= publicPath; assets.push({identifier: `minecraft:${name}`, type, renderType, publicPath, vanillaVersion: null, provenance: 'legacy-unversioned'});
  }
  for (const folder of ['Faces', 'Entities', 'Models']) for (const file of await filesUnder(path.join(assetRoot, folder), '.asset.json')) {
    const metadata = await readJson(file);
    if (!metadata.identifier?.includes(':') || !metadata.type || !metadata.publicPath || !metadata.vanillaVersion) throw new Error(`Incomplete asset metadata: ${file}`);
    const relative = metadata.publicPath.startsWith(publicBase) ? metadata.publicPath.slice(publicBase.length) : null;
    if (!relative) throw new Error(`Asset metadata URL is outside vanilla root: ${file}`);
    const target = safeAssetPath(assetRoot, relative);
    if (metadata.type !== 'model' && !await validImage(target)) throw new Error(`Invalid indexed image: ${target}`);
    if (metadata.type === 'model') await fs.access(target);
    assets.push(metadata);
  }
  for (const {manifest, publicRoot, version = null, assetDirectory} of manifests) {
    const document = typeof manifest === 'string' ? await readJson(manifest) : manifest;
    const project = document.id ?? document.project?.id ?? null;
    const directory = assetDirectory ?? safeAssetPath(path.join(websiteRoot, 'static'), publicRoot.replace(/^\//, ''));
    const generated = new Map();
    for (const [folder, collection, type] of [['auto-entities', 'entities', 'entity'], ['auto-renders', 'blocks', 'block']]) {
      const index = await optionalIndex(path.join(directory, folder, 'index.json'));
      for (const [key, value] of Object.entries(index[collection] ?? {})) {
        const formats = type === 'entity' ? Object.entries(value) : [['render', value]];
        for (const [format, entry] of formats) {
          if (!entry || !entry.identifier?.includes(':')) continue;
          const publicPath = publicAssetPath(entry.path, publicRoot);
          if (!publicPath) continue;
          const variant = entry.variant ?? (key.startsWith(entry.identifier + '@') ? key.slice(entry.identifier.length + 1) : undefined);
          const metadata = {identifier: entry.identifier, type, renderType: format, publicPath,
            vanillaVersion: entry.vanillaVersion ?? index.vanillaVersion ?? version, project,
            ...visualMetadata(entry, index), ...(variant === undefined ? {} : {variant})};
          generated.set(publicPath, metadata);
          assets.push(metadata);
        }
      }
    }
    for (const [collection, type] of [['items', 'item'], ['blocks', 'block'], ['entities', 'entity']]) for (const record of document.content?.[collection] ?? []) {
      if (!record.identifier?.includes(':')) continue;
      const add = (field, reference, variant) => {
        const publicPath = publicAssetPath(reference, publicRoot);
        if (!publicPath) return;
        const textureAtlas = field === 'image' && type === 'entity'
          && (record.imageKind === 'texture' || /(?:^|\/)textures\/entity\//i.test(reference));
        const metadata = generated.get(publicPath);
        assets.push({...metadata, identifier: record.identifier, type,
          renderType: textureAtlas ? 'textureAtlas' : field === 'render' && type === 'entity' ? 'fullBody' : field,
          vanillaVersion: metadata?.vanillaVersion ?? version, publicPath, project,
          ...(variant === undefined ? {} : {variant})});
      };
      for (const field of ['render', 'portrait', 'face', 'image']) if (record[field]) add(field, record[field]);
      for (const [variant, mapping] of Object.entries(record.renderVariants ?? {})) {
        if (typeof mapping === 'string') add('render', mapping, variant);
        else if (mapping && typeof mapping === 'object') for (const field of ['render', 'fullBody', 'portrait', 'face', 'image']) {
          if (mapping[field]) add(field === 'fullBody' ? 'render' : field, mapping[field], variant);
        }
      }
    }
  }
  const unique = new Map(); for (const asset of assets) unique.set(JSON.stringify([asset.identifier, asset.type, asset.renderType, asset.variant ?? null, asset.publicPath]), asset);
  const sorted = [...unique.values()].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))), byIdentifier = {};
  for (let i = 0; i < sorted.length; i++) (byIdentifier[sorted[i].identifier] ??= []).push(i);
  const universal = {schemaVersion: 1, assets: sorted, byIdentifier};
  let previous = {}; try { previous = await readJson(legacyOutput); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const ordered = Object.fromEntries([...new Set([...Object.keys(previous), ...Object.keys(legacy)])].filter(key => key in legacy).map(key => [key, legacy[key]]));
  await writeChanged(legacyOutput, ordered);
  await writeChanged(path.join(assetRoot, 'index.json'), universal); return {legacy, universal};
}
