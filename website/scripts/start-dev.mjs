#!/usr/bin/env node

import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const websiteDirectory = path.resolve(scriptDirectory, '..');
const docusaurusBin = path.join(websiteDirectory, 'node_modules', '@docusaurus', 'core', 'bin', 'docusaurus.mjs');
const serverArguments = process.argv.slice(2);
const portArgument = serverArguments.find(argument => argument.startsWith('--port='))?.split('=')[1]
  ?? (serverArguments.includes('--port') ? serverArguments[serverArguments.indexOf('--port') + 1] : 3000);
const localUrl = `http://localhost:${Number(portArgument)}`;
// Hold the guard throughout preparation and serving. The OS releases it on exit.
const guardPort = 34971;
const guard = http.createServer((_request, response) => {
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(JSON.stringify({project: websiteDirectory, url: localUrl, pid: process.pid}));
});
try {
  await new Promise((resolve, reject) => {
    guard.once('error', reject);
    guard.listen(guardPort, '127.0.0.1', resolve);
  });
} catch (error) {
  if (error.code !== 'EADDRINUSE') throw error;
  const response = await fetch(`http://127.0.0.1:${guardPort}`, {signal: AbortSignal.timeout(3000)});
  const existing = await response.json();
  if (existing.project !== websiteDirectory) throw new Error(`Development guard port ${guardPort} is in use by another project.`);
  console.log(`[dev] Site already running or starting: ${existing.url}`);
  process.exit(0);
}

const npmCli = process.env.npm_execpath
  ?? path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
if (!fs.existsSync(npmCli)) {
  guard.close();
  throw new Error('Start the local website with npm start.');
}
const preparation = spawn(process.execPath, [npmCli, 'run', 'prepare:dev'], {
  cwd: websiteDirectory, env: process.env, stdio: 'inherit',
});
const prepared = await new Promise((resolve, reject) => {
  preparation.once('error', reject);
  preparation.once('exit', code => resolve(code ?? 1));
});
if (prepared !== 0) {
  guard.close();
  process.exit(prepared);
}
const server = spawn(process.execPath, [docusaurusBin, 'start', ...serverArguments], {
  cwd: websiteDirectory,
  // Production builds generate locale-specific routes in .docusaurus. Keep
  // the live preview separate so a build cannot replace its routes or assets.
  env: {...process.env, DOCUSAURUS_GENERATED_FILES_DIR_NAME: '.docusaurus-dev'},
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    if (!server.killed) server.kill(signal);
  });
}

server.once('exit', (code) => {
  guard.close();
  process.exitCode = code ?? 1;
});

server.once('error', (error) => {
  guard.close();
  console.error(`[start-dev] ${error.message}`);
  process.exitCode = 1;
});
