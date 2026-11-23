import {pathToFileURL} from 'node:url';
import {collectVanillaAssets} from './vanilla-assets.mjs';
export function parseVanillaArguments(args) {
  const result = {}, names = {'--source': 'source', '--version': 'version', '--config': 'config', '--cache': 'cacheRoot'};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--offline') result.offline = true;
    else if (names[args[i]] && args[i + 1] && !args[i + 1].startsWith('--')) { const key = names[args[i]]; result[key] = args[++i]; }
    else throw new Error(`Unknown or incomplete option: ${args[i]}`);
  }
  if (result.source && !result.version) throw new Error('Local Resource Packs require --version explicitly'); return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { const result = await collectVanillaAssets(parseVanillaArguments(process.argv.slice(2))); console.log(JSON.stringify({resourcePack: result.root, inventory: result.inventoryPath, version: result.inventory.bedrockVersion, contentHash: result.inventory.contentHash, reused: result.reused, entities: Object.keys(result.inventory.entities).length, geometries: Object.keys(result.inventory.geometries).length, issues: result.inventory.issues}, null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
