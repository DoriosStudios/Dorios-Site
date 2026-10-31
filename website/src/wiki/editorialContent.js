// Editorial overlays stay separate from generated manifests. Values describe
// acquisition routes, not guaranteed yields or an exhaustive recipe list.
const pick = (locale, en, pt, es) => ({en, 'pt-BR': pt, 'es-MX': es}[locale] ?? en);
const recipeIndexes = new WeakMap();
function recipeInputs(recipe) {
  if (recipe.inputs?.length) return recipe.inputs;
  const slots = recipe.slots?.filter(Boolean);
  if (slots?.length) return slots;
  return String(recipe.input ?? '').split(' + ').flatMap((value) => {
    const match = value.match(/^(?:\d+×\s*)?([\w]+:[\w/.-]+)$/);
    return match ? [{id: match[1]}] : [];
  });
}

function resourceRecipes(project) {
  if (recipeIndexes.has(project)) return recipeIndexes.get(project);
  const index = new Map();
  for (const recipe of [...(project.processingRecipes ?? []), ...(project.craftingRecipeDetails ?? [])]) {
    const id = recipe.result?.id;
    if (!id) continue;
    const entries = index.get(id) ?? [];
    entries.push(recipe);
    index.set(id, entries);
  }
  recipeIndexes.set(project, index);
  return index;
}

function isResource(entry) {
  if (/trinket/i.test(entry.documentation?.basic?.itemType ?? '')) return false;
  const id = (entry.identifier ?? entry.id ?? '').split(':').pop();
  return /(?:_dust|_chunk|_pebble|_handful|_fragments|_shard|_essence|_ingot|_nugget|_plate|_crystal|_pellet|_rod)$/.test(id)
    || /^(?:raw_|brute_)/.test(id)
    || ['aetherium', 'titanium', 'tungsten', 'silicon', 'geode', 'fluxite', 'crushed_kelp', 'mud_ball'].includes(id);
}

