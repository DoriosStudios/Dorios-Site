import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import sharp from 'sharp';

// Use the same vanilla revision as Atelier's generated wool/concrete textures.
const vanillaRevision = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
const vanillaRoot = `https://raw.githubusercontent.com/Mojang/bedrock-samples/${vanillaRevision}/resource_pack/`;
const imageSize = 128;
const rendererVersion = 2;
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const firstTexture = value => Array.isArray(value) ? firstTexture(value[0]) : value;
const add = (a, b, scale = 1) => a.map((value, index) => value + b[index] * scale);
const subtract = (a, b) => a.map((value, index) => value - b[index]);
const pointAt = (face, u, v) => add(add(face.origin, face.u, u), face.v, v);
const project = ([x, y, z]) => [(x - z) * Math.sqrt(3) / 2, (x + z) / 2 - y, x + y + z];
const studioLighting = {intensity: {east: .85, south: .55, up: 1.25}, contrast: 1.7, shadowStrength: .45};
const keyDirections = [-.45, 0, .45].flatMap(x => [-.45, 0, .45].map(z => [1 + x, 2, -1 + z]));

// Match the site's studio renders: upper-right key, a weaker opposite fill,
// deep shaded midtones and a soft highlight shoulder. Work on decoded pixels;
// source textures and tint colors stay untouched.
function studioChannel(value, light, shadow) {
  const lit = value / 255 * light * (1 - shadow * studioLighting.shadowStrength);
  const contrast = light >= 1 ? lit : lit < .5
    ? .5 * (lit * 2) ** studioLighting.contrast : 1 - .5 * (2 * (1 - lit)) ** studioLighting.contrast;
  const shoulder = contrast > .8 ? .8 + .2 * (1 - Math.exp(-5 * (contrast - .8))) : contrast;
  return Math.round(Math.max(0, Math.min(1, shoulder)) * 255);
}

function blockedLight(origin, direction, cubes) {
  return cubes.some(cube => {
    let near = 0, far = Infinity;
    for (let axis = 0; axis < 3; axis++) {
      const a = (cube.origin[axis] - origin[axis]) / direction[axis];
      const b = (cube.origin[axis] + cube.size[axis] - origin[axis]) / direction[axis];
      near = Math.max(near, Math.min(a, b));
      far = Math.min(far, Math.max(a, b));
      if (far <= near) return false;
    }
    return far > .001;
  });
}

const fullBlock = {
  description: {texture_width: 16, texture_height: 16},
  bones: [{name: 'block', cubes: [{origin: [-8, 0, -8], size: [16, 16, 16], uv: {
    east: {uv: [0, 0], uv_size: [16, 16]}, south: {uv: [0, 0], uv_size: [16, 16]},
    up: {uv: [16, 16], uv_size: [-16, -16]},
  }}]}],
};

function visibleCubes(geometry, visibility) {
  const bones = new Map(geometry.bones.map(bone => [bone.name, bone]));
  const hidden = bone => visibility[bone.name] === false || (bone.parent && hidden(bones.get(bone.parent)));
  return geometry.bones.filter(bone => !hidden(bone)).flatMap(bone => {
    if (bone.rotation?.some(value => value)) throw new Error(`Unsupported rotated preview bone: ${bone.name}`);
    return (bone.cubes ?? []).map(cube => {
      if (cube.rotation?.some(value => value)) throw new Error('Unsupported rotated preview cube');
      return cube;
    });
  });
}

function cubeFaces(cube) {
  const [x, y, z] = cube.origin;
  const [w, h, d] = cube.size;
  return [
    {name: 'east', origin: [x + w, y + h, z + d], u: [0, 0, -d], v: [0, -h, 0], normal: [1, 0, 0]},
    {name: 'south', origin: [x, y + h, z + d], u: [w, 0, 0], v: [0, -h, 0], normal: [0, 0, 1]},
    {name: 'up', origin: [x + w, y + h, z + d], u: [-w, 0, 0], v: [0, 0, -d], normal: [0, 1, 0]},
  ].filter(face => face.u.some(Boolean) && face.v.some(Boolean)).map(face => {
    if (Array.isArray(cube.uv)) throw new Error('Preview geometry requires per-face UVs');
    return {...face, shade: studioLighting.intensity[face.name], uv: cube.uv?.[face.name]};
  }).filter(face => face.uv);
}

