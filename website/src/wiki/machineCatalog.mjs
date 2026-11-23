// Gallery summaries only. Detail pages retain their full operating descriptions.
// Functions were checked against the existing machine profiles and the matching
// Ascendant BP/scripts/features/machines and config/recipes implementations.
// Keep development/legacy status where it changes the machine's practical role.
const ascendantDescriptions = {
  abyssal_fisher: ['Catches fishing loot using a net and stored water.', 'Obtém recursos de pesca com uma rede e água armazenada.', 'Obtiene recursos de pesca con una red y agua almacenada.'],
  alchemical_station: ['Brews potions and upgrades their strength or duration.', 'Prepara poções e melhora sua potência ou duração.', 'Prepara pociones y mejora su potencia o duración.'],
  arc_press_forge: ['Presses materials using energy and steam.', 'Prensa materiais com energia e vapor.', 'Prensa materiales con energía y vapor.'],
  arcane_enchanter: ['Enchants equipment using lapis lazuli and stored experience.', 'Encanta equipamentos com lápis-lazúli e experiência armazenada.', 'Encanta equipo con lapislázuli y experiencia almacenada.'],
  catalyst_weaver: ['Combines materials, catalysts and fluid into advanced products.', 'Combina materiais, catalisadores e fluido para criar novos produtos.', 'Combina materiales, catalizadores y fluido para crear nuevos productos.'],
  centrifugal_siever: ['Sifts materials through a mesh using energy and steam.', 'Peneira materiais com uma malha, energia e vapor.', 'Tamiza materiales con una malla, energía y vapor.'],
  compactor: ['Compresses compatible materials into compact forms.', 'Comprime materiais compatíveis em formas compactadas.', 'Comprime materiales compatibles en formas compactadas.'],
  cryo_chamber: ['Legacy workstation combining freezing, Cryofluid production and stabilization.', 'Estação legada que reúne congelamento, produção de Cryofluid e estabilização.', 'Estación heredada de congelación, producción de Cryofluid y estabilización.'],
  cryo_freezer: ['Freezes food and crafts materials with cooling fluid.', 'Congela alimentos e produz materiais com fluido refrigerante.', 'Congela alimentos y fabrica materiales con fluido refrigerante.'],
  cryo_stabilizer: ['Stabilizes volatile materials with Cryofluid.', 'Estabiliza materiais voláteis com Cryofluid.', 'Estabiliza materiales volátiles con Cryofluid.'],
  cryofluid_synthesizer: ['Produces Cryofluid for other machines.', 'Produz Cryofluid para outras máquinas.', 'Produce Cryofluid para otras máquinas.'],
  decompactor: ['Returns compatible compacted materials to their component forms.', 'Descompacta materiais compatíveis para recuperar seus componentes.', 'Descompacta materiales compatibles para recuperar sus componentes.'],
  disenchanter: ['Extracts enchantments into books or converts them into experience.', 'Extrai encantamentos para livros ou os converte em experiência.', 'Extrae encantamientos a libros o los convierte en experiencia.'],
  dual_siever: ['Sifts materials through independent mesh lanes.', 'Peneira materiais em linhas independentes com malhas.', 'Tamiza materiales en líneas independientes con mallas.'],
  duplicator: ['Copies eligible items using a template and replication fluid.', 'Copia itens permitidos com um modelo e fluido de replicação.', 'Copia objetos permitidos con una plantilla y fluido de replicación.'],
  enchantment_station: ['Enchants, repairs and reinforces equipment, and recovers enchantments.', 'Encanta, repara e reforça equipamentos, além de recuperar encantamentos.', 'Encanta, repara y refuerza equipo, y recupera encantamientos.'],
  energizer: ['Converts compatible materials into energized products.', 'Converte materiais compatíveis em produtos energizados.', 'Convierte materiales compatibles en productos energizados.'],
  genetic_seed_synthesizer: ['Generates plant resources from seeds, soil and coolant.', 'Gera recursos de plantas com sementes, solo e refrigerante.', 'Genera recursos de plantas con semillas, suelo y refrigerante.'],
  impact_crusher: ['Crushes materials in parallel processing lanes.', 'Tritura materiais em linhas de processamento paralelas.', 'Tritura materiales en líneas de procesamiento paralelas.'],
  industrial_burner: ['Smelts materials using energy and liquid fuel.', 'Funde materiais com energia e combustível líquido.', 'Funde materiales con energía y combustible líquido.'],
  industrial_crucible: ['Processes mineral materials and collects lava as a byproduct.', 'Processa materiais minerais e coleta lava como subproduto.', 'Procesa materiales minerales y recoge lava como subproducto.'],
  laser_barrier: ['Projects an energy-powered barrier that damages entities on contact.', 'Projeta uma barreira de energia que causa dano a entidades ao toque.', 'Proyecta una barrera de energía que daña entidades al contacto.'],
  liquifier: ['Converts compatible solid materials into liquids.', 'Converte materiais sólidos compatíveis em líquidos.', 'Convierte materiales sólidos compatibles en líquidos.'],
  mob_magnet: ['Pulls nearby mobs toward a configured collection point.', 'Atrai criaturas próximas para um ponto de coleta configurado.', 'Atrae criaturas cercanas hacia un punto de recogida configurado.'],
  network_center: ['Monitors energy generation, consumption and connected devices.', 'Monitora geração, consumo de energia e dispositivos conectados.', 'Supervisa generación, consumo de energía y dispositivos conectados.'],
  pattern_placer: ['Places blocks in configurable patterns.', 'Coloca blocos em padrões configuráveis.', 'Coloca bloques en patrones configurables.'],
  pulverizer: ['Crushes materials into processed resources using steam.', 'Tritura materiais em recursos processados com vapor.', 'Tritura materiales en recursos procesados con vapor.'],
  refining_table: ['Rerolls equipment attributes and abilities through refinement.', 'Refina equipamentos para sortear novos atributos e habilidades.', 'Refina equipo para obtener nuevos atributos y habilidades.'],
  reinforcement_anvil: ['Repairs equipment and adds reinforcement.', 'Repara equipamentos e aplica reforços.', 'Repara equipo y aplica refuerzos.'],
  residue_processor: ['Recovers useful resources from compatible residues.', 'Recupera recursos úteis de resíduos compatíveis.', 'Recupera recursos útiles de residuos compatibles.'],
  seismic_breaker: ['Breaks blocks across a configurable work pattern.', 'Quebra blocos em um padrão de trabalho configurável.', 'Rompe bloques en un patrón de trabajo configurable.'],
  singularity_fabricator: ['Planned material compression into singularities; currently awaiting rework.', 'Compressão de materiais em singularidades planejada; aguarda reformulação.', 'Compresión de materiales en singularidades prevista; pendiente de rediseño.'],
  steam_boiler: ['Converts water into steam.', 'Converte água em vapor.', 'Convierte agua en vapor.'],
  vaporizer: ['Produces steam from water, Cryofluid or Saline Coolant.', 'Produz vapor com água, Cryofluid ou Saline Coolant.', 'Produce vapor con agua, Cryofluid o Saline Coolant.'],
  vaporworks_processor: ['Legacy steam processor retained for existing worlds.', 'Processador de vapor legado, mantido para mundos existentes.', 'Procesador de vapor heredado, conservado para mundos existentes.'],
  verdant_cultivator: ['Plants, grows and harvests supported crops.', 'Planta, cultiva e colhe plantações compatíveis.', 'Planta, cultiva y cosecha cultivos compatibles.'],
};

