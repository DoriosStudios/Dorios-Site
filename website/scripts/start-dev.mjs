#!/usr/bin/env node

import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const websiteDirectory = path.resolve(scriptDirectory, '..');
const docusaurusBin = path.join(websiteDirectory, 'node_modules', '@docusaurus', 'core', 'bin', 'docusaurus.mjs');
const tenMinutes = 10 * 60 * 1000;
const githubInterval = process.env.GITHUB_TOKEN ? tenMinutes : 20 * 60 * 1000;
let lastGithubRefresh = Date.now();
let refreshRunning = false;

function runScript(filename) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(scriptDirectory, filename)], {
      cwd: websiteDirectory,
      env: process.env,
      stdio: 'inherit',
    });
    child.once('exit', (code) => resolve(code ?? 1));
    child.once('error', () => resolve(1));
  });
}

async function refreshDownloadStats() {
  if (refreshRunning) return;
  refreshRunning = true;
  try {
    const now = Date.now();
    if (now - lastGithubRefresh >= githubInterval) {
      await runScript('refresh-github-release-stats.mjs');
      lastGithubRefresh = Date.now();
    } else if (!process.env.GITHUB_TOKEN) {
      console.log('[stats-watch] GitHub refresh waits 20 minutes without GITHUB_TOKEN to stay within the public API limit.');
    }
    await runScript('refresh-curseforge-stats.mjs');
  } finally {
    refreshRunning = false;
  }
}

const server = spawn(process.execPath, [docusaurusBin, 'start', ...process.argv.slice(2)], {
  cwd: websiteDirectory,
  env: process.env,
  stdio: 'inherit',
});

const timer = setInterval(refreshDownloadStats, tenMinutes);
timer.unref();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    clearInterval(timer);
    if (!server.killed) server.kill(signal);
  });
}

server.once('exit', (code) => {
  clearInterval(timer);
  process.exitCode = code ?? 1;
});

server.once('error', (error) => {
  clearInterval(timer);
  console.error(`[start-dev] ${error.message}`);
  process.exitCode = 1;
});
