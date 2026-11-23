// Row-major affine matrices, column vectors; coordinates remain in Bedrock
// model units (16 per block). Pivots in .geo.json are absolute model positions.
export const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export const multiply = (a, b) => Array.from({length: 16}, (_, i) =>
  [0, 1, 2, 3].reduce((sum, k) => sum + a[Math.floor(i / 4) * 4 + k] * b[k * 4 + i % 4], 0));
export const transformPoint = (m, p, w = 1) => [0, 1, 2].map(i =>
  m[i * 4] * p[0] + m[i * 4 + 1] * p[1] + m[i * 4 + 2] * p[2] + m[i * 4 + 3] * w);
const translation = p => [1, 0, 0, p[0], 0, 1, 0, p[1], 0, 0, 1, p[2], 0, 0, 0, 1];
const scaleMatrix = p => [p[0], 0, 0, 0, 0, p[1], 0, 0, 0, 0, p[2], 0, 0, 0, 0, 1];
const chain = (...matrices) => matrices.reduce(multiply);
const negative = p => p.map(v => -v);
export const normalize = p => {
  const length = Math.hypot(...p);
  if (!length) throw new Error('Degenerate normal or camera direction');
  return p.map(v => v / length);
};
export const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const minus = (a, b) => a.map((v, i) => v - b[i]);
const vec3 = (p, fallback) => {
  p ??= fallback;
  if (!Array.isArray(p) || p.length !== 3 || !p.every(Number.isFinite)) throw new Error(`Invalid vector: ${JSON.stringify(p)}`);
  return p;
};

export function rotationMatrix(rotation = [0, 0, 0]) {
  // Bedrock model X is reflected relative to Blockbench/Three. Its codec
  // imports angles as [-x,-y,z] and reflects positions on X. Expressed in the
  // unreflected Bedrock coordinates used here, this is Rz(-z) Ry(y) Rx(-x).
  // https://github.com/JannisX11/blockbench/blob/master/js/formats/bedrock/bedrock.js
  const [x, y, z] = vec3(rotation).map((v, i) => v * Math.PI / 180 * (i === 1 ? 1 : -1));
  const [a, b, c, d, e, f] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
  return chain([e, -f, 0, 0, f, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [c, 0, d, 0, 0, 1, 0, 0, -d, 0, c, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, a, -b, 0, 0, b, a, 0, 0, 0, 0, 1]);
}
export function pivotMatrix(rotation, pivot = [0, 0, 0]) {
  vec3(pivot);
  return chain(translation(pivot), rotationMatrix(rotation), translation(negative(pivot)));
}
export function blockMatrix(config = {}) {
  // Component pivots/translation use blocks relative to block center, unlike
  // geometry pivots. Apply scale, rotation, then translation, in that order.
  const centerPivot = p => vec3(p, [0, 0, 0]).map((v, i) => v * 16 + (i === 1 ? 8 : 0));
  const sp = centerPivot(config.scale_pivot), rp = centerPivot(config.rotation_pivot);
  return chain(translation(vec3(config.translation, [0, 0, 0]).map(v => v * 16)),
    pivotMatrix(config.rotation, rp), translation(sp), scaleMatrix(vec3(config.scale, [1, 1, 1])), translation(negative(sp)));
}
export function inverseAffine(m) {
  const [a, b, c, , d, e, f, , g, h, i] = m;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-12) throw new Error('Singular block transformation');
  const out = [(e*i-f*h)/det, (c*h-b*i)/det, (b*f-c*e)/det, 0,
    (f*g-d*i)/det, (a*i-c*g)/det, (c*d-a*f)/det, 0,
    (d*h-e*g)/det, (b*g-a*h)/det, (a*e-b*d)/det, 0, 0, 0, 0, 1];
  const t = transformPoint(out, [m[3], m[7], m[11]], 0);
  [out[3], out[7], out[11]] = negative(t);
  return out;
}
export const transformNormal = (inverse, p) => normalize([0, 1, 2].map(i =>
  [0, 1, 2].reduce((sum, j) => sum + inverse[j * 4 + i] * p[j], 0)));

export function cameraProjection(camera = {}) {
  const direction = normalize(vec3(camera.direction, [1, 1, 1]));
  const right = normalize(cross(vec3(camera.up, [0, 1, 0]), direction));
  const up = cross(direction, right);
  return p => [dot(p, right), -dot(p, up), dot(p, direction)];
}