const ascendantCategories = {
  'Superior Machines': ['Processing, construction and farming machines.', 'Máquinas de processamento, construção e cultivo.', 'Máquinas de procesamiento, construcción y cultivo.'],
  'Unique Machines': ['Specialized production and automation systems.', 'Sistemas especializados de produção e automação.', 'Sistemas especializados de producción y automatización.'],
  'Equipment Management Machines': ['Enchanting, repair and equipment refinement.', 'Encantamento, reparo e refinamento de equipamentos.', 'Encantamiento, reparación y refinamiento de equipo.'],
  'Mob Grinding Machines': ['Mob collection and farm support.', 'Coleta de criaturas e apoio a fazendas.', 'Recogida de criaturas y apoyo a granjas.'],
  Utility: ['Additional material-processing tools.', 'Ferramentas adicionais de processamento de materiais.', 'Herramientas adicionales de procesamiento de materiales.'],
};

function localeIndex(locale) {
  return /^pt(?:-|$)/i.test(locale) ? 1 : /^es(?:-|$)/i.test(locale) ? 2 : 0;
}

/** Short gallery copy, scoped by project to avoid collisions between add-ons. */
export function machineCatalogDescription(projectId, machine, locale = 'en') {
  if (!machine) return '';
  const id = String(machine.id ?? machine.identifier ?? '').split(':').at(-1);
  if (projectId === 'ascendant-technology' && ascendantDescriptions[id]) {
    return ascendantDescriptions[id][localeIndex(locale)];
  }
  const description = typeof machine.description === 'string' ? machine.description.trim() : '';
  // These generated templates carry no task information. Omitting them is more
  // useful than presenting an invented function for an unfamiliar machine.
  if (!description || /^(?:Runs registered .+ recipes using Dorios Energy and its configured material interfaces|Provides .+ functionality as part of a Dorios automation network)\.?$/i.test(description)) return '';
  return description.match(/^.*?[.!?](?=\s|$)/u)?.[0] ?? description;
}

export function machineCategoryDescription(projectId, category, locale = 'en') {
  return projectId === 'ascendant-technology'
    ? ascendantCategories[category]?.[localeIndex(locale)] ?? ''
    : '';
}

export function machineCatalogResources(machine) {
  const data = machine.machineData ?? {}, resources = new Set();
  if (machine.productionType === 'Item' || /\b(?:items?|materials?|catalysts?|ores?|ingots?|blocks?|bottles?)\b/i.test(`${machine.input ?? ''} ${machine.output ?? ''}`)) resources.add('items');
  if (machine.productionType === 'Fluid' || data.fluidCapacity > 0) resources.add('fluids');
  if (machine.productionType === 'Gas' || data.gasCapacity > 0) resources.add('gases');
  return [...resources];
}
