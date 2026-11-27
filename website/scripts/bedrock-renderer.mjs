// CPU-only Bedrock isometric rendering. Sharp only decodes/encodes image bytes.
// Geometry and cube rotations use model-space pivots, X then Y then Z.
// https://learn.microsoft.com/minecraft/creator/reference/content/schemasreference/schemas/minecraftschema_geometry_1.21.0
export const rendererVersion = 4;
import {cameraProjection, compileGeometry, boxFaces} from './bedrock-geometry.mjs';
export {compileGeometry} from './bedrock-geometry.mjs';
const add = (a, b, scale = 1) => a.map((value, index) => value + b[index] * scale);
const subtract = (a, b) => a.map((value, index) => value - b[index]);
const pointAt = (face, u, v) => add(add(face.origin, face.u, u), face.v, v);
const project = ([x, y, z]) => [(x - z) * Math.sqrt(3) / 2, (x + z) / 2 - y, x + y + z];
export const studioLighting = {intensity: {east: .85, south: .55, up: 1.25}, contrast: 1.7, shadowStrength: .45};
export const keyDirections = [-.45, 0, .45].flatMap(x => [-.45, 0, .45].map(z => [1 + x, 2, -1 + z]));

export async function renderGeometry(input, options = {}) {
  const size = options.size ?? 128;
  if (!Number.isInteger(size) || size < 16 || size > 2048) throw new Error('Render size must be an integer from 16 to 2048');
  const compiled = await compileGeometry({...input, camera: options.camera, lighting: options.lighting});
  const pixels = rasterize(compiled.faces, input.geometry, {}, compiled.volumes, options);
  if (!pixels.some((value, i) => i % 4 === 3 && value)) throw new Error('Model has no visible textured pixels');
  return {pixels, width: size, height: size, stats: compiled.stats};
}

