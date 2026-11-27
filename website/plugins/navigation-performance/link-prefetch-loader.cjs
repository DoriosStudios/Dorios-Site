// Keep Docusaurus link routing and leave its speculative loads on by default.
// Search results can opt out because the destinations change with every query.
const replacements = [
  ['Link({ isNavLink, to, href,', 'Link({ isNavLink, to, href, prefetch = true,'],
  ['if (IOSupported && el && isInternal)', 'if (prefetch && IOSupported && el && isInternal)'],
  ['if (!preloaded.current && targetLink != null)', 'if (prefetch && !preloaded.current && targetLink != null)'],
  ['if (!IOSupported && isInternal && ExecutionEnvironment.canUseDOM)', 'if (prefetch && !IOSupported && isInternal && ExecutionEnvironment.canUseDOM)'],
  ['[ioRef, targetLink, IOSupported, isInternal]', '[ioRef, targetLink, IOSupported, isInternal, prefetch]'],
];

module.exports = function linkPrefetchLoader(source) {
  this?.cacheable?.();
  for (const [original, replacement] of replacements) {
    if (source.indexOf(original) === -1 || source.indexOf(original) !== source.lastIndexOf(original)) {
      throw new Error('Docusaurus Link implementation changed; review the search prefetch opt-out.');
    }
    source = source.replace(original, replacement);
  }
  return source;
};
