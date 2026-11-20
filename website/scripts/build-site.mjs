#!/usr/bin/env node

import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--out-dir');
const output = path.resolve(website, args.find(argument => argument.startsWith('--out-dir='))?.slice('--out-dir='.length)
  ?? (outputIndex === -1 ? 'build' : args[outputIndex + 1]));
const generated = path.resolve(website, process.env.DOCUSAURUS_GENERATED_FILES_DIR_NAME ?? '.docusaurus');
const started = Date.now();
const skipped = new Set(['assets', 'img', 'fonts', 'atelier-builder', '__server']);
let reporting = false;

async function countPages(directory, locales) {
  const entries = await fs.readdir(directory, {withFileTypes: true}).catch(() => []);
  let count = 0;
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.html')) count++;
    else if (entry.isDirectory() && !skipped.has(entry.name) && !locales.includes(entry.name)) {
      count += await countPages(path.join(directory, entry.name), []);
    }
  }
  return count;
}

async function report() {
  if (reporting) return;
  reporting = true;
  try {
    const i18n = JSON.parse(await fs.readFile(path.join(generated, 'i18n.json'), 'utf8'));
    const locale = i18n.currentLocale;
    const directory = locale === i18n.defaultLocale ? output : path.join(output, locale);
    const pages = await countPages(directory, i18n.locales);
    console.log(`[build-progress] ${locale}: ${pages.toLocaleString('en-US')} HTML files in output; ${Math.floor((Date.now() - started) / 1000)}s elapsed.`);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`[build-progress] ${error.message}`);
  } finally {
    reporting = false;
  }
}

const child = spawn(process.execPath, [path.join(website, 'node_modules/@docusaurus/core/bin/docusaurus.mjs'), 'build', ...args], {
  cwd: website, env: process.env, stdio: 'inherit',
});
const timer = setInterval(report, 30000);
timer.unref();
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => child.kill(signal));
child.once('error', error => {
  clearInterval(timer);
  console.error(error);
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  clearInterval(timer);
  process.exitCode = code ?? (signal ? 1 : 0);
});
