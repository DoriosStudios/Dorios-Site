import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import '@fontsource-variable/space-grotesk';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {getWikiProject} from '../../wiki/projects';
import {getProjectByWikiPath} from '../../data/projects';
import {projectCardPalette} from '../../data/cardPalettes';
import vanillaAssetIndex from '../../data/vanillaAssetIndex.json';
import styles from './styles.module.css';

const WikiProjectContext = createContext(null);

function useWikiProject() {
  const project = useContext(WikiProjectContext);
  if (!project) throw new Error('AddonWiki must be rendered inside a WikiProjectContext provider.');
  return project;
}

function resolveAsset(project, source) {
  if (!source) return null;
  if (/^(?:https?:)?\/\//.test(source) || source.startsWith('/')) return source;
  return `${project.assetRoot}/${source}`.replace(/([^:]\/)\/+/g, '$1');
}

function socialRender(source) {
  return source?.replace(/^\/img\/wiki\/([^/]+)\/renders\//, '/img/social/wiki/$1/renders/');
}

function entrySocialImage(project, entryType, entry, controller, recipe) {
  if (entryType === 'machines') {
    return resolveAsset(project, controller?.render ?? controller?.itemImage ?? controller?.image ?? Object.values(controller?.faces ?? {}).find(Boolean) ?? project.overview.heroImage);
  }
  if (entryType === 'items') return resolveAsset(project, entry.image ?? project.fallbackImage);
  if (entryType === 'blocks') return resolveAsset(project, entry.render ?? entry.itemImage ?? entry.image ?? Object.values(entry.faces ?? {}).find(Boolean) ?? project.fallbackImage);
  if (entryType === 'generators') return resolveAsset(project, entry.render ?? entry.itemImage ?? entry.image ?? Object.values(entry.faces ?? {}).find(Boolean) ?? project.fallbackImage);
  if (entryType === 'entities') return resolveAsset(project, entry.image ?? project.overview.heroImage);
  if (entryType === 'recipes') return visualFor(project, recipe?.result?.id ?? recipe?.result?.label) ?? resolveAsset(project, project.recipeFallbackFace ?? project.fallbackImage);
  return resolveAsset(project, project.mechanicsGuide?.image ?? project.overview.heroImage ?? project.fallbackImage);
}

function sectionSocialImage(project, section, itemCategory) {
  if (itemCategory) return resolveAsset(project, project.items.find(({category}) => categoriesInSection(itemCategory).includes(category))?.image ?? project.fallbackImage);
  if (section === 'items') return resolveAsset(project, project.items.find(({image}) => image)?.image ?? project.fallbackImage);
  if (section === 'blocks') {
    const block = (project.allBlocks ?? project.blocks)[0];
    return resolveAsset(project, block?.render ?? block?.itemImage ?? block?.image ?? Object.values(block?.faces ?? {}).find(Boolean) ?? project.fallbackImage);
  }
  if (section === 'machines') {
    const machine = project.machines[0];
    const block = (project.allBlocks ?? project.blocks).find(({slug}) => slug === (machine?.blockSlug ?? project.machineControllerIds?.[machine?.id]));
    return entrySocialImage(project, 'machines', machine, block);
  }
  if (section === 'generators') return entrySocialImage(project, 'generators', project.generators[0] ?? {});
  if (section === 'entities') return entrySocialImage(project, 'entities', project.entities[0] ?? {});
  if (section === 'mechanics') return resolveAsset(project, project.mechanicsGuide?.image ?? project.overview.heroImage);
  return resolveAsset(project, project.overview.heroImage ?? project.fallbackImage);
}

function WikiSearch({query, setQuery, placeholder}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const focusSearch = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <label className={styles.search}>
      <span aria-hidden="true">⌕</span>
      <span className={styles.srOnly}>Search this wiki section</span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder ?? 'Search wiki…'}
      />
      <kbd>Ctrl K</kbd>
    </label>
  );
}

function WikiFrame({active, query, setQuery, children}) {
  const project = useWikiProject();
  const catalogProject = getProjectByWikiPath(project.basePath);
  const activeSectionRef = useRef(null);

  useEffect(() => {
    activeSectionRef.current?.scrollIntoView({block: 'nearest', inline: 'center'});
  }, [active]);

  return (
    <DoriosMarketingShell activePage="wiki" project={catalogProject}>
      <main className={styles.wikiPage} style={projectCardPalette(project.id)}>
        <div className={styles.contextBar}>
          <div className={styles.breadcrumb}>
            <Link to="/projects">Projects</Link>
            {catalogProject && <><i aria-hidden="true" /><Link to={catalogProject.routes.project}>{catalogProject.name}</Link></>}
            <i aria-hidden="true" />
            <Link to={project.basePath}>{project.wikiName}</Link>
          </div>
          <WikiSearch query={query} setQuery={setQuery} />
        </div>

        <div className={styles.wikiLayout}>
          <aside className={styles.sidebar} aria-label={`${project.name} wiki sections`}>
            <p>{project.name}</p>
            <nav>
              {project.wikiSections.map((section) => (
                <Link
                  key={section.id}
                  to={section.href}
                  aria-current={active === section.id ? 'page' : undefined}
                  className={active === section.id ? styles.activeNav : undefined}
                  ref={active === section.id ? activeSectionRef : undefined}
                >
                  <span aria-hidden="true">{section.icon}</span>{section.label}
                </Link>
              ))}
            </nav>
            {project.repository && (
              <a className={styles.repoSideLink} href={project.repository} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.7 17.3 15.9 10M10.2 7.8h7v7" />
                  <path d="M17.2 12.8v5.4a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2V8.8a2 2 0 0 1 2-2h5.4" />
                </svg>
                <span>GitHub repository</span>
                <b aria-hidden="true">↗</b>
              </a>
            )}
          </aside>
          <div className={styles.content}>{children}</div>
        </div>
      </main>
    </DoriosMarketingShell>
  );
}

function PageIntro({section, count, countLabel, eyebrow}) {
  const project = useWikiProject();
  return (
    <header className={styles.pageIntro}>
      <p className={styles.eyebrow}>{eyebrow ?? `${project.name} index`}</p>
      <div>
        <h1>{project.pageMeta[section][0].replace(`${project.name} `, '')}</h1>
        {count !== undefined && <span><strong>{count}</strong> {countLabel}</span>}
      </div>
      <p>{project.sectionDescriptions[section]}</p>
    </header>
  );
}

function FilterChips({categories, active, setActive}) {
  return (
    <div className={styles.filterChips} aria-label="Filter categories">
      {categories.map(({name, count}) => (
        <button
          type="button"
          key={name}
          aria-pressed={active === name}
          className={active === name ? styles.activeChip : undefined}
          onClick={() => setActive(name)}
        >
          {name} <span>{count}</span>
        </button>
      ))}
    </div>
  );
}

function categoriesFor(entries) {
  const categoryCounts = entries.reduce((counts, entry) => {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    return counts;
  }, {});
  return [
    {name: 'All', count: entries.length},
    ...Object.entries(categoryCounts).map(([name, count]) => ({name, count})),
  ];
}

function categoriesInSection(section) {
  return section ? (section.categories ?? [section.label]) : [];
}

function sectionForItemCategory(project, category) {
  return project.itemCategorySections?.find((section) => categoriesInSection(section).includes(category));
}

function TierFlipbook({entry, className}) {
  const project = useWikiProject();
  const variants = entry.variants?.filter((variant) => variant.image) ?? [];
  const fallbackImage = entry.image ?? project.fallbackImage;
  const frameSources = variants.map((variant) => variant.image).join('|');
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (variants.length < 2) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      if (reduceMotion.matches || document.hidden) return;
      timer = window.setInterval(() => {
        setActiveFrame((current) => (current + 1) % variants.length);
      }, 1450);
    };
    const syncPlayback = () => {
      if (reduceMotion.matches) setActiveFrame(0);
      start();
    };

    setActiveFrame(0);
    variants.forEach((variant) => {
      const image = new Image();
      image.src = resolveAsset(project, variant.image);
    });
    start();
    document.addEventListener('visibilitychange', syncPlayback);
    reduceMotion.addEventListener('change', syncPlayback);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', syncPlayback);
      reduceMotion.removeEventListener('change', syncPlayback);
    };
  }, [entry.id, frameSources, project]);

  const frame = variants.length > 1 ? variants[activeFrame % variants.length] : {...entry, image: fallbackImage};

  return (
    <div
      className={`${className} ${variants.length > 1 ? styles.tierFlipbook : ''}`}
      aria-label={variants.length > 1 ? `${entry.name}, ${variants.length} levels shown in ascending order` : undefined}
    >
      {frame?.image ? <img
        className={styles.tierFlipbookFrame}
        key={`${frame.id ?? frame.image}-${activeFrame}`}
        src={resolveAsset(project, frame.image)}
        alt=""
        loading="lazy"
        aria-hidden="true"
      /> : <span className={styles.visualFallback} aria-hidden="true">◇</span>}
      {variants.length > 1 && <span className={styles.tierCount}>{variants.length} levels</span>}
    </div>
  );
}