// Match the site's studio renders: upper-right key, a weaker opposite fill,
// deep shaded midtones and a soft highlight shoulder. Work on decoded pixels;
// source textures and tint colors stay untouched.
function studioChannel(value, light, shadow, lighting = studioLighting) {
  const lit = value / 255 * light * (1 - shadow * lighting.shadowStrength);
  const contrast = light >= 1 ? lit : lit < .5
    ? .5 * (lit * 2) ** lighting.contrast : 1 - .5 * (2 * (1 - lit)) ** lighting.contrast;
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

export const fullBlock = {
  description: {texture_width: 16, texture_height: 16},
  bones: [{name: 'block', cubes: [{origin: [-8, 0, -8], size: [16, 16, 16], uv: {
    east: {uv: [0, 0], uv_size: [16, 16]}, south: {uv: [0, 0], uv_size: [16, 16]},
    up: {uv: [16, 16], uv_size: [-16, -16]},
  }}]}],
};

export function visibleCubes(geometry, visibility) {
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
  return boxFaces(cube).filter(face => ['east', 'south', 'up'].includes(face.name))
    .map(face => ({...face, shade: studioLighting.intensity[face.name]}));
}

// Split at neighbouring cube edges and remove shared/internal surfaces. This
// keeps stair treads and wall joints clean, including translucent materials.
export function surfaceFragments(cubes) {
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

export function rasterize(faces, geometry, textures, cubes, options = {}) {
  const imageSize = options.size ?? 128;
  const lighting = {...studioLighting, ...options.lighting};
  const projectPoint = options.camera ? cameraProjection(options.camera) : project;
  const legacy = options.profile === 'atelier-v2';
  const fragments = legacy ? null : Array.from({length: imageSize * imageSize}, () => []);
  const points = faces.flatMap(face => [[face.u0, face.v0], [face.u1, face.v0], [face.u1, face.v1], [face.u0, face.v1]]
    .map(([u, v]) => projectPoint(pointAt(face, u, v))));
  if (!points.length) throw new Error('Preview geometry has no visible surfaces');
  const min = [0, 1].map(axis => Math.min(...points.map(point => point[axis])));
  const max = [0, 1].map(axis => Math.max(...points.map(point => point[axis])));
  // Entity portraits need to fill the canvas even when the head is only a few
  // model units wide. Preserve the established block framing unless requested.
  const scale = Math.min(options.maxScale ?? 3.5 * imageSize / 128,
    (imageSize * (options.padding ?? .875)) / (max[0] - min[0]),
    (imageSize * (options.padding ?? .875)) / (max[1] - min[1])) * (options.zoom ?? 1);
  const screen = point => {
    const [x, y, depth] = projectPoint(point);
    return [(x - (min[0] + max[0]) / 2) * scale + imageSize / 2,
      (y - (min[1] + max[1]) / 2) * scale + imageSize / 2, depth];
  };
  const pixels = Buffer.alloc(imageSize * imageSize * 4);
  const depths = new Float64Array(imageSize * imageSize).fill(-Infinity);
  const ordered = [...faces].sort((a, b) => projectPoint(pointAt(a, (a.u0 + a.u1) / 2, (a.v0 + a.v1) / 2))[2]
    - projectPoint(pointAt(b, (b.u0 + b.u1) / 2, (b.v0 + b.v1) / 2))[2]);
  const sampled = new Map();
  for (const face of ordered) {
    const texture = face.texture ?? textures[face.name];
    if (texture.animation && options.tick && !sampled.has(texture.animation)) {
      sampled.set(texture.animation, texture.animation.pixelsAt(options.tick));
    }
    const texels = sampled.get(texture.animation) ?? texture.pixels;
    const shades = Array.from({length: keyDirections.length + 1}, (_, blocked) =>
      Uint8Array.from({length: 256}, (_, value) => studioChannel(value, face.shade, blocked / keyDirections.length, lighting)));
    const receivesShadow = options.shadows !== false && texture.ambientOcclusion !== false && texture.ambientOcclusion !== 0
      && cubes.length > 1 && (legacy ? face.name !== 'south' : true) && texture.method === 'opaque';
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
      if (legacy && depth < depths[index] - .0001) continue;
      let tu = u, tv = v;
      for (let turns = (((face.uv.uv_rotation ?? 0) % 360 + 360) % 360) / 90; turns > 0; turns--) [tu, tv] = [tv, 1 - tu];
      const tx = Math.floor((face.uv.uv[0] + tu * uvSize[0]) / geometry.description.texture_width * texture.width);
      const ty = Math.floor((face.uv.uv[1] + tv * uvSize[1]) / geometry.description.texture_height * texture.height);
      const source = (Math.max(0, Math.min(texture.height - 1, ty)) * texture.width
        + Math.max(0, Math.min(texture.width - 1, tx))) * 4;
      let alpha = texels[source + 3] / 255;
      if (texture.method === 'opaque') alpha = 1;
      else if (texture.method?.startsWith('alpha_test')) alpha = alpha >= .5 ? 1 : 0;
      alpha *= texture.opacity ?? 1;
      if (!alpha) continue;
      if (!legacy && face.volume && cubes.some(other => other !== face.volume && other.contains
        && other.contains(add(pointAt(face, u, v), face.normal, .001))
        && other.hides(texture))) continue;
      const originInLight = receivesShadow ? add(pointAt(face, u, v), face.normal, .002) : null;
      const shadow = receivesShadow ? (legacy ? keyDirections.filter(direction => blockedLight(originInLight, direction, cubes)).length
        : keyDirections.filter(direction => cubes.some(cube => cube !== face.volume && cube.blocks?.(originInLight, direction))).length) : 0;
      if (!legacy) {
        fragments[index].push({depth, alpha, rgb: [0, 1, 2].map(channel => shades[shadow][texels[source + channel]])});
        continue;
      }
      const target = index * 4, oldAlpha = pixels[target + 3] / 255;
      const outAlpha = alpha + oldAlpha * (1 - alpha);
      for (let channel = 0; channel < 3; channel++) pixels[target + channel] = Math.round(
        (shades[shadow][texels[source + channel]] * alpha + pixels[target + channel] * oldAlpha * (1 - alpha)) / outAlpha);
      pixels[target + 3] = Math.round(outAlpha * 255);
      depths[index] = depth;
    }
  }
  if (!legacy) for (let index = 0; index < fragments.length; index++) {
    const layers = fragments[index].sort((a, b) => a.depth - b.depth);
    let alpha = 0, rgb = [0, 0, 0], previous;
    for (const layer of layers) {
      // Coplanar duplicate faces must not double the opacity of a flat element.
      if (previous && Math.abs(previous.depth - layer.depth) < 1e-6
        && previous.alpha === layer.alpha && previous.rgb.every((v, c) => v === layer.rgb[c])) continue;
      const next = layer.alpha + alpha * (1 - layer.alpha);
      rgb = rgb.map((value, c) => (layer.rgb[c] * layer.alpha + value * alpha * (1 - layer.alpha)) / next);
      alpha = next;
      previous = layer;
    }
    for (let c = 0; c < 3; c++) pixels[index * 4 + c] = Math.round(rgb[c]);
    pixels[index * 4 + 3] = Math.round(alpha * 255);
  }
  return pixels;
}

