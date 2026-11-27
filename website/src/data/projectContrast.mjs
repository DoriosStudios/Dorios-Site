const surfaces = {
  light: ['#f3f0e9', '#fffdf8', '#e8e3da'],
  dark: ['#0c0c0c', '#171717', '#252525'],
};
const minimumContrast = 4.6;

const rgb = hex => hex.slice(1).match(/../g).map(channel => parseInt(channel, 16));
const hex = channels => '#' + channels.map(channel => channel.toString(16).padStart(2, '0')).join('');
const mix = (from, to, weight) => from.map((channel, i) => Math.round(channel + (to[i] - channel) * weight));

function luminance(color) {
  const linear = color.map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}

function contrast(first, second) {
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

function accentFor(primary, secondary, theme) {
  const original = mix(primary, secondary, .52);
  const backgrounds = surfaces[theme].map(rgb);
  const raised = backgrounds[2];
  backgrounds.push(mix(raised, primary, .20), mix(raised, secondary, .15));
  const target = theme === 'light' ? [0, 0, 0] : [255, 255, 255];
  // Include the tinted active navigation row, where the accent is also the icon color.
  const passes = color => [...backgrounds, mix(raised, color, .25)]
    .every(background => contrast(color, background) >= minimumContrast);
  if (passes(original)) return original;
  let start = 0, end = 1;
  for (let i = 0; i < 12; i++) {
    const weight = (start + end) / 2;
    if (passes(mix(original, target, weight))) end = weight;
    else start = weight;
  }
  return mix(original, target, end);
}

export function projectAccentVariables(primary, secondary) {
  const light = accentFor(rgb(primary), rgb(secondary), 'light');
  const dark = accentFor(rgb(primary), rgb(secondary), 'dark');
  return {
    '--card-accent': `light-dark(${hex(light)}, ${hex(dark)})`,
    '--card-accent-ink': 'light-dark(#fff, #000)',
  };
}