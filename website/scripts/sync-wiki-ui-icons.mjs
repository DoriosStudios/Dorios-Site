import fs from 'node:fs';
import path from 'node:path';
import {projectSourcePath} from './wiki-source-paths.mjs';
import {VANILLA_EFFECT_NAMES} from '../src/data/wikiUiIcons.mjs';

export function syncVanillaUiIcons({sourceRoot = projectSourcePath('Vanilla', 'VANILLA_PROJECT_PATH'), siteRoot = path.resolve(import.meta.dirname, '..')} = {}) {
  const source = path.join(sourceRoot, 'resource_pack', 'textures', 'ui');
  const target = path.join(siteRoot, 'static', 'img', 'wiki', 'ui', 'effects');
  if (!fs.existsSync(source)) {
    console.log('[wiki-ui-icons] Vanilla source unavailable; preserving committed effect icons.');
    return;
  }
  fs.mkdirSync(target, {recursive:true});
  for (const name of VANILLA_EFFECT_NAMES) {
    const file = path.join(source, `${name}_effect.png`);
    if (!fs.existsSync(file)) throw new Error(`Missing vanilla effect sprite: ${file}`);
    fs.copyFileSync(file, path.join(target, `${name}.png`));
  }
  console.log(`[wiki-ui-icons] Synced ${VANILLA_EFFECT_NAMES.length} vanilla effect icons.`);
}
