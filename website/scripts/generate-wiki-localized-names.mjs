import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const siteRoot = path.resolve(import.meta.dirname, '..');
const bridgeRoot = process.env.BRIDGE_PROJECTS_PATH ?? path.join(
  os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects',
);
const projectRoot = path.join(siteRoot, 'src', 'wiki', 'projects');
const catalog = JSON.parse(fs.readFileSync(path.join(siteRoot, 'src', 'data', 'projectCatalog.json'), 'utf8'));
const outputPath = path.join(siteRoot, 'src', 'i18n', 'wikiNames.generated.json');
const localeFiles = {'pt-BR': 'pt_BR.lang', 'es-MX': 'es_MX.lang'};

function parseLang(file) {
  if (!fs.existsSync(file)) return new Map();
  return new Map(fs.readFileSync(file, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !/^\s*[#;]/.test(line) && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=');
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1)
        .replace(/\\n.*$/, '')
        .replace(/§./g, '')
        .trim();
      return [key, value];
    })
    .filter(([, value]) => value));
}

function localizedName(table, identifier, entryType) {
  const candidates = entryType === 'blocks'
    ? [`tile.${identifier}.name`, `block.${identifier}.name`, `item.${identifier}.name`, `item.${identifier}`]
    : entryType === 'entities'
      ? [`entity.${identifier}.name`, `item.spawn_egg.entity.${identifier}.name`]
      : [`item.${identifier}.name`, `item.${identifier}`, `tile.${identifier}.name`];
  return candidates.map((key) => table.get(key)).find(Boolean) ?? null;
}

const output = {generatedAt: new Date().toISOString(), locales: {}};

for (const [locale, fileName] of Object.entries(localeFiles)) {
  const projects = {};
  for (const catalogProject of catalog.projects) {
    const manifestPath = path.join(projectRoot, catalogProject.id, 'manifest.json');
    const bridgeProject = catalogProject.source?.bridgeProject;
    if (!bridgeProject || !fs.existsSync(manifestPath)) continue;

    const table = parseLang(path.join(bridgeRoot, bridgeProject, 'RP', 'texts', fileName));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const names = {};
    let total = 0;
    for (const [entryType, entries] of Object.entries({
      items: manifest.content?.items ?? [],
      blocks: manifest.content?.blocks ?? [],
      entities: manifest.content?.entities ?? [],
    })) {
      for (const entry of entries) {
        if (!entry.identifier) continue;
        total += 1;
        const name = localizedName(table, entry.identifier, entryType);
        if (name) names[entry.identifier] = name;
      }
    }
    projects[catalogProject.id] = {
      names,
      coverage: {translated: Object.keys(names).length, total},
    };
  }
  output.locales[locale] = projects;
}

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
for (const locale of Object.keys(localeFiles)) {
  const projects = output.locales[locale];
  const translated = Object.values(projects).reduce((sum, project) => sum + project.coverage.translated, 0);
  const total = Object.values(projects).reduce((sum, project) => sum + project.coverage.total, 0);
  console.log(`[wiki-locales] ${locale}: ${translated}/${total} source names localized.`);
}
