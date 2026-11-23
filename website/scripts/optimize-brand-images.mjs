import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../static/img');
const output = path.join(root, 'optimized');
await fs.mkdir(output, {recursive:true});
const report = [];
for (const name of ['black_no_bg.png', 'white_no_bg.png', 'blazing_animated_transparent.gif']) {
  const animated = name.endsWith('.gif');
  const input = path.join(root, name);
  const target = path.join(output, name.replace(/\.(png|gif)$/, '.webp'));
  // Three device pixels per CSS pixel at the brand's maximum 30px size.
  await sharp(input, {animated}).resize({width:90, withoutEnlargement:true})
    .webp({lossless:true, effort:6}).toFile(target);
  const before = await sharp(input, {animated}).metadata();
  const after = await sharp(target, {animated}).metadata();
  report.push({source:name, output:path.basename(target), originalBytes:(await fs.stat(input)).size,
    bytes:(await fs.stat(target)).size, originalWidth:before.width, width:after.width,
    frames:after.pages??1, originalFrames:before.pages??1});
}
console.log(JSON.stringify(report, null, 2));
