import fs from 'node:fs';
import path from 'node:path';
import {projectSourcePath} from './wiki-source-paths.mjs';
import {ASCENDANT_UI_ICON_NAMES} from '../src/data/wikiUiIcons.mjs';
import {syncVanillaUiIcons} from './sync-wiki-ui-icons.mjs';

const siteRoot = path.resolve(import.meta.dirname, '..');
const addonRoot = projectSourcePath('Ascendant-Technology', 'ASCENDANT_TECHNOLOGY_PROJECT_PATH');
const sourceDirectory = [
  path.join(addonRoot, 'RP', 'textures', 'ui', 'at_icons'),
  path.join(addonRoot, 'RP', 'font', 'glyph_F5_icons'),
].find((directory) => fs.existsSync(directory));
const destinationDirectory = path.join(siteRoot, 'static', 'img', 'addons', 'ascendant', 'resources', 'glyphs');
const iconNames = ASCENDANT_UI_ICON_NAMES;

syncVanillaUiIcons();

if (!sourceDirectory) {
  process.stdout.write(
    `Ascendant Technology glyph source was not found in ${addonRoot}; preserving committed glyph icons.\n`,
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
