import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {loadEntityPacks, resolveEntityVisual, renderEntity} from './bedrock-entity.mjs';

const website = path.resolve(import.meta.dirname, '..');
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const args = process.argv.slice(2);
const faces = args.includes('--faces');
const [resourcePack, destination] = args.filter(argument => argument !== '--faces');
const source = resourcePack ?? (await readJson(path.join(website, '.cache-loader/vanilla/active.json'))).resourcePack;
const output = path.resolve(destination ?? path.join(website, 'static/img/wiki/trinkets', faces ? 'drop-faces' : 'drop-mobs'));
const profiles = await readJson(path.join(website, 'src/wiki/projects/trinkets/trinketProfiles.json'));
const presets = await readJson(path.join(import.meta.dirname, 'trinket-drop-render-presets.json'));
const ids = new Set(Object.values(profiles).flatMap(profile => (profile.drops ?? []).map(drop => drop.entity)));
const packs = await loadEntityPacks({source: website, vanilla: source});

const spiderPose = {
  leg0: [0, 45, -45], leg1: [0, -45, 45], leg2: [0, 22.5, -33.3], leg3: [0, -22.5, 33.3],
  leg4: [0, -22.5, -33.3], leg5: [0, 22.5, 33.3], leg6: [0, -45, -45], leg7: [0, 45, 45],
};
const blazeOffsets = Object.fromEntries(Array.from({length: 12}, (_, index) => {
  const ring = Math.floor(index / 4);
  const angle = ((index % 4) * 90 + [0, 45, 27][ring]) * Math.PI / 180;
  const radius = [9, 7, 5][ring];
  return [`upperBodyParts${index}`, [Math.cos(angle) * radius, [2, -2, -11][ring], Math.sin(angle) * radius]];
}));
const guardianPose = Object.fromEntries([
  [-45, 0, 0], [45, 0, 0], [0, 0, 45], [0, 0, -45],
  [90, 45, 0], [90, -45, 0], [90, -135, 0], [90, 135, 0],
  [-135, 0, 0], [135, 0, 0], [0, 0, 135], [0, 0, -135],
].map((value, index) => [`spikepart${index}`, value]));
const guardianOffsets = {
  eye: [0, 0, -8.25], tailpart1: [-1.5, -.5, 14], tailpart2: [.5, -.5, 6],
  ...Object.fromEntries([
    [0, 14, 8], [0, 14, -8], [8, 14, 0], [-8, 14, 0],
    [-8, 8, -8], [8, 8, -8], [8, 8, 8], [-8, 8, 8],
    [0, 2, 8], [0, 2, -8], [8, 2, 0], [-8, 2, 0],
  ].map((value, index) => [`spikepart${index}`, [value[0], value[1] - 24, value[2]]])),
};

const poses = {
  'minecraft:cave_spider': {pose: spiderPose},
  'minecraft:blaze': {poseOffsets: blazeOffsets},
  'minecraft:guardian': {pose: guardianPose, poseOffsets: guardianOffsets},
  'minecraft:elder_guardian': {pose: guardianPose, poseOffsets: guardianOffsets},
  'minecraft:shulker': {poseOffsets: {lid: [0, 10, 0]}},
  'minecraft:zombie': {pose: {rightArm: [-82, 0, 0], leftArm: [-82, 0, 0]}},
  'minecraft:witch': {pose: {arms: [-42, 0, 0]}},
  'minecraft:vindicator': {pose: {arms: [-35, 0, 0]}},
  'minecraft:drowned': {pose: {rightArm: [-70, 0, 0], leftArm: [-70, 0, 0]}},
};

const faceSettings = {
  'minecraft:ender_dragon': {camera: {direction: [-1, .55, -1]}},
  'minecraft:phantom': {camera: {direction: [-.25, .65, -1]}},
  'minecraft:shulker': {head: ['base']},
  'minecraft:strider': {head: ['body']},
  'minecraft:warden': {camera: {direction: [-.28, .3, -1]}},
  'minecraft:wither': {head: ['head1', 'head2', 'head3']},
};

await fs.mkdir(output, {recursive: true});
for (const identifier of [...ids].sort()) {
  // A raw unqualified registry key cannot match the entity's namespaced typeId.
  if (!identifier.startsWith('minecraft:')) continue;
  const preset = presets[identifier];
  if (!preset) throw new Error(`Missing render preset for ${identifier}`);
  const visual = await resolveEntityVisual({identifier, packs, override: {...preset, ...poses[identifier]}});
  // Dragon runtime animation assembles the wings, neck and tail from loose
  // parts. The head and jaw form an intact, recognizable static portrait.
  const settings = identifier === 'minecraft:ender_dragon'
    ? {format: 'portrait', portraitBones: ['head'], camera: {direction: [-1, .55, -1]}}
    : {};
  const options = faces ? {size: 64, format: 'face', ...faceSettings[identifier]} : {size: 160, ...settings};
  const {pixels, width, height} = await renderEntity(visual, options);
  const image = sharp(pixels, {raw: {width, height, channels: 4}});
  if (!faces) image.trim();
  await image.png().toFile(path.join(output, identifier.slice('minecraft:'.length) + '.png'));
  console.log(identifier);
}
