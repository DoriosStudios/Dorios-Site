import path from 'node:path';
import {buildVanillaAssetIndex, websiteRoot} from './vanilla-assets.mjs';
import {readJson, filesUnder} from './bedrock-pack.mjs';
const manifests = [];
for (const file of await filesUnder(path.join(websiteRoot, 'src/wiki/projects'))) {
  if (path.basename(file) !== 'manifest.json') continue;
  const manifest = await readJson(file), id = manifest.project?.id ?? manifest.id;
  if (id) manifests.push({manifest, publicRoot: `/img/wiki/${id}`});
}
const {legacy, universal} = await buildVanillaAssetIndex({manifests});
console.log(`Indexed ${Object.keys(legacy).length} compatible vanilla URLs and ${universal.assets.length} resource records.`);
