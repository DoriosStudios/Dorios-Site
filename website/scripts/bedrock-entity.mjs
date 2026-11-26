// Entity adapter for the shared CPU geometry compiler and rasterizer. No addon
// scripts, eval, runtime animation controllers or arbitrary Molang are executed.
import fs from 'node:fs/promises';
import path from 'node:path';
import {compileGeometry, rasterize, rendererVersion} from './bedrock-renderer.mjs';
import {transformPoint, boxFaces} from './bedrock-geometry.mjs';
import {readJson, filesUnder, decodeTexture, evaluateExpression, digest} from './bedrock-pack.mjs';

export const entityRendererVersion = 1;
export const entityLighting = {ambient: .55, direction: [.2, .45, .15], contrast: 1.05, shadowStrength: .16};
const inside = (root, relative) => {
  const file = path.resolve(root, relative);
  if (!file.startsWith(path.resolve(root) + path.sep)) throw new Error(`Asset escapes resource pack: ${relative}`);
  return file;
};
export class EntityVisualError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const fail = (code, message) => { throw new EntityVisualError(code, message); };
const lookup = (object, name) => Object.entries(object ?? {}).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];

export async function loadEntityPacks({source, dependencies = [], vanilla}) {
  const roots = [path.join(source, 'RP'), ...dependencies.map(root => path.join(root, 'RP')), ...(vanilla ? [vanilla] : [])];
  const clients = new Map(), geometries = new Map(), controllers = new Map(), materials = new Map(), animations = new Map(), animationControllers = new Map();
  const issues = [];
  const insert = (map, key, value, file) => { if (!map.has(key)) map.set(key, {value, file}); };
  for (const root of roots) {
    for (const [folder, type] of [['entity', 'client'], ['models', 'geometry'], ['render_controllers', 'controller'],
      ['materials', 'material'], ['animations', 'animation'], ['animation_controllers', 'animationController']]) {
      for (const file of await filesUnder(path.join(root, folder), type === 'material' ? '.material' : '.json')) {
        try {
          const data = await readJson(file);
          if (type === 'client') {
            const value = data['minecraft:client_entity']?.description;
            if (value?.identifier) insert(clients, value.identifier, value, file);
          } else if (type === 'geometry') {
            for (const geometry of data['minecraft:geometry'] ?? []) insert(geometries, geometry.description.identifier, geometry, file);
            // The official resource pack still contains legacy entity models.
            for (const [identifier, model] of Object.entries(data)) if (identifier.startsWith('geometry.') && model.bones) {
              const [name, parent] = identifier.split(':');
              insert(geometries, name, {...model, legacyParent: parent, description: {identifier: name,
                texture_width: model.texturewidth, texture_height: model.textureheight}}, file);
            }
          } else {
            const map = {controller: controllers, material: materials, animation: animations, animationController: animationControllers}[type];
            for (const [name, value] of Object.entries(data[{controller:'render_controllers', material:'materials', animation:'animations', animationController:'animation_controllers'}[type]] ?? {})) {
              if (name !== 'version') insert(map, type === 'material' ? name.split(':')[0] : name,
                type === 'material' && name.includes(':') ? {...value,parent:name.split(':')[1]} : value, file);
            }
          }
        } catch (error) { issues.push({file, message: error.message}); }
      }
    }
  }
  const textureCache = new Map();
  const texture = async relative => {
    if (typeof relative !== 'string') fail('missingTexture', `Texture path must be explicit: ${JSON.stringify(relative)}`);
    if (!textureCache.has(relative)) textureCache.set(relative, (async () => {
      for (const root of roots) for (const candidate of path.extname(relative) ? [relative] : [relative + '.png', relative + '.tga']) {
        try {
          const file = inside(root, candidate), bytes = await fs.readFile(file);
          return {...await decodeTexture(bytes), file, path: relative};
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      fail('missingTexture', `Missing entity texture: ${relative}`);
    })());
    return textureCache.get(relative);
  };
  return {roots, clients, geometries, controllers, materials, animations, animationControllers, texture, issues};
}

export function entityQueries(behavior, overrides = {}) {
  const components = behavior?.components ?? {};
  const queries = {};
  for (const [component, query] of [['minecraft:variant','variant'], ['minecraft:mark_variant','mark_variant'], ['minecraft:skin_id','skin_id']]) {
    if (Number.isFinite(components[component]?.value)) queries[query] = components[component].value;
  }
  if (components['minecraft:is_baby']) queries.is_baby = true;
  return {...queries, ...overrides};
}

export function entityExpression(expression, {queries = {}, properties = {}, expressions = {}} = {}) {
  if (typeof expression === 'boolean' || typeof expression === 'number') return expression;
  if (Object.hasOwn(expressions, expression)) return expressions[expression];
  let rewritten = String(expression).replace(/(?:query|q)\.property\(\s*(['"])([^'"]+)\1\s*\)/g, (_, quote, name) => {
    if (!Object.hasOwn(properties, name)) fail('unsupportedVariant', `Entity property needs an explicit value: ${name}`);
    return JSON.stringify(properties[name]);
  });
  rewritten = rewritten.replace(/\b(?:query|q)\.([a-z_][a-z\d_]*)\b/gi, (_, name) => {
    if (!Object.hasOwn(queries, name)) fail('unsupportedVariant', `Molang query needs an explicit value: query.${name} (${expression})`);
    const value = queries[name];
    if (!['number','boolean','string'].includes(typeof value) || typeof value === 'number' && !Number.isFinite(value)) fail('unsupportedVariant', `Invalid query value: ${name}`);
    return JSON.stringify(value);
  });
  try { return evaluateExpression(rewritten, {}); }
  catch (error) { fail('unresolvedController', `Unsupported Molang: ${expression}; ${error.message}. Supply queries/expressions or explicit layers.`); }
}

function ternaryParts(expression) {
  let depth = 0, question = -1, nested = 0;
  for (let i = 0; i < expression.length; i++) {
    const c = expression[i];
    if ('(['.includes(c)) depth++;
    if (')]'.includes(c)) depth--;
    if (depth) continue;
    if (c === '?' && question < 0) question = i;
    else if (c === '?' && question >= 0) nested++;
    else if (c === ':' && question >= 0) {
      if (nested) nested--; else return [expression.slice(0, question), expression.slice(question + 1, i), expression.slice(i + 1)];
    }
  }
}

export function resolveEntitySymbol(expression, kind, client, controller, context, depth = 0) {
  if (depth > 20) fail('unresolvedController', 'Symbol/array recursion exceeds 20 levels');
  if (typeof expression !== 'string') fail('unresolvedController', `Invalid ${kind} reference: ${JSON.stringify(expression)}`);
  expression = expression.trim();
  if (Object.hasOwn(context.symbols ?? {}, expression)) return context.symbols[expression];
  const ternary = ternaryParts(expression);
  if (ternary) return resolveEntitySymbol(ternary[entityExpression(ternary[0], context) ? 1 : 2], kind, client, controller, context, depth + 1);
  const array = expression.match(/^Array\.([\w]+)\[(.*)\]$/i);
  if (array) {
    const values = lookup(controller.arrays?.[{geometry:'geometries',texture:'textures',material:'materials'}[kind]], `Array.${array[1]}`);
    if (!Array.isArray(values) || !values.length) fail('unresolvedController', `Missing ${kind} array: Array.${array[1]}`);
    const index = entityExpression(array[2], context);
    if (!Number.isInteger(index) || index < 0 || index >= values.length) fail('unsupportedVariant', `Array index outside declared range: ${expression} = ${index}`);
    return resolveEntitySymbol(values[index], kind, client, controller, context, depth + 1);
  }
  const symbol = expression.match(/^(Geometry|Texture|Material)\.([\w]+)$/i);
  if (symbol) {
    if (symbol[1].toLowerCase() !== kind) fail('unresolvedController', `Expected ${kind}, got ${expression}`);
    const value = lookup(client[{geometry:'geometry',texture:'textures',material:'materials'}[kind]], symbol[2]);
    if (typeof value !== 'string') fail(kind === 'texture' ? 'missingTexture' : 'unresolvedController', `Unresolved symbol: ${expression}`);
    return value;
  }
  // Explicit config layers can use concrete asset identifiers and texture paths.
  if (kind === 'geometry' && expression.startsWith('geometry.') || kind === 'texture' && expression.startsWith('textures/')) return expression;
  if (kind === 'material' && /^[\w.:_-]+$/.test(expression)) return expression;
  fail('unresolvedController', `Unresolved ${kind} selection: ${expression}`);
}

function materialProfile(name, packs, explicit) {
  if (explicit) {
    if (!['opaque','blend','alpha_test','alpha_test_single_sided','alpha_test_double_sided'].includes(explicit)) fail('unsupportedMaterial', `Unsupported material method: ${explicit}`);
    return {method: explicit, doubleSided: !['opaque','alpha_test_single_sided'].includes(explicit)};
  }
  const seen = new Set(), states = new Set();
  let current = name;
  while (current && !seen.has(current)) {
    seen.add(current);
    const entry = packs.materials.get(current)?.value;
    for (const state of entry?.states ?? []) states.add(state);
    if (entry?.['+states']) for (const state of entry['+states']) states.add(state);
    current = entry?.parent;
  }
  // Known vanilla entity shader families have explicit, stable alpha semantics.
  const names = [...seen].join(' ');
  if ([...seen].some(value => /^(?:entity|armor|villager|spider|player)(?:_|$)/.test(value)) || states.size) {
    const blend = states.has('Blending') || /(?:alpha|translucent|blend)/i.test(names) && !/alphatest/i.test(names);
    const alphaTest = states.has('AlphaTest') || /alphatest|alpha_test/i.test(names);
    return {method: blend ? 'blend' : alphaTest ? 'alpha_test' : 'opaque', doubleSided: states.has('DisableCulling') || /(?:double|nocull)/i.test(name)};
  }
  fail('unsupportedMaterial', `Unknown entity material ${name}; configure materialMethods.${name} explicitly`);
}

const patternMatches = (pattern, value) => new RegExp('^' + pattern.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$', 'i').test(value);
export function headBones(geometry, configured) {
  let roots = configured;
  if (!roots) {
    const exact = geometry.bones.filter(bone => /^(?:head|skull|face|cranium)$/i.test(bone.name));
    const candidates = exact.length ? exact : geometry.bones.filter(bone => /(?:^|[_. -])(?:head|skull|face|cranium)(?:$|[_. -])/i.test(bone.name));
    if (candidates.length !== 1) fail('headNotResolved', `Cannot identify a unique head in ${geometry.description.identifier}; configure headBones`);
    roots = candidates.map(bone => bone.name);
  }
  if (!Array.isArray(roots) || !roots.length || roots.some(name => !geometry.bones.some(bone => bone.name === name))) fail('headNotResolved', `Invalid headBones: ${JSON.stringify(roots)}`);
  const selected = new Set(roots);
  for (let n = 0; n < geometry.bones.length; n++) for (const bone of geometry.bones) if (selected.has(bone.parent)) selected.add(bone.name);
  return selected;
}

function alignEndermanHead(geometry) {
  const head = geometry.bones.find(bone => bone.name === 'head');
  const hat = geometry.bones.find(bone => bone.name === 'hat' && bone.parent === 'head');
  const body = geometry.bones.find(bone => bone.name === head?.parent && bone.name === 'body');
  if (head?.pivot?.[1] !== 24 || head.cubes?.length !== 1 || head.cubes[0].origin?.[1] !== 24
    || hat?.pivot?.[1] !== 38 || body?.pivot?.[1] !== 38) return;

  // Place the bind-pose head at the neck for static renders. Cube and bone
  // coordinates are model-relative, so the hat is already at the right height.
  head.pivot[1] = body.pivot[1];
  head.cubes[0].origin[1] = body.pivot[1];
}

function resolveEntityGeometry(packs, id, ancestors = new Set()) {
  const model = packs.geometries.get(id)?.value;
  if (!model) fail('missingGeometry', `Missing entity geometry: ${id}`);
  if (ancestors.has(id)) fail('missingGeometry', `Cyclic legacy entity geometry: ${id}`);
  const {legacyParent, ...geometry} = structuredClone(model);
  if (legacyParent) {
    const parent = resolveEntityGeometry(packs, legacyParent, new Set([...ancestors, id]));
    const bones = new Map(parent.bones.map(bone => [bone.name.toLowerCase(), bone]));
    for (const bone of geometry.bones) {
      const key = bone.name.toLowerCase();
      bones.set(key, {...bones.get(key), ...bone});
    }
    geometry.bones = [...bones.values()];
    geometry.description.texture_width ??= parent.description.texture_width;
    geometry.description.texture_height ??= parent.description.texture_height;
  }
  geometry.description.texture_width ??= 64;
  geometry.description.texture_height ??= 32;
  const names = new Map(geometry.bones.map(bone => [bone.name.toLowerCase(), bone.name]));
  for (const bone of geometry.bones) if (bone.parent) {
    bone.parent = names.get(bone.parent.toLowerCase()) ?? bone.parent;
  }
  return geometry;
}

export async function resolveEntityVisual({identifier, behavior, packs, override = {}}) {
  const client = packs.clients.get(identifier)?.value;
  if (!client && !override.layers) fail('missingClient', `No client entity matching full identifier ${identifier}`);
  const properties = Object.fromEntries(Object.entries(behavior?.description?.properties ?? {}).filter(([, value]) => ['number','boolean','string'].includes(typeof value.default)).map(([name, value]) => [name, value.default]));
  const context = {queries: entityQueries(behavior, override.queries), properties: {...properties, ...override.properties}, expressions: override.expressions ?? {}, symbols: override.symbols ?? {}};
  const warnings = [];
  if (client?.scripts?.animate?.length) warnings.push('Runtime animations/controllers are not evaluated; using deterministic bind pose unless pose/staticAnimation is configured.');
  if (client?.scripts?.scale !== undefined) warnings.push('Client scripts.scale is not evaluated; neutral model units and automatic framing are used.');
  const layers = [];
  const declarations = override.layers ?? client?.render_controllers;
  if (!Array.isArray(declarations) || !declarations.length) fail('unresolvedController', 'No render controllers; configure explicit layers');
  for (const declaration of declarations) {
    let controller, controllerName;
    if (override.layers) controller = declaration;
    else {
      let name = declaration;
      if (typeof declaration === 'object') {
        const entries = Object.entries(declaration);
        if (entries.length !== 1) fail('unresolvedController', 'Conditional render controller must have exactly one entry');
        const [[key, condition]] = entries;
        if (!entityExpression(condition, context)) continue;
        name = key;
      }
      controllerName = name;
      controller = packs.controllers.get(name)?.value;
      if (!controller) fail('unresolvedController', `Missing render controller: ${name}`);
    }
    const symbolic = (value, kind) => resolveEntitySymbol(value, kind, client ?? {}, controller, context);
    const geometryId = symbolic(controller.geometry, 'geometry');
    const geometry = resolveEntityGeometry(packs, geometryId);
    if (identifier === 'minecraft:enderman' && geometryId === 'geometry.enderman.v1.8') alignEndermanHead(geometry);
    for (const bone of geometry.bones) if (bone.neverRender && override.visibility?.[bone.name] !== true) bone.cubes = [];
    const pose = {...override.pose};
    if (override.staticAnimation) {
      const animationName = client?.animations?.[override.staticAnimation] ?? override.staticAnimation;
      const animation = packs.animations.get(animationName)?.value;
      if (!animation) fail('unsupportedPose', `Missing static animation: ${animationName}`);
      for (const [name, value] of Object.entries(animation.bones ?? {})) {
        if (value.position || value.scale || value.rotation && (!Array.isArray(value.rotation) || !value.rotation.every(Number.isFinite))) fail('unsupportedPose', `Static animation supports constant rotations only: ${animationName}/${name}`);
        if (value.rotation) pose[name] = value.rotation;
      }
    }
    for (const [name, rotation] of Object.entries(pose)) {
      const bone = geometry.bones.find(bone => bone.name === name);
      if (!bone || !Array.isArray(rotation) || rotation.length !== 3 || !rotation.every(Number.isFinite)) fail('unsupportedPose', `Invalid pose rotation for ${name}`);
      bone.rotation = (bone.rotation ?? [0,0,0]).map((value, i) => value + rotation[i]);
    }
    for (const [name, offset] of Object.entries(override.poseOffsets ?? {})) {
      const bone = geometry.bones.find(bone => bone.name === name);
      if (!bone || !Array.isArray(offset) || offset.length !== 3 || !offset.every(Number.isFinite)) {
        fail('unsupportedPose', `Invalid pose offset for ${name}`);
      }
      bone.previewOffset = offset;
    }
    const textures = controller.textures ?? (controller.texture ? [controller.texture] : []);
    if (textures.length !== 1) fail('unsupportedVariant', `Controller ${controllerName ?? 'explicit'} has ${textures.length} texture stages; configure one explicit layer per texture/material instead of guessing shader composition`);
    const texturePath = symbolic(textures[0], 'texture'), decoded = await packs.texture(texturePath);
    for (const key of ['color','overlay_color','is_hurt_color','on_fire_color','uv_anim','filter_lighting','ignore_lighting']) {
      if (controller[key] !== undefined) warnings.push(`Controller ${controllerName ?? 'explicit'} ${key} is not applied in the neutral static shader profile.`);
    }
    const materialRules = controller.materials ?? [{'*': controller.material ?? 'Material.default'}];
    if (!Array.isArray(materialRules)) fail('unresolvedController', 'Controller materials must be an array');
    const visibility = {};
    for (const rule of controller.part_visibility ?? []) for (const [pattern, expression] of Object.entries(rule)) {
      const value = Boolean(entityExpression(expression, context));
      for (const bone of geometry.bones) if (patternMatches(pattern, bone.name)) visibility[bone.name] = value;
    }
    Object.assign(visibility, override.visibility, controller.visibility);
    const materials = {};
    for (const bone of geometry.bones) {
      let name;
      for (const rule of materialRules) for (const [pattern, reference] of Object.entries(rule)) if (patternMatches(pattern, bone.name)) name = symbolic(reference, 'material');
      if (!name) fail('unsupportedMaterial', `No material selected for bone ${bone.name}`);
      const profile = materialProfile(name, packs, override.materialMethods?.[name] ?? controller.renderMethod);
      const key = `entity_${bone.name}`;
      materials[key] = {texture: key};
      // Material selection is bone based for entities. Feed it through the
      // existing per-face material-instance mechanism without modifying UVs.
      for (const cube of bone.cubes ?? []) {
        if (Array.isArray(cube.uv)) {
          // boxFaces is already the shared Bedrock atlas convention authority.
          cube.uv = Object.fromEntries(boxFaces(cube).map(face => [face.name, {...face.uv, material_instance: key}]));
        } else for (const uv of Object.values(cube.uv ?? {})) uv.material_instance = key;
      }
      materials[key].decoded = {...decoded, ...profile, faceDimming: true, ambientOcclusion: true};
    }
    layers.push({geometry, geometryId, texturePath, textureDigest: decoded.digest, controller: controllerName, materials, visibility});
  }
  if (!layers.length) fail('unsupportedVariant', `All render controllers are disabled for ${identifier}`);
  return {identifier, layers, warnings, context, rendererVersion, entityRendererVersion};
}

export async function renderEntity(visual, {format = 'fullBody', size = 128, head: configuredHead, portraitBones, camera,
  lighting = entityLighting, shadows = true, zoom = 1, padding = .875} = {}) {
  if (!['fullBody','portrait','face'].includes(format)) throw new Error(`Unknown entity format: ${format}`);
  if (!Number.isInteger(size) || size < 16 || size > 2048) throw new Error('Entity render size must be from 16 to 2048');
  if (!Number.isFinite(zoom) || zoom <= 0 || zoom > 4 || !Number.isFinite(padding) || padding <= 0 || padding > 1) throw new Error('Invalid entity framing settings');
  const view = camera ?? {direction: format === 'face' ? [0,0,-1] : [-1,.65,-1]};
  const faces = [], volumes = [], stats = [];
  for (const layer of visual.layers) {
    const geometry = structuredClone(layer.geometry);
    let selected;
    if (format === 'face') selected = headBones(geometry, configuredHead);
    else if (format === 'portrait' && portraitBones) selected = headBones(geometry, portraitBones);
    if (selected) for (const bone of geometry.bones) if (!selected.has(bone.name)) bone.cubes = [];
    const compiled = await compileGeometry({geometry, materials: layer.materials, visibility: layer.visibility,
      textureFor: async material => layer.materials[material.texture].decoded, camera: view, lighting});
    let chosen = compiled.faces;
    if (format === 'portrait' && !portraitBones) {
      const allPoints = compiled.volumes.flatMap(volume => [0,1].flatMap(x => [0,1].flatMap(y => [0,1].map(z =>
        transformPoint(volume.matrix, volume.origin.map((value,i) => value + [x,y,z][i]*volume.size[i]))))));
      const ys = allPoints.map(point => point[1]), cutoff = Math.min(...ys) + (Math.max(...ys) - Math.min(...ys)) * .5;
      chosen = chosen.filter(face => transformPoint(face.volume.matrix, face.volume.origin.map((value, i) => value + face.volume.size[i]/2))[1] >= cutoff);
    }
    // Different controller geometries can declare different atlas dimensions.
    // Normalize UVs before the one shared depth/transparency rasterization pass.
    for (const face of chosen) faces.push({...face, uv: {...face.uv,
      uv: face.uv.uv.map((value, i) => value / geometry.description[i ? 'texture_height' : 'texture_width']),
      uv_size: face.uv.uv_size.map((value, i) => value / geometry.description[i ? 'texture_height' : 'texture_width'])}});
    const used = new Set(chosen.map(face => face.volume));
    volumes.push(...compiled.volumes.filter(volume => used.has(volume)));
    stats.push(compiled.stats);
  }
  if (!faces.length) fail('renderFailure', `No visible geometry for ${visual.identifier}/${format}`);
  const pixels = rasterize(faces, {description:{texture_width:1,texture_height:1}}, {}, volumes,
    {size, camera:view, lighting, shadows, maxScale:Infinity, zoom, padding});
  if (!pixels.some((value, i) => i % 4 === 3 && value)) fail('renderFailure', `No visible textured pixels for ${visual.identifier}/${format}`);
  return {pixels, width:size, height:size, stats, camera:view, format};
}

export function entityVisualHash(visual, settings) {
  return digest(JSON.stringify({rendererVersion, entityRendererVersion, settings, identifier:visual.identifier,
    layers: visual.layers.map(({geometry, texturePath, textureDigest, controller, visibility, materials}) => ({geometry, texturePath,
      textureDigest, controller, visibility, materials:Object.fromEntries(Object.entries(materials).map(([key, material]) => [key,
        {texture:material.texture, method:material.decoded.method, doubleSided:material.decoded.doubleSided}]))}))}));
}
