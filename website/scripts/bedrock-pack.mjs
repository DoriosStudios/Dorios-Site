import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {fullBlock} from './bedrock-renderer.mjs';

export const digest = value => createHash('sha256').update(value).digest('hex');
export function parseJsonc(text) {
  // Tokenize strings as a whole so URLs, escaped quotes and commas in strings
  // survive both comment and trailing-comma removal.
  const clean = text.replace(/^\uFEFF/, '').replace(/"(?:\\.|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\//g,
    token => token.startsWith('"') ? token : ' ');
  return JSON.parse(clean.replace(/"(?:\\.|[^"\\])*"|,\s*(?=[}\]])/g, token => token.startsWith('"') ? token : ''));
}
export const readJson = async file => parseJsonc(await fs.readFile(file, 'utf8'));
export async function validImage(file, size) {
  try {
    const {pixels, width, height} = await decodeTexture(await fs.readFile(file));
    return width > 0 && height > 0 && (!size || width === size && height === size)
      && pixels.some((v, i) => i % 4 === 3 && v > 0);
  } catch { return false; }
}
export function decodeTga(bytes) {
  if (bytes.length < 18) throw new Error('Truncated TGA header');
  const type = bytes[2], width = bytes.readUInt16LE(12), height = bytes.readUInt16LE(14), bits = bytes[16];
  if (bytes[1] || ![2, 3, 10, 11].includes(type) || !width || !height || width * height > 16777216
    || ([2, 10].includes(type) ? ![24, 32].includes(bits) : ![8, 16].includes(bits))) throw new Error('Unsupported TGA encoding');
  const channels = bits / 8, pixels = Buffer.alloc(width * height * 4);
  const gray = type === 3 || type === 11, rle = type >= 10;
  let offset = 18 + bytes[0], index = 0;
  const read = () => {
    if (offset + channels > bytes.length) throw new Error('Truncated TGA pixels');
    const p = gray ? [bytes[offset], bytes[offset], bytes[offset], channels === 2 ? bytes[offset+1] : 255]
      : [bytes[offset+2], bytes[offset+1], bytes[offset], channels === 4 ? bytes[offset+3] : 255];
    offset += channels;
    return p;
  };
  const write = p => {
    if (index >= width * height) throw new Error('TGA packet exceeds image dimensions');
    let x = index % width, y = Math.floor(index / width);
    if (!(bytes[17] & 32)) y = height - 1 - y;
    if (bytes[17] & 16) x = width - 1 - x;
    pixels.set(p, (y * width + x) * 4); index++;
  };
  while (index < width * height) {
    if (!rle) { write(read()); continue; }
    if (offset >= bytes.length) throw new Error('Truncated TGA packet');
    const packet = bytes[offset++], count = (packet & 127) + 1;
    if (packet & 128) { const p = read(); for (let i = 0; i < count; i++) write(p); }
    else for (let i = 0; i < count; i++) write(read());
  }
  return {data: pixels, info: {width, height}};
}
export async function decodeTexture(bytes, tint) {
  let decoded;
  try { decoded = await sharp(bytes, {failOn: 'warning'}).ensureAlpha().raw().toBuffer({resolveWithObject: true}); }
  catch (error) {
    if (bytes.length >= 18 && [2, 3, 10, 11].includes(bytes[2])) decoded = decodeTga(bytes);
    else throw error;
  }
  if (tint) {
    if (!/^#[a-f\d]{6}$/i.test(tint)) throw new Error(`Unsupported tint: ${tint}`);
    const rgb = tint.slice(1).match(/../g).map(value => parseInt(value, 16));
    for (let i = 0; i < decoded.data.length; i += 4) for (let c = 0; c < 3; c++) decoded.data[i+c] = Math.round(decoded.data[i+c] * rgb[c] / 255);
  }
  return {pixels: decoded.data, width: decoded.info.width, height: decoded.info.height, digest: digest(Buffer.concat([bytes, Buffer.from(tint ?? '')]))};
}
export async function filesUnder(folder, extension = '.json') {
  let entries;
  try { entries = await fs.readdir(folder, {withFileTypes: true}); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(file, extension));
    else if (!extension || file.toLowerCase().endsWith(extension)) files.push(file);
  }
  return files;
}