function resourceOrigin(entry, project, locale, nameFor) {
  if (!isResource(entry)) return null;
  const id = (entry.identifier ?? entry.id).split(':').pop();
  const explicit = {
    aetherium_crystal: [
      'Found by mining Aetherium Ore in the End or deep in the Overworld, or assembled from shards recovered by advanced sieving. A crystalline starting point for Aetherium technology.',
      'Encontrado ao minerar Aetherium no End ou nas profundezas do Overworld, ou montado com fragmentos recuperados por peneiramento avançado. É um ponto de partida para a tecnologia de Aetherium.',
      'Se encuentra al extraer Aetherium en el End o en las profundidades del Overworld, o se forma con fragmentos recuperados mediante tamizado avanzado. Es un punto de partida para la tecnología de Aetherium.',
    ],
    raw_titanium: ['Recovered from Titanium Ore deep in the Overworld. Refine it into metal for advanced equipment and machinery.', 'Obtido de minérios de titânio nas profundezas do Overworld. Refine-o em metal para equipamentos e máquinas avançados.', 'Se obtiene del mineral de titanio en las profundidades del Overworld. Refínalo para fabricar equipo y maquinaria avanzados.'],
    raw_lead: ['Recovered by breaking Lead Ore, which can also be reconstructed from chunks obtained through sieving. Refine it for lead components.', 'Obtido ao quebrar minério de chumbo, que também pode ser reconstruído com fragmentos recuperados no peneiramento. Refine-o para produzir componentes de chumbo.', 'Se obtiene al romper mineral de plomo, que también se puede reconstruir con fragmentos recuperados mediante tamizado. Refínalo para producir componentes de plomo.'],
    aetherium: ['Forged in the Catalyst Weaver from advanced metals and a crystalline Aetherium source. This metal supports late-game machines, tools and armor.', 'Produzido no Catalyst Weaver a partir de metais avançados e uma fonte de Aetherium cristalino. Esse metal sustenta as máquinas, ferramentas e armaduras do fim da progressão.', 'Se produce en el Catalyst Weaver a partir de metales avanzados y una fuente de Aetherium cristalino. Este metal sustenta las máquinas, herramientas y armaduras del final de la progresión.'],
    aetherium_shard: ['Recovered through high-tier sieving and advanced ore or residue processing. Combine shards to form an Aetherium Crystal.', 'Recuperado no peneiramento de alto nível e no processamento avançado de minérios ou resíduos. Reúna fragmentos para formar um Cristal de Aetherium.', 'Se recupera mediante tamizado de alto nivel y procesamiento avanzado de minerales o residuos. Reúne fragmentos para formar un Cristal de Aetherium.'],
    titanium: ['Refined from titanium-bearing ore, raw material or dust. This durable metal bridges industrial infrastructure and Aetherium technology.', 'Refinado a partir de minério, material bruto ou pó de titânio. Esse metal durável faz a transição da infraestrutura industrial para a tecnologia de Aetherium.', 'Se refina a partir de mineral, material en bruto o polvo de titanio. Este metal duradero conecta la infraestructura industrial con la tecnología de Aetherium.'],
    tungsten: ['Refined from tungsten-bearing material recovered in deep Overworld rock and the Nether. Used in reinforced and high-energy machine components.', 'Refinado a partir de materiais com tungstênio encontrados nas rochas profundas do Overworld e no Nether. Usado em componentes de máquinas reforçados e de alta energia.', 'Se refina a partir de materiales con tungsteno encontrados en las rocas profundas del Overworld y en el Nether. Se utiliza en componentes de máquinas reforzados y de alta energía.'],
    steel_ingot: ['Produced by infusing iron with coal or charcoal, or by smelting prepared steel material. A structural metal for machines, tools and industrial components.', 'Produzido ao infundir ferro com carvão ou carvão vegetal, ou ao fundir materiais de aço preparados. É um metal estrutural para máquinas, ferramentas e componentes industriais.', 'Se produce al infundir hierro con carbón o carbón vegetal, o al fundir materiales de acero preparados. Es un metal estructural para máquinas, herramientas y componentes industriales.'],
    energized_iron_ingot: ['Produced by infusing iron with Redstone or by refining prepared energized iron. Used in powered components and energy infrastructure.', 'Produzido ao infundir ferro com redstone ou ao refinar ferro energizado preparado. Usado em componentes energizados e infraestrutura de energia.', 'Se produce al infundir hierro con redstone o al refinar hierro energizado preparado. Se utiliza en componentes energizados e infraestructura de energía.'],
    raw_tungsten: ['Recovered from Tungsten Ore in deep Overworld rock and the Nether. Refine it for reinforced industrial components.', 'Obtido de minérios de tungstênio nas rochas profundas do Overworld e no Nether. Refine-o para produzir componentes industriais reforçados.', 'Se obtiene del mineral de tungsteno en las rocas profundas del Overworld y en el Nether. Refínalo para producir componentes industriales reforzados.'],
    raw_tin: ['Recovered by processing tin-bearing chunks from sieving. Refine it for tin components and bronze alloys.', 'Obtido ao processar fragmentos de estanho recuperados no peneiramento. Refine-o para produzir componentes de estanho e ligas de bronze.', 'Se obtiene al procesar fragmentos de estaño recuperados mediante tamizado. Refínalo para producir componentes de estaño y aleaciones de bronce.'],
    raw_uranium: ['Mined from deep uranium ore or recovered by processing uranium-bearing chunks from sieving. It starts the refining chain for nuclear materials.', 'Minerado de depósitos profundos de urânio ou obtido ao processar fragmentos recuperados no peneiramento. Inicia a cadeia de refino dos materiais nucleares.', 'Se extrae de depósitos profundos de uranio o se obtiene al procesar fragmentos recuperados mediante tamizado. Inicia la cadena de refinado de materiales nucleares.'],
    silicon: ['Obtained by heating Quartz Dust. This refined material is used in electronic components and automation.', 'Obtido ao aquecer pó de quartzo. Esse material refinado é usado em componentes eletrônicos e automação.', 'Se obtiene al calentar polvo de cuarzo. Este material refinado se utiliza en componentes electrónicos y automatización.'],
    fluxite: ['Created in an Infuser using Diamond Dust and Quartz. It is a base material for digital storage components.', 'Criado em um Infuser com pó de diamante e quartzo. É um material básico dos componentes de armazenamento digital.', 'Se crea en un Infuser con polvo de diamante y cuarzo. Es un material básico de los componentes de almacenamiento digital.'],
    void_essence: ['Extracted from crushed Endstone in the Catalyst Weaver using a glass bottle. It carries the End’s essence into advanced processing.', 'Extraída de pedra do End triturada no Catalyst Weaver usando uma garrafa de vidro. Leva a essência do End ao processamento avançado.', 'Se extrae de piedra del End triturada en el Catalyst Weaver usando una botella de vidrio. Lleva la esencia del End al procesamiento avanzado.'],
    uranium_dust: ['Obtained by crushing uranium ore, raw uranium or refined uranium. Used in the chemical refining chain for nuclear fuel.', 'Obtido ao triturar minério, urânio bruto ou urânio refinado. Usado na cadeia de refino químico do combustível nuclear.', 'Se obtiene al triturar mineral, uranio en bruto o uranio refinado. Se utiliza en la cadena de refinado químico del combustible nuclear.'],
    uranium_pellet: ['Pressed from Uranium Ingots in an Electro Press. Used to assemble standard nuclear fuel rods.', 'Prensada a partir de lingotes de urânio na Prensa Elétrica. Usada para montar barras de combustível nuclear comum.', 'Se prensa a partir de lingotes de uranio en la Prensa Eléctrica. Se utiliza para fabricar barras de combustible nuclear común.'],
    tungsten_chunk: ['A legacy tungsten fragment. Current acquisition uses the deepslate and Nether tungsten chunks recovered through advanced sieving.', 'Um fragmento antigo de tungstênio. A obtenção atual usa os fragmentos de tungstênio de ardósia e do Nether recuperados no peneiramento avançado.', 'Un antiguo fragmento de tungsteno. La obtención actual utiliza los fragmentos de tungsteno de pizarra profunda y del Nether recuperados mediante tamizado avanzado.'],
  };
  if (explicit[id]) return pick(locale, ...explicit[id]);
  if (['andesite_pebble', 'diorite_pebble', 'granite_pebble', 'stone_pebble', 'dirt_handful', 'gravel_fragments', 'sand_handful'].includes(id)) return pick(locale,
    'Recovered by using a hammer on dirt or grass while sneaking. A simple surface resource for early crafting and material conversion.',
    'Recuperado ao usar um martelo na terra ou grama enquanto estiver agachado. É um recurso simples da superfície para fabricação inicial e conversão de materiais.',
    'Se recupera al usar un martillo sobre tierra o césped mientras te agachas. Es un recurso sencillo de la superficie para la fabricación inicial y la conversión de materiales.');
  if (['mud_ball', 'red_sand_handful'].includes(id)) return pick(locale,
    `Recovered by using a hammer on ${id === 'mud_ball' ? 'mud' : 'red sand or terracotta'} while sneaking. Can be assembled back into building material.`,
    `Recuperado ao usar um martelo em ${id === 'mud_ball' ? 'lama' : 'areia vermelha ou terracota'} enquanto estiver agachado. Pode ser reunido para formar material de construção.`,
    `Se recupera al usar un martillo sobre ${id === 'mud_ball' ? 'barro' : 'arena roja o terracota'} mientras te agachas. Se puede reunir para formar material de construcción.`);
  if (id.endsWith('_essence')) return pick(locale,
    'Captured from the corresponding creature using an Essence Vessel. Used to configure mechanical spawners.',
    'Capturada da criatura correspondente usando um Recipiente de Essência. Usada para configurar geradores mecânicos de criaturas.',
    'Se captura de la criatura correspondiente usando un Recipiente de Esencia. Se utiliza para configurar generadores mecánicos de criaturas.');
  const candidates = resourceRecipes(project).get(entry.identifier ?? entry.id) ?? [];
  // Prefer initial acquisition over unpacking a storage block or cloning the
  // resource itself. Inputs are identifiers; translated names never affect this.
  const score = (recipe) => {
    const inputs = recipeInputs(recipe);
    return (/siev|fisher/.test(recipe.station) ? 0 : /infus|catalyst/.test(recipe.station) ? 1 : /crusher|pulver|burn|inciner|furnace/.test(recipe.station) ? 2 : 4)
      + (inputs.some((input) => /_block$|_nugget$/.test(input.id) || input.id === (entry.identifier ?? entry.id)) ? 10 : 0);
  };
  const recipe = [...candidates].sort((a, b) => score(a) - score(b))[0];
  if (recipe) {
    const station = nameFor(`utilitycraft:${recipe.station}`) ?? project.stationMeta?.[recipe.station]?.label ?? recipe.station.replace(/[_-]/g, ' ');
    const input = recipeInputs(recipe)[0];
    const ingredient = input?.id ? nameFor(input.id) : null;
    if (/siev/.test(recipe.station)) return pick(locale,
      `Recovered by sieving${ingredient ? ` ${ingredient}` : ' compatible loose materials'}. Suitable mesh tiers unlock this resource for further processing.`,
      `Recuperado no peneiramento${ingredient ? ` de ${ingredient}` : ' de materiais compatíveis'}. Malhas de nível adequado liberam esse recurso para processamento.`,
      `Se recupera al tamizar${ingredient ? ` ${ingredient}` : ' materiales compatibles'}. Las mallas del nivel adecuado permiten obtener este recurso para procesarlo.`);
    return pick(locale,
      `Obtained through ${station}${ingredient ? ` processing of ${ingredient}` : ' recipes'}. Used as a material in the add-on’s crafting and processing chains.`,
      `Obtido em ${station}${ingredient ? ` a partir de ${ingredient}` : ' por meio de suas receitas'}. Serve como material nas cadeias de fabricação e processamento do addon.`,
      `Se obtiene en ${station}${ingredient ? ` a partir de ${ingredient}` : ' mediante sus recetas'}. Se utiliza como material en las cadenas de fabricación y procesamiento del addon.`);
  }
  return null;
}

