import path from 'node:path';
import {readJson} from './bedrock-pack.mjs';
import {extractVanillaFaces, websiteRoot, safeAssetPath} from './vanilla-assets.mjs';
// Source textures are kept private by default. This command intentionally has
// no public-directory default or automatic redistribution permission.
const args = process.argv.slice(2), options = {};
for (let i = 0; i < args.length; i++) {
  if (!['--active', '--block', '--faces', '--output', '--variant'].includes(args[i]) || !args[i + 1]) throw new Error(`Unknown or incomplete option: ${args[i]}`);
  options[args[i].slice(2)] = args[++i];
}
if (!options.block?.includes(':')) throw new Error('--block requires a full identifier');
const active = await readJson(options.active ?? path.join(websiteRoot, '.cache-loader/vanilla/active.json'));
const inventory = await readJson(active.inventory);
const output = path.resolve(options.output ?? path.join(websiteRoot, '.cache-loader/vanilla', active.bedrockVersion, 'faces'));
const publicRoot = path.join(websiteRoot, 'static');
if (output === publicRoot || output.startsWith(publicRoot + path.sep)) throw new Error('Raw vanilla extraction is restricted to private build storage; publication requires separate rights review');
safeAssetPath(output, 'index.json');
const result = await extractVanillaFaces({root: active.resourcePack, inventory, output,
  selections: (options.faces ?? 'up,south,east').split(',').map(face => ({identifier: options.block, face, ...(options.variant === undefined ? {} : {variant: Number(options.variant)})}))});
console.log(JSON.stringify(result, null, 2));
if (result.issues.length) process.exitCode = 1;
