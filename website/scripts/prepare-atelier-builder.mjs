import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

// CI supplies the checkout. Local builds can use the sibling Atelier project.
const website = path.resolve(import.meta.dirname, '..');
const source = process.env.ATELIER_PROJECT_PATH
  ? path.resolve(process.env.ATELIER_PROJECT_PATH)
  : path.resolve(website, '../../..', "Dorios' Atelier");
const script = path.join(source, 'tools/build-custom-package.mjs');
const output = path.join(website, 'static/atelier-builder');
if (!fs.existsSync(script)) {
  throw new Error('Atelier builder source is missing. Set ATELIER_PROJECT_PATH to the Atelier checkout (with npm ci installed).');
}
const result = spawnSync(process.execPath, [script, '--out', output], {cwd: source, stdio: 'inherit'});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