export function boxFaces(cube) {
  const [x, y, z] = cube.origin, [w, h, d] = cube.size;
  const [tw, th, td] = cube.textureSize ?? cube.size;
  const faces = [
    {name: 'east', origin: [x+w, y+h, z+d], u: [0, 0, -d], v: [0, -h, 0], normal: [1, 0, 0], uvSize: [d, h]},
    {name: 'south', origin: [x, y+h, z+d], u: [w, 0, 0], v: [0, -h, 0], normal: [0, 0, 1], uvSize: [w, h]},
    {name: 'up', origin: [x+w, y+h, z+d], u: [-w, 0, 0], v: [0, 0, -d], normal: [0, 1, 0], uvSize: [w, d]},
    {name: 'west', origin: [x, y+h, z], u: [0, 0, d], v: [0, -h, 0], normal: [-1, 0, 0], uvSize: [d, h]},
    {name: 'north', origin: [x+w, y+h, z], u: [-w, 0, 0], v: [0, -h, 0], normal: [0, 0, -1], uvSize: [w, h]},
    {name: 'down', origin: [x+w, y, z], u: [-w, 0, 0], v: [0, 0, d], normal: [0, -1, 0], uvSize: [w, d]},
  ];
  let uvs = cube.uv;
  if (Array.isArray(uvs)) {
    const [s, t] = uvs;
    uvs = {west: {uv: [s, t+td]}, north: {uv: [s+td, t+td]}, east: {uv: [s+td+tw, t+td]},
      south: {uv: [s+2*td+tw, t+td]}, up: {uv: [s+td+tw, t+td], uv_size: [-tw, -td]},
      down: {uv: [s+td+2*tw, t], uv_size: [-tw, td]}};
  }
  return faces.filter(face => Math.hypot(...face.u) && Math.hypot(...face.v)).flatMap(face => {
    const source = uvs?.[face.name];
    if (!source) return [];
    const defaultSize = ['east', 'west'].includes(face.name) ? [td, th]
      : ['up', 'down'].includes(face.name) ? [tw, td] : [tw, th];
    const uv = {...source, uv_size: source.uv_size ?? defaultSize};
    if (!Array.isArray(uv.uv) || uv.uv.length !== 2 || ![...uv.uv, ...uv.uv_size].every(Number.isFinite)) throw new Error('Invalid face UV');
    if ((uv.uv_rotation ?? 0) % 90) throw new Error('UV rotation must be a multiple of 90');
    return [{...face, uv}];
  });
}

function materialFor(materials, face) {
  let key = face.uv.material_instance ?? face.name;
  let material = materials[key] ?? materials['*'];
  const seen = new Set();
  while (typeof material === 'string') {
    if (seen.has(material)) throw new Error(`Material alias cycle: ${material}`);
    seen.add(material);
    key = material;
    material = materials[key];
  }
  if (!material?.texture) throw new Error(`Missing material for ${face.name} (${key})`);
  return material;
}

