import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The clean source checkout is outside the site Git repository. Explicit
// overrides still take precedence; CI can build using the committed catalogs.
export function utilitycraftSourcePath() {
  if (process.env.UTILITYCRAFT_PROJECT_PATH) return path.resolve(process.env.UTILITYCRAFT_PROJECT_PATH);
  const clean = path.resolve(import.meta.dirname, '..', '..', '..', 'wiki-sources', 'UtilityCraft');
  if (fs.existsSync(path.join(clean, '.git')) && fs.existsSync(path.join(clean, 'BP'))) return clean;
  return path.join(os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects', 'UtilityCraft');
}