// A deliberately bounded, non-evaluating Molang expression reader. Unknown
// queries/functions fail visibly instead of choosing an arbitrary permutation.
export function evaluateExpression(expression, states) {
  if (typeof expression === 'boolean' || typeof expression === 'number') return expression;
  if (typeof expression !== 'string') throw new Error(`Invalid Molang expression: ${expression}`);
  const tokens = expression.match(/\s+|(?:query|q)\.block_state|true|false|'[^']*'|"[^"\\]*"|\d*\.?\d+|==|!=|<=|>=|&&|\|\||[()!<>+*/%\-]|./g).filter(t => t.trim());
  let index = 0;
  const primary = () => {
    const token = tokens[index++];
    if (token === '!') return !primary();
    if (token === '-') return -Number(primary());
    if (token === '+') return Number(primary());
    if (token === '(') { const value = binary(0); if (tokens[index++] !== ')') throw new Error('Unbalanced Molang expression'); return value; }
    if (token === 'q.block_state' || token === 'query.block_state') {
      if (tokens[index++] !== '(') throw new Error('Expected block_state argument');
      const name = tokens[index++];
      if (!/^(['"]).*\1$/.test(name) || tokens[index++] !== ')') throw new Error('Invalid block_state argument');
      const key = name.slice(1, -1);
      if (!(key in states)) throw new Error(`Unknown block state: ${key}`);
      return states[key];
    }
    if (token === 'true' || token === 'false') return token === 'true';
    if (/^(['"]).*\1$/.test(token ?? '')) return token.slice(1, -1);
    if (/^\d*\.?\d+$/.test(token ?? '')) return Number(token);
    throw new Error(`Unsupported Molang token: ${token} in ${expression}`);
  };
  const operators = {
    '||': [1, (a,b) => a || b], '&&': [2, (a,b) => a && b],
    '==': [3, (a,b) => a === b], '!=': [3, (a,b) => a !== b],
    '<': [4, (a,b) => a < b], '>': [4, (a,b) => a > b], '<=': [4, (a,b) => a <= b], '>=': [4, (a,b) => a >= b],
    '+': [5, (a,b) => Number(a) + Number(b)], '-': [5, (a,b) => a - b],
    '*': [6, (a,b) => a * b], '/': [6, (a,b) => a / b], '%': [6, (a,b) => a % b],
  };
  const binary = precedence => {
    let left = primary();
    while (operators[tokens[index]]?.[0] > precedence) {
      const [level, fn] = operators[tokens[index++]];
      left = fn(left, binary(level));
    }
    return left;
  };
  const value = binary(0);
  if (index !== tokens.length) throw new Error(`Unsupported Molang expression: ${expression}`);
  return value;
}

export function resolveVisual(block, requestedStates = {}, {itemVisual = true, legacy} = {}) {
  const states = {};
  for (const [name, definition] of Object.entries(block.description.states ?? {})) states[name] = Array.isArray(definition) ? definition[0] : definition.values?.min;
  const traits = block.description.traits ?? {};
  for (const name of traits['minecraft:placement_direction']?.enabled_states ?? []) states[name] = 'north';
  for (const name of traits['minecraft:placement_position']?.enabled_states ?? []) states[name] = name.endsWith('vertical_half') ? 'bottom' : 'up';
  Object.assign(states, requestedStates);
  let components = {...block.components};
  for (const permutation of block.permutations ?? []) {
    if (!Object.keys(permutation.components ?? {}).some(key => ['minecraft:geometry', 'minecraft:material_instances', 'minecraft:transformation', 'minecraft:item_visual'].includes(key))) continue;
    if (evaluateExpression(permutation.condition, states)) components = {...components, ...permutation.components};
  }
  const visual = itemVisual ? components['minecraft:item_visual'] : undefined;
  let descriptor = visual?.geometry ?? components['minecraft:geometry'];
  // Older cubic blocks explicitly declare their visual in RP/blocks.json.
  // This is a declared vanilla cube, never a substitute for a missing model.
  let legacyMaterials;
  if (legacy?.textures) {
    descriptor ??= 'minecraft:geometry.full_block';
    legacyMaterials = typeof legacy.textures === 'string' ? {'*': {texture: legacy.textures}}
      : Object.fromEntries(Object.entries(legacy.textures).map(([face, texture]) => [face, {texture}]));
  }
  if (typeof descriptor === 'string') descriptor = {identifier: descriptor};
  if (!descriptor?.identifier) throw new Error('No declared geometry; generic cube substitution is disabled');
  if (descriptor.uv_lock || descriptor.n_way_visual_rotation) throw new Error('uv_lock/n_way_visual_rotation is not supported');
  return {descriptor, states, transformation: components['minecraft:transformation'],
    materials: visual?.material_instances ?? components['minecraft:material_instances'] ?? legacyMaterials};
}

const firstTexture = value => Array.isArray(value) ? firstTexture(value[0]) : value;
export async function loadResourcePacks({source, dependencies = [], vanilla}) {
  const roots = [path.join(source, 'RP'), ...dependencies.map(folder => path.join(folder, 'RP')), ...(vanilla ? [vanilla] : [])];
  const atlas = new Map(), geometries = new Map(), legacyBlocks = new Map(), issues = [];
  const builtin = structuredClone(fullBlock);
  for (const name of ['west', 'north', 'down']) builtin.bones[0].cubes[0].uv[name] = {uv: [0, 0], uv_size: [16, 16]};
  geometries.set('minecraft:geometry.full_block', builtin);
  for (const root of roots) {
    try {
      for (const [identifier, visual] of Object.entries(await readJson(path.join(root, 'blocks.json')))) {
        if (!legacyBlocks.has(identifier)) legacyBlocks.set(identifier, visual);
      }
    } catch (error) { if (error.code !== 'ENOENT') issues.push(`${root}/blocks.json: ${error.message}`); }
    let terrain = {};
    try { terrain = (await readJson(path.join(root, 'textures/terrain_texture.json'))).texture_data ?? {}; }
    catch (error) { if (error.code !== 'ENOENT') issues.push(`${root}: ${error.message}`); }
    for (const [name, entry] of Object.entries(terrain)) if (!atlas.has(name)) atlas.set(name, {entry, root});
    for (const file of await filesUnder(path.join(root, 'models'))) {
      try {
        for (const geometry of (await readJson(file))['minecraft:geometry'] ?? []) {
          if (!geometries.has(geometry.description.identifier)) geometries.set(geometry.description.identifier, geometry);
        }
      } catch (error) { issues.push(`${file}: ${error.message}`); }
    }
  }
  const decodedImages = new Map();
  const textureFor = async material => {
    const declaredMethod = material.render_method ?? 'opaque';
    // Orthographic previews use near-distance appearance for LOD materials.
    const method = declaredMethod === 'double_sided' ? 'opaque' : declaredMethod.replace(/_to_opaque$/, '');
    if (!['opaque', 'blend', 'alpha_test', 'alpha_test_single_sided', 'alpha_test_double_sided'].includes(method)) throw new Error(`Unsupported render method: ${declaredMethod}`);
    if (material.tint_method && material.tint_method !== 'none') throw new Error(`Biome tint requires environment data: ${material.tint_method}`);
    if (material.isotropic) throw new Error('Random isotropic material UVs require a world position');
    const name = material.texture, entry = atlas.get(name);
    if (!entry) throw new Error(`Missing terrain texture: ${name}`);
    const texture = firstTexture(entry.entry.textures ?? entry.entry);
    const relative = typeof texture === 'string' ? texture : texture?.path;
    if (!relative) throw new Error(`Invalid terrain texture: ${name}`);
    const tint = typeof texture === 'object' ? texture.tint_color : undefined;
    const key = JSON.stringify([name, tint]);
    if (!decodedImages.has(key)) decodedImages.set(key, (async () => {
      const candidates = path.extname(relative) ? [relative] : [relative + '.png', relative + '.tga'];
      let bytes;
      for (const root of roots) {
        for (const file of candidates) {
          try { bytes = await fs.readFile(path.join(root, file)); break; }
          catch (error) { if (error.code !== 'ENOENT') throw error; }
        }
        if (bytes) break;
      }
      if (!bytes) throw new Error(`Missing texture asset: ${relative}`);
      return decodeTexture(bytes, tint);
    })());
    return {...await decodedImages.get(key), method, doubleSided: declaredMethod === 'double_sided'
      || ['blend', 'alpha_test', 'alpha_test_double_sided'].includes(method),
      faceDimming: material.face_dimming ?? true, ambientOcclusion: material.ambient_occlusion ?? true};
  };
  return {geometries, legacyBlocks, textureFor, issues};
}
