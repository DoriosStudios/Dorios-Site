const path = require('node:path');

const loaders = [
  ['@docusaurus/core/lib/client/docusaurus.js', 'chunk-index-loader.cjs'],
  ['@docusaurus/core/lib/client/exports/Link.js', 'link-prefetch-loader.cjs'],
];

module.exports = function navigationPerformance() {
  return {
    name: 'dorios-navigation-performance',
    configureWebpack() {
      return {module: {rules: loaders.map(([source, loader]) => ({
        include: [require.resolve(source)],
        enforce: 'pre',
        use: [{loader: path.join(__dirname, loader)}],
      }))}};
    },
  };
};
