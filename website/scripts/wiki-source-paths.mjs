import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function bridgeProjectsPath() {
  if (process.env.BRIDGE_PROJECTS_PATH) return path.resolve(process.env.BRIDGE_PROJECTS_PATH);
  const workspace = path.resolve(import.meta.dirname, '..', '..', '..', '..');
  if (fs.existsSync(path.join(workspace, 'Ascendant-Technology', 'BP'))) return workspace;
  return path.join(os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects');
}

export function projectSourcePath(project, ...overrides) {
  const override = overrides.map((key) => process.env[key]).find(Boolean);
  return override ? path.resolve(override) : path.join(bridgeProjectsPath(), project);
}

// The clean source checkout is outside the site Git repository. Explicit
// overrides still take precedence; CI can build using the committed catalogs.
export function utilitycraftSourcePath() {
  if (process.env.UTILITYCRAFT_PROJECT_PATH) return path.resolve(process.env.UTILITYCRAFT_PROJECT_PATH);
  const clean = path.resolve(import.meta.dirname, '..', '..', '..', 'wiki-sources', 'UtilityCraft');
  if (fs.existsSync(path.join(clean, '.git')) && fs.existsSync(path.join(clean, 'BP'))) return clean;
  return projectSourcePath('UtilityCraft');
}
