import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {projectCardPalettes} from '../src/data/cardPalettes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wikiRoot = path.join(root, 'static', 'img', 'wiki');
const outputRoot = path.join(root, 'static', 'img', 'social', 'wiki');
const projectSourceRoot = path.join(root, 'src', 'wiki', 'projects');
const projectCatalogPath = path.join(root, 'src', 'data', 'projectCatalog.json');
const logoPath = path.join(root, 'static', 'img', 'dorios_logo.png');
const fallbackPalette = ['#ff6d18', '#211006'];
const concurrency = 8;

function isEntryAsset(relative, projectId) {
  const segments = relative.split(path.sep).map((segment) => segment.toLowerCase());
  const [topLevelDirectory, assetType] = segments;
  if (projectId === 'vanilla') return topLevelDirectory === 'renders';
  if (topLevelDirectory === 'textures') return ['blocks', 'items'].includes(assetType);
  return ['blocks', 'equipment', 'guide', 'items', 'renders', 'showcase'].includes(topLevelDirectory);
}

function manifestEntryAssets(manifest) {
  const assets = new Set();
  const addItem = (entry) => {
    if (entry?.image) assets.add(entry.image);
    entry?.variants?.forEach(addItem);
  };
  const addBlock = (entry) => {
    if (entry?.render) {
      assets.add(entry.render);
      return;
    }
    [
      entry?.itemImage,
      entry?.image,
      entry?.faces?.north,
      entry?.faces?.right,
      Object.values(entry?.faces ?? {}).find(Boolean),
    ].filter(Boolean).forEach((image) => assets.add(image));
  };
  manifest.content?.items?.forEach(addItem);
  manifest.catalog?.items?.forEach(addItem);
  manifest.content?.blocks?.forEach(addBlock);
  return [...assets];
}

function relativeEntryAsset(projectId, source) {
  const assetPrefix = `/img/wiki/${projectId}/`;
  const relative = String(source).startsWith(assetPrefix) ? String(source).slice(assetPrefix.length) : String(source);
  if (/^(?:https?:)?\/\//.test(relative) || path.isAbsolute(relative)) return null;
  return relative.replaceAll('/', path.sep);
}

async function projectEntryImages(projectId, projectRoot) {
  const manifestPath = path.join(projectSourceRoot, projectId, 'manifest.json');
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const referencedImages = manifestEntryAssets(manifest)
      .map((source) => relativeEntryAsset(projectId, source))
      .filter(Boolean)
      .map((relative) => path.join(projectRoot, relative));
    const supportingImages = [];
    for (const directory of ['guide', 'renders', 'showcase']) {
      try {
        supportingImages.push(...await pngFiles(path.join(projectRoot, directory)));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    return [...new Set([...referencedImages, ...supportingImages])];
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const images = await pngFiles(projectRoot);
    return images.filter((source) => isEntryAsset(path.relative(projectRoot, source), projectId));
  }
}

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
const projectCatalog = JSON.parse(await fs.readFile(projectCatalogPath, 'utf8'));
const jobs = [];

for (const project of projects.filter((entry) => entry.isDirectory())) {
  const projectRoot = path.join(wikiRoot, project.name);
  const images = await projectEntryImages(project.name, projectRoot);
  for (const source of images) {
    const relative = path.relative(projectRoot, source);
    jobs.push({
      source,
      destination: path.join(outputRoot, project.name, relative),
      palette: projectCardPalettes[project.name],
    });
  }
  const catalogProject = projectCatalog.projects.find(({id}) => id === project.name);
  const fallbackSource = catalogProject?.media?.icon
    ? path.join(root, 'static', catalogProject.media.icon.replace(/^\//, '').replaceAll('/', path.sep))
    : logoPath;
  jobs.push({
    source: fallbackSource,
    destination: path.join(outputRoot, project.name, 'fallback.png'),
    palette: projectCardPalettes[project.name],
  });
}

await fs.rm(outputRoot, {recursive: true, force: true});

for (let index = 0; index < jobs.length; index += concurrency) {
  await Promise.all(jobs.slice(index, index + concurrency).map(async ({source, destination, palette}) => {
    try {
      await generatePreview(source, destination, palette, logo);
    } catch (error) {
      throw new Error(`[social-previews] Failed to process ${path.relative(wikiRoot, source)}: ${error.message}`, {cause: error});
    }
  }));
}

console.log(`[social-previews] Generated ${jobs.length} item, block and machine cards.`);
