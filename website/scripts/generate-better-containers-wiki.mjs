import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {projectSourcePath} from './wiki-source-paths.mjs';
import {evaluateExpression, filesUnder, loadResourcePacks, readJson, resolveVisual} from './bedrock-pack.mjs';
import {renderGeometry, studioLighting} from './bedrock-renderer.mjs';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(projectSourcePath('Better-Containers', 'BETTER_CONTAINERS_PROJECT_PATH'), 'packs');
const bp = path.join(source, 'BP');
const output = path.join(root, 'static/img/wiki/better-containers');
const tiers = ['drawer', 'copper', 'iron', 'gold', 'emerald', 'diamond', 'netherite'];
const families = ['drawers', 'chests', 'barrels', 'shulkers'];
const {assets, byIdentifier} = await readJson(path.join(root, 'static/img/wiki/vanilla/index.json'));
const packs = await loadResourcePacks({source});
const drawerScript = await fs.readFile(path.join(bp, 'scripts/containers/itemStorageManager.js'), 'utf8');
const drawers = new Map([...drawerScript.matchAll(/"(better_containers:\w+)"\s*:\s*Object\.freeze\(\{\s*typeSlots:\s*(\d+),\s*stackCapacity:\s*(\d+)\s*\}\)/g)]
  .map(([, id, types, stacks]) => [id, {types: Number(types), stacks: Number(stacks)}]));

const recipes = new Map();
for (const file of await filesUnder(path.join(bp, 'recipes'))) {
  const data = await readJson(file);
  const recipe = data['minecraft:recipe_shaped'];
  if (!recipe?.tags.includes('crafting_table')) continue;
  const {result, pattern, key} = recipe;
  const slots = pattern.flatMap(row => [...row].map(symbol => key[symbol]?.item ?? key[symbol]?.tag ?? null));
  recipes.set(result.item, {slots, columns: pattern[0].length, count: result.count ?? 1});
}

async function containerSlots(family, slug) {
  const entity = await readJson(path.join(bp, 'entities', family, slug + '_entity.json'));
  const slots = entity['minecraft:entity']?.components?.['minecraft:inventory']?.inventory_size;
  if (!Number.isInteger(slots)) throw new Error('No inventory size for ' + slug);
  return slots;
}

await fs.mkdir(output, {recursive: true});
const records = [];
for (const family of families) {
  for (const file of await filesUnder(path.join(bp, 'blocks', family))) {
    const block = (await readJson(file))['minecraft:block'];
    const id = block.description.identifier;
    const slug = id.split(':')[1];
    const tier = slug.split('_')[0];
    const recipe = recipes.get(id);
    if (!recipe || !tiers.includes(tier)) throw new Error('Incomplete catalog data for ' + id);
    const capacity = family === 'drawers' ? drawers.get(id) : {
      slots: await containerSlots(family, slug),
      ...(family === 'chests' && {doubleSlots: await containerSlots(family, tier + '_double_chest')}),
    };
    if (!capacity) throw new Error('No drawer capacity for ' + id);
    const asset = slug + '.png';
    // The established site renderer uses the declared inventory model. That
    // matters for containers whose placed block delegates its appearance to an entity.
    const visual = resolveVisual(block, {}, {legacy: packs.legacyBlocks.get(id)});
    const geometry = packs.geometries.get(visual.descriptor.identifier);
    const {pixels, width, height} = await renderGeometry({
      geometry, visibility: visual.descriptor.bone_visibility, materials: visual.materials,
      transformation: visual.transformation, textureFor: packs.textureFor,
      evaluate: expression => evaluateExpression(expression, visual.states),
    }, {size: 128, lighting: studioLighting, shadows: true});
    await sharp(pixels, {raw: {width, height, channels: 4}}).png().toFile(path.join(output, asset));
    records.push({id, slug, family, tier, image: '/img/wiki/better-containers/' + asset, capacity, recipe});
  }
}

const vanilla = {};
for (const id of new Set(records.flatMap(record => record.recipe.slots).filter(id => id?.startsWith('minecraft:')))) {
  const lookup = id === 'minecraft:planks' ? 'minecraft:oak_planks' : id;
  const asset = byIdentifier[lookup]?.map(index => assets[index]).find(asset => asset.publicPath);
  if (asset) vanilla[id] = asset.publicPath;
}
records.sort((a, b) => families.indexOf(a.family) - families.indexOf(b.family) || tiers.indexOf(a.tier) - tiers.indexOf(b.tier));
const file = path.join(root, 'src/data/betterContainersWiki.json');
await fs.writeFile(file, JSON.stringify({records, vanilla}, null, 2) + '\n');
console.log('Better Containers catalog: ' + records.length + ' variants across ' + families.length + ' families.');
