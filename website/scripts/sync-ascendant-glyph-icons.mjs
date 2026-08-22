import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const siteRoot = path.resolve(import.meta.dirname, '..');
const addonRoot = process.env.ASCENDANT_TECHNOLOGY_PROJECT_PATH ?? path.join(
  os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects', 'Ascendant-Technology',
);
const sourceDirectory = path.join(addonRoot, 'RP', 'font', 'glyph_F5_icons');
const destinationDirectory = path.join(siteRoot, 'static', 'img', 'addons', 'ascendant', 'resources', 'glyphs');
const iconNames = [
  'water', 'lava', 'steam', 'xp', 'cryofluid', 'liquified_aetherium', 'dark_matter', 'milk', 'blood', 'generic_fluid',
  'energy', 'pressure_meter', 'generic_speed', 'energy_upgrade', 'speed_upgrade', 'filter_upgrade',
  'quantity_upgrade', 'range_upgrade', 'stack_upgrade',
];

if (!fs.existsSync(sourceDirectory)) {
  process.stdout.write(
    `Ascendant Technology glyph source was not found at ${sourceDirectory}; preserving committed glyph icons.\n`,
  );
  process.exit(0);
}

fs.mkdirSync(destinationDirectory, {recursive: true});
const copied = iconNames.map((name) => {
  const source = path.join(sourceDirectory, `${name}.png`);
  const destination = path.join(destinationDirectory, `${name}.png`);
  if (!fs.existsSync(source)) throw new Error(`Missing glyph icon: ${source}`);
  fs.copyFileSync(source, destination);
  return name;
});

console.log(`[ascendant-glyphs] Synced ${copied.length} UI icons to the shared site library.`);
