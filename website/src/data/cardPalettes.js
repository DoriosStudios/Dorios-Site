const fallbackPalette = ['#ff6d18', '#ff9b49'];

export const projectCardPalettes = {
  utilitycraft: ['#769050', '#3c5338'],
  'heavy-machinery': ['#946546', '#5b3b28'],
  'ascendant-technology': ['#6b4978', '#a1166c'],
  'better-containers': ['#3e2d1a', '#98e0d1'],
  smelters: ['#7a5328', '#d78c55'],
  bonsais: ['#558c37', '#90cc56'],
  crops: ['#584225', '#ae9d7f'],
  trees: ['#b1c0e4', '#682017'],
  'cobblestone-generators': ['#8ccdb5', '#95ae73'],
  compressy: ['#505332', '#aca3aa'],
  'digital-storage': ['#0c8081', '#c6c7c7'],
  atelier: ['#775032', '#a98760'],
  basics: ['#798623', '#bb884b'],
  excavate: ['#407a02', '#802e1b'],
  insight: ['#232300', '#b9b589'],
  trinkets: ['#490600', '#872c08'],
  pillars: ['#5d721a', '#a97f42'],
  paxels: ['#d1b6a3', '#8499bd'],
  lamps: ['#102d42', '#e6baa4'],
  'tiered-machinery': ['#8a2321', '#798489'],
  dummy: ['#a2c36b', '#a4848a'],
  chests: ['#b78c38', '#7a5c25'],
  enchants: ['#0054d3', '#04257c'],
  'lucky-tools': ['#b85d25', '#de9917'],
  'project-u': ['#46296c', '#8641d3'],
  'remix-attributes': ['#af6d24', '#67361c'],
  'too-many-trinkets': ['#732f11', '#b27747'],
  'utilitycraft-quarry': ['#575859', '#1d2324'],
  utilitysky: ['#c7c7c7', '#f3f3f3'],
};

export const memberCardPalettes = {
  milo504: ['#ff7300', '#3d291a'],
  weathervictor: ['#7f7771', '#c7c5c1'],
  kauzin: ['#450547', '#c47caa'],
  srgui: ['#c3c4be', '#1c1d24'],
  jrice: ['#1caad1', '#225973'],
  sam: ['#74d47f', '#102520'],
  mikey: ['#876c13', '#e3b540'],
  cloud: ['#84676f', '#b2aa9a'],
  mainmas: ['#084d53', '#655232'],
  yusou: ['#e0a383', '#b98a72'],
  the_white_cat: ['#e7e4df', '#766f69'],
  druski: ['#657b8f', '#bec9d1'],
  sh_pro: ['#752f91', '#2e183f'],
  luna: ['#6b568d', '#d3a8c8'],
};

function paletteVariables(palette) {
  const [primary, secondary] = palette ?? fallbackPalette;
  return {
    '--card-primary': primary,
    '--card-secondary': secondary,
  };
}

export function projectCardPalette(projectOrId) {
  const id = typeof projectOrId === 'string' ? projectOrId : projectOrId?.id;
  return paletteVariables(projectCardPalettes[id]);
}

export function memberCardPalette(memberOrId) {
  const id = typeof memberOrId === 'string' ? memberOrId : memberOrId?.id;
  return paletteVariables(memberCardPalettes[id]);
}
