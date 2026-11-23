import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {inventoryResourcePack, collectVanillaAssets, resolveResourceReference, resolveBlockFace, extractVanillaFaces, buildVanillaAssetIndex, safeAssetPath, publicAssetPath} from './vanilla-assets.mjs';
import {parseVanillaArguments} from './collect-vanilla-assets.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dorios-vanilla-'));
  t.after(() => fs.rm(root, {recursive: true, force: true}));
  const write = async (relative, payload) => {const file = path.join(root, relative); await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file, JSON.stringify(payload));};
  const image = async relative => {const file = path.join(root, relative); await fs.mkdir(path.dirname(file), {recursive: true}); await sharp({create: {width: 16, height: 16, channels: 4, background: '#cc8844'}}).png().toFile(file);};
  await write('RP/manifest.json', {format_version: 2, header: {min_engine_version: [1, 26, 50]}});
  await write('RP/entity/bird.json', {'minecraft:client_entity': {description: {identifier: 'minecraft:bird', geometry: {default: 'geometry.bird'}, textures: {default: 'textures/entity/bird'}, render_controllers: ['controller.render.bird']}}});
  await write('RP/models/entity/bird.json', {'minecraft:geometry': [{description: {identifier: 'geometry.bird', texture_width: 16, texture_height: 16}, bones: []}], 'geometry.legacy_bird': {texturewidth: 32, bones: []}});
  await write('RP/render_controllers/bird.json', {render_controllers: {'controller.render.bird': {geometry: 'Geometry.default', textures: ['Texture.default']}}});
  await write('RP/materials/bird.material', {materials: {'bird:entity_alphatest': {}}});
  await write('RP/animations/bird.json', {animations: {'animation.bird.idle': {}}});
  await write('RP/animation_controllers/bird.json', {animation_controllers: {'controller.animation.bird': {}}});
  await write('RP/blocks.json', {furnace: {textures: {up: 'furnace_top', north: 'furnace_front', side: 'furnace_side'}}});
  await write('RP/textures/terrain_texture.json', {texture_data: {furnace_top: {textures: 'textures/blocks/top'}, furnace_front: {textures: ['textures/blocks/front', 'textures/blocks/top']}, furnace_side: {textures: 'textures/blocks/front'}}});
  await image('RP/textures/entity/bird.png'); await image('RP/textures/blocks/top.png'); await image('RP/textures/blocks/front.png');
  return {root, write, image, rp: path.join(root, 'RP')};
}

test('inventory associates client identifiers, modern/legacy geometry and static pose references', async t => {
  const {rp} = await fixture(t), index = await inventoryResourcePack(rp, {version: '1.26.50.4'});
  assert.equal(index.entities['minecraft:bird'].geometry.default, 'geometry.bird');
  assert.equal(index.geometries['geometry.legacy_bird'].legacy, true);
  assert.ok(index.renderControllers['controller.render.bird']); assert.ok(index.materials['bird:entity_alphatest']);
  assert.ok(index.animations['animation.bird.idle']); assert.ok(index.animationControllers['controller.animation.bird']);
  assert.equal(index.issues.length, 0);
});

test('local snapshots reuse identical bytes and separate changed visual inputs by content hash', async t => {
  const {root, rp, image} = await fixture(t), options = {source: rp, version: '1.26.50.4', cacheRoot: path.join(root, 'cache')};
  const first = await collectVanillaAssets(options), second = await collectVanillaAssets(options);
  assert.equal(second.reused, true); assert.equal(first.root, second.root);
  await image('RP/textures/entity/new.png'); const changed = await collectVanillaAssets(options);
  assert.notEqual(changed.root, first.root); assert.equal(await fs.stat(path.join(first.root, 'textures/entity/bird.png')).then(s => s.isFile()), true);
  await assert.rejects(collectVanillaAssets({...options, version: undefined}), /explicit/);
});

