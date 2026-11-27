const creatureNames = {
  blaze: ['Blaze', 'Chama', 'Blaze'],
  bogged: ['Bogged', 'Pantanoso', 'Ciénago'],
  breeze: ['Breeze', 'Vórtice', 'Vorágine'],
  cave_spider: ['Cave Spider', 'Aranha das Cavernas', 'Araña de cueva'],
  drowned: ['Drowned', 'Afogado', 'Ahogado'],
  elder_guardian: ['Elder Guardian', 'Guardião-mestre', 'Guardián anciano'],
  ender_dragon: ['Ender Dragon', 'Dragão Ender', 'Dragona de Ender'],
  enderman: ['Enderman', 'Enderman', 'Enderman'],
  guardian: ['Guardian', 'Guardião', 'Guardián'],
  phantom: ['Phantom', 'Fantasma', 'Fantasma'],
  piglin_brute: ['Piglin Brute', 'Piglin Bárbaro', 'Piglin bruto'],
  pillager: ['Pillager', 'Saqueador', 'Saqueador'],
  rabbit: ['Rabbit', 'Coelho', 'Conejo'],
  shulker: ['Shulker', 'Shulker', 'Shulker'],
  skeleton: ['Skeleton', 'Esqueleto', 'Esqueleto'],
  stray: ['Stray', 'Errante', 'Errante'],
  strider: ['Strider', 'Lavagante', 'Caminante'],
  vex: ['Vex', 'Vex', 'Vex'],
  vindicator: ['Vindicator', 'Vingador', 'Vindicador'],
  warden: ['Warden', 'Guarda', 'Guardia'],
  witch: ['Witch', 'Bruxa', 'Bruja'],
  wither: ['Wither', 'Wither', 'Wither'],
  wither_skeleton: ['Wither Skeleton', 'Esqueleto Wither', 'Esqueleto de Wither'],
  zombie: ['Zombie', 'Zumbi', 'Zombi'],
};

export function isAvailableEntityDrop({entity}) {
  return typeof entity === 'string' && entity.startsWith('minecraft:')
    && Object.hasOwn(creatureNames, entity.slice('minecraft:'.length));
}

export function trinketDropCreature(entity, locale) {
  const id = entity.replace(/^minecraft:/, '');
  const names = creatureNames[id];
  const language = locale === 'pt-BR' ? 1 : locale === 'es-MX' ? 2 : 0;
  const hasRender = isAvailableEntityDrop({entity});
  return {
    id,
    name: names?.[language] ?? id.replaceAll('_', ' '),
    image: hasRender ? `drop-mobs/${id}.png` : null,
    faceImage: hasRender ? `drop-faces/${id}.png` : null,
  };
}

export function dropDimensionLabel(dimension) {
  return {
    'minecraft:overworld': 'Overworld only',
    'minecraft:nether': 'Nether only',
    'minecraft:the_end': 'The End only',
  }[dimension] ?? dimension;
}

export function groupTrinketEntityDrops(items) {
  const creatures = new Map();
  const unavailable = [];
  for (const item of items) {
    for (const drop of item.documentation?.acquisition?.entityDrops ?? []) {
      if (!isAvailableEntityDrop(drop)) {
        unavailable.push({item, drop});
        continue;
      }
      if (!creatures.has(drop.entity)) creatures.set(drop.entity, []);
      creatures.get(drop.entity).push({item, drop});
    }
  }
  return {creatures, unavailable};
}