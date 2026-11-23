import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {decodeTexture, parseJsonc, validImage, resolveVisual, evaluateExpression} from './bedrock-pack.mjs';
import sharp from 'sharp';

// Use the same vanilla revision as Atelier's generated wool/concrete textures.
const vanillaRevision = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
const vanillaRoot = `https://raw.githubusercontent.com/Mojang/bedrock-samples/${vanillaRevision}/resource_pack/`;
const imageSize = 128;
import {fullBlock, visibleCubes, surfaceFragments, rasterize, compileGeometry, rendererVersion as universalVersion, studioLighting, keyDirections} from './bedrock-renderer.mjs';
const rendererVersion = 2;
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const firstTexture = value => Array.isArray(value) ? firstTexture(value[0]) : value;
export async function generateAtelierPreviews({source, output, force = false}) {
  const catalog = await readJson(path.join(output, 'catalog.json'));
  const atlas = (await readJson(path.join(source, 'RP/textures/terrain_texture.json'))).texture_data;
  const cache = path.resolve(output, '../../.cache-loader/atelier-previews', vanillaRevision);
  await fs.mkdir(cache, {recursive: true});
  const remote = async file => {
    const cached = path.join(cache, file);
    try { return await fs.readFile(cached); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const response = await fetch(vanillaRoot + file, {signal: AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error(`Vanilla preview asset ${file}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await fs.mkdir(path.dirname(cached), {recursive: true});
    await fs.writeFile(cached, bytes);
    return bytes;
  };
  let vanillaAtlas;
  const images = new Map(), geometries = new Map([['minecraft:geometry.full_block', fullBlock]]);
  const models = async folder => {
    for (const file of await fs.readdir(folder, {withFileTypes: true})) {
      const location = path.join(folder, file.name);
      if (file.isDirectory()) await models(location);
      else if (file.name.endsWith('.json')) for (const geometry of (await readJson(location))['minecraft:geometry'] ?? []) {
        geometries.set(geometry.description.identifier, geometry);
      }
    }
  };
  await models(path.join(source, 'RP/models/blocks'));
  const textureFor = async material => {
    const key = material.texture;
    if (!images.has(key)) images.set(key, (async () => {
      let entry = atlas[key];
      if (!entry) {
        vanillaAtlas ??= parseJsonc((await remote('textures/terrain_texture.json')).toString()).texture_data;
        entry = vanillaAtlas[key];
      }
      if (!entry) throw new Error(`Unknown preview texture: ${key}`);
      const texture = firstTexture(entry.textures);
      const file = typeof texture === 'string' ? texture : texture.path;
      const relative = /\.(?:png|tga)$/.test(file) ? file : file + '.png';
      let bytes;
      try { bytes = await fs.readFile(path.join(source, 'RP', relative)); }
      catch (error) { if (error.code !== 'ENOENT') throw error; bytes = await remote(relative); }
      const tint = typeof texture === 'object' ? texture.tint_color : undefined;
      return decodeTexture(bytes, tint);
    })());
    return {...await images.get(key), method: material.render_method};
  };
  await fs.mkdir(path.join(output, 'previews'), {recursive: true});
  let generated = 0;
  const errors = [];
  for (const record of catalog.records.filter(record => record.kind === 'block')) {
    try {
      const block = (await readJson(path.join(source, record.file)))['minecraft:block'];
      const components = block.components, visual = components['minecraft:item_visual'];
      let descriptor = visual?.geometry ?? components['minecraft:geometry'];
      // Vertical slabs have no item_visual override. Their unconnected north
      // permutation supplies the two visible quarters of the inventory model.
      if (!visual?.geometry && record.shape === 'vertical_slab') descriptor = block.permutations.find(permutation =>
        /==\s*'north'/.test(permutation.condition) && /==\s*'none'/.test(permutation.condition))?.components['minecraft:geometry'] ?? descriptor;
      if (typeof descriptor === 'string') descriptor = {identifier: descriptor};
      const geometry = geometries.get(descriptor?.identifier);
      if (!geometry) throw new Error(`Missing preview model for ${record.id}: ${descriptor?.identifier}`);
      const legacy = !components['minecraft:transformation'] && geometry.bones.every(bone =>
        !bone.rotation?.some(Boolean) && (bone.cubes ?? []).every(cube => !cube.rotation?.some(Boolean) && !Array.isArray(cube.uv)))
        && Object.values(descriptor.bone_visibility ?? {}).every(value => typeof value === 'boolean');
      const cubes = legacy ? visibleCubes(geometry, descriptor.bone_visibility ?? {}) : null;
      const materials = visual?.material_instances ?? components['minecraft:material_instances'];
      const textures = {};
      for (const face of legacy ? ['up', 'east', 'south'] : []) {
        const material = materials[face] ?? materials['*'];
        textures[face] = await textureFor(material);
      }
      const compiled = legacy ? null : await compileGeometry({geometry, materials, textureFor,
        visibility: descriptor.bone_visibility, transformation: components['minecraft:transformation'],
        evaluate: value => evaluateExpression(value, resolveVisual(block).states)});
      const inputs = legacy ? {rendererVersion, studioLighting, keyDirections, geometry, cubes,
        textures: Object.values(textures).map(texture => [texture.digest, texture.method])}
        : {rendererVersion: universalVersion, studioLighting, keyDirections, geometry, descriptor,
          transformation: components['minecraft:transformation'],
          faces: compiled.faces.map(face => [face.bone, face.name, face.texture.digest, face.texture.method, face.uv])};
      const hash = createHash('sha256').update(JSON.stringify(inputs)).digest('hex').slice(0, 24);
      const relative = `previews/${hash}.png`, target = path.join(output, relative);
      if (force || !await validImage(target, imageSize)) {
        const pixels = legacy ? rasterize(surfaceFragments(cubes), geometry, textures, cubes, {profile: 'atelier-v2'})
          : rasterize(compiled.faces, geometry, {}, compiled.volumes);
        await sharp(pixels, {raw: {width: imageSize, height: imageSize, channels: 4}})
          .png().toFile(target);
        generated++;
      }
      record.preview = relative;
    } catch (error) {
      errors.push({block: record.id, message: error.message});
      console.error(`[atelier-previews] ${record.id}: ${error.message}`);
    }
  }
  await fs.writeFile(path.join(output, 'catalog.json'), JSON.stringify(catalog));
  const used = new Set(catalog.records.map(record => record.preview && path.basename(record.preview)));
  for (const file of await fs.readdir(path.join(output, 'previews'))) {
    if (/^[a-f0-9]{24}\.png$/.test(file) && !used.has(file)) await fs.unlink(path.join(output, 'previews', file));
  }
  console.log(`[atelier-previews] ${catalog.records.filter(record => record.preview).length} block previews (${generated} generated, remaining cached).`);
  if (errors.length) throw new Error(`${errors.length} Atelier previews failed; other previews were preserved/generated.`);
  return {generated, previews: catalog.records.filter(record => record.preview).length};
}
