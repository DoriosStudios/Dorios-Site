const path = require('node:path');

module.exports = function navigationPerformance() {
  return {
    name: 'dorios-navigation-performance',
    configureWebpack() {
      return {module: {rules: [{
        include: [require.resolve('@docusaurus/core/lib/client/docusaurus.js')],
        enforce: 'pre',
        use: [{loader: path.join(__dirname, 'chunk-index-loader.cjs')}],
      }]}};
    },
  };
};