// Split at neighbouring cube edges and remove shared/internal surfaces. This
// keeps stair treads and wall joints clean, including translucent materials.
function surfaceFragments(cubes) {
  return cubes.flatMap(cube => cubeFaces(cube).flatMap(face => {
    const cuts = vector => {
      const axis = vector.findIndex(Boolean);
      const values = [0, 1];
      for (const other of cubes) for (const coordinate of [other.origin[axis], other.origin[axis] + other.size[axis]]) {
        const value = (coordinate - face.origin[axis]) / vector[axis];
        if (value > 0 && value < 1) values.push(value);
      }
      return [...new Set(values)].sort((a, b) => a - b);
    };
    const us = cuts(face.u), vs = cuts(face.v), fragments = [];
    for (let i = 1; i < us.length; i++) for (let j = 1; j < vs.length; j++) {
      const [u0, u1, v0, v1] = [us[i - 1], us[i], vs[j - 1], vs[j]];
      const outside = add(pointAt(face, (u0 + u1) / 2, (v0 + v1) / 2), face.normal, .001);
      const covered = cubes.some(other => other !== cube && outside.every((value, axis) =>
        value > other.origin[axis] && value < other.origin[axis] + other.size[axis]));
      if (!covered) fragments.push({...face, u0, u1, v0, v1});
    }
    return fragments;
  }));
}

function rasterize(faces, geometry, textures, cubes) {
  const points = faces.flatMap(face => [[face.u0, face.v0], [face.u1, face.v0], [face.u1, face.v1], [face.u0, face.v1]]
    .map(([u, v]) => project(pointAt(face, u, v))));
  if (!points.length) throw new Error('Preview geometry has no visible surfaces');
  const min = [0, 1].map(axis => Math.min(...points.map(point => point[axis])));
  const max = [0, 1].map(axis => Math.max(...points.map(point => point[axis])));
  const scale = Math.min(3.5, 112 / (max[0] - min[0]), 112 / (max[1] - min[1]));
  const screen = point => {
    const [x, y, depth] = project(point);
    return [(x - (min[0] + max[0]) / 2) * scale + imageSize / 2,
      (y - (min[1] + max[1]) / 2) * scale + imageSize / 2, depth];
  };
  const pixels = Buffer.alloc(imageSize * imageSize * 4);
  const depths = new Float64Array(imageSize * imageSize).fill(-Infinity);
  const ordered = [...faces].sort((a, b) => project(pointAt(a, (a.u0 + a.u1) / 2, (a.v0 + a.v1) / 2))[2]
    - project(pointAt(b, (b.u0 + b.u1) / 2, (b.v0 + b.v1) / 2))[2]);
  for (const face of ordered) {
    const texture = textures[face.name];
    const shades = Array.from({length: keyDirections.length + 1}, (_, blocked) =>
      Uint8Array.from({length: 256}, (_, value) => studioChannel(value, face.shade, blocked / keyDirections.length)));
    const receivesShadow = cubes.length > 1 && face.name !== 'south' && texture.method === 'opaque';
    const origin = screen(face.origin), uAxis = subtract(screen(add(face.origin, face.u)), origin),
      vAxis = subtract(screen(add(face.origin, face.v)), origin);
    const determinant = uAxis[0] * vAxis[1] - uAxis[1] * vAxis[0];
    if (Math.abs(determinant) < .0001) continue;
    const corners = [[face.u0, face.v0], [face.u1, face.v0], [face.u1, face.v1], [face.u0, face.v1]]
      .map(([u, v]) => screen(pointAt(face, u, v)));
    const left = Math.max(0, Math.floor(Math.min(...corners.map(p => p[0]))));
    const right = Math.min(imageSize, Math.ceil(Math.max(...corners.map(p => p[0]))));
    const top = Math.max(0, Math.floor(Math.min(...corners.map(p => p[1]))));
    const bottom = Math.min(imageSize, Math.ceil(Math.max(...corners.map(p => p[1]))));
    const uvSize = face.uv.uv_size;
    if (!uvSize) throw new Error('Preview face is missing uv_size');
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
      const dx = x + .5 - origin[0], dy = y + .5 - origin[1];
      const u = (dx * vAxis[1] - dy * vAxis[0]) / determinant;
      const v = (uAxis[0] * dy - uAxis[1] * dx) / determinant;
      if (u < face.u0 || u >= face.u1 || v < face.v0 || v >= face.v1) continue;
      const depth = origin[2] + u * uAxis[2] + v * vAxis[2];
      const index = y * imageSize + x;
      if (depth < depths[index] - .0001) continue;
      let tu = u, tv = v;
      for (let turns = (face.uv.uv_rotation ?? 0) / 90; turns > 0; turns--) [tu, tv] = [tv, 1 - tu];
      const tx = Math.floor((face.uv.uv[0] + tu * uvSize[0]) / geometry.description.texture_width * texture.width);
      const ty = Math.floor((face.uv.uv[1] + tv * uvSize[1]) / geometry.description.texture_height * texture.height);
      const source = (Math.max(0, Math.min(texture.height - 1, ty)) * texture.width
        + Math.max(0, Math.min(texture.width - 1, tx))) * 4;
      let alpha = texture.pixels[source + 3] / 255;
      if (texture.method === 'opaque') alpha = 1;
      else if (texture.method?.startsWith('alpha_test')) alpha = alpha >= .5 ? 1 : 0;
      if (!alpha) continue;
      const originInLight = receivesShadow ? add(pointAt(face, u, v), face.normal, .002) : null;
      const shadow = receivesShadow ? keyDirections.filter(direction => blockedLight(originInLight, direction, cubes)).length : 0;
      const target = index * 4, oldAlpha = pixels[target + 3] / 255;
      const outAlpha = alpha + oldAlpha * (1 - alpha);
      for (let channel = 0; channel < 3; channel++) pixels[target + channel] = Math.round(
        (shades[shadow][texture.pixels[source + channel]] * alpha + pixels[target + channel] * oldAlpha * (1 - alpha)) / outAlpha);
      pixels[target + 3] = Math.round(outAlpha * 255);
      depths[index] = depth;
    }
  }
  return pixels;
}

