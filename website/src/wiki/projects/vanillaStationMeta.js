// Shared renders for vanilla recipe stations. These are absolute public URLs so
// every generated wiki can use the same visual language without copying assets.
export const vanillaStationMeta = Object.freeze({
  crafting_table: {label: 'Crafting Table', face: '/img/wiki/vanilla/Renders/crafting_table.png'},
  stonecutter: {label: 'Stonecutter', face: '/img/wiki/vanilla/Renders/stonecutter.png'},
  furnace: {label: 'Furnace', face: '/img/wiki/vanilla/Renders/furnace.png'},
  blast_furnace: {label: 'Blast Furnace', face: '/img/wiki/vanilla/Renders/blast_furnace.png'},
  smoker: {label: 'Smoker', face: '/img/wiki/vanilla/Renders/smoker.png'},
  smithing_table: {label: 'Smithing Table', face: '/img/wiki/vanilla/Renders/smithing_table.png'},
  cartography_table: {label: 'Cartography Table', face: '/img/wiki/vanilla/Renders/cartography_table.png'},
  fletching_table: {label: 'Fletching Table', face: '/img/wiki/vanilla/Renders/fletching_table.png'},
  loom: {label: 'Loom', face: '/img/wiki/vanilla/Renders/loom.png'},
});

export function vanillaStationFor(station) {
  const key = String(station ?? '')
    .replace(/^minecraft:/, '')
    .replace(/-/g, '_')
    .toLowerCase();
  return vanillaStationMeta[key] ?? null;
}