test('official import is pinned, refuses a mixed version, mutable ref and missing offline checkout', async t => {
  const {root} = await fixture(t), config = {bedrockVersion: '1.26.50.4', repository: 'https://github.com/Mojang/bedrock-samples.git', revision: 'a'.repeat(40), resourcePack: 'resource_pack'};
  await assert.rejects(collectVanillaAssets({config, version: '1.21.0', cacheRoot: root}), /differs/);
  await assert.rejects(collectVanillaAssets({config: {...config, revision: 'main'}, cacheRoot: root}), /immutable/);
  await assert.rejects(collectVanillaAssets({config, cacheRoot: root, offline: true}), /unavailable offline/);
  assert.throws(() => parseVanillaArguments(['--source', root]), /--version/);
});

test('project and explicit dependency textures precede vanilla without filename collisions', async t => {
  const {root, rp, image} = await fixture(t); await image('project/textures/entity/bird.png'); await image('dependency/textures/entity/bird.png');
  const project = path.join(root, 'project'), dependency = path.join(root, 'dependency');
  assert.equal(await resolveResourceReference('textures/entity/bird', [project, dependency, rp]), path.join(project, 'textures/entity/bird.png'));
  await fs.unlink(path.join(project, 'textures/entity/bird.png'));
  assert.equal(await resolveResourceReference('textures/entity/bird', [project, dependency, rp]), path.join(dependency, 'textures/entity/bird.png'));
  assert.equal(await resolveResourceReference('textures/entity/missing', [rp]), null);
  assert.throws(() => safeAssetPath(rp, '../secret'), /escapes/);
});

test('selected real faces preserve source pixels, require explicit texture variants and isolate failures', async t => {
  const {root, rp} = await fixture(t), inventory = await inventoryResourcePack(rp, {version: '1.26.50.4'});
  await assert.rejects(resolveBlockFace(inventory, rp, 'minecraft:furnace', 'north'), /explicit variant/);
  const options = {root: rp, inventory, output: path.join(root, 'faces'), selections: [{identifier: 'minecraft:furnace', face: 'up'}, {identifier: 'minecraft:furnace', face: 'north', variant: 0}, {identifier: 'minecraft:missing', face: 'up'}]};
  const first = await extractVanillaFaces(options), second = await extractVanillaFaces(options);
  assert.equal(first.results.length, 2); assert.equal(first.issues.length, 1); assert.ok(second.results.every(result => result.reused));
  assert.deepEqual(await sharp(first.results[0].path).raw().toBuffer(), await sharp(path.join(rp, 'textures/blocks/top.png')).raw().toBuffer());
});

test('rich resource index preserves legacy URLs and separate namespaces, including generated face metadata', async t => {
  const {root, image, write} = await fixture(t), assetRoot = path.join(root, 'public');
  await image('public/Items/bird.png'); await image('public/Renders/stone.png'); await image('public/Entities/bird-face.png');
  await write('public/Entities/bird.asset.json', {identifier: 'minecraft:bird', type: 'entity', renderType: 'face', publicPath: '/img/wiki/vanilla/Entities/bird-face.png', vanillaVersion: '1.26.50.4', geometry: 'geometry.bird', texture: 'textures/entity/bird'});
  const result = await buildVanillaAssetIndex({assetRoot, legacyOutput: path.join(root, 'legacy.json'), manifests: [{manifest: {id: 'addon', content: {entities: [{identifier: 'addon:bird', render: 'auto-renders/bird.png', face: 'auto-renders/bird-face.png'}]}}, publicRoot: '/img/wiki/addon'}]});
  assert.equal(result.legacy.bird, '/img/wiki/vanilla/Items/bird.png'); assert.equal(result.legacy.stone, '/img/wiki/vanilla/Renders/stone.png');
  assert.equal(result.universal.byIdentifier['minecraft:bird'].length, 2); assert.equal(result.universal.byIdentifier['addon:bird'].length, 2);
  const face = result.universal.assets.find(asset => asset.renderType === 'face' && asset.identifier === 'minecraft:bird'); assert.equal(face.vanillaVersion, '1.26.50.4');
});

