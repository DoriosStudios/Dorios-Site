import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const websiteRoot = process.cwd();
const projectRoot = path.join(websiteRoot, 'src', 'wiki', 'projects', 'ascendant-technology');
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'manifest.json'), 'utf8'));
const renderRoot = path.join(websiteRoot, 'static', 'img', 'wiki', 'ascendant-technology', 'renders');
const output = path.join(websiteRoot, 'static', 'img', 'wiki', 'ascendant-technology', 'showcase', 'machines_render.png');

const machines = manifest.content.blocks.filter((block) => (
  /\/blocks\/machinery\/machines\//i.test(`/${block.source ?? ''}`)
  || block.id === 'mob_magnet'
));

const cellSize = 90;
const renderSize = 80;
const columns = 10;
const rows = Math.ceil(machines.length / columns);

const composites = await Promise.all(machines.map(async (machine, index) => {
  const source = path.join(renderRoot, `${machine.id}.png`);
  await fs.access(source);
  const input = await sharp(source)
    .resize(renderSize, renderSize, {fit: 'contain', kernel: sharp.kernel.nearest})
    .png()
    .toBuffer();

  return {
    input,
    left: (index % columns) * cellSize + Math.floor((cellSize - renderSize) / 2),
    top: Math.floor(index / columns) * cellSize + Math.floor((cellSize - renderSize) / 2),
  };
}));

await fs.mkdir(path.dirname(output), {recursive: true});
await sharp({
  create: {
    width: columns * cellSize,
    height: rows * cellSize,
    channels: 4,
    background: {r: 0, g: 0, b: 0, alpha: 0},
  },
})
  .composite(composites)
  .png({compressionLevel: 9, palette: false})
  .toFile(output);

console.log(`Generated ${path.relative(websiteRoot, output)} with ${machines.length} machines.`);
