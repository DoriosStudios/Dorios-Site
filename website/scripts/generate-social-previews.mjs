import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import palettes from '../src/data/socialPreviewPalettes.json' with {type: 'json'};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wikiRoot = path.join(root, 'static', 'img', 'wiki');
const outputRoot = path.join(root, 'static', 'img', 'social', 'wiki');
const logoPath = path.join(root, 'static', 'img', 'dorios_logo.png');
const fallbackPalette = ['#ff6d18', '#211006'];

async function pngFiles(directory) {
  const entries = await fs.readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return pngFiles(target);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.png') ? [target] : [];
  }));
  return nested.flat();
}

function backgroundSvg(primary, secondary) {
  return Buffer.from(`<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="background" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#0c0c0c"/>
        <stop offset="0.54" stop-color="${secondary}"/>
        <stop offset="1" stop-color="${primary}"/>
      </linearGradient>
      <radialGradient id="glow" cx="76%" cy="28%" r="62%">
        <stop offset="0" stop-color="${primary}" stop-opacity=".48"/>
        <stop offset="1" stop-color="${primary}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="512" height="512" rx="64" fill="url(#background)"/>
    <rect width="512" height="512" rx="64" fill="url(#glow)"/>
    <path d="M32 420H480M32 92H480" stroke="#fff" stroke-opacity=".12"/>
    <circle cx="448" cy="64" r="118" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>
  </svg>`);
}

async function generatePreview(source, destination, palette, logo) {
  const [primary, secondary] = palette ?? fallbackPalette;
  const render = await sharp(source)
    .resize(404, 404, {fit: 'contain', kernel: sharp.kernel.nearest})
    .png()
    .toBuffer();
  await fs.mkdir(path.dirname(destination), {recursive: true});
  await sharp(backgroundSvg(primary, secondary))
    .composite([
      {input: render, gravity: 'centre'},
      {input: logo, left: 28, top: 28},
    ])
    .png({compressionLevel: 9, palette: true})
    .toFile(destination);
}

const logo = await sharp(logoPath).resize(48, 48, {fit: 'contain'}).png().toBuffer();
const projects = await fs.readdir(wikiRoot, {withFileTypes: true});
let generated = 0;

for (const project of projects.filter((entry) => entry.isDirectory())) {
  const renderRoot = path.join(wikiRoot, project.name, 'renders');
  try {
    const renders = await pngFiles(renderRoot);
    for (const source of renders) {
      const relative = path.relative(renderRoot, source);
      const destination = path.join(outputRoot, project.name, 'renders', relative);
      await generatePreview(source, destination, palettes[project.name], logo);
      generated += 1;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

console.log(`[social-previews] Generated ${generated} render cards.`);
