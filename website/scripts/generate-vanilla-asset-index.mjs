import {readdir, writeFile} from 'node:fs/promises';
import {resolve, join, basename} from 'node:path';

const websiteRoot = resolve(import.meta.dirname, '..');
const assetRoot = join(websiteRoot, 'static', 'img', 'wiki', 'vanilla');
const outputPath = join(websiteRoot, 'src', 'data', 'vanillaAssetIndex.json');
const folders = ['Items', 'Renders'];
const index = {};

for (const folder of folders) {
  const files = await readdir(join(assetRoot, folder), {withFileTypes: true});
  for (const file of files.filter((entry) => entry.isFile() && entry.name.endsWith('.png'))) {
    const id = basename(file.name, '.png');
    index[id] ??= `/img/wiki/vanilla/${folder}/${file.name}`;
  }
}

await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Indexed ${Object.keys(index).length} vanilla assets in ${outputPath}.`);
