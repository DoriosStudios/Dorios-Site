import {vanillaStationFor} from './vanillaStationMeta.js';

const SECTION_DEFINITIONS = [
  {id: 'overview', label: 'Overview', icon: 'book'},
  {id: 'items', label: 'Items', icon: 'sword'},
  {id: 'blocks', label: 'Blocks', icon: 'cube'},
  {id: 'machines', label: 'Machines', icon: 'tool'},
  {id: 'generators', label: 'Generators', icon: 'bolt'},
  {id: 'entities', label: 'Entities', icon: 'users'},
  {id: 'recipes', label: 'Recipes', icon: 'file-text'},
  {id: 'mechanics', label: 'Mechanics', icon: 'settings'},
];

const SECTION_COPY = {
  items: 'Registered materials, components, equipment, resources, and tools.',
  blocks: 'Every registered block, organized by its source category.',
  machines: 'Processing, automation, and production systems provided by the add-on.',
  generators: 'Energy generation, storage, transmission, and receiving systems.',
  entities: 'Runtime and gameplay entities registered by the add-on.',
  recipes: 'Every discoverable Bedrock recipe normalized into individual entries.',
  mechanics: 'The current energy, gas, machine, and generator systems.',
  'how-to-play': 'A guided survival progression from first tools to powered automation.',
};

