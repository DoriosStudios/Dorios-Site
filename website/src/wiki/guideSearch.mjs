import guides from './compactGuides.json' with {type: 'json'};

const sections = {
  compressy: [
    ['recipes', ['Compression and unpacking recipes', 'Receitas de compactação e descompactação', 'Recetas de compresión y descompresión'], ['Ream of Paper', 'resma de papel']],
    ['tiers', ['Block compression tiers', 'Níveis de compactação', 'Niveles de compresión'], ['nonuple compressed cobblestone', 'pedregulho compactado']],
    ['materials', ['Compressible materials', 'Materiais aceitos no Compressy', 'Materiales compatibles con Compressy']],
  ],
  paxels: [
    ['recipes', ['Paxel and AIOT recipes', 'Receitas de Paxel e AIOT', 'Recetas de Paxel y AIOT']],
    ['tiers', ['Paxel and AIOT stats by material', 'Estatísticas do Paxel e da AIOT por material', 'Estadísticas de Paxel y AIOT por material']],
    ['actions', ['AIOT area actions', 'Ações em área da AIOT', 'Acciones de área de la AIOT']],
  ],
  insight: [
    ['settings', ['Insight settings book', 'Livro de configurações do Insight', 'Libro de configuración de Insight'], ['insightmenu']],
    ['hud', ['Insight HUD setup', 'Configuração do HUD do Insight', 'Configuración del HUD de Insight'], ['WAILA', 'mobile layout']],
  ],
  crops: [
    ['crop-and-soil-tiers', ['Crop and soil tiers', 'Níveis das plantações e dos solos', 'Niveles de cultivos y suelos']],
    ['crafting-the-base-seed', ['Base seed recipe', 'Receita da semente base', 'Receta de la semilla base']],
    ['resource-drops', ['Harvest drops', 'Recursos das colheitas', 'Recursos de la cosecha']],
  ],
  trees: [
    ['crafting-ore-saplings', ['Ore sapling recipes', 'Receitas das mudas de minério', 'Recetas de brotes de minerales'], ['redstone sapling', 'muda de redstone', 'brote de redstone']],
    ['growth-and-harvest', ['Ore tree growth and harvest', 'Crescimento e colheita das árvores de minério', 'Crecimiento y cosecha de árboles de minerales']],
  ],
  'cobblestone-generators': [
    ['generator-tiers', ['Generator speeds', 'Velocidades dos geradores', 'Velocidades de los generadores']],
    ['crafting-the-generator', ['Generator recipes', 'Receitas dos geradores', 'Recetas de generadores']],
  ],
};

export function wikiGuideEntries(project, locale) {
  const href = project.routes.wiki;
  if (!href) return [];
  const language = locale === 'pt-BR' ? 1 : locale === 'es-MX' ? 2 : 0;
  const configured = sections[project.id] ?? [];
  const landing = {name: project.name, type: 'searchGuide', href, aliases: [project.summary]};
  if (href.startsWith('/docs/')) {
    return [landing, ...configured.map(([id, names, aliases]) => ({
      name: names[language], type: 'searchGuide', href: href + '#' + id, aliases: [...names, ...(aliases ?? [])],
    }))];
  }
  const projectGuides = guides[project.id];
  if (!projectGuides) return [];
  const guide = projectGuides[locale] ?? projectGuides.en;
  const tuned = new Map(configured.map(([id, names, aliases]) => [id, {names, aliases}]));
  return [
    landing,
    ...guide.pages.flatMap((page, index) => {
      const pageHref = href + '/how-to-play' + (index > 0 ? '/' + page.id : '');
      return page.sections.map(section => {
        const match = tuned.get(section.id);
        return {name: match?.names[language] ?? section.title, type: 'searchGuide', href: pageHref + '#' + section.id,
          aliases: [section.title, ...(match?.names ?? []), ...(match?.aliases ?? [])]};
      });
    }),
  ];
}
