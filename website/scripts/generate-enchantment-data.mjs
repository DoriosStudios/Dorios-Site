import fs from 'node:fs/promises';
import path from 'node:path';
import {filesUnder, readJson} from './bedrock-pack.mjs';
import {projectSourcePath, utilitycraftSourcePath} from './wiki-source-paths.mjs';
import {miningSpeedRange} from '../src/wiki/enchantmentEstimates.mjs';

const sources = {
  utilitycraft: utilitycraftSourcePath(),
  paxels: projectSourcePath('Paxels-and-AIOTs', 'PAXELS_PROJECT_PATH'),
  'ascendant-technology': projectSourcePath('Ascendant-Technology'),
  'heavy-machinery': projectSourcePath('UtilityCraft-Heavy-Machinery'),
  'digital-storage': projectSourcePath('UtilityCraft-Digital-Storage'),
};
const output = path.resolve(import.meta.dirname, '../src/wiki/enchantmentData.generated.json');
let existing = {};
try { existing = await readJson(output); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

for (const [project, source] of Object.entries(sources)) {
  const directory = path.join(source, 'BP', 'items');
  const files = await filesUnder(directory);
  if (!files.length) continue;
  const entries = {};
  for (const file of files.sort()) {
    const item = (await readJson(file).catch(error => {
      if (error instanceof SyntaxError) return {};
      throw error;
    }))['minecraft:item'];
    const id = item?.description?.identifier;
    if (!id) continue;
    const components = item.components ?? {};
    const enchanting = components['minecraft:enchantable'];
    const digger = components['minecraft:digger'];
    const range = miningSpeedRange(digger);
    if (!enchanting?.slot && !range) continue;
    const durability = components['minecraft:durability']?.max_durability;
    const damage = components['minecraft:damage'];
    entries[id] = {
      ...(enchanting?.slot && {slot: enchanting.slot, value: enchanting.value}),
      ...(range && {range, efficiency: digger.use_efficiency === true}),
      ...(durability > 0 && {durability}),
      ...(Number.isFinite(damage?.value ?? damage) && {damage: damage?.value ?? damage}),
      ...(components['minecraft:wearable'] && {wearable: true}),
    };
  }
  existing[project] = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
}
await fs.writeFile(output, JSON.stringify(existing, null, 2) + '\n');
console.log(Object.fromEntries(Object.entries(existing).map(([id, entries]) => [id, Object.keys(entries).length])));
