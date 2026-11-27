import data from '../../data/betterContainersWiki.json' with {type: 'json'};

export const catalogPath = '/wiki/better-containers';
export const families = ['drawers', 'chests', 'barrels', 'shulkers'];
export const containers = data.records;
export const containersById = new Map(containers.map(container => [container.id, container]));

const names = {
  en: {
    families: ['Drawers', 'Chests', 'Barrels', 'Shulker Boxes'],
    nouns: ['Drawer', 'Chest', 'Barrel', 'Shulker Box'],
    tiers: {copper: 'Copper', iron: 'Iron', gold: 'Gold', emerald: 'Emerald', diamond: 'Diamond', netherite: 'Netherite'},
    ingredients: ['Barrel', 'Chest', 'Copper Ingot', 'Diamond', 'Emerald', 'Gold Ingot', 'Iron Ingot', 'Netherite Ingot', 'Netherite Scrap', 'Any Planks', 'Shulker Box', 'Stick'],
  },
  'pt-BR': {
    families: ['Gavetas', 'Baús', 'Barris', 'Caixas de shulker'],
    nouns: ['Gaveta', 'Baú', 'Barril', 'Caixa de Shulker'],
    tiers: {copper: 'Cobre', iron: 'Ferro', gold: 'Ouro', emerald: 'Esmeralda', diamond: 'Diamante', netherite: 'Netherita'},
    ingredients: ['Barril', 'Baú', 'Barra de Cobre', 'Diamante', 'Esmeralda', 'Barra de Ouro', 'Barra de Ferro', 'Barra de Netherita', 'Fragmento de Netherita', 'Tábuas de qualquer tipo', 'Caixa de Shulker', 'Graveto'],
  },
  'es-MX': {
    families: ['Cajones', 'Cofres', 'Barriles', 'Cajas de shulker'],
    nouns: ['Cajón', 'Cofre', 'Barril', 'Caja de Shulker'],
    tiers: {copper: 'Cobre', iron: 'Hierro', gold: 'Oro', emerald: 'Esmeralda', diamond: 'Diamante', netherite: 'Netherita'},
    ingredients: ['Barril', 'Cofre', 'Lingote de Cobre', 'Diamante', 'Esmeralda', 'Lingote de Oro', 'Lingote de Hierro', 'Lingote de Netherita', 'Fragmento de Netherita', 'Tablones de cualquier tipo', 'Caja de Shulker', 'Palo'],
  },
};
const ingredientIds = ['barrel', 'chest', 'copper_ingot', 'diamond', 'emerald', 'gold_ingot', 'iron_ingot', 'netherite_ingot', 'netherite_scrap', 'planks', 'shulker_box', 'stick'];

export function familyName(family, locale) {
  return (names[locale] ?? names.en).families[families.indexOf(family)];
}

export function containerName(container, locale) {
  const copy = names[locale] ?? names.en;
  const noun = copy.nouns[families.indexOf(container.family)];
  const tier = copy.tiers[container.tier];
  if (!tier) return noun;
  return !locale || locale === 'en' ? tier + ' ' + noun : noun + ' de ' + tier;
}

export function containerPath(container) {
  return catalogPath + '/' + container.family + '/' + container.slug.replaceAll('_', '-');
}

export function ingredient(id, locale) {
  const container = containersById.get(id);
  if (container) return {name: containerName(container, locale), image: container.image, href: containerPath(container)};
  const key = id.split(':').at(-1);
  const label = (names[locale] ?? names.en).ingredients[ingredientIds.indexOf(key)];
  return {name: label ?? key.replaceAll('_', ' '), image: data.vanilla[id]};
}

export function containerSearchProject(locale) {
  return {
    id: 'better-containers', name: 'Better Containers', basePath: catalogPath,
    wikiSections: [{id: 'blocks', icon: 'cube'}],
    blocks: families.map(family => ({
      id: family, name: familyName(family, locale), href: catalogPath + '/' + family,
      variants: containers.filter(container => container.family === family).map(container => ({
        id: container.id, name: containerName(container, locale), href: containerPath(container),
        aliases: [containerName(container, 'en')],
      })),
    })),
  };
}