const operationNote = (locale) => pick(locale,
  'Nominal estimates assume 20 game ticks/s. Stack size, filters, available items, free space, sided I/O and loaded chunks can reduce actual throughput.',
  'Estimativas nominais consideram 20 ticks de jogo/s. Tamanho das pilhas, filtros, itens disponíveis, espaço livre, entrada e saída por face e chunks carregados podem reduzir a vazão real.',
  'Las estimaciones nominales suponen 20 ticks de juego/s. El tamaño de las pilas, los filtros, los objetos disponibles, el espacio libre, las caras de entrada y salida y los chunks cargados pueden reducir el caudal real.');

function transportDocumentation(entry, project, locale) {
  const id = (entry.identifier ?? entry.id ?? '').split(':').pop();
  const l = (...values) => pick(locale, ...values);
  const fact = (labels, values) => [l(...labels), l(...values)];
  let description;
  let facts = [];
  const universal = project.id === 'ascendant-technology' && /^universal_(?:importer|exporter)$/.test(id);
  if ((project.id === 'utilitycraft' || universal) && /^(?:item|fluid|gas|multi|universal)_(?:importer|exporter)(?:_|$)/.test(id)) {
    const exporter = id.includes('exporter');
    const item = id.startsWith('item_') || id.startsWith('multi_') || universal;
    const multi = id.startsWith('multi_') || universal;
    description = exporter
      ? l('Extracts resources from the attached source inventory or tank and sends them to compatible destinations on the network.', 'Retira recursos do inventário ou tanque de origem conectado e os envia aos destinos compatíveis da rede.', 'Extrae recursos del inventario o tanque de origen conectado y los envía a destinos compatibles de la red.')
      : l('Receives network resources into the attached destination inventory or tank. The exporter performs the transfer.', 'Recebe os recursos da rede no inventário ou tanque de destino conectado. O Exporter executa a transferência.', 'Recibe los recursos de la red en el inventario o tanque de destino conectado. El Exporter realiza la transferencia.');
    facts.push(fact(['Direction', 'Direção', 'Dirección'], exporter ? ['Source → network → destination', 'Origem → rede → destino', 'Origen → red → destino'] : ['Network → attached destination', 'Rede → destino conectado', 'Red → destino conectado']));
    facts.push(fact(['Filter', 'Filtro', 'Filtro'], ['Install a Filter Upgrade: whitelist accepts listed resources; blacklist excludes them.', 'Instale uma Melhoria de Filtro: a lista de permissão aceita os recursos listados; a lista de bloqueio os exclui.', 'Instala una Mejora de Filtro: la lista de permitidos acepta los recursos indicados; la lista de bloqueados los excluye.']));
    if (item) facts.push(fact(['Empty item filter', 'Filtro de itens vazio', 'Filtro de objetos vacío'], exporter
      ? ['An empty whitelist blocks exports when filtering is installed; an empty blacklist allows all items.', 'Com filtro instalado, uma lista de permissão vazia bloqueia a exportação; uma lista de bloqueio vazia permite todos os itens.', 'Con el filtro instalado, una lista de permitidos vacía bloquea la exportación; una lista de bloqueados vacía permite todos los objetos.']
      : ['An empty importer item list accepts all items. The source exporter filter still applies.', 'Uma lista de itens vazia no Importer aceita todos os itens. O filtro do Exporter de origem continua valendo.', 'Una lista de objetos vacía en el Importer acepta todos los objetos. El filtro del Exporter de origen sigue aplicándose.']));
    facts.push(fact(['Routing modes', 'Modos de distribuição', 'Modos de distribución'], exporter
      ? ['Nearest prefers closer targets; Farthest prefers distant targets; Round Robin rotates the next target after a successful transfer.', 'Nearest prioriza os destinos mais próximos; Farthest prioriza os mais distantes; Round Robin alterna o próximo destino após uma transferência bem-sucedida.', 'Nearest prioriza los destinos más cercanos; Farthest prioriza los más lejanos; Round Robin alterna el siguiente destino tras una transferencia exitosa.']
      : ['Destination order is selected on the source exporter: Nearest, Farthest or Round Robin.', 'A ordem dos destinos é escolhida no Exporter de origem: Nearest, Farthest ou Round Robin.', 'El orden de los destinos se elige en el Exporter de origen: Nearest, Farthest o Round Robin.']));
    if (item) facts.push(fact(['Estimated item throughput', 'Vazão estimada de itens', 'Caudal estimado de objetos'], ['Exporter: one operation every 10 ticks, up to 64 items per operation; approximately 128 items/s with full stacks. Four Speed Upgrades raise the limit to five operations/cycle, up to 640 items/s.', 'Exporter: uma operação a cada 10 ticks, até 64 itens por operação; aproximadamente 128 itens/s com pilhas cheias. Quatro Melhorias de Velocidade elevam o limite a cinco operações/ciclo, até 640 itens/s.', 'Exporter: una operación cada 10 ticks, hasta 64 objetos por operación; aproximadamente 128 objetos/s con pilas completas. Cuatro Mejoras de Velocidad elevan el límite a cinco operaciones/ciclo, hasta 640 objetos/s.']));
    if (!item || multi) facts.push(fact(['Fluid and gas throughput', 'Vazão de líquidos e gases', 'Caudal de líquidos y gases'], ['Exporter budget: 4,000 mB per cycle, multiplied by 1–5 with Speed Upgrades. Each resource uses its own transfer budget.', 'Limite do Exporter: 4.000 mB por ciclo, multiplicado por 1–5 com Melhorias de Velocidade. Cada recurso usa seu próprio limite de transferência.', 'Límite del Exporter: 4.000 mB por ciclo, multiplicado por 1–5 con Mejoras de Velocidad. Cada recurso utiliza su propio límite de transferencia.']));
    if (multi) facts.push(fact(['Resource configuration', 'Configuração de recursos', 'Configuración de recursos'], ['Items, fluids and gases are configured separately in the endpoint menu.', 'Itens, líquidos e gases são configurados separadamente no menu do terminal.', 'Los objetos, líquidos y gases se configuran por separado en el menú del terminal.']));
    if (universal) facts.push(fact(['Energy connection', 'Conexão de energia', 'Conexión de energía'], ['Also connects the energy network through its enabled faces. Item, fluid and gas settings belong to their respective transfer systems.', 'Também conecta a rede de energia pelas faces habilitadas. Os ajustes de itens, líquidos e gases pertencem aos respectivos sistemas de transferência.', 'También conecta la red de energía por sus caras habilitadas. Los ajustes de objetos, líquidos y gases pertenecen a sus respectivos sistemas de transferencia.']));
    facts.push(fact(['Connections', 'Conexões', 'Conexiones'], ['Compatible pipe colors and enabled faces must connect the source and destinations. Configure faces with the Wrench; copy compatible settings with the Copy/Paste Tool.', 'Cores de tubos compatíveis e faces habilitadas precisam ligar a origem aos destinos. Configure as faces com a Chave Inglesa; copie ajustes compatíveis com a ferramenta de copiar e colar.', 'Los colores de tubos compatibles y las caras habilitadas deben conectar el origen con los destinos. Configura las caras con la Llave Inglesa; copia ajustes compatibles con la herramienta de copiar y pegar.']));
  } else if (project.id === 'utilitycraft' && /^(?:fluid|gas)_pipe(?:_|$)/.test(id)) {
    description = l('Connects compatible resource endpoints through an open pipe route.', 'Conecta terminais de recursos compatíveis por uma rota de tubos habilitada.', 'Conecta terminales de recursos compatibles mediante una ruta de tubos habilitada.');
    facts = [
      fact(['Connections', 'Conexões', 'Conexiones'], ['Resource type, compatible pipe colors and enabled connection faces determine the network route. Use the Wrench to configure faces.', 'O tipo de recurso, as cores compatíveis e as faces de conexão habilitadas determinam a rota da rede. Use a Chave Inglesa para configurar as faces.', 'El tipo de recurso, los colores compatibles y las caras de conexión habilitadas determinan la ruta de la red. Utiliza la Llave Inglesa para configurar las caras.']),
      fact(['Filter and routing', 'Filtro e distribuição', 'Filtro y distribución'], ['Configure resource selection and destination priority on the attached transfer endpoints.', 'Configure a seleção de recursos e a prioridade de destino nos terminais de transferência conectados.', 'Configura la selección de recursos y la prioridad de destino en los terminales de transferencia conectados.']),
      fact(['Throughput', 'Vazão', 'Caudal'], ['Throughput follows the connected exporter or pump budget and the destination’s available capacity.', 'A vazão segue o limite do Exporter ou da bomba conectada e a capacidade disponível no destino.', 'El caudal sigue el límite del Exporter o de la bomba conectada y la capacidad disponible en el destino.']),
    ];
  } else if (project.id === 'utilitycraft' && ['mechanic_hopper', 'mechanic_upper', 'mechanic_dropper', 'ender_hopper'].includes(id)) {
    const ender = id === 'ender_hopper';
    const directions = {
      mechanic_hopper: ['Pulls from above and outputs to the inventory in its facing direction.', 'Retira itens de cima e os envia ao inventário na direção de saída.', 'Extrae objetos de arriba y los envía al inventario en su dirección de salida.'],
      mechanic_upper: ['Pulls from below and outputs upward or toward its horizontal facing direction.', 'Retira itens de baixo e os envia para cima ou na direção horizontal de saída.', 'Extrae objetos de abajo y los envía hacia arriba o en su dirección de salida horizontal.'],
      mechanic_dropper: ['Pulls from the adjacent vertical source and ejects complete stacks into the world on the opposite side.', 'Retira itens da origem vertical adjacente e ejeta pilhas inteiras no mundo pelo lado oposto.', 'Extrae objetos del origen vertical adyacente y expulsa pilas completas al mundo por el lado opuesto.'],
      ender_hopper: ['Collects nearby dropped items and sends them to the inventory below.', 'Coleta itens soltos próximos e os envia ao inventário abaixo.', 'Recoge objetos sueltos cercanos y los envía al inventario inferior.'],
    };
    description = l(...directions[id]);
    facts = [
      fact(['Filter', 'Filtro', 'Filtro'], ['A Filter Upgrade enables a whitelist or blacklist by item type. The filter applies to collection and output.', 'Uma Melhoria de Filtro habilita uma lista de permissão ou bloqueio por tipo de item. O filtro vale para coleta e saída.', 'Una Mejora de Filtro habilita una lista de permitidos o bloqueados por tipo de objeto. El filtro se aplica a la recogida y a la salida.']),
      fact(['Estimated speed', 'Velocidade estimada', 'Velocidad estimada'], ['One cycle every 8 ticks (about 2.5 cycles/s). Each collection/output pass attempts 1–5 stacks with 0–4 Speed Upgrades: about 2.5–12.5 stack attempts/s per pass.', 'Um ciclo a cada 8 ticks (cerca de 2,5 ciclos/s). Cada etapa de coleta/saída tenta mover 1–5 pilhas com 0–4 Melhorias de Velocidade: cerca de 2,5–12,5 tentativas de pilha/s por etapa.', 'Un ciclo cada 8 ticks (unos 2,5 ciclos/s). Cada paso de recogida/salida intenta mover 1–5 pilas con 0–4 Mejoras de Velocidad: unos 2,5–12,5 intentos de pila/s por paso.']),
      fact(['Routing', 'Distribuição', 'Distribución'], ['Uses its physical output direction. Nearest, Farthest and Round Robin are network exporter modes, not hopper modes.', 'Usa sua direção física de saída. Nearest, Farthest e Round Robin são modos dos Exporters de rede.', 'Utiliza su dirección física de salida. Nearest, Farthest y Round Robin son modos de los Exporters de red.']),
    ];
    if (ender) facts.push(fact(['Collection radius', 'Raio de coleta', 'Radio de recogida'], ['Default: 3 blocks; each Range Upgrade adds 2 blocks, up to 11. The collection radius can be reduced in its menu.', 'Padrão: 3 blocos; cada Melhoria de Alcance adiciona 2 blocos, até 11. O raio de coleta pode ser reduzido no menu.', 'Predeterminado: 3 bloques; cada Mejora de Alcance añade 2 bloques, hasta 11. El radio se puede reducir en el menú.']));
    else if (id !== 'mechanic_dropper') facts.push(fact(['Collection sources', 'Origens da coleta', 'Orígenes de recogida'], ['Reads the adjacent inventory, or chest/hopper minecarts when enabled; also collects dropped items when no source inventory is present.', 'Lê o inventário adjacente ou carrinhos com baú/funil quando habilitado; também coleta itens soltos quando não há inventário de origem.', 'Lee el inventario adyacente o las vagonetas con cofre/tolva si está habilitado; también recoge objetos sueltos cuando no hay un inventario de origen.']));
  } else if (project.id === 'digital-storage' && ['import_buffer', 'export_buffer'].includes(id)) {
    const importing = id === 'import_buffer';
    description = importing
      ? l('Moves items from its input slots into the linked digital storage network.', 'Move itens dos slots de entrada para a rede de armazenamento digital vinculada.', 'Mueve objetos de sus ranuras de entrada a la red de almacenamiento digital vinculada.')
      : l('Withdraws selected items from the linked digital storage network into its output slots.', 'Retira os itens selecionados da rede de armazenamento digital vinculada e os coloca nos slots de saída.', 'Retira los objetos seleccionados de la red de almacenamiento digital vinculada y los coloca en las ranuras de salida.');
    facts = [
      fact(['Filter', 'Filtro', 'Filtro'], importing
        ? ['Imports the contents of its 18 input slots. External automation can control which items enter the buffer.', 'Importa o conteúdo de seus 18 slots de entrada. A automação externa pode controlar quais itens entram no buffer.', 'Importa el contenido de sus 18 ranuras de entrada. La automatización externa puede controlar qué objetos entran en el buffer.']
        : ['Nine sample slots select the item types to withdraw. Each sample feeds its own column of three output slots.', 'Nove slots de amostra selecionam os tipos de item a retirar. Cada amostra abastece sua própria coluna de três slots de saída.', 'Nueve ranuras de muestra seleccionan los tipos de objeto que se retiran. Cada muestra abastece su propia columna de tres ranuras de salida.']),
      fact(['Estimated speed', 'Velocidade estimada', 'Velocidad estimada'], ['Every 10 ticks: one stack operation, increased to nine with eight Speed Upgrades. At 20 ticks/s: about 2–18 stack operations/s, subject to available items and capacity.', 'A cada 10 ticks: uma operação de pilha, ampliada para nove com oito Melhorias de Velocidade. A 20 ticks/s: cerca de 2–18 operações de pilha/s, conforme os itens e a capacidade disponíveis.', 'Cada 10 ticks: una operación de pila, ampliada a nueve con ocho Mejoras de Velocidad. A 20 ticks/s: unas 2–18 operaciones de pila/s, según los objetos y la capacidad disponibles.']),
      fact(['Routing', 'Distribuição', 'Distribución'], ['Requires a linked, online storage network. Uses slot order rather than Nearest, Farthest or Round Robin.', 'Exige uma rede de armazenamento vinculada e ativa. Usa a ordem dos slots para distribuir os itens.', 'Requiere una red de almacenamiento vinculada y activa. Utiliza el orden de las ranuras para distribuir los objetos.']),
    ];
  } else if (project.id === 'ascendant-technology' && id.includes('conveyor')) {
    const tier = id.split('_')[0];
    const tiers = {copper: [1, 8], titanium: [2, 16], aetherium: [5, 32]};
    const routeCopy = {
      conveyor_router: ['Alternates available forward, left and right outputs.', 'Alterna as saídas disponíveis à frente, à esquerda e à direita.', 'Alterna las salidas disponibles al frente, a la izquierda y a la derecha.'],
      conveyor_sorter: ['Sends matching items forward first; other items alternate between side routes.', 'Envia os itens do filtro primeiro para a frente; os demais alternam entre as laterais.', 'Envía primero al frente los objetos del filtro; los demás alternan entre los lados.'],
      conveyor_inverted_sorter: ['Sends matching items to alternating side routes before trying the forward route.', 'Envia os itens do filtro para as laterais alternadas antes de tentar a saída à frente.', 'Envía los objetos del filtro a los lados alternados antes de intentar la salida al frente.'],
      conveyor_smart_router: ['Uses separate item filters for left, front and right outputs.', 'Usa filtros de item separados para as saídas esquerda, frontal e direita.', 'Utiliza filtros de objetos separados para las salidas izquierda, frontal y derecha.'],
      conveyor_overflow: ['Prioritizes the forward route; alternates side routes when the main path is blocked.', 'Prioriza a saída à frente; alterna as laterais quando o caminho principal está bloqueado.', 'Prioriza la salida al frente; alterna los lados cuando el camino principal está bloqueado.'],
      conveyor_underflow: ['Attempts insertion into side inventories first, alternating sides, then forwards the remainder.', 'Tenta inserir primeiro nos inventários laterais, alternando os lados, e envia o restante para a frente.', 'Intenta insertar primero en los inventarios laterales, alternando los lados, y envía el resto al frente.'],
      conveyor_junction: ['Keeps items moving straight through an intersection according to their entry direction.', 'Mantém os itens em linha reta na interseção conforme a direção de entrada.', 'Mantiene los objetos en línea recta en la intersección según la dirección de entrada.'],
    };
    description = routeCopy[id] ? l(...routeCopy[id]) : l('Moves dropped items along its oriented conveyor route.', 'Move itens soltos ao longo da esteira na direção configurada.', 'Mueve objetos sueltos a lo largo de la cinta en la dirección configurada.');
    facts.push(fact(['Routing', 'Distribuição', 'Distribución'], routeCopy[id] ?? ['The conveyor orientation defines travel direction; bridge transmitters and receivers carry items across a gap.', 'A orientação da esteira define a direção; transmissores e receptores de ponte transportam itens sobre um vão.', 'La orientación de la cinta define la dirección; los transmisores y receptores de puente transportan objetos sobre un espacio.']));
    facts.push(fact(['Filter', 'Filtro', 'Filtro'], /sorter|smart_router/.test(id)
      ? ['Configure the routing block’s item filter to select preferred outputs.', 'Configure o filtro de itens do bloco de distribuição para escolher as saídas preferenciais.', 'Configura el filtro de objetos del bloque de distribución para elegir las salidas preferidas.']
      : ['This part has no item whitelist or blacklist; use a Sorter or Smart Router to separate items.', 'Esta peça não possui lista de permissão ou bloqueio de itens; use um Sorter ou Smart Router para separá-los.', 'Esta pieza no tiene lista de permitidos o bloqueados; utiliza un Sorter o Smart Router para separar los objetos.']));
    if (tiers[tier]) {
      const [speed, range] = tiers[tier];
      facts.push(fact(['Estimated speed', 'Velocidade estimada', 'Velocidad estimada'], [`${speed} blocks/s along the conveyor. This measures travel speed, not items per second.`, `${speed} blocos/s ao longo da esteira. Mede a velocidade de deslocamento, não itens por segundo.`, `${speed} bloques/s a lo largo de la cinta. Mide la velocidad de desplazamiento, no objetos por segundo.`]));
      if (id.includes('bridge')) facts.push(fact(['Bridge range', 'Alcance da ponte', 'Alcance del puente'], [`Up to ${range} blocks.`, `Até ${range} blocos.`, `Hasta ${range} bloques.`]));
    }
  }
  if (!description) return null;
  return {
    description,
    section: {id: 'transport', title: l('Transport behavior', 'Funcionamento do transporte', 'Funcionamiento del transporte'), copy: description, facts, entries: [operationNote(locale)]},
  };
}

module.exports = {isResource, resourceOrigin, transportDocumentation};