test('public paths preserve root-relative associations and omit remote or inline assets', () => {
  assert.equal(publicAssetPath('/img/wiki/utilitycraft/workbench.png', '/img/wiki/ascendant-technology'), '/img/wiki/utilitycraft/workbench.png');
  assert.equal(publicAssetPath('textures/items/part.png', '/img/wiki/addon'), '/img/wiki/addon/textures/items/part.png');
  for (const ref of ['https://example.org/item.png', '//example.org/item.png', 'data:image/png;base64,AAA', 'javascript:alert(1)', '../private.png']) assert.equal(publicAssetPath(ref, '/img/wiki/addon'), null);
});

test('addon index includes named variants and generated geometry/texture metadata without promoting atlases', async t => {
  const {root, image, write} = await fixture(t), assetRoot = path.join(root, 'public'), assetDirectory = path.join(root, 'addon');
  await image('public/Items/stone.png');
  await write('addon/auto-entities/index.json', {schemaVersion: 1, entityRendererVersion: 1, entities: {
    'addon:bird': {fullBody: {identifier: 'addon:bird', path: 'auto-entities/bird/full.png', hash: 'bodyhash', kind: 'generated', geometries: ['geometry.bird'], textures: ['textures/entity/bird'], settings: {size: 128}}},
    'addon:bird@winter': {face: {identifier: 'addon:bird', variant: 'winter', path: 'auto-entities/bird/face-winter.png', geometries: ['geometry.bird.winter'], textures: ['textures/entity/bird_winter'], hash: 'facehash'}}
  }});
  await write('addon/auto-renders/index.json', {schemaVersion: 1, rendererVersion: 4, blocks: {'addon:machine@east': {identifier: 'addon:machine', path: 'auto-renders/machine-east.png', geometry: 'geometry.machine', hash: 'blockhash', states: {'minecraft:cardinal_direction': 'east'}}}});
  const manifest = {project: {id: 'addon'}, content: {entities: [{identifier: 'addon:bird', image: '/img/wiki/addon/textures/entity/bird.png', imageKind: 'texture', render: 'auto-entities/bird/full.png',
    renderVariants: {winter: {face: 'auto-entities/bird/face-winter.png'}, summer: {fullBody: '/img/wiki/addon/auto-entities/summer.png'}, manual: 'renders/manual.png'}}],
    blocks: [{identifier: 'addon:machine', render: '/img/wiki/utilitycraft/renders/machine.png'}],
    items: [{identifier: 'addon:remote', image: 'https://example.org/item.png'}, {identifier: 'addon:data', image: 'data:image/png;base64,AAA'}]}};
  const {universal} = await buildVanillaAssetIndex({assetRoot, legacyOutput: path.join(root, 'legacy.json'), manifests: [{manifest, publicRoot: '/img/wiki/addon', assetDirectory}]});
  const bird = universal.assets.filter(asset => asset.identifier === 'addon:bird');
  assert.equal(bird.filter(asset => asset.renderType === 'fullBody' && !asset.variant).length, 1);
  const full = bird.find(asset => asset.renderType === 'fullBody' && !asset.variant);
  assert.deepEqual(full.geometries, ['geometry.bird']); assert.deepEqual(full.textures, ['textures/entity/bird']); assert.equal(full.hash, 'bodyhash'); assert.equal(full.settings.size, 128);
  const face = bird.find(asset => asset.variant === 'winter'); assert.equal(face.renderType, 'face'); assert.deepEqual(face.geometries, ['geometry.bird.winter']);
  assert.ok(bird.find(asset => asset.variant === 'summer' && asset.renderType === 'fullBody'));
  assert.ok(bird.find(asset => asset.variant === 'manual' && asset.publicPath === '/img/wiki/addon/renders/manual.png'));
  assert.equal(bird.find(asset => asset.renderType === 'textureAtlas').publicPath, '/img/wiki/addon/textures/entity/bird.png');
  const machine = universal.assets.filter(asset => asset.identifier === 'addon:machine');
  assert.ok(machine.find(asset => asset.publicPath === '/img/wiki/utilitycraft/renders/machine.png'));
  assert.equal(machine.find(asset => asset.variant === 'east').geometry, 'geometry.machine');
  assert.equal(universal.assets.some(asset => ['addon:remote', 'addon:data'].includes(asset.identifier)), false);
});
