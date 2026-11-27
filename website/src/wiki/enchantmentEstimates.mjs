export function miningSpeedRange(digger) {
  const speeds = (digger?.destroy_speeds ?? []).map(({speed}) => speed)
    .filter(speed => typeof speed === 'number' && Number.isFinite(speed) && speed >= 0);
  return speeds.length ? [Math.min(...speeds), Math.max(...speeds)] : null;
}

export function formatMiningRange(range, format = String) {
  const [minimum, maximum] = range;
  return (minimum === maximum ? format(minimum) : format(minimum) + '–' + format(maximum)) + '×';
}

export function miningEstimate(range, level, enabled) {
  if (!range) return null;
  const bonus = enabled && Number.isInteger(level) && level > 0 ? level ** 2 + 1 : 0;
  const [minimum, maximum] = range;
  return {
    range: [minimum + bonus, maximum + bonus],
    bonus,
    improvement: minimum > 0 && maximum > 0
      ? [Math.round(100 * bonus / maximum), Math.round(100 * bonus / minimum)]
      : null,
  };
}
