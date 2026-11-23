// Presentation rules operate on verified fields, never on an item's name.
export function meaningfulValue(value) {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.some(meaningfulValue);
  const text = String(value).trim();
  return !/^(?:none|not applicable|not documented|registered item|unknown|configured .+|no status effect|no attribute change|add-on progression)$/i.test(text)
    && !/configured machine input|machine-specific result/i.test(text);
}

export function uniqueGuideFacts(facts) {
  const seen = new Set();
  return facts.filter(pair => Array.isArray(pair) && meaningfulValue(pair[1])).filter(([label]) => {
    const key = String(label).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function itemHighlights(documentation) {
  const attributes = (documentation.capabilities?.attributeModifiers ?? []).map(item => [item.name, item.modifier]);
  const mining = (documentation.sections ?? []).flatMap(section => section.facts ?? [])
    .filter(([label]) => /^(?:mining speed|base mining speed|conversion speed|tool tier|mining tier)$/i.test(label));
  return uniqueGuideFacts([...attributes, ...(documentation.statistics ?? []), ...mining]);
}

export function isSimpleEquipment(documentation) {
  return meaningfulValue(documentation.basic?.equipSlot)
    && documentation.basic.equipSlot !== 'Not a trinket slot'
    && !(documentation.sections?.length || documentation.statistics?.length);
}

export function equipmentBenefits(documentation) {
  const c = documentation.capabilities ?? {};
  return [
    ...(c.attributeModifiers ?? []).map(item => ({label:item.name, value:item.modifier, kind:'attribute'})),
    ...(c.passiveEffects ?? []).map(item => ({label:item.name, value:item.description, kind:'effect'})),
    ...(c.activeEffects ?? []).map(item => ({label:item.name, value:item.description, kind:'effect'})),
    ...(c.immunities ?? []).map(item => ({label:typeof item === 'string' ? item : item.name, kind:'immunity'})),
    ...(c.specialAbility ? [{label:c.specialAbility.name, value:c.specialAbility.description, kind:'effect'}] : []),
  ].filter(item => meaningfulValue(item.label));
}

export function machinePlayerGuide(machine) {
  const data = machine.machineData ?? {};
  const number = value => Number(value).toLocaleString('en-US');
  const cycle = data.energyCost > 0 && data.baseRate > 0 ? Math.ceil(data.energyCost / data.baseRate) : null;
  const sourced = machine.specifications ?? [];
  const metrics = uniqueGuideFacts([
    data.energyCapacity > 0 && ['Energy capacity', `${number(data.energyCapacity)} DE`],
    data.energyCost > 0 && ['Base energy consumption', `${number(data.energyCost)} DE/action`],
    cycle && ['Base processing time', `${number(cycle)} ticks · ${number(cycle / 20)} s`],
    data.fluidCapacity > 0 && ['Fluid capacity', `${number(data.fluidCapacity)} mB`],
    data.gasCapacity > 0 && ['Gas capacity', `${number(data.gasCapacity)} mB`],
    ...sourced.filter(([label]) => /^(?:processing speed|nominal cycle|fuel use|coal-equivalent yield|storage capacity|capacity|range)$/i.test(label)),
  ]);
  return {
    metrics,
    inputs: meaningfulValue(machine.input) ? [machine.input] : [],
    outputs: meaningfulValue(machine.output) ? [machine.output] : [],
    features: sourced.filter(([label,value]) => /(?:special behavior|risk|restriction|catalyst slots|secondary output)/i.test(label) && meaningfulValue(value)),
    upgrades: [...new Set(data.upgrades?.map(upgrade => upgrade.type) ?? machine.modules ?? [])],
    steps: (machine.howItWorks ?? []).filter(meaningfulValue),
  };
}
