// Docusaurus 3.9.1 scans the full chunk manifest for every route matched during
// viewport prefetch. Index it once without changing router or loading behavior.
// Keep the installed dependency untouched and fail explicitly on API drift.
const {createHash} = require('node:crypto');
const expectedLookupHash = '54f07d5ac7979564a52b7d033ba22b7f9b56a2f30096633520698da280768bd9';
module.exports = function chunkIndexLoader(source) {
  this?.cacheable?.();
  const start = source.indexOf('const getChunkNamesToLoad = (path) => Object.entries(routesChunkNames)');
  const end = source.indexOf('const prefetch =', start);
  const hash = createHash('sha256').update(source.slice(start, end).replace(/\r\n/g, '\n')).digest('hex');
  if (start < 0 || end < 0 || hash !== expectedLookupHash) {
    throw new Error('Docusaurus prefetch implementation changed; review the Dorios chunk index loader.');
  }
  return source.slice(0, start) + `let chunkNamesByPath;
const getChunkNamesToLoad = (path) => {
    if (!chunkNamesByPath) {
        chunkNamesByPath = new Map();
        for (const [routeNameWithHash, routeChunks] of Object.entries(routesChunkNames)) {
            const routePath = routeNameWithHash.replace(/-[^-]+$/, '');
            const chunks = Object.values(flat(routeChunks));
            const existing = chunkNamesByPath.get(routePath);
            if (existing) existing.push(...chunks);
            else chunkNamesByPath.set(routePath, chunks);
        }
    }
    return chunkNamesByPath.get(path) ?? [];
};
` + source.slice(end);
};
