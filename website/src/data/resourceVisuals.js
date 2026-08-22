const ascendantGlyph = (name) => `/img/addons/ascendant/resources/glyphs/${name}.png`;

export const MACHINE_RESOURCE_ICONS = Object.freeze({
  energy: ascendantGlyph('energy'),
  gas: ascendantGlyph('pressure_meter'),
  speed: ascendantGlyph('generic_speed'),
  fluid: ascendantGlyph('generic_fluid'),
  energyUpgrade: ascendantGlyph('energy_upgrade'),
  speedUpgrade: ascendantGlyph('speed_upgrade'),
  filterUpgrade: ascendantGlyph('filter_upgrade'),
  quantityUpgrade: ascendantGlyph('quantity_upgrade'),
  rangeUpgrade: ascendantGlyph('range_upgrade'),
  stackUpgrade: ascendantGlyph('stack_upgrade'),
});

const FLUID_VISUALS = Object.freeze({
  water: {
    label: 'Water',
    description: 'A basic coolant and process liquid used by several machines.',
    icon: ascendantGlyph('water'),
    palette: {primary: '#38bdf8', secondary: '#075985', glow: '#7dd3fc'},
  },
  lava: {
    label: 'Lava',
    description: 'A high-temperature liquid used for heat-intensive processing and power.',
    icon: ascendantGlyph('lava'),
    palette: {primary: '#fb923c', secondary: '#9a3412', glow: '#fdba74'},
  },
  steam: {
    label: 'Steam',
    description: 'Pressurised thermal fluid produced and consumed by heat-processing machines.',
    icon: ascendantGlyph('steam'),
    palette: {primary: '#cbd5e1', secondary: '#64748b', glow: '#f8fafc'},
  },
  xp: {
    label: 'Experience',
    description: 'Stored experience fluid for enchanting and advanced equipment processes.',
    icon: ascendantGlyph('xp'),
    palette: {primary: '#84cc16', secondary: '#3f6212', glow: '#bef264'},
  },
  cryofluid: {
    label: 'Cryofluid',
    description: 'A sub-zero coolant for cryogenic machines and precision processes.',
    icon: ascendantGlyph('cryofluid'),
    palette: {primary: '#22d3ee', secondary: '#155e75', glow: '#67e8f9'},
  },
  liquified_aetherium: {
    label: 'Liquified Aetherium',
    description: 'Condensed Aetherium used by late-game Ascendant Technology systems.',
    icon: ascendantGlyph('liquified_aetherium'),
    palette: {primary: '#c084fc', secondary: '#6b21a8', glow: '#e9d5ff'},
  },
  dark_matter: {
    label: 'Dark Matter',
    description: 'A dense exotic liquid required for advanced catalyst and singularity processing.',
    icon: ascendantGlyph('dark_matter'),
    palette: {primary: '#818cf8', secondary: '#312e81', glow: '#c4b5fd'},
  },
  milk: {
    label: 'Milk',
    description: 'A biological liquid used by recipes that require a neutral dairy ingredient.',
    icon: ascendantGlyph('milk'),
    palette: {primary: '#f8fafc', secondary: '#94a3b8', glow: '#ffffff'},
  },
  blood: {
    label: 'Blood',
    description: 'A biological liquid reserved for specialised processing systems.',
    icon: ascendantGlyph('blood'),
    palette: {primary: '#ef4444', secondary: '#7f1d1d', glow: '#fca5a5'},
  },
  generic: {
    label: 'Machine fluid',
    description: 'A machine-specific liquid resource.',
    icon: MACHINE_RESOURCE_ICONS.fluid,
    palette: {primary: '#38bdf8', secondary: '#075985', glow: '#7dd3fc'},
  },
});

const FLUID_ALIASES = Object.freeze({
  aetherium_liquid: 'liquified_aetherium',
  dark_matter_liquid: 'dark_matter',
  experience: 'xp',
  experience_points: 'xp',
});

function resourceKey(value) {
  return String(value ?? '')
    .replace(/^fluid:/i, '')
    .replace(/^.*:/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

export function fluidVisualFor(value) {
  const key = resourceKey(value);
  return FLUID_VISUALS[FLUID_ALIASES[key] ?? key] ?? FLUID_VISUALS.generic;
}