export async function compileGeometry({geometry, visibility = {}, transformation, materials, textureFor,
  evaluate = value => { if (typeof value !== 'boolean') throw new Error(`Unresolved visibility: ${value}`); return value; },
  camera, lighting}) {
  if (!geometry?.bones || !geometry.description?.texture_width || !geometry.description?.texture_height) throw new Error('Invalid Bedrock geometry');
  const bones = new Map();
  for (const bone of geometry.bones) {
    if (bones.has(bone.name)) throw new Error(`Duplicate bone: ${bone.name}`);
    bones.set(bone.name, bone);
  }
  const transforms = new Map(), active = new Set(), root = blockMatrix(transformation);
  const boneTransform = name => {
    if (transforms.has(name)) return transforms.get(name);
    const bone = bones.get(name);
    if (!bone) throw new Error(`Missing parent bone: ${name}`);
    if (active.has(name)) throw new Error(`Bone hierarchy cycle: ${name}`);
    if (bone.poly_mesh || bone.texture_meshes || bone.binding || bone.locators && Object.values(bone.locators).some(v => v?.binding)) throw new Error(`Unsupported mesh or skeletal binding: ${name}`);
    active.add(name);
    const parent = bone.parent ? boneTransform(bone.parent) : {matrix: root, visible: true};
    const value = {matrix: multiply(parent.matrix, pivotMatrix(bone.rotation, bone.pivot)),
      visible: parent.visible && (visibility[name] === undefined || Boolean(evaluate(visibility[name])))};
    active.delete(name);
    transforms.set(name, value);
    return value;
  };
  const faces = [], volumes = [], view = normalize(camera?.direction ?? [1, 1, 1]);
  let cubeCount = 0, planarCount = 0;
  for (const bone of geometry.bones) {
    const transform = boneTransform(bone.name);
    if (!transform.visible) continue;
    for (const source of bone.cubes ?? []) {
      const origin = vec3(source.origin), size = vec3(source.size);
      if (size.some(v => v < 0)) throw new Error(`Negative cube size in ${bone.name}`);
      const inflate = source.inflate ?? bone.inflate ?? 0;
      if (!Number.isFinite(inflate)) throw new Error('Invalid inflation');
      const cube = {...source, textureSize: size, origin: origin.map(v => v - inflate), size: size.map(v => v + 2 * inflate)};
      if (cube.size.some(v => v < 0)) throw new Error('Inflation inverted a cube');
      cubeCount++;
      if (cube.size.includes(0)) planarCount++;
      const matrix = multiply(transform.matrix, pivotMatrix(cube.rotation, cube.pivot));
      const inverse = inverseAffine(matrix);
      const volume = {origin: cube.origin, size: cube.size, matrix, inverse, textures: []};
      volume.contains = p => !cube.size.includes(0) && transformPoint(inverse, p).every((v, i) =>
        v > cube.origin[i] + 1e-6 && v < cube.origin[i] + cube.size[i] - 1e-6);
      // Only closed, uniformly opaque volumes can occlude arbitrary surfaces.
      volume.hides = texture => volume.closed && volume.textures.every(t => t.method === 'opaque'
        || (t.digest === texture.digest && t.method === texture.method && t.method === 'blend'));
      volume.blocks = (p, direction) => {
        if (!volume.closed || !volume.textures.every(t => t.method === 'opaque')) return false;
        const o = transformPoint(inverse, p), d = transformPoint(inverse, direction, 0);
        let near = 0, far = Infinity;
        for (let i = 0; i < 3; i++) {
          if (Math.abs(d[i]) < 1e-10) { if (o[i] < cube.origin[i] || o[i] > cube.origin[i] + cube.size[i]) return false; continue; }
          const a = (cube.origin[i] - o[i]) / d[i], b = (cube.origin[i] + cube.size[i] - o[i]) / d[i];
          near = Math.max(near, Math.min(a, b)); far = Math.min(far, Math.max(a, b));
          if (far <= near) return false;
        }
        return far > .001;
      };
      const localFaces = boxFaces(cube);
      volume.closed = localFaces.length === 6 && !cube.size.includes(0);
      const mirror = cube.mirror ?? bone.mirror;
      for (const local of localFaces) {
        // Mirrored box UV swaps east/west and reverses U on every face.
        let face = local;
        if (mirror) {
          const sourceFace = local.name === 'east' ? localFaces.find(f => f.name === 'west')
            : local.name === 'west' ? localFaces.find(f => f.name === 'east') : local;
          if (!sourceFace) throw new Error('Mirrored face has no opposite UV');
          face = {...local, uv: {...sourceFace.uv, uv: [sourceFace.uv.uv[0] + sourceFace.uv.uv_size[0], sourceFace.uv.uv[1]],
            uv_size: [-sourceFace.uv.uv_size[0], sourceFace.uv.uv_size[1]]}};
        }
        const material = materialFor(materials, face), texture = await textureFor(material);
        volume.textures.push(texture);
        const normal = transformNormal(inverse, face.normal);
        const facing = dot(normal, view);
        const doubleSided = texture.doubleSided ?? ['blend', 'alpha_test', 'alpha_test_double_sided'].includes(texture.method);
        // A plane can declare one UV side only (crossed crop planes do this).
        // Use its reverse side for double-sided materials when there is no
        // separate front UV. When both UVs exist, use the camera-facing one.
        if (Math.abs(facing) < 1e-8) continue;
        if (facing < 0) {
          const opposite = localFaces.some(other => dot(other.normal, local.normal) < -.999);
          if (!doubleSided || cube.size.includes(0) && opposite) continue;
        }
        const p = transformPoint(matrix, face.origin);
        const intensity = lighting?.intensity ?? {east: .85, south: .55, up: 1.25};
        const ambient = lighting?.ambient ?? .25;
        const light = lighting?.direction ?? [intensity.east - ambient, intensity.up - ambient, intensity.south - ambient];
        const shade = texture.faceDimming === false ? 1 : ambient + Math.max(0, dot(normal, light));
        faces.push({...face, origin: p, u: transformPoint(matrix, face.u, 0), v: transformPoint(matrix, face.v, 0),
          normal, shade, texture, volume, bone: bone.name, u0: 0, u1: 1, v0: 0, v1: 1});
      }
      volumes.push(volume);
    }
  }
  return {faces, volumes, stats: {bones: transforms.size, cubes: cubeCount, planes: planarCount, faces: faces.length}};
}