const titleize = (value) => value
  .replace(/^.*:/, '')
  .replace(/[_/-]+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

function tierFor(name, category) {
  const tier = ['Creative', 'Absolute', 'Ultimate', 'Expert', 'Advanced', 'Basic']
    .find((candidate) => name.toLowerCase().includes(candidate.toLowerCase()));
  return tier ?? category ?? 'Standard';
}

function normalizeItem(entry, {itemProfiles = {}} = {}) {
  const identifier = entry.identifier ?? entry.id;
  const profile = itemProfiles[entry.id] ?? itemProfiles[identifier] ?? {};
  const profileDocumentation = profile.documentation ?? {};
  return {
    ...entry,
    ...profile,
    documentation: {
      ...(entry.documentation ?? {}),
      ...profileDocumentation,
      basic: {...(entry.documentation?.basic ?? {}), ...(profileDocumentation.basic ?? {})},
      capabilities: {...(entry.documentation?.capabilities ?? {}), ...(profileDocumentation.capabilities ?? {})},
    },
    id: identifier,
    identifier,
    shortId: entry.id,
    slug: entry.slug ?? slugify(entry.id),
    category: entry.category ?? 'General',
    description: entry.description ?? '',
    entryType: 'items',
    variants: entry.variants?.map((variant) => ({
      ...variant,
      id: variant.identifier ?? variant.id,
      identifier: variant.identifier ?? variant.id,
    })),
  };
}

function normalizeBlock(entry, {generatedCompressedRenders = false, blockProfiles = {}} = {}) {
  const identifier = entry.identifier ?? entry.id;
  const profile = blockProfiles[entry.id] ?? blockProfiles[identifier] ?? {};
  const generatedCompressedRender = generatedCompressedRenders && entry.category === 'Compressed'
    ? `renders/compressed_blocks/${entry.id}.png`
    : undefined;
  return {
    ...entry,
    ...profile,
    blockData: {...entry.blockData, ...profile.blockData},
    blockDetails: profile.blockDetails ?? entry.blockDetails,
    render: entry.render ?? generatedCompressedRender,
    id: identifier,
    identifier,
    shortId: entry.id,
    slug: entry.slug ?? slugify(entry.id),
    category: entry.category ?? 'General',
    tier: entry.tier ?? tierFor(entry.name, entry.category),
    description: entry.description ?? '',
    entryType: 'blocks',
  };
}

function normalizeEntity(entry) {
  return {
    ...entry,
    id: entry.id ?? slugify(entry.identifier),
    slug: entry.slug ?? slugify(entry.id ?? entry.identifier),
    category: entry.category ?? 'Runtime',
    description: entry.description ?? '',
  };
}

function normalizeRecipe(entry) {
  if (!entry.result) return null;
  return {
    ...entry,
    category: entry.category ?? titleize(entry.kind ?? 'Crafting'),
    station: entry.station ?? 'crafting_table',
    slots: entry.slots ?? Array(9).fill(null),
    slotCount: entry.slotCount ?? (entry.slots ?? []).filter(Boolean).length,
  };
}

function isMachineBlock(block) {
  return /\/blocks\/machinery\/machines\//i.test(`/${block.source ?? ''}`);
}

function isGeneratorBlock(block) {
  return /\/blocks\/machinery\/generators\//i.test(`/${block.source ?? ''}`);
}

function formatMachineNumber(value) {
  return Number(value).toLocaleString('en-US');
}

function machineCategory(block, profile) {
  if (profile.category) return profile.category;
  if (/(?:placer|breaker|harvester|fisher|sieve|cultivator|barrier)/.test(block.shortId)) return 'Automation';
  if (/(?:battery|container|tank|storage)/.test(block.shortId)) return 'Storage';
  if (block.machineData?.recipeType || /(?:crusher|press|infuser|burner|processor|forge|chamber|anvil|synthesizer|fabricator|liquifier|pulverizer)/.test(block.shortId)) return 'Processing';
  return 'Utility';
}

function defaultMachineDescription(block, category) {
  const registeredProcess = block.machineData?.recipeType ? titleize(block.machineData.recipeType) : null;
  const process = block.name.toLowerCase();
  if (registeredProcess) return `Runs registered ${registeredProcess} recipes using Dorios Energy and its configured material interfaces.`;
  if (category === 'Processing') return `Processes ${process} operations using Dorios Energy and its internal inventory.`;
  if (category === 'Automation') return `Automates ${process} operations while connected to a Dorios Energy network.`;
  if (category === 'Storage') return `Stores and exposes ${process} resources to a connected automation network.`;
  return `Provides ${process} functionality as part of a Dorios automation network.`;
}

function defaultMachineIo(machineData) {
  const interfaces = (machineData.interfaces ?? []).filter((interfaceName) => (
    interfaceName !== 'Energy' || machineData.energyCost > 0
  ));
  return interfaces.map((interfaceName) => {
    if (interfaceName === 'Energy') return ['Energy', 'Configured energy sides'];
    if (interfaceName === 'Items') return ['Items', 'Configured item sides'];
    if (interfaceName === 'Fluids') return ['Fluids', 'Configured fluid sides'];
    if (interfaceName === 'Gases') return ['Gases', 'Configured gas sides'];
    return [interfaceName, 'Configurable'];
  });
}

function machineSpecifications(machineData, profile, summary) {
  const upgrades = (machineData.upgrades ?? []).map((upgrade) => titleize(upgrade.type));
  const hasDirectionalSpecification = (profile.specifications ?? [])
    .some(([label]) => /(?:face|orientation|placement)/i.test(label));
  const hasProductionType = (profile.specifications ?? [])
    .some(([label]) => /production type/i.test(label));
  const baseDuration = machineData.energyCost > 0 && machineData.baseRate > 0
    ? machineData.energyCost / machineData.baseRate
    : null;
  const specifications = [
    !profile.omitConfiguredEnergy && machineData.energyCost > 0 && ['Base consumption', profile.baseConsumption ?? profile.energy ?? `${formatMachineNumber(machineData.energyCost)} DE`],
    machineData.energyCost > 0 && machineData.energyCapacity > 0 && ['Energy capacity', `${formatMachineNumber(machineData.energyCapacity)} DE`],
    machineData.baseRate > 0 && ['Base energy rate', `${formatMachineNumber(machineData.baseRate)} DE/t`],
    !profile.omitConfiguredEnergy && baseDuration && ['Nominal base cycle', `${formatMachineNumber(baseDuration)} ticks · ${(baseDuration / 20).toLocaleString('en-US')} s`],
    machineData.fluidCapacity !== undefined && ['Fluid capacity', `${formatMachineNumber(machineData.fluidCapacity)} mB`],
    machineData.gasCapacity !== undefined && ['Gas capacity', `${formatMachineNumber(machineData.gasCapacity)} mB`],
    !hasProductionType && ['Production type', summary.productionType],
    upgrades.length > 0 && ['Upgrade support', upgrades.join(', ')],
    ...(profile.specifications ?? []),
  ];
  return specifications.filter(Boolean);
}

function machineFromBlock(block, profile = {}) {
  const machineData = block.machineData ?? {};
  const category = machineCategory(block, profile);
  const recipeName = machineData.recipeType ? titleize(machineData.recipeType) : null;
  const resourceInterfaces = (machineData.interfaces ?? []).filter((entry) => entry !== 'Energy');
  const input = profile.input ?? (recipeName ? `${recipeName} recipe inputs` : 'Configured machine input');
  const output = profile.output ?? (recipeName ? `${recipeName} recipe products` : 'Machine-specific result');
  const baseConsumption = profile.baseConsumption ?? profile.energy ?? (machineData.energyCost > 0
    ? (recipeName ? `${formatMachineNumber(machineData.energyCost)} DE default` : `${formatMachineNumber(machineData.energyCost)} DE / action`)
    : 'Not required');
  const energyCapacity = profile.energyCapacity ?? (machineData.energyCapacity > 0
    ? `${formatMachineNumber(machineData.energyCapacity)} DE`
    : 'Not applicable');
  const productionType = profile.productionType ?? (/fluid|liquid|lava|water|cryofluid|steam|xp/i.test(output)
    ? 'Fluid'
    : /world|placed|target|field|none|not applicable/i.test(output) ? 'Other' : 'Item');
  return {
    id: block.shortId,
    name: block.name,
    description: profile.description ?? defaultMachineDescription(block, category),
    blockSlug: block.slug,
    controller: block.name,
    tier: profile.tier ?? tierFor(block.name, 'Standard'),
    category,
    recipe: recipeName,
    cost: baseConsumption,
    baseConsumption,
    energyCapacity,
    productionType,
    input,
    output,
    primaryResource: profile.primaryResource ?? (resourceInterfaces.join(' + ') || 'Dorios Energy'),
    modules: profile.modules ?? (machineData.upgrades ?? []).map((upgrade) => titleize(upgrade.type)),
    specifications: machineSpecifications(machineData, profile, {productionType}),
    howItWorks: profile.howItWorks ?? [
      `Supply ${input.toLowerCase()} to the machine.`,
      ...(machineData.energyCost > 0 ? ['Connect the machine to a Dorios Energy network.'] : []),
      `Collect ${output.toLowerCase()} from its configured output.`,
    ],
    io: profile.io ?? defaultMachineIo(machineData),
    machineData,
  };
}

function generatorFromBlock(block, profile = {}) {
  const machineData = block.machineData ?? {};
  const systemType = profile.systemType ?? (block.shortId.includes('battery')
    ? 'Storage'
    : /energy_(?:receiver|transmitter)/.test(block.shortId)
      ? 'Transport'
      : 'Generation');
  const operatingFacts = {
    Generation: {
      fuel: 'Configured fuel or environment',
      output: 'Generated Dorios Energy',
      risk: 'Produces energy for a connected network',
    },
    Storage: {
      fuel: 'Network energy',
      output: 'Buffered Dorios Energy',
      risk: 'Stores energy between production and demand',
    },
    Transport: {
      fuel: 'Connected network',
      output: 'Transferred Dorios Energy',
      risk: 'Moves energy between network endpoints',
    },
  }[systemType];
  const defaultGenerationType = systemType !== 'Generation'
    ? systemType
    : /solar|wind/.test(block.shortId)
      ? 'Passive'
      : machineData.entityType === 'fluid_generator'
        ? 'Active (Fluid)'
        : 'Active (Item)';
  const baseGeneration = machineData.baseRate > 0
    ? `${formatMachineNumber(machineData.baseRate)} DE/t`
    : 'Not applicable';
  const energyCapacity = machineData.energyCapacity > 0
    ? `${formatMachineNumber(machineData.energyCapacity)} DE`
    : 'Not applicable';
  return {
    id: block.shortId,
    name: block.name,
    description: '',
    blockSlug: block.slug,
    faces: block.faces,
    render: block.render,
    itemImage: block.itemImage,
    image: block.render ?? block.itemImage ?? block.faces?.right,
    status: profile.status ?? systemType,
    systemType,
    family: profile.family ?? (systemType === 'Generation' ? block.name.replace(/^(?:Basic|Advanced|Expert|Ultimate)\s+/i, '').replace(/\s+Generator$/i, '') : systemType),
    familyOrder: profile.familyOrder ?? Number.MAX_SAFE_INTEGER,
    tier: profile.tier ?? tierFor(block.name, block.category),
    tierOrder: profile.tierOrder ?? Number.MAX_SAFE_INTEGER,
    generationType: profile.generationType ?? defaultGenerationType,
    baseGeneration: profile.baseGeneration ?? baseGeneration,
    energyCapacity: profile.energyCapacity ?? energyCapacity,
    ...operatingFacts,
    fuel: profile.fuel ?? operatingFacts.fuel,
    output: profile.output ?? operatingFacts.output,
    risk: profile.risk ?? operatingFacts.risk,
    components: profile.components ?? [],
    machineData,
  };
}

function buildStationMeta(recipes, blocks, assetRoot, dependencyProjects) {
  const sources = [
    {blocks, assetRoot},
    ...dependencyProjects.map((project) => ({blocks: project.blocks, assetRoot: project.assetRoot})),
  ];

  return [...new Set(recipes.map((recipe) => recipe.station))].reduce((result, station) => {
    const vanillaStation = vanillaStationFor(station);
    if (vanillaStation) {
      result[station] = vanillaStation;
      return result;
    }
    const rawStationId = station.replace(/^.*:/, '').replace(/-/g, '_');
    const stationId = rawStationId.replace(/^utilitycraft_/, '');
    const source = sources.find((candidate) => candidate.blocks.some((entry) => (
      entry.shortId === stationId || entry.shortId === rawStationId
    )));
    const block = source?.blocks.find((entry) => (
      entry.shortId === stationId || entry.shortId === rawStationId
    ));
    const face = block?.render ?? block?.itemImage ?? block?.faces?.right;
    result[station] = {
      label: stationId === 'workbench' ? 'UtilityCraft Workbench' : titleize(station),
      face: face ? `${source.assetRoot}/${face}` : null,
    };
    return result;
  }, {});
}

export function createGeneratedProject({
  manifest,
  id,
  name,
  repository,
  overview,
  mechanics = [],
  machineNotice,
  mechanicsGuide,
  processingRecipes = [],
  sectionDescriptions = {},
  entityFilter = () => true,
  additionalMachineIds = [],
  additionalGeneratorIds = [],
  dependencyProjects = [],
  machineProfiles = {},
  machineCategoryOrder = [],
  generatorProfiles = {},
  generatorCategoryOrder = [],
  machineFilter = isMachineBlock,
  generatorFilter = isGeneratorBlock,
  blockProfiles = {},
  itemProfiles = {},
  includeBlockSection = true,
  includeEntitySection = false,
  itemCatalogColumns,
  howToPlay,
}) {
  const basePath = `/wiki/${id}`;
  const assetRoot = `/img/wiki/${id}`;
  const itemProfileOptions = {itemProfiles};
  const rawItems = manifest.content.items.map((entry) => normalizeItem(entry, itemProfileOptions));
  const items = (manifest.catalog?.items ?? manifest.content.items).map((entry) => normalizeItem(entry, itemProfileOptions));
  const allBlocks = includeBlockSection
    ? manifest.content.blocks.map((entry) => normalizeBlock(entry, {
      generatedCompressedRenders: id === 'utilitycraft',
      blockProfiles,
    }))
    : [];
  const entities = includeEntitySection
    ? manifest.content.entities.map(normalizeEntity).filter(entityFilter)
    : [];
  const craftingRecipeDetails = manifest.content.recipes.map(normalizeRecipe).filter(Boolean);
  const machineBlocks = allBlocks
    .filter((block) => machineFilter(block) || additionalMachineIds.includes(block.shortId))
    .map((block) => machineFromBlock(block, machineProfiles[block.shortId]));
  const generatorBlocks = allBlocks
    .filter((block) => generatorFilter(block) || additionalGeneratorIds.includes(block.shortId))
    .map((block) => generatorFromBlock(block, generatorProfiles[block.shortId]));
  const machineIds = new Set(machineBlocks.map((machine) => machine.id));
  const generatorIds = new Set(generatorBlocks.map((generator) => generator.id));
  const blocks = allBlocks.filter((block) => !machineIds.has(block.shortId) && !generatorIds.has(block.shortId));
  const machines = machineBlocks;
  const generators = generatorBlocks;
  const fallbackFace = machines
    .map((machine) => {
      const block = allBlocks.find((entry) => entry.slug === machine.blockSlug);
      return block?.render ?? block?.itemImage ?? block?.faces?.right;
    })
    .find(Boolean)
    ?? allBlocks.map((block) => block.render ?? block.itemImage ?? block.faces?.right).find(Boolean)
    ?? items.map((item) => item.image).find(Boolean);

  const groupSlugByIdentifier = items.reduce((lookup, item) => {
    lookup[item.identifier] = item.slug;
    item.variants?.forEach((variant) => {
      lookup[variant.identifier] = item.slug;
    });
    return lookup;
  }, {});
  const allItems = rawItems.map((item) => ({
    ...item,
    catalogSlug: groupSlugByIdentifier[item.identifier] ?? item.slug,
  }));
  const lookupItems = [
    ...allItems,
    ...dependencyProjects.flatMap((project) => (project.allItems ?? project.items).map((entry) => ({
      ...entry,
      assetRoot: project.assetRoot,
      basePath: project.basePath,
      entryType: 'items',
    }))),
  ];
  const lookupBlocks = [
    ...allBlocks.map((block) => {
      const entryType = machineIds.has(block.shortId)
        ? 'machines'
        : generatorIds.has(block.shortId)
          ? 'generators'
          : 'blocks';
      return {
        ...block,
        entryType,
        catalogSlug: entryType === 'blocks' ? block.slug : block.shortId,
      };
    }),
    ...dependencyProjects.flatMap((project) => project.blocks.map((entry) => ({
      ...entry,
      assetRoot: project.assetRoot,
      basePath: project.basePath,
      entryType: 'blocks',
    }))),
  ];

  const available = {
    overview: true,
    items: items.length > 0,
    blocks: includeBlockSection && blocks.length > 0,
    machines: machines.length > 0,
    generators: generators.length > 0,
    entities: includeEntitySection && entities.length > 0,
    recipes: craftingRecipeDetails.length > 0 || processingRecipes.length > 0,
    mechanics: mechanics.length > 0,
  };
  const wikiSections = SECTION_DEFINITIONS
    .filter((section) => available[section.id])
    .map((section) => ({
      ...section,
      href: section.id === 'overview' ? basePath : `${basePath}/${section.id}`,
    }));

  if (howToPlay?.pages?.length) {
    wikiSections.splice(1, 0, {
      id: 'how-to-play',
      label: howToPlay.title ?? 'How To Play',
      icon: 'help-circle',
      href: `${basePath}/how-to-play`,
      children: howToPlay.pages.map((page, index) => ({
        id: page.id,
        label: page.label,
        href: index === 0 ? `${basePath}/how-to-play` : `${basePath}/how-to-play/${page.id}`,
      })),
    });
  }

  const pageMeta = wikiSections.reduce((result, section) => {
    const pageName = section.id === 'overview' ? `${name} Wiki` : `${name} ${section.label}`;
    result[section.id] = [pageName, section.id === 'overview'
      ? overview.description
      : (sectionDescriptions[section.id] ?? SECTION_COPY[section.id])];
    return result;
  }, {});

  howToPlay?.pages?.forEach((page, index) => {
    const sectionId = index === 0 ? 'how-to-play' : `how-to-play/${page.id}`;
    pageMeta[sectionId] = [`${name} How To Play: ${page.label}`, page.intro ?? howToPlay.description];
  });

  return {
    id,
    name,
    wikiName: `${name} Wiki`,
    basePath,
    repository,
    assetRoot,
    wikiSections,
    pageMeta,
    sectionDescriptions: {...SECTION_COPY, ...sectionDescriptions},
    stationMeta: buildStationMeta([...craftingRecipeDetails, ...processingRecipes], allBlocks, assetRoot, dependencyProjects),
    recipeFallbackFace: fallbackFace,
    fallbackImage: items.map((item) => item.image).find(Boolean) ?? fallbackFace,
    machineControllerIds: machines.reduce((result, machine) => {
      result[machine.id] = machine.blockSlug;
      return result;
    }, {}),
    items,
    allItems,
    lookupItems,
    lookupBlocks,
    allBlocks,
    blocks: includeBlockSection ? blocks : [],
    machines,
    machineCategoryOrder,
    itemCatalogColumns,
    generators,
    generatorCategoryOrder,
    entities: includeEntitySection ? entities : [],
    mechanics,
    craftingRecipes: craftingRecipeDetails,
    craftingRecipeDetails,
    processingRecipes,
    overview: {
      ...overview,
      heroImage: overview.heroImage ?? fallbackFace,
      heroImageAlt: overview.heroImageAlt ?? `${name} featured technology`,
    },
    machineNotice,
    mechanicsGuide,
    howToPlay,
  };
}