export async function generateAtelierPreviews({source, output}) {
  const {parse: parseJsonc} = createRequire(path.join(source, 'package.json'))('jsonc-parser');
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
      const decoded = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject: true});
      const tint = typeof texture === 'object' ? texture.tint_color : undefined;
      if (tint) {
        const color = tint.replace(/^#/, '').match(/.{2}/g).map(value => parseInt(value, 16));
        for (let pixel = 0; pixel < decoded.data.length; pixel += 4) for (let channel = 0; channel < 3; channel++) {
          decoded.data[pixel + channel] = Math.round(decoded.data[pixel + channel] * color[channel] / 255);
        }
      }
      return {pixels: decoded.data, width: decoded.info.width, height: decoded.info.height,
        digest: createHash('sha256').update(bytes).update(tint ?? '').digest('hex')};
    })());
    return {...await images.get(key), method: material.render_method};
  };
  await fs.mkdir(path.join(output, 'previews'), {recursive: true});
  let generated = 0;
  for (const record of catalog.records.filter(record => record.kind === 'block')) {
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
    const cubes = visibleCubes(geometry, descriptor.bone_visibility ?? {});
    const materials = visual?.material_instances ?? components['minecraft:material_instances'];
    const textures = {};
    for (const face of ['up', 'east', 'south']) {
      const material = materials[face] ?? materials['*'];
      textures[face] = await textureFor(material);
    }
    const hash = createHash('sha256').update(JSON.stringify({rendererVersion, studioLighting, keyDirections, geometry, cubes,
      textures: Object.values(textures).map(texture => [texture.digest, texture.method])})).digest('hex').slice(0, 24);
    const relative = `previews/${hash}.png`, target = path.join(output, relative);
    try { await fs.access(target); }
    catch {
      await sharp(rasterize(surfaceFragments(cubes), geometry, textures, cubes), {raw: {width: imageSize, height: imageSize, channels: 4}})
        .png().toFile(target);
      generated++;
    }
    record.preview = relative;
  }
  await fs.writeFile(path.join(output, 'catalog.json'), JSON.stringify(catalog));
  const used = new Set(catalog.records.map(record => record.preview && path.basename(record.preview)));
  for (const file of await fs.readdir(path.join(output, 'previews'))) {
    if (/^[a-f0-9]{24}\.png$/.test(file) && !used.has(file)) await fs.unlink(path.join(output, 'previews', file));
  }
  console.log(`[atelier-previews] ${catalog.records.filter(record => record.preview).length} block previews (${generated} generated, remaining cached).`);
}