function ItemCard({entry}) {
  const project = useWikiProject();
  return (
    <li className={styles.catalogListItem}>
      <Link className={styles.selectableCard} to={`${project.basePath}/items/${entry.slug}`}>
        <article className={`${styles.catalogRow} ${entry.summaryFacts ? styles.richCatalogRow : ''}`}>
        <TierFlipbook entry={entry} className={styles.itemImage} />
        <div className={styles.itemCopy}>
          <span>{entry.category}</span>
          <h2>{entry.name}</h2>
          <code>{entry.identifier ?? entry.id}</code>
        </div>
          {entry.summaryFacts && <dl className={styles.itemSummary}>{entry.summaryFacts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          <i className={styles.catalogArrow} aria-hidden="true">→</i>
        </article>
      </Link>
    </li>
  );
}

function BlockPreview({entry, size = 'min(100%, 7rem)'}) {
  const project = useWikiProject();
  const fallback = Object.values(entry.faces ?? {}).find(Boolean);
  const source = entry.render ?? entry.itemImage ?? entry.image ?? fallback;
  if (!source) return <div className={styles.blockFallback} style={{'--block-preview-size': size}} aria-hidden="true">◆</div>;
  const assetProject = entry.assetRoot ? {...project, assetRoot: entry.assetRoot} : project;
  return (
    <figure
      className={`${styles.blockPreview} ${entry.itemImage ? styles.itemBlockPreview : ''}`}
      style={{'--block-preview-size': size}}
    >
      <img src={resolveAsset(assetProject, source)} alt={`${entry.name} render`} loading="lazy" />
    </figure>
  );
}

function BlockCard({entry}) {
  const project = useWikiProject();
  return (
    <li className={styles.catalogListItem}>
      <Link className={styles.selectableCard} to={`${project.basePath}/blocks/${entry.slug}`}>
        <article className={styles.catalogRow}>
        <BlockPreview entry={entry} size="4.5rem" />
        <div className={styles.blockCopy}>
          <span>{entry.category}</span>
          <h2>{entry.name}</h2>
          {entry.tier && <div><b>{entry.tier}</b></div>}
        </div>
          <i className={styles.catalogArrow} aria-hidden="true">→</i>
        </article>
      </Link>
    </li>
  );
}

function formatIdentifier(identifier) {
  return identifier.replace(/^.*:/, '').replace(/[_/-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactEnergy(value) {
  const source = String(value ?? '').trim();
  const match = source.match(/([\d,.]+)\s*DE(\/t)?/i);
  if (!match) return source;
  const amount = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(amount)) return source;
  const unit = [
    [1e12, 'T'],
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
  ].find(([threshold]) => amount >= threshold);
  const compact = unit
    ? `${Number((amount / unit[0]).toFixed(amount / unit[0] >= 100 ? 0 : 1))}${unit[1]}`
    : String(amount);
  return `${compact}DE${match[2] ?? ''}`;
}

function catalogEntryFor(project, value) {
  const source = typeof value === 'object' && value !== null
    ? value.id ?? value.identifier ?? value.label ?? value.name ?? ''
    : value;
  const identifier = String(source).replace(/^\d+×\s*/, '').trim();
  const normalized = identifier.replace(/\s+\([^)]*\).*$/, '').trim().toLowerCase();
  return [...(project.lookupItems ?? project.allItems ?? project.items), ...(project.lookupBlocks ?? project.blocks)]
    .find((entry) => entry.id === identifier || entry.identifier === identifier || entry.shortId === identifier || entry.name.toLowerCase() === normalized);
}

const VANILLA_ASSET_ALIASES = {
  beetroot_seeds: 'seeds_beetroot',
  black_dye: 'dye_powder_black',
  blue_dye: 'dye_powder_blue',
  brown_dye: 'dye_powder_brown',
  clock: 'clock_item',
  cyan_dye: 'dye_powder_cyan',
  fermented_spider_eye: 'spider_eye_fermented',
  fishing_rod: 'fishing_rod_uncast',
  glow_ink_sac: 'dye_powder_glow',
  golden_apple: 'apple_golden',
  golden_axe: 'gold_axe',
  golden_carrot: 'carrot_golden',
  golden_hoe: 'gold_hoe',
  golden_pickaxe: 'gold_pickaxe',
  golden_shovel: 'gold_shovel',
  golden_sword: 'gold_sword',
  heart_of_the_sea: 'heartofthesea_closed',
  ink_sac: 'dye_powder_black',
  lava_bucket: 'bucket_lava',
  light_blue_dye: 'dye_powder_light_blue',
  light_gray_dye: 'dye_powder_silver',
  lime_dye: 'dye_powder_lime',
  magenta_dye: 'dye_powder_magenta',
  melon_seeds: 'seeds_melon',
  nether_brick: 'netherbrick',
  orange_dye: 'dye_powder_orange',
  pink_dye: 'dye_powder_pink',
  popped_chorus_fruit: 'chorus_fruit_popped',
  potion: 'potion_bottle_drinkable',
  pumpkin_seeds: 'seeds_pumpkin',
  purple_dye: 'dye_powder_purple',
  red_dye: 'dye_powder_red',
  redstone: 'redstone_dust',
  slime_ball: 'slimeball',
  water_bucket: 'bucket_water',
  wheat_seeds: 'seeds_wheat',
  white_dye: 'dye_powder_white',
  wooden_axe: 'wood_axe',
  wooden_hoe: 'wood_hoe',
  wooden_pickaxe: 'wood_pickaxe',
  wooden_shovel: 'wood_shovel',
  wooden_sword: 'wood_sword',
  yellow_dye: 'dye_powder_yellow',
};

function vanillaAssetFor(value) {
  const source = typeof value === 'object' && value !== null
    ? value.id ?? value.identifier ?? value.label ?? value.name
    : value;
  if (typeof source !== 'string') return null;
  const identifier = source.replace(/^\d+×\s*/, '').trim();
  const id = identifier.startsWith('minecraft:')
    ? identifier.slice('minecraft:'.length)
    : identifier.includes(':')
      ? null
      : identifier.toLowerCase().replace(/[\s/-]+/g, '_');
  if (!id) return null;
  const candidate = VANILLA_ASSET_ALIASES[id] ?? id;
  return vanillaAssetIndex[candidate] ?? null;
}

function visualFor(project, value) {
  const entry = catalogEntryFor(project, value);
  if (entry) {
    const assetProject = entry.assetRoot ? {...project, assetRoot: entry.assetRoot} : project;
    return resolveAsset(assetProject, entry.render ?? entry.image ?? entry.itemImage ?? entry.faces?.right ?? Object.values(entry.faces ?? {}).find(Boolean));
  }
  return vanillaAssetFor(value);
}

function detailLinkFor(project, value) {
  const entry = catalogEntryFor(project, value);
  if (!entry) return null;
  const entryType = entry.entryType ?? (entry.image ? 'items' : 'blocks');
  return `${entry.basePath ?? project.basePath}/${entryType}/${entry.catalogSlug ?? entry.slug}`;
}

function RecipeSlot({ingredient, result = false}) {
  const project = useWikiProject();
  if (!ingredient) return <span className={styles.emptySlot} aria-hidden="true" />;
  const image = visualFor(project, ingredient.id ?? ingredient.label);
  const name = ingredient.label ?? formatIdentifier(ingredient.id);
  const link = detailLinkFor(project, ingredient.id ?? ingredient.label);
  const content = (
    <>
      {image ? <img src={image} alt="" loading="lazy" /> : <span className={styles.slotFallback}>{name}</span>}
      {(ingredient.count ?? 1) > 1 && <b className={styles.slotCount}>{ingredient.count}</b>}
    </>
  );
  return link ? <Link className={`${styles.recipeSlot} ${result ? styles.resultSlot : ''}`} to={link} aria-label={name}>{content}</Link>
    : <span className={`${styles.recipeSlot} ${result ? styles.resultSlot : ''}`} title={name}>{content}</span>;
}

function normalizedProcessingRecipe(recipe) {
  if (recipe.slots && recipe.result) {
    return {
      ...recipe,
      slots: [...recipe.slots, ...Array(9)].slice(0, 9),
      result: {...recipe.result},
    };
  }
  const slots = Array(9).fill(null);
  recipe.input.split(' + ').forEach((raw, index) => {
    const match = raw.match(/^(\d+)×\s*(.*)$/);
    slots[index] = {label: match ? match[2] : raw, count: match ? Number(match[1]) : 1};
  });
  const outputMatch = recipe.output.match(/^(\d+)×\s*(.*)$/);
  return {
    ...recipe,
    slots,
    result: {label: outputMatch ? outputMatch[2] : recipe.output, count: outputMatch ? Number(outputMatch[1]) : 1},
  };
}

const LINEAR_PROCESSING_STATIONS = new Set(['crusher', 'electro_press', 'electro-press', 'incinerator']);

function isLinearProcessingRecipe(recipe) {
  return Boolean(
    recipe?.type
    && LINEAR_PROCESSING_STATIONS.has(recipe.station)
    && recipe.result
    && recipe.slots?.filter(Boolean).length === 1,
  );
}

function RecipeCard({recipe}) {
  const project = useWikiProject();
  const station = project.stationMeta[recipe.station] ?? {
    label: formatIdentifier(recipe.station),
    face: project.recipeFallbackFace,
  };
  const type = recipe.type ? 'processing' : 'crafting';
  const detailHref = `${project.basePath}/recipes/${type}-${recipe.id}`;
  const linear = isLinearProcessingRecipe(recipe);
  const linearInput = linear ? recipe.slots.find(Boolean) : null;

  return (
    <article className={`${styles.recipeCard} ${linear ? styles.linearRecipeCard : ''}`}>
      <header>
        {station.face
          ? <img src={resolveAsset(project, station.face)} alt="" />
          : <span className={styles.stationFallback} aria-hidden="true">▦</span>}
        <div><span>{station.label}</span><strong>{recipe.category}</strong></div>
        <Link
          to={detailHref}
          aria-label={`Open recipe for ${recipe.result.label ?? formatIdentifier(recipe.result.id)}`}
        >
          ↗
        </Link>
      </header>
      <div className={`${styles.recipeFlow} ${linear ? styles.linearRecipeFlow : ''}`}>
        {linear
          ? <RecipeSlot ingredient={linearInput} />
          : <div className={styles.craftingSlots}>{recipe.slots.map((ingredient, slot) => <RecipeSlot key={slot} ingredient={ingredient} />)}</div>}
        <span className={styles.recipeArrow} aria-hidden="true">→</span>
        <div className={styles.recipeResult}>
          <RecipeSlot ingredient={recipe.result} result />
          <strong>{recipe.result.label ?? formatIdentifier(recipe.result.id)}</strong>
        </div>
      </div>
    </article>
  );
}

function OverviewPage({query}) {
  const project = useWikiProject();
  const {
    assetRoot, blocks, craftingRecipes, entities = [], generators, items, machines, mechanics,
    overview, processingRecipes, wikiSections,
  } = project;
  const normalized = query.trim().toLowerCase();
  const searchMatches = useMemo(() => {
    if (!normalized) return [];
    const entries = [
      ...items.map((entry) => ({...entry, section: 'Items', href: `${project.basePath}/items`})),
      ...blocks.map((entry) => ({...entry, section: 'Blocks', href: `${project.basePath}/blocks`})),
      ...machines.map((entry) => ({...entry, section: 'Machines', href: `${project.basePath}/machines`})),
      ...generators.map((entry) => ({...entry, section: 'Generators', href: `${project.basePath}/generators`})),
      ...entities.map((entry) => ({...entry, section: 'Entities', href: `${project.basePath}/entities`})),
    ];
    return entries.filter((entry) => `${entry.name} ${entry.category ?? ''} ${entry.description}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [normalized]);

  const categoryCards = [
    {id: 'items', count: `${items.length} entries`, image: items.find((entry) => entry.image)?.image},
    {id: 'blocks', count: `${blocks.length} entries`, image: blocks.map((entry) => entry.itemImage ?? entry.render ?? entry.faces?.right).find(Boolean)},
    {
      id: 'machines',
      count: `${machines.length} systems`,
      image: machines.map((machine) => {
        const block = blocks.find((entry) => entry.slug === (machine.blockSlug ?? project.machineControllerIds?.[machine.id]));
        return block?.itemImage ?? block?.render ?? block?.faces?.right;
      }).find(Boolean),
    },
    {id: 'generators', count: `${generators.length} systems`, image: generators.map((entry) => entry.image ?? entry.faces?.right).find(Boolean)},
    {id: 'entities', count: `${entities.length} entries`, image: entities.find((entry) => entry.image)?.image},
    {id: 'recipes', count: `${craftingRecipes.length + processingRecipes.length} indexed`, image: project.fallbackImage},
    {id: 'mechanics', count: `${mechanics.length} topics`, image: project.mechanicsGuide?.image ?? overview.heroImage},
  ]
    .filter((card) => wikiSections.some((section) => section.id === card.id))
    .map((card) => ({
      ...card,
      copy: project.sectionDescriptions[card.id],
      image: card.image ?? project.fallbackImage,
    }));

  const defaultStats = [
    {label: 'Items', value: items.length},
    {label: 'Blocks', value: blocks.length},
    {label: 'Machines', value: machines.length},
    {label: 'Recipes', value: craftingRecipes.length + processingRecipes.length},
  ].filter((stat) => stat.value > 0);
  const stats = overview.stats ?? defaultStats;

  return (
    <>
      <section className={styles.overviewHero} aria-labelledby="wiki-title">
        <div>
          <p className={styles.eyebrow}>{overview.eyebrow}</p>
          <h1 id="wiki-title">{project.wikiName}</h1>
          <p>{overview.description}</p>
          <div className={styles.heroStats}>
            {stats.map((stat) => <span key={stat.label}><strong>{stat.value}</strong> {stat.label}</span>)}
          </div>
        </div>
        {overview.heroImage
          ? <img src={resolveAsset(project, overview.heroImage)} alt={overview.heroImageAlt} />
          : <span className={styles.overviewFallback} aria-hidden="true">◆</span>}
      </section>

      {normalized && (
        <section className={styles.searchResults} aria-live="polite">
          <p>{searchMatches.length} results for “{query}”</p>
          <div>
            {searchMatches.map((entry) => <Link key={`${entry.section}-${entry.name}`} to={entry.href}><span>{entry.section}</span><strong>{entry.name}</strong></Link>)}
          </div>
        </section>
      )}

      {overview.dependencyName && (
        <section className={styles.requirement}>
          <div><span>Required dependency</span><strong>{overview.dependencyName}</strong></div>
          <p>{overview.dependencyCopy}</p>
          {project.repository && <a href={project.repository} target="_blank" rel="noreferrer">Official repo <span aria-hidden="true">↗</span></a>}
        </section>
      )}

      <section className={styles.categoryGrid} aria-label="Wiki categories">
        {categoryCards.map((card) => {
          const section = wikiSections.find((entry) => entry.id === card.id);
          return (
            <Link key={card.id} to={section.href} className={styles.categoryCard} data-category={card.id}>
              {card.image
                ? <img src={resolveAsset(project, card.image)} alt="" />
                : <span className={styles.categoryFallback} aria-hidden="true">{section.icon}</span>}
              <div><strong>{section.label}</strong><span>{card.count}</span></div>
              <p>{card.copy}</p><b aria-hidden="true">→</b>
            </Link>
          );
        })}
      </section>

      {overview.shortcuts?.length > 0 && (
        <section className={styles.overviewShortcuts} aria-labelledby="overview-shortcuts-title">
          <header>
            <div>
              <p className={styles.eyebrow}>Browse by type</p>
              <h2 id="overview-shortcuts-title">Trinket categories</h2>
            </div>
            <p>Jump directly to the equipment slot or supporting item group you need.</p>
          </header>
          <div>
            {overview.shortcuts.map((shortcut) => (
              <Link key={shortcut.href} to={shortcut.href} className={styles.overviewShortcut}>
                {shortcut.image
                  ? <img src={resolveAsset(project, shortcut.image)} alt="" />
                  : <span aria-hidden="true">{shortcut.icon ?? '◇'}</span>}
                <strong>{shortcut.label}</strong>
                <small>{shortcut.count} {shortcut.count === 1 ? 'entry' : 'entries'}</small>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
        </section>
      )}

      {overview.steps?.length > 0 && (
        <section className={styles.getStarted}>
          <div><p className={styles.eyebrow}>Start here</p><h2>{overview.stepsTitle ?? 'Build your progression.'}</h2></div>
          <ol>
            {overview.steps.map((step, index) => (
              <li key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{step.title}</strong><p>{step.copy}</p></div></li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

function ItemsPage({query, categorySection}) {
  const project = useWikiProject();
  const {items} = project;
  const itemCatalogClass = project.itemCatalogColumns === 1 ? styles.simpleCatalogList : `${styles.simpleCatalogList} ${styles.itemCatalogList}`;
  const [category, setCategory] = useState('All');
  const fixedCategories = categoriesInSection(categorySection);
  const normalized = query.trim().toLowerCase();
  const visible = items.filter((entry) => {
    const matchesCategory = fixedCategories.length
      ? fixedCategories.includes(entry.category)
      : (category === 'All' || entry.category === category);
    return matchesCategory
      && `${entry.name} ${entry.category} ${entry.id} ${entry.description ?? ''}`.toLowerCase().includes(normalized);
  });
  const categoryOrder = project.itemCategoryOrder ?? [];
  const filters = categoriesFor(items).sort((left, right) => {
    if (left.name === 'All') return -1;
    if (right.name === 'All') return 1;
    const leftIndex = categoryOrder.indexOf(left.name);
    const rightIndex = categoryOrder.indexOf(right.name);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
  const grouped = visible.reduce((groups, item) => {
    (groups[item.category] ??= []).push(item);
    return groups;
  }, {});
  const groupedEntries = Object.entries(grouped).sort(([left], [right]) => {
    const leftIndex = categoryOrder.indexOf(left);
    const rightIndex = categoryOrder.indexOf(right);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
  return (
    <>
      <PageIntro section={categorySection?.id ?? 'items'} count={visible.length} countLabel="items found" />
      {!categorySection && <FilterChips categories={filters} active={category} setActive={setCategory} />}
      <p className={styles.resultCount}>{visible.length} entries shown</p>
      {project.groupItemsByCategory ? <div className={styles.itemGroups}>{groupedEntries.map(([groupName, entries]) => (
        <section className={styles.itemGroup} key={groupName}>
          <header><div><span>Item category</span><h2>{groupName}</h2></div><b>{entries.length}</b></header>
          <ul className={itemCatalogClass} aria-label={`${groupName} item catalog`}>
            {entries.map((entry) => <ItemCard key={entry.id} entry={entry} />)}
          </ul>
        </section>
      ))}</div> : <ul className={itemCatalogClass} aria-label={`${project.name} item catalog`}>
        {visible.map((entry) => <ItemCard key={entry.id} entry={entry} />)}
      </ul>}
      {!visible.length && <p className={styles.empty}>No items match the current filters.</p>}
    </>
  );
}

function BlocksPage({query}) {
  const project = useWikiProject();
  const {blocks, machines = [], generators = []} = project;
  const specializedBlockSlugs = new Set([
    ...machines.map((entry) => entry.blockSlug ?? entry.id),
    ...generators.map((entry) => entry.blockSlug ?? entry.id),
  ]);
  const [category, setCategory] = useState('All');
  const normalized = query.trim().toLowerCase();
  const visible = blocks.filter((entry) => !specializedBlockSlugs.has(entry.slug) && !specializedBlockSlugs.has(entry.shortId)
    && (category === 'All' || entry.category === category)
    && `${entry.name} ${entry.category} ${entry.tier} ${entry.id}`.toLowerCase().includes(normalized));
  return (
    <>
      <PageIntro section="blocks" count={blocks.length} countLabel="blocks found" />
      <FilterChips categories={categoriesFor(blocks)} active={category} setActive={setCategory} />
      <p className={styles.resultCount}>{visible.length} entries shown</p>
      <ul className={`${styles.simpleCatalogList} ${styles.blockCatalogList}`} aria-label={`${project.name} block catalog`}>
        {visible.map((entry) => <BlockCard key={entry.id} entry={entry} />)}
      </ul>
      {!visible.length && <p className={styles.empty}>No blocks match the current filters.</p>}
    </>
  );
}

function documentedMachine(machine) {
  const category = machine.category ?? 'Processing';
  const primaryResource = machine.primaryResource ?? 'Dorios Energy';
  const baseConsumption = machine.baseConsumption ?? machine.cost ?? 'Not documented';
  const energyCapacity = machine.energyCapacity
    ?? (machine.machineData?.energyCapacity > 0
      ? `${Number(machine.machineData.energyCapacity).toLocaleString('en-US')} DE`
      : machine.modules?.some((module) => /energy cell/i.test(module))
        ? 'Scales with Energy Cell modules'
        : 'Not applicable');
  const outputText = String(machine.output ?? '').toLowerCase();
  const productionType = machine.productionType
    ?? (/(?:item|material).*(?:fluid|liquid)|(?:fluid|liquid).*(?:item|material)/.test(outputText)
      ? 'Other'
      : /fluid|liquid|lava|water|cryofluid|steam|xp/.test(outputText)
      ? 'Fluid'
      : /world|placed|target|field|none|not applicable/.test(outputText) ? 'Other' : 'Item');
  const specifications = machine.specifications?.length ? machine.specifications : [
    ['Controller', machine.controller],
    ['Structure tier', machine.tier],
    ['Base consumption', baseConsumption],
    ['Energy capacity', energyCapacity],
    ['Production type', productionType],
    ['Compatible modules', machine.modules],
  ];
  return {
    ...machine,
    category,
    primaryResource,
    baseConsumption,
    energyCapacity,
    productionType,
    specifications,
    howItWorks: machine.howItWorks ?? [
      `Build a valid ${machine.tier ?? ''} structure around the ${machine.controller ?? 'machine controller'}.`.replace('valid  structure', 'valid structure'),
      `Supply ${machine.input?.toLowerCase() ?? 'the required inputs'} and connect Dorios Energy.`,
      `Collect ${machine.output?.toLowerCase() ?? 'the processed result'} from the configured output.`,
    ],
    io: machine.io ?? [
      ['Input', machine.input],
      ['Output', machine.output],
      ['Energy', machine.cost ?? 'Dorios Energy network'],
    ],
  };
}

const MACHINE_REFERENCE_GROUPS = [
  {
    id: 'specifications',
    title: 'Machine specifications',
    copy: 'Power, capacity, timing and upgrade limits verified in the add-on configuration.',
    matches: /energy|power|capacity|rate|cycle|duration|processing|upgrade|module|cost|consumption|budget/i,
  },
  {
    id: 'interface',
    title: 'Interface',
    copy: 'Inventory, controller, recipe and orientation details used to configure the machine.',
    matches: /inventory|container|controller|tier|orientation|recipe|crafting|batch|slot|tank|layout/i,
  },
  {
    id: 'behavior',
    title: 'I/O and behavior',
    copy: 'What the machine accepts, where results go and how it interacts with the world.',
    matches: null,
  },
];

function groupedMachineReferences(machine) {
  const grouped = Object.fromEntries(MACHINE_REFERENCE_GROUPS.map(({id}) => [id, []]));
  const seen = new Set();
  const ioValues = new Set(machine.io.map(([, value]) => String(value).trim().toLowerCase()));
  const add = (groupId, pair) => {
    const [label, value] = pair;
    if (value === undefined || value === null || value === '') return;
    const key = `${String(label).trim().toLowerCase()}|${String(value).trim().toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    grouped[groupId].push(pair);
  };

  machine.specifications.forEach((pair) => {
    const label = String(pair[0]);
    const groupId = /input|output|accept|produce|placement|target|operation|automation|working face|side config|range/i.test(label)
      ? 'behavior'
      : /inventory|container|controller|tier|orientation|recipe|crafting|batch|slot|tank|layout/i.test(label)
        ? 'interface'
        : MACHINE_REFERENCE_GROUPS[0].matches.test(label)
          ? 'specifications'
          : 'behavior';
    if (groupId === 'behavior' && ioValues.has(String(pair[1]).trim().toLowerCase())) return;
    add(groupId, pair);
  });
  machine.io.forEach((pair) => add('behavior', pair));

  return MACHINE_REFERENCE_GROUPS
    .map((group) => ({...group, items: grouped[group.id]}))
    .filter(({items}) => items.length > 0);
}

function MachinesPage({query}) {
  const project = useWikiProject();
  const {machineControllerIds = {}, machines} = project;
  const blocks = project.allBlocks ?? project.blocks;
  const documentedMachines = machines.map(documentedMachine);
  const categoryOrder = project.machineCategoryOrder ?? [];
  const [category, setCategory] = useState('All');
  const normalized = query.trim().toLowerCase();
  const visible = documentedMachines.filter((entry) => (category === 'All' || entry.category === category)
    && `${entry.name} ${entry.category} ${entry.tier} ${entry.recipe ?? ''} ${entry.description ?? ''} ${entry.input ?? ''} ${entry.output ?? ''} ${(entry.modules ?? []).join(' ')}`.toLowerCase().includes(normalized));
  const grouped = visible.reduce((groups, machine) => {
    (groups[machine.category] ??= []).push(machine);
    return groups;
  }, {});
  const categoryFilters = categoriesFor(documentedMachines).sort((left, right) => {
    if (left.name === 'All') return -1;
    if (right.name === 'All') return 1;
    const leftIndex = categoryOrder.indexOf(left.name);
    const rightIndex = categoryOrder.indexOf(right.name);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex)
      - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
  const groupedEntries = Object.entries(grouped).sort(([left], [right]) => {
    const leftIndex = categoryOrder.indexOf(left);
    const rightIndex = categoryOrder.indexOf(right);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex)
      - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
  return (
    <>
      <PageIntro section="machines" count={machines.length} countLabel="documented machines" eyebrow="Technical machine catalog" />
      {project.machineNotice && <div className={styles.technologyNotice}><strong>{project.machineNotice.title}</strong><p>{project.machineNotice.copy}</p></div>}
      <FilterChips categories={categoryFilters} active={category} setActive={setCategory} />
      <p className={styles.resultCount}>{visible.length} machines shown</p>
      <div className={styles.machineGroups}>
        {groupedEntries.map(([groupName, groupMachines]) => (
          <section className={styles.machineGroup} data-category={groupName.toLowerCase()} key={groupName}>
            <header><div><span>Machine category</span><h2>{groupName}</h2></div><b>{groupMachines.length}</b></header>
            <div className={styles.machineList}>
              {groupMachines.map((machine) => {
                const sequence = documentedMachines.findIndex((entry) => entry.id === machine.id) + 1;
                const controller = blocks.find((entry) => entry.slug === (machine.blockSlug ?? machineControllerIds[machine.id]));
                return (
                  <Link className={styles.selectableCard} to={`${project.basePath}/machines/${machine.id}`} key={machine.id}>
                    <article className={styles.machineCard}>
                      <div className={styles.machineVisual}>
                        {controller && <BlockPreview entry={controller} size="min(100%, 10rem)" />}
                        <span>Machine {String(sequence).padStart(2, '0')}</span>
                      </div>
                      <div className={styles.machineContent}>
                        <div className={styles.machineHeading}><div><span>{machine.category} · {machine.tier} tier</span><h3>{machine.name}</h3></div><b>{machine.primaryResource}</b></div>
                        <p className={styles.machineDescription}>{machine.description}</p>
                        <dl className={styles.machineSummary}>
                          <div><dt>Base consumption</dt><dd>{machine.baseConsumption}</dd></div>
                          <div><dt>Energy capacity</dt><dd>{machine.energyCapacity}</dd></div>
                          <div><dt>Production type</dt><dd>{machine.productionType}</dd></div>
                          <div><dt>Upgrades</dt><dd>{machine.modules?.length ? machine.modules.join(', ') : 'None'}</dd></div>
                        </dl>
                      </div>
                      <i className={styles.machineArrow} aria-hidden="true">→</i>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {!visible.length && <p className={styles.empty}>No machines match “{query}”.</p>}
    </>
  );
}

function GeneratorsPage({query}) {
  const project = useWikiProject();
  const {generators, generatorCategoryOrder = []} = project;
  const normalized = query.trim().toLowerCase();
  const visible = generators.filter((entry) => `${entry.name} ${entry.family ?? ''} ${entry.status ?? ''} ${entry.fuel ?? ''} ${entry.generationType ?? ''} ${entry.description ?? ''}`.toLowerCase().includes(normalized));
  const grouped = visible.reduce((groups, generator) => {
    const family = generator.family ?? generator.systemType ?? 'Energy systems';
    (groups[family] ??= []).push(generator);
    return groups;
  }, {});
  const sortedGroups = Object.entries(grouped)
    .sort(([left], [right]) => {
      const leftOrder = generatorCategoryOrder.indexOf(left);
      const rightOrder = generatorCategoryOrder.indexOf(right);
      return (leftOrder < 0 ? Number.MAX_SAFE_INTEGER : leftOrder) - (rightOrder < 0 ? Number.MAX_SAFE_INTEGER : rightOrder) || left.localeCompare(right);
    })
    .map(([family, entries]) => [family, [...entries].sort((left, right) => (
      (left.tierOrder ?? Number.MAX_SAFE_INTEGER) - (right.tierOrder ?? Number.MAX_SAFE_INTEGER)
      || left.name.localeCompare(right.name)
    ))]);
  return (
    <>
      <PageIntro section="generators" count={generators.length} countLabel="energy systems" eyebrow="Technology add-on section" />
      <div className={styles.generatorGroups}>
        {sortedGroups.map(([family, entries]) => (
          <section className={styles.generatorGroup} key={family}>
            <header><div><span>{entries[0].systemType === 'Generation' ? 'Generation family' : 'Energy infrastructure'}</span><h2>{family}</h2></div><b>{entries.length}</b></header>
            <div className={styles.generatorTierList}>
              {entries.map((generator) => (
                <Link className={styles.selectableCard} to={`${project.basePath}/generators/${generator.id}`} key={generator.id}>
                  <article className={styles.generatorCard}>
                    <div className={styles.generatorImage}>
                      {generator.faces
                        ? <BlockPreview entry={generator} size="min(100%, 6.5rem)" />
                        : generator.image
                          ? <img src={resolveAsset(project, generator.image)} alt="" loading="lazy" />
                          : <span className={styles.visualFallback} aria-hidden="true">◉</span>}
                    </div>
                    <div className={styles.generatorContent}>
                      <div><span>{generator.generationType ?? generator.systemType}</span><h3>{generator.name}</h3></div>
                      <dl>
                        {generator.systemType === 'Generation' && <>
                          <div>
                            <dt><span className={styles.generatorFullLabel}>Base generation</span><span className={styles.generatorCompactLabel}>Rate</span></dt>
                            <dd><span className={styles.generatorFullValue}>{generator.baseGeneration}</span><span className={styles.generatorCompactValue}>{compactEnergy(generator.baseGeneration)}</span></dd>
                          </div>
                          <div>
                            <dt><span className={styles.generatorFullLabel}>Energy capacity</span><span className={styles.generatorCompactLabel}>Capacity</span></dt>
                            <dd><span className={styles.generatorFullValue}>{generator.energyCapacity}</span><span className={styles.generatorCompactValue}>{compactEnergy(generator.energyCapacity)}</span></dd>
                          </div>
                        </>}
                        <div><dt>{generator.systemType === 'Generation' ? 'Generation type' : 'System type'}</dt><dd>{generator.generationType ?? generator.systemType}</dd></div>
                      </dl>
                    </div>
                    <i className={styles.machineArrow} aria-hidden="true">→</i>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      {!visible.length && <p className={styles.empty}>No generators match “{query}”.</p>}
    </>
  );
}

function EntitiesPage({query}) {
  const project = useWikiProject();
  const {entities} = project;
  const normalized = query.trim().toLowerCase();
  const visible = entities.filter((entry) => `${entry.name} ${entry.identifier} ${entry.category} ${entry.description ?? ''}`.toLowerCase().includes(normalized));
  return (
    <>
      <PageIntro section="entities" count={entities.length} countLabel="runtime entities" eyebrow="Implementation reference" />
      <section className={styles.entityGrid}>
        {visible.map((entry) => (
          <Link className={styles.selectableCard} to={`${project.basePath}/entities/${entry.slug ?? entry.id}`} key={entry.id}>
            <article className={styles.entityCard}>
              <div>{entry.image
                ? <img src={resolveAsset(project, entry.image)} alt="" loading="lazy" />
                : <span className={styles.visualFallback} aria-hidden="true">⊙</span>}</div>
              <span>{entry.category}</span><h2>{entry.name}</h2>
            </article>
          </Link>
        ))}
      </section>
      {!visible.length && <p className={styles.empty}>No entities match “{query}”.</p>}
    </>
  );
}

function RecipesPage({query}) {
  const project = useWikiProject();
  const {craftingRecipeDetails, craftingRecipes, processingRecipes, stationMeta} = project;
  const [stationFilter, setStationFilter] = useState('All');
  const normalized = query.trim().toLowerCase();
  const allRecipes = useMemo(() => [
    ...craftingRecipeDetails,
    ...processingRecipes.map(normalizedProcessingRecipe),
  ], []);
  const stationFilters = useMemo(() => {
    const counts = allRecipes.reduce((result, recipe) => {
      const label = stationMeta[recipe.station]?.label ?? formatIdentifier(recipe.station);
      result[label] = (result[label] ?? 0) + 1;
      return result;
    }, {});
    return [{name: 'All', count: allRecipes.length}, ...Object.entries(counts).map(([name, count]) => ({name, count}))];
  }, [allRecipes]);
  const visible = allRecipes.filter((recipe) => {
    const stationLabel = stationMeta[recipe.station]?.label ?? formatIdentifier(recipe.station);
    const matchesStation = stationFilter === 'All' || stationFilter === stationLabel;
    const searchable = `${recipe.identifier} ${recipe.category} ${stationLabel} ${recipe.slots.map((slot) => slot?.id ?? slot?.label ?? '').join(' ')} ${recipe.result.id ?? recipe.result.label}`.toLowerCase();
    return matchesStation && searchable.includes(normalized);
  });
  return (
    <>
      <PageIntro section="recipes" count={craftingRecipes.length + processingRecipes.length} countLabel="documented entries" />
      <FilterChips categories={stationFilters} active={stationFilter} setActive={setStationFilter} />
      <p className={styles.resultCount}>{visible.length} individual recipes shown.</p>
      <section className={styles.recipeGrid}>
        {visible.map((recipe) => <RecipeCard key={`${recipe.station}-${recipe.id}`} recipe={recipe} />)}
      </section>
      {!visible.length && <p className={styles.empty}>No recipes match the current search.</p>}
    </>
  );
}

function MechanicsPage({query}) {
  const project = useWikiProject();
  const {mechanics} = project;
  const normalized = query.trim().toLowerCase();
  const visible = mechanics.filter((entry) => `${entry.name} ${entry.description}`.toLowerCase().includes(normalized));
  return (
    <>
      <PageIntro section="mechanics" count={mechanics.length} countLabel="core systems" />
      <section className={styles.mechanicsGrid}>
        {visible.map((mechanic) => {
          const slug = mechanic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return <Link className={styles.selectableCard} to={`${project.basePath}/mechanics/${slug}`} key={mechanic.name}><article><span aria-hidden="true">{mechanic.icon}</span><div><h2>{mechanic.name}</h2></div></article></Link>;
        })}
      </section>
      {project.mechanicsGuide && (
        <section className={styles.structureGuide}>
          <div><p className={styles.eyebrow}>{project.mechanicsGuide.eyebrow}</p><h2>{project.mechanicsGuide.title}</h2><p>{project.mechanicsGuide.copy}</p></div>
          {project.mechanicsGuide.image && <img src={resolveAsset(project, project.mechanicsGuide.image)} alt={project.mechanicsGuide.imageAlt ?? ''} />}
        </section>
      )}
    </>
  );
}

function DetailFacts({facts}) {
  return (
    <dl className={styles.detailFacts}>
      {facts.filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join(', ') : value}</dd></div>)}
    </dl>
  );
}

function blockDetailFacts(entry) {
  const data = entry.blockData ?? {};
  const formattedBreakTime = data.breakTime !== undefined ? `${Number(data.breakTime).toLocaleString('en-US')} s` : null;
  const formattedResistance = typeof data.explosionResistance === 'number'
    ? `${Number(data.explosionResistance).toLocaleString('en-US')}`
    : data.explosionResistance;
  return [
    ['Category', entry.category],
    entry.tier && entry.tier !== 'Standard' && ['Tier', entry.tier],
    formattedBreakTime && ['Break time', formattedBreakTime],
    data.mineable === false && ['Mining', 'Cannot be mined'],
    formattedResistance && ['Explosion resistance', formattedResistance],
    data.tool && ['Preferred tool', data.tool],
    data.lightEmission !== undefined && ['Light emission', data.lightEmission],
    data.friction !== undefined && ['Friction', data.friction],
    data.mapColor && ['Map color', data.mapColor],
    data.lootTable && ['Loot table', data.lootTable],
    data.directional && ['Orientation', 'Directional placement'],
    ['Identifier', entry.identifier ?? entry.id],
  ].filter(Boolean);
}

function entryReferenceGroups(entryType, entry) {
  if (entryType === 'blocks') {
    const data = entry.blockData ?? {};
    const formattedBreakTime = data.breakTime !== undefined ? `${Number(data.breakTime).toLocaleString('en-US')} s` : null;
    const formattedResistance = typeof data.explosionResistance === 'number'
      ? Number(data.explosionResistance).toLocaleString('en-US')
      : data.explosionResistance;
    return [
      {
        id: 'specifications',
        title: 'Block Details',
        copy: 'Physical properties that affect placement, mining, and durability.',
        items: [
          formattedBreakTime && ['Break time', formattedBreakTime],
          formattedResistance && ['Explosion resistance', formattedResistance],
          data.tool && ['Preferred tool', data.tool],
          data.mineable === false && ['Mining', 'Cannot be mined'],
          data.lightEmission !== undefined && ['Light emission', data.lightEmission],
          data.friction !== undefined && ['Friction', data.friction],
        ].filter(Boolean),
      },
      {
        id: 'interface',
        title: 'Registry & placement',
        copy: 'Classification and world-facing behavior for this block.',
        items: [
          ['Category', entry.category],
          entry.tier && entry.tier !== 'Standard' && ['Tier', entry.tier],
          data.directional && ['Orientation', 'Directional placement'],
          data.mapColor && ['Map color', data.mapColor],
          data.lootTable && ['Loot table', data.lootTable],
          ['Identifier', entry.identifier ?? entry.id],
        ].filter(Boolean),
      },
    ].filter((group) => group.items.length);
  }

  return [
    {
      id: 'specifications',
      title: 'Generator Specifications',
      copy: 'Energy performance for this tier and generation method.',
      items: [
        entry.systemType === 'Generation' && ['Base generation', entry.baseGeneration],
        ['Energy capacity', entry.energyCapacity],
        ['Generation type', entry.generationType],
        ['Tier', entry.tier],
      ].filter(Boolean),
    },
    {
      id: 'behavior',
      title: 'Operation',
      copy: 'Inputs, output behavior, and operating conditions.',
      items: [
        ['System type', entry.systemType ?? entry.status],
        ['Fuel / condition', entry.fuel],
        ['Output', entry.output],
        ['Operational note', entry.risk],
        entry.components?.length > 0 && ['Components', entry.components],
      ].filter(Boolean).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    },
  ].filter((group) => group.items.length);
}

function EntryReference({entryType, groups}) {
  const isBlock = entryType === 'blocks';
  const title = isBlock ? 'Block Details' : 'Generator Specifications';
  const copy = isBlock
    ? 'Properties are grouped by physical behavior and registry data, rather than presented as a flat table.'
    : 'Performance and operation are separated so each energy system is easier to compare at a glance.';
  return (
    <section className={`${styles.machineReference} ${styles.entryReference}`} aria-labelledby="entry-reference">
      <header>
        <div><p className={styles.eyebrow}>Technical reference</p><h2 id="entry-reference">{title}</h2></div>
        <p>{copy}</p>
      </header>
      <div className={styles.machineReferenceGrid}>
        {groups.map((group, index) => (
          <section className={styles.machineReferenceGroup} data-group={group.id} key={group.id}>
            <div className={styles.machineReferenceHeading}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{group.title}</h3><p>{group.copy}</p></div>
            </div>
            <MachinePropertyList items={group.items} />
          </section>
        ))}
      </div>
    </section>
  );
}

function DetailIcon({name}) {
  const paths = {
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></>,
    capabilities: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    attributes: <><path d="M14.5 4.5 19.5 9.5M13 6l5 5M5 19l5.5-5.5M4 20l3-1 11-11-2-2L5 17l-1 3Z" /></>,
    passive: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
    active: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>,
    immunity: <><path d="M12 3 5 6v5c0 4.4 2.8 7.7 7 10 4.2-2.3 7-5.6 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    obtain: <><path d="M4 7h16v13H4zM8 7V4h8v3" /><path d="M4 11h16" /></>,
    entity: <><circle cx="12" cy="8" r="3" /><path d="M6 20c.5-4 2.5-6 6-6s5.5 2 6 6" /></>,
    structure: <><path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-6h4v6" /></>,
    biome: <><path d="M4 20h16M7 20v-6M17 20v-8M7 14c-3 0-4-4-1-6 0-4 6-4 6 0 3 2 1 6-2 6H7ZM17 12c-3 0-4-4-1-6 0-3 5-3 5 1 2 2 0 5-2 5h-2Z" /></>,
    recipe: <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></>,
    usage: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    related: <><path d="m10 13 4-4M8.5 15.5l-1.4 1.4a3 3 0 0 1-4.2-4.2l3.1-3.1a3 3 0 0 1 4.2 0" /><path d="m15.5 8.5 1.4-1.4a3 3 0 1 1 4.2 4.2l-3.1 3.1a3 3 0 0 1-4.2 0" /></>,
    used: <><path d="M5 4h11l3 3v13H5z" /><path d="M16 4v4h4M8 12h8M8 16h6" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name] ?? paths.info}</svg>;
}

function ItemSectionHeading({id, icon, children}) {
  return <h2 className={styles.itemSectionHeading} id={id}><span><DetailIcon name={icon} /></span>{children}</h2>;
}

function CopyIdentifierButton({identifier}) {
  const [copied, setCopied] = useState(false);
  async function copyIdentifier() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(identifier);
      else {
        const field = document.createElement('textarea');
        field.value = identifier;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" className={styles.copyIdentifier} onClick={copyIdentifier} aria-label={`Copy identifier ${identifier}`} title="Copy identifier">
      <DetailIcon name={copied ? 'check' : 'copy'} />
      <span className={styles.srOnly} aria-live="polite">{copied ? 'Identifier copied' : 'Copy identifier'}</span>
    </button>
  );
}

function meaningfulList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizedItemDocumentation(entry) {
  const facts = new Map((entry.detailFacts ?? []).map(([label, value]) => [label.toLowerCase(), value]));
  const source = entry.documentation ?? {};
  const capabilities = source.capabilities ?? {};
  return {
    description: source.description || entry.description || `${entry.name} is a ${String(entry.itemType ?? entry.category ?? 'registered item').toLowerCase()} in this add-on.`,
    basic: {
      itemType: source.basic?.itemType ?? facts.get('item type') ?? entry.itemType ?? entry.category ?? 'Registered item',
      equipSlot: source.basic?.equipSlot ?? facts.get('equip slot'),
      maximumStack: source.basic?.maximumStack ?? facts.get('maximum stack'),
      identifier: entry.identifier ?? entry.id,
    },
    capabilities: {
      attributeModifiers: meaningfulList(capabilities.attributeModifiers),
      passiveEffects: meaningfulList(capabilities.passiveEffects),
      activeEffects: meaningfulList(capabilities.activeEffects),
      specialAbility: capabilities.specialAbility,
      immunities: meaningfulList(capabilities.immunities),
    },
    acquisition: {
      entityDrops: meaningfulList(source.acquisition?.entityDrops),
      structures: meaningfulList(source.acquisition?.structures),
      biomes: meaningfulList(source.acquisition?.biomes),
    },
    usage: source.usage,
  };
}

function formatChance(chance) {
  if (chance === undefined || chance === null || Number.isNaN(Number(chance))) return null;
  return `${(Number(chance) * 100).toLocaleString('en-US', {maximumFractionDigits: 2})}% chance`;
}

function quantityLabel(source) {
  const minimum = source.minQuantity ?? source.min ?? source.count;
  const maximum = source.maxQuantity ?? source.max ?? source.count;
  if (minimum === undefined && maximum === undefined) return null;
  return minimum === maximum || maximum === undefined ? `${minimum} item${Number(minimum) === 1 ? '' : 's'}` : `${minimum}–${maximum} items`;
}

function capabilityGroups(capabilities) {
  return [
    capabilities.attributeModifiers.length && {id: 'attributes', title: 'Attribute Modifiers', icon: 'attributes', entries: capabilities.attributeModifiers, attributes: true},
    capabilities.passiveEffects.length && {id: 'passives', title: 'Passive Effects', icon: 'passive', entries: capabilities.passiveEffects},
    capabilities.activeEffects.length && {id: 'actives', title: 'Active Effects', icon: 'active', entries: capabilities.activeEffects},
    capabilities.specialAbility && {id: 'special', title: 'Special Ability', icon: 'active', entries: [capabilities.specialAbility]},
    capabilities.immunities.length && {id: 'immunities', title: 'Immunities', icon: 'immunity', entries: capabilities.immunities},
  ].filter(Boolean);
}

function CapabilityGroup({group}) {
  return (
    <section className={styles.capabilityGroup}>
      <header><DetailIcon name={group.icon} /><h3>{group.title}</h3></header>
      <ul>{group.entries.map((item, index) => <li key={`${item.name}-${index}`}>
        {group.attributes ? <><strong>{item.modifier}</strong><span>{item.name}</span></> : <><strong>{item.name}</strong>{item.description && <p>{item.description}</p>}{item.cooldown && <small>Cooldown: {item.cooldown}</small>}</>}
      </li>)}</ul>
    </section>
  );
}

function obtainingRecipes(project, entry) {
  const identifiers = itemIdentifiers(entry);
  const crafting = project.craftingRecipeDetails.filter((recipe) => identifiers.has(recipe.result?.id));
  const machine = project.processingRecipes
    .map(normalizedProcessingRecipe)
    .filter((recipe) => identifiers.has(recipe.result?.id));
  return {crafting, machine};
}

function itemIdentifiers(entry) {
  return new Set([entry.id, entry.identifier, ...(entry.variants ?? []).flatMap((variant) => [variant.id, variant.identifier])].filter(Boolean));
}

function recipesUsingItem(project, entry) {
  const identifiers = itemIdentifiers(entry);
  const recipes = [
    ...project.craftingRecipeDetails,
    ...project.processingRecipes.map(normalizedProcessingRecipe),
  ];
  return recipes.filter((recipe) => recipe.slots?.some((slot) => identifiers.has(slot?.id))).slice(0, 6);
}

function relatedItemsFor(project, entry, obtained, usedIn) {
  const identifiers = itemIdentifiers(entry);
  const sameCategory = (project.items ?? []).filter((candidate) => (
    candidate.category === entry.category && !identifiers.has(candidate.id) && !identifiers.has(candidate.identifier)
  ));
  const recipeNeighbours = [
    ...obtained.crafting.flatMap((recipe) => recipe.slots ?? []),
    ...obtained.machine.flatMap((recipe) => recipe.slots ?? []),
    ...usedIn.map((recipe) => recipe.result),
  ].map((value) => catalogEntryFor(project, value)).filter(Boolean);
  const seen = new Set();
  return [...recipeNeighbours, ...sameCategory].filter((candidate) => {
    const key = candidate.identifier ?? candidate.id;
    if (!key || identifiers.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}

function AcquisitionCard({icon, eyebrow, title, chance, quantity, note}) {
  return (
    <article className={styles.acquisitionCard}>
      <span className={styles.acquisitionIcon}><DetailIcon name={icon} /></span>
      <div><small>{eyebrow}</small><h3>{title}</h3>{note && <p>{note}</p>}<footer>{chance && <strong>{chance}</strong>}{quantity && <span>{quantity}</span>}</footer></div>
    </article>
  );
}

function RecipeResultLink({project, recipe}) {
  const target = catalogEntryFor(project, recipe.result);
  const href = detailLinkFor(project, recipe.result);
  const image = visualFor(project, recipe.result);
  const content = <><span className={styles.usedInVisual}>{image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true">◇</span>}</span><span><strong>{target?.name ?? formatIdentifier(recipe.result?.id)}</strong><small>{project.stationMeta[recipe.station]?.label ?? recipe.type ?? 'Recipe'}</small></span></>;
  return href ? <Link className={styles.usedInItem} to={href}>{content}</Link> : <div className={styles.usedInItem}>{content}</div>;
}

function RelatedItemCard({project, item}) {
  const href = detailLinkFor(project, item);
  const image = visualFor(project, item);
  const content = <><span className={styles.relatedItemVisual}>{image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true">◇</span>}</span><span><strong>{item.name}</strong><small>{item.itemType ?? item.category ?? 'Item'}</small></span></>;
  return href ? <Link className={styles.relatedItemCard} to={href}>{content}</Link> : <div className={styles.relatedItemCard}>{content}</div>;
}

function ItemDetail({entry, visual}) {
  const project = useWikiProject();
  const documentation = normalizedItemDocumentation(entry);
  const groups = capabilityGroups(documentation.capabilities);
  const recipes = obtainingRecipes(project, entry);
  const usedIn = recipesUsingItem(project, entry);
  const relatedItems = relatedItemsFor(project, entry, recipes, usedIn);
  const recipeCount = recipes.crafting.length + recipes.machine.length;
  const compactProcessingRecipes = recipes.crafting.length === 0
    && recipes.machine.length > 1
    && recipes.machine.every(isLinearProcessingRecipe);
  const basics = [
    ['Item Type', documentation.basic.itemType],
    ['Equip Slot', documentation.basic.equipSlot && documentation.basic.equipSlot !== 'Not a trinket slot' ? documentation.basic.equipSlot : null],
    ['Maximum Stack', documentation.basic.maximumStack],
    ['Add-on', project.name],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
  const hasAcquisition = recipeCount > 0 || documentation.acquisition.entityDrops.length > 0
    || documentation.acquisition.structures.length > 0 || documentation.acquisition.biomes.length > 0;
  const typeLabel = String(documentation.basic.itemType ?? entry.category ?? 'Item').toUpperCase();
  return (
    <article className={styles.itemDetailPage}>
      <header className={styles.itemDetailHero}>
        <div className={styles.itemDetailVisual}>{visual}</div>
        <div className={styles.itemDetailHeading}>
          <p className={styles.eyebrow}>Item · {typeLabel}</p><h1>{entry.name}</h1><p>{documentation.description}</p>
          {documentation.basic.identifier && <div className={styles.itemIdentifier}><span>Identifier</span><code>{documentation.basic.identifier}</code><CopyIdentifierButton identifier={documentation.basic.identifier} /></div>}
        </div>
      </header>

      <div className={styles.itemDetailLayout}>
      <section className={`${styles.itemEditorialSection} ${styles.itemBasicSection}`} aria-labelledby="item-basic-information">
        <ItemSectionHeading id="item-basic-information" icon="info">Basic Information</ItemSectionHeading>
        <dl className={styles.itemBasicList}>{basics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </section>

      {hasAcquisition && <section className={`${styles.itemEditorialSection} ${styles.itemObtainSection}`} aria-labelledby="item-obtain">
        <ItemSectionHeading id="item-obtain" icon="obtain">How to Obtain</ItemSectionHeading>
        <div className={styles.acquisitionGrid}>
          {documentation.acquisition.entityDrops.map((drop, index) => <AcquisitionCard key={`${drop.entity}-${index}`} icon="entity" eyebrow="Entity Drop" title={formatIdentifier(drop.entity)} chance={formatChance(drop.chance)} quantity={quantityLabel(drop)} />)}
          {documentation.acquisition.structures.map((loot, index) => {
            const dimension = loot.conditions?.dimension ? formatIdentifier(loot.conditions.dimension) : null;
            const structure = loot.structure === 'default' ? (dimension ? `${dimension} Loot` : 'World Loot') : formatIdentifier(loot.structure);
            return <AcquisitionCard key={`${loot.structure}-${index}`} icon="structure" eyebrow="Structure Loot" title={structure} chance={formatChance(loot.chance)} note={loot.table ?? loot.category} />;
          })}
          {documentation.acquisition.biomes.map((loot, index) => <AcquisitionCard key={`${loot.biome}-${index}`} icon="biome" eyebrow="Biome Loot" title={formatIdentifier(loot.biome)} chance={formatChance(loot.chance)} />)}
          {recipeCount > 0 && <section className={`${styles.recipeAcquisition} ${compactProcessingRecipes ? styles.compactRecipeAcquisition : ''}`}>
            <header><DetailIcon name="recipe" /><div><small>Recipes</small><h3>{recipeCount} documented recipe{recipeCount === 1 ? '' : 's'}</h3></div></header>
            <div>{recipes.crafting.map((recipe) => <RecipeCard key={`crafting-${recipe.id}`} recipe={recipe} />)}{recipes.machine.map((recipe) => <RecipeCard key={`machine-${recipe.id}`} recipe={recipe} />)}</div>
          </section>}
        </div>
      </section>}

      {groups.length > 0 && <section className={`${styles.itemEditorialSection} ${styles.itemCapabilitiesSection}`} aria-labelledby="item-capabilities">
        <ItemSectionHeading id="item-capabilities" icon="capabilities">Trinket Capabilities</ItemSectionHeading>
        <div className={styles.capabilityGrid}>{groups.map((group) => <CapabilityGroup key={group.id} group={group} />)}</div>
      </section>}

      {usedIn.length > 0 && <section className={`${styles.itemEditorialSection} ${styles.itemUsedInSection}`} aria-labelledby="item-used-in">
        <ItemSectionHeading id="item-used-in" icon="used">Used In</ItemSectionHeading>
        <div className={styles.usedInGrid}>{usedIn.map((recipe) => <RecipeResultLink project={project} recipe={recipe} key={`${recipe.type ?? 'recipe'}-${recipe.id}`} />)}</div>
      </section>}

      {relatedItems.length > 0 && <section className={`${styles.itemEditorialSection} ${styles.itemRelatedSection}`} aria-labelledby="item-related-items">
        <ItemSectionHeading id="item-related-items" icon="related">Related Items</ItemSectionHeading>
        <div className={styles.relatedItemGrid}>{relatedItems.map((item) => <RelatedItemCard project={project} item={item} key={item.identifier ?? item.id} />)}</div>
      </section>}

      {documentation.usage && <section className={`${styles.itemEditorialSection} ${styles.itemUsageSection}`} aria-labelledby="item-usage">
        <ItemSectionHeading id="item-usage" icon="usage">Usage</ItemSectionHeading>
        <div className={styles.itemUsage}><DetailIcon name="usage" /><p>{documentation.usage}</p></div>
      </section>}
      </div>
    </article>
  );
}

function MachinePropertyList({items, className = ''}) {
  return (
    <dl className={`${styles.machinePropertyList} ${className}`}>
      {items.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value], index) => (
        <div key={`${label}-${index}`}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join(', ') : value}</dd></div>
      ))}
    </dl>
  );
}

function MachineDetail({entry, controller, sequence}) {
  const machine = documentedMachine(entry);
  const directional = machine.machineData?.directional;
  const referenceGroups = groupedMachineReferences(machine);
  return (
    <>
      <article className={styles.machineDetailHero} data-category={machine.category.toLowerCase()}>
        <div className={styles.machineDetailVisual}>
          {controller ? <BlockPreview entry={controller} size="min(100%, 20rem)" /> : <span className={styles.visualFallback} aria-hidden="true">▦</span>}
          {directional && (
            <div className={styles.orientationLegend} aria-label="Machine orientation">
              <span><i aria-hidden="true" /> Front face</span>
              <span>Side I/O is configurable</span>
            </div>
          )}
        </div>
        <div className={styles.machineDetailHeading}>
          <p className={styles.eyebrow}>Machine {String(sequence).padStart(2, '0')} / {machine.category}</p>
          <h1>{machine.name}</h1>
          <p>{machine.description}</p>
          <div className={styles.machineHeroMeta}>
            <span><small>Tier</small>{machine.tier}</span>
            <span><small>Primary resource</small>{machine.primaryResource}</span>
          </div>
        </div>
      </article>

      <section className={styles.machineReference} aria-labelledby="machine-reference">
        <header>
          <div>
            <p className={styles.eyebrow}>Technical reference</p>
            <h2 id="machine-reference">Built to be understood</h2>
          </div>
          <p>Configuration values are separated from interface and behavior, so the information needed for a build is easier to scan.</p>
        </header>
        <div className={styles.machineReferenceGrid}>
          {referenceGroups.map((group, index) => (
            <section className={styles.machineReferenceGroup} data-group={group.id} key={group.id}>
              <div className={styles.machineReferenceHeading}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{group.title}</h3><p>{group.copy}</p></div>
              </div>
              <MachinePropertyList items={group.items} />
            </section>
          ))}
        </div>
      </section>

      <div className={styles.machineGuideGrid}>
        <section className={styles.howItWorks} aria-labelledby="how-it-works">
          <p className={styles.eyebrow}>Operation</p>
          <h2 id="how-it-works">How it works</h2>
          <ol>{machine.howItWorks.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
        </section>
      </div>
    </>
  );
}

function recipesRelatedTo(project, entry) {
  const identifiers = new Set([
    entry.id,
    entry.identifier,
    ...(entry.variants ?? []).flatMap((variant) => [variant.id, variant.identifier]),
  ].filter(Boolean));
  const relatedCrafting = project.craftingRecipeDetails.filter((recipe) => identifiers.has(recipe.result.id)
    || recipe.slots.some((slot) => identifiers.has(slot?.id)));
  const relatedProcessing = project.processingRecipes.filter((recipe) => `${recipe.input} ${recipe.output}`.toLowerCase().includes(entry.name.toLowerCase()));
  return [
    ...relatedCrafting.map((recipe) => ({...recipe, href: `${project.basePath}/recipes/crafting-${recipe.id}`})),
    ...relatedProcessing.map((recipe) => ({...recipe, href: `${project.basePath}/recipes/processing-${recipe.id}`})),
  ];
}

function RelatedRecipes({entry}) {
  const project = useWikiProject();
  const related = recipesRelatedTo(project, entry);
  if (!related.length) return null;
  return (
    <section className={styles.relatedSection}>
      <div><p className={styles.eyebrow}>Connected production</p><h2>Related recipes</h2></div>
      <div className={styles.relatedLinks}>
        {related.map((recipe) => <Link key={recipe.href} to={recipe.href}><span>{recipe.type ?? project.stationMeta[recipe.station]?.label ?? 'Crafting'}</span><strong>{formatIdentifier(recipe.result?.id ?? recipe.output ?? recipe.identifier)}</strong><b aria-hidden="true">→</b></Link>)}
      </div>
    </section>
  );
}

function AddonWikiEntryContent({entryType, slug}) {
  const project = useWikiProject();
  const {
    assetRoot, blocks, allBlocks, craftingRecipeDetails, entities = [], generators, machineControllerIds,
    machines, mechanics, items, processingRecipes, stationMeta, wikiSections,
  } = project;
  const [query, setQuery] = useState('');
  const mechanicEntries = mechanics.map((entry) => ({...entry, id: entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}));
  const collections = {items, blocks, machines, generators, entities, mechanics: mechanicEntries};
  let entry = collections[entryType]?.find((candidate) => (
    candidate.slug === slug || candidate.id === slug
  ));
  let recipe;

  if (entryType === 'recipes') {
    if (slug.startsWith('crafting-')) recipe = craftingRecipeDetails.find((candidate) => candidate.id === slug.replace(/^crafting-/, ''));
    if (slug.startsWith('processing-')) {
      const source = processingRecipes.find((candidate) => candidate.id === slug.replace(/^processing-/, ''));
      recipe = source ? normalizedProcessingRecipe(source) : undefined;
    }
    entry = recipe;
  }

  if (!entry) {
    return <Layout title="Entry not found"><WikiFrame active="overview" query={query} setQuery={setQuery}><p className={styles.empty}>This wiki entry could not be found.</p></WikiFrame></Layout>;
  }

  const itemCategorySection = entryType === 'items'
    ? sectionForItemCategory(project, entry.category)
    : undefined;
  const activeSection = itemCategorySection?.id ?? (entryType === 'mechanics' ? 'mechanics' : entryType);
  const title = recipe ? (recipe.result.label ?? formatIdentifier(recipe.result.id)) : entry.name;
  const entryTypeLabel = {items: 'Item', blocks: 'Block', machines: 'Machine', generators: 'Generator', entities: 'Entity', mechanics: 'Mechanic'}[entryType] ?? 'Wiki';
  const backHref = `${project.basePath}/${entryType === 'recipes' ? 'recipes' : activeSection}`;
  const backLabel = entryType === 'recipes' ? 'Recipes' : wikiSections.find((section) => section.id === activeSection)?.label;
  let visual;
  let facts = [];
  let referenceGroups;

  if (entryType === 'machines') {
    const controller = (allBlocks ?? blocks).find((candidate) => candidate.slug === (entry.blockSlug ?? machineControllerIds[entry.id]));
    const sequence = Math.max(1, machines.findIndex((machine) => machine.id === entry.id) + 1);
    const originalSocialImage = entrySocialImage(project, entryType, entry, controller);
    const machineSocialImage = socialRender(originalSocialImage);
    const hasGeneratedSocialImage = machineSocialImage !== originalSocialImage;
    return (
      <Layout title={`${title} — ${project.wikiName}`} description={entry.description} noFooter>
        <SocialMetadata
          title={title}
          parent={project.name}
          type={entryTypeLabel}
          description={entry.description}
          path={`${project.basePath}/${entryType}/${slug}`}
          image={machineSocialImage}
          imageAlt={`${title} render from ${project.name}`}
          imageWidth={hasGeneratedSocialImage ? 512 : undefined}
          imageHeight={hasGeneratedSocialImage ? 512 : undefined}
        />
        <WikiFrame active="machines" query={query} setQuery={setQuery}>
          <div className={styles.detailBack}><Link to={backHref}>← Back to {backLabel}</Link></div>
          <MachineDetail entry={entry} controller={controller} sequence={sequence} />
        </WikiFrame>
      </Layout>
    );
  }

  if (entryType === 'items') {
    const itemVisual = <TierFlipbook entry={entry} className={styles.detailItemVisual} />;
    return (
      <Layout title={`${title} — ${project.wikiName}`} description={entry.documentation?.description || entry.description || `${title} item in ${project.wikiName}.`} noFooter>
        <SocialMetadata
          title={title}
          parent={project.name}
          type={entryTypeLabel}
          description={entry.documentation?.description || entry.description}
          path={`${project.basePath}/${entryType}/${slug}`}
          image={entrySocialImage(project, entryType, entry)}
          imageAlt={`${title} from ${project.name}`}
        />
        <WikiFrame active={activeSection} query={query} setQuery={setQuery}>
          <div className={styles.detailBack}><Link to={backHref}>← Back to {backLabel}</Link></div>
          <ItemDetail entry={entry} visual={itemVisual} />
        </WikiFrame>
      </Layout>
    );
  }

  if (entryType === 'blocks') {
    visual = <div className={styles.detailCubeVisual}><BlockPreview entry={entry} size="min(100%, 17rem)" /></div>;
    facts = blockDetailFacts(entry);
    referenceGroups = entryReferenceGroups(entryType, entry);
  } else if (entryType === 'generators') {
    visual = <div className={styles.detailGuideVisual}>{entry.faces
      ? <BlockPreview entry={entry} size="min(100%, 17rem)" />
      : entry.image
        ? <img src={resolveAsset(project, entry.image)} alt="" />
        : <span className={styles.visualFallback} aria-hidden="true">◉</span>}</div>;
    facts = [
      ['System type', entry.systemType ?? entry.status],
      ['Tier', entry.tier],
      entry.systemType === 'Generation' && ['Base generation', entry.baseGeneration],
      ['Energy capacity', entry.energyCapacity],
      ['Generation type', entry.generationType],
      ['Fuel / condition', entry.fuel],
      ['Output', entry.output],
      ['Operational note', entry.risk],
      entry.components?.length > 0 && ['Components', entry.components],
    ].filter(Boolean);
    referenceGroups = entryReferenceGroups(entryType, entry);
  } else if (entryType === 'entities') {
    visual = <div className={styles.detailGuideVisual}>{entry.image
      ? <img src={resolveAsset(project, entry.image)} alt="" />
      : <span className={styles.visualFallback} aria-hidden="true">⊙</span>}</div>;
    facts = [['Category', entry.category], ['Identifier', entry.identifier], ['Entry type', 'Runtime entity']];
  } else if (entryType === 'mechanics') {
    visual = <div className={styles.detailMechanicVisual} aria-hidden="true">{entry.icon}</div>;
    facts = [['Entry type', 'Mechanic'], ['System', entry.name]];
  }

  return (
    <Layout title={`${title} — ${project.wikiName}`} description={recipe ? `Recipe for ${title}.` : (entry.description || `${title} entry in the ${project.wikiName}.`)} noFooter>
      <SocialMetadata
        title={title}
        parent={project.name}
        type={entryTypeLabel}
        description={recipe ? `Recipe for ${title}.` : entry.description}
        path={`${project.basePath}/${entryType}/${slug}`}
        image={entrySocialImage(project, entryType, entry, undefined, recipe)}
        imageAlt={`${title} from ${project.name}`}
      />
      <WikiFrame active={activeSection} query={query} setQuery={setQuery}>
        <div className={styles.detailBack}><Link to={backHref}>← Back to {backLabel}</Link></div>
        {recipe ? (
          <section className={styles.recipeDetail}>
            <div className={styles.detailHeading}><p className={styles.eyebrow}>Recipe entry</p><h1>{title}</h1><code>{recipe.identifier}</code></div>
            <RecipeCard recipe={recipe} />
            <DetailFacts facts={[
              ['Station', stationMeta[recipe.station]?.label ?? formatIdentifier(recipe.station)],
              ['Category', recipe.category],
              ['Used slots', recipe.slotCount],
              ['Recipe type', recipe.kind ?? 'Processing'],
              ['Energy', recipe.cost],
            ]} />
          </section>
        ) : (
          <>
            <article className={styles.detailHero}>
              {visual}
              <div className={styles.detailHeading}><p className={styles.eyebrow}>{entryTypeLabel} entry</p><h1>{entry.name}</h1>{entry.description && <p>{entry.description}</p>}</div>
            </article>
            {referenceGroups?.length ? <EntryReference entryType={entryType} groups={referenceGroups} /> : <DetailFacts facts={facts} />}
            {entryType === 'blocks' && <RelatedRecipes entry={entry} />}
          </>
        )}
      </WikiFrame>
    </Layout>
  );
}

export function AddonWikiEntryPage({projectId = 'heavy-machinery', ...props}) {
  const project = getWikiProject(projectId);
  return (
    <WikiProjectContext.Provider value={project}>
      <AddonWikiEntryContent {...props} />
    </WikiProjectContext.Provider>
  );
}

const pageComponents = {
  overview: OverviewPage,
  items: ItemsPage,
  blocks: BlocksPage,
  machines: MachinesPage,
  generators: GeneratorsPage,
  entities: EntitiesPage,
  recipes: RecipesPage,
  mechanics: MechanicsPage,
};

function AddonWikiContent({section}) {
  const project = useWikiProject();
  const [query, setQuery] = useState('');
  const itemCategory = project.itemCategorySections?.find(({id}) => id === section);
  const Page = itemCategory ? ItemsPage : (pageComponents[section] ?? OverviewPage);
  const [title, description] = project.pageMeta[section] ?? project.pageMeta.overview;
  const sectionNavigation = project.wikiSections.find(({id}) => id === section);
  const previewTitle = section === 'overview' ? project.wikiName : (sectionNavigation?.label ?? title.replace(`${project.name} `, ''));
  const previewType = section === 'overview' ? 'Wiki' : 'Wiki section';
  const previewPath = section === 'overview' ? project.basePath : (sectionNavigation?.href ?? `${project.basePath}/${section}`);

  return (
    <Layout title={title} description={description} noFooter>
      <SocialMetadata
        title={previewTitle}
        parent={project.name}
        type={previewType}
        description={description}
        path={previewPath}
        image={sectionSocialImage(project, section, itemCategory)}
        imageAlt={`${previewTitle} from ${project.name}`}
      />
      <WikiFrame active={section} query={query} setQuery={setQuery}>
        <Page query={query} categorySection={itemCategory} />
      </WikiFrame>
    </Layout>
  );
}

export default function AddonWiki({projectId = 'heavy-machinery', section = 'overview'}) {
  const project = getWikiProject(projectId);
  return (
    <WikiProjectContext.Provider value={project}>
      <AddonWikiContent section={section} />
    </WikiProjectContext.Provider>
  );
}
