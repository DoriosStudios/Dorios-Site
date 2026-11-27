const path = require('node:path');
const {loadFreshModule} = require('@docusaurus/utils');

const name = 'dorios-wiki-search-index';

module.exports = function wikiSearchIndex(context) {
  return {
    name,
    getPathsToWatch() {
      return [
        'src/wiki/**/*.{js,mjs,json}',
        'src/data/{projectCatalog,atelierWiki,betterContainersWiki}.json',
        'src/i18n/{projects.js,wiki*.json,wiki.js}',
        'src/components/{AtelierWiki,BetterContainersWiki}/{copy.js,model.mjs}',
      ].map(file => path.join(context.siteDir, file));
    },
    async loadContent() {
      const {buildGlobalWikiSearchIndex} = await loadFreshModule(
        path.join(context.siteDir, 'src/wiki/buildSearchIndex.js'),
      );
      return buildGlobalWikiSearchIndex(context.i18n.currentLocale);
    },
    async contentLoaded({content, actions}) {
      await actions.createData('index.json', JSON.stringify(content));
    },
  };
};
