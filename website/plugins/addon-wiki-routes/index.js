const path = require('node:path');
const {pathToFileURL} = require('node:url');

module.exports = function doriosGeneratedRoutesPlugin() {
  return {
    name: 'dorios-generated-routes',
    async contentLoaded({actions}) {
      const projectRoot = path.join(__dirname, '..', '..', 'src', 'wiki', 'projects');
      const genericProjectIds = require(path.join(projectRoot, 'generatedProjects.json'));
      const projectCatalog = require(path.join(__dirname, '..', '..', 'src', 'data', 'projectCatalog.json'));
      const projectComponent = path.join(__dirname, '..', '..', 'src', 'components', 'ProjectDetailPage', 'route.js');
      const entryComponent = path.join(__dirname, '..', '..', 'src', 'components', 'AddonWiki', 'entryPage.js');
      const pageComponent = path.join(__dirname, '..', '..', 'src', 'components', 'AddonWiki', 'page.js');
      const dataPath = path.join(projectRoot, 'heavy-machinery', 'data.js');
      const recipePath = path.join(projectRoot, 'heavy-machinery', 'recipeData.js');
      const data = await import(`${pathToFileURL(dataPath).href}?wiki-routes`);
      const recipeData = await import(`${pathToFileURL(recipePath).href}?wiki-routes`);
      const trinketCategorySections = require(path.join(projectRoot, 'trinkets', 'categorySections.json'));
      const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const addEntryRoutes = (projectId, routeGroups) => {
        Object.entries(routeGroups).forEach(([entryType, slugs]) => {
          slugs.forEach((slug) => actions.addRoute({
            path: `/wiki/${projectId}/${entryType}/${slug}`,
            component: entryComponent,
            exact: true,
            priority: 20,
            props: {projectId, entryType, slug},
          }));
        });
      };
      const addSectionRoutes = (projectId, sections) => {
        sections.forEach((section) => actions.addRoute({
          path: section === 'overview' ? `/wiki/${projectId}` : `/wiki/${projectId}/${section}`,
          component: pageComponent,
          exact: true,
          priority: 10,
          props: {projectId, section},
        }));
      };

      projectCatalog.projects.forEach((project) => {
        [project.routes.project, ...project.aliases].forEach((projectPath) => actions.addRoute({
          path: projectPath,
          component: projectComponent,
          exact: true,
          priority: 30,
          props: {projectSlug: project.slug},
        }));
      });

      addEntryRoutes('heavy-machinery', {
        items: data.items.map((entry) => entry.slug),
        blocks: data.blocks.map((entry) => entry.slug),
        machines: data.machines.map((entry) => entry.id),
        generators: data.generators.map((entry) => entry.id),
        mechanics: data.mechanics.map((entry) => slugify(entry.name)),
        recipes: [
          ...recipeData.craftingRecipeDetails.map((entry) => `crafting-${entry.id}`),
          ...data.processingRecipes.map((entry) => `processing-${entry.id}`),
        ],
      });

      const generatedProjects = [
        {
          id: 'utilitycraft',
          manifest: require(path.join(projectRoot, 'utilitycraft', 'manifest.json')),
          processingRecipes: require(path.join(projectRoot, 'utilitycraft', 'processingRecipes.json')),
          machineFilter: (block) => block.componentKeys?.includes('tag:dorios:machine'),
          generatorFilter: (block) => block.componentKeys?.includes('tag:dorios:generator'),
          mechanics: ['dorios-energy', 'machine-tiers', 'energy-networks', 'item-and-fluid-transport', 'machine-upgrades', 'bonsai-automation'],
        },
        {
          id: 'ascendant-technology',
          manifest: require(path.join(projectRoot, 'ascendant-technology', 'manifest.json')),
          machineFilter: (block) => /\/blocks\/machinery\/machines\//i.test(`/${block.source}`),
          additionalMachineIds: ['mob_magnet'],
          generatorFilter: (block) => /\/blocks\/machinery\/generators\//i.test(`/${block.source}`) || block.id === 'cobble_gen_6',
          mechanics: ['absolute-tier', 'superior-machines', 'overclocking', 'refinement', 'power-beacons-wip'],
        },
        ...genericProjectIds
          .filter((id) => !['utilitycraft', 'ascendant-technology'].includes(id))
          .map((id) => ({
            id,
            manifest: require(path.join(projectRoot, id, 'manifest.json')),
            machineFilter: (block) => block.componentKeys?.includes('tag:dorios:machine')
              || /\/blocks\/machinery\/machines\//i.test(`/${block.source}`),
            generatorFilter: (block) => block.componentKeys?.includes('tag:dorios:generator')
              || /\/blocks\/machinery\/generators\//i.test(`/${block.source}`),
            mechanics: id === 'trinkets'
              ? ['dedicated-slots', 'attribute-bonuses', 'effects-and-immunities', 'loot-progression']
              : [],
            hiddenSections: id === 'trinkets' ? ['blocks', 'entities'] : [],
          })),
      ];

      generatedProjects.forEach((project) => {
        const allBlocks = project.manifest.content.blocks;
        const machines = allBlocks.filter((block) => project.machineFilter(block)
          || project.additionalMachineIds?.includes(block.id));
        const generators = allBlocks.filter(project.generatorFilter);
        const specializedBlockIds = new Set([
          ...machines.map((block) => block.id),
          ...generators.map((block) => block.id),
        ]);
        const blocks = allBlocks.filter((block) => !specializedBlockIds.has(block.id));
        const sectionVisible = (section) => !project.hiddenSections?.includes(section);
        const sections = [
          'overview',
          project.manifest.catalog.items.length && project.id !== 'trinkets' && 'items',
          ...(project.id === 'trinkets' ? trinketCategorySections.map(({id}) => id) : []),
          blocks.length && sectionVisible('blocks') && 'blocks',
          machines.length && 'machines',
          generators.length && 'generators',
          (project.manifest.content.recipes.length || project.processingRecipes?.length) && 'recipes',
          project.mechanics.length && 'mechanics',
        ].filter(Boolean);
        addSectionRoutes(project.id, sections);
        if (project.id === 'trinkets') {
          trinketCategorySections.forEach(({id, aliases = []}) => aliases.forEach((alias) => actions.addRoute({
            path: `/wiki/trinkets/${alias}`,
            component: pageComponent,
            exact: true,
            priority: 10,
            props: {projectId: 'trinkets', section: id},
          })));
        }
        addEntryRoutes(project.id, {
          items: project.manifest.catalog.items.map((entry) => entry.slug),
          blocks: sectionVisible('blocks') ? blocks.map((entry) => entry.slug) : [],
          machines: machines.map((entry) => entry.id),
          generators: generators.map((entry) => entry.id),
          entities: [],
          recipes: [
            ...project.manifest.content.recipes.map((entry) => `crafting-${entry.id}`),
            ...(project.processingRecipes ?? []).map((entry) => `processing-${entry.id}`),
          ],
          mechanics: project.mechanics,
        });
      });
    },
  };
};
