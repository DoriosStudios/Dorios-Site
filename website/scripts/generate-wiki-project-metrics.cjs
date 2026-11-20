const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

const sourceRoot = path.resolve(__dirname, '../src') + path.sep;
const originalLoader = require.extensions['.js'];
// Match the extensionless imports used by the webpack build and wiki tests.
require.extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(sourceRoot)) return originalLoader(module, filename);
  const {code} = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false, configFile: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  });
  module._compile(code, filename);
};

const {wikiProjects} = require('../src/wiki/projects');
const catalogPath = path.resolve(__dirname, '../src/data/projectCatalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
for (const record of catalog.projects) {
  const project = wikiProjects[record.id];
  if (!project) continue;
  if (project.machines.length || record.metrics.machines !== undefined) record.metrics.machines = project.machines.length;
  if (project.generators.length || record.metrics.energySystems !== undefined) record.metrics.energySystems = project.generators.length;
}
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`[wiki-project-metrics] Updated machine and energy-system counts from ${Object.keys(wikiProjects).length} wiki adapters.`);
