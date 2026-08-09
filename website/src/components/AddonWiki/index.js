import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import '@fontsource-variable/space-grotesk';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {getWikiProject} from '../../wiki/projects';
import {getProjectByWikiPath} from '../../data/projects';
import {projectCardPalette} from '../../data/cardPalettes';
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
    const block = project.blocks[0];
    return resolveAsset(project, block?.render ?? block?.itemImage ?? block?.image ?? Object.values(block?.faces ?? {}).find(Boolean) ?? project.fallbackImage);
  }
  if (section === 'machines') {
    const machine = project.machines[0];
    const block = project.blocks.find(({slug}) => slug === (machine?.blockSlug ?? project.machineControllerIds?.[machine?.id]));
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
  const frames = variants.length > 1 ? [...variants, variants[0]] : [{...entry, image: fallbackImage}];
  const frameWidth = 100 / frames.length;
  const trackStyle = variants.length > 1 ? {
    '--flipbook-duration': `${variants.length * 1.45}s`,
    '--flipbook-end': `${-(100 * variants.length) / frames.length}%`,
    '--variant-count': variants.length,
    width: `${frames.length * 100}%`,
  } : undefined;

  return (
    <div
      className={`${className} ${variants.length > 1 ? styles.tierFlipbook : ''}`}
      aria-label={variants.length > 1 ? `${entry.name}, ${variants.length} levels shown in ascending order` : undefined}
    >
      {fallbackImage ? <div className={styles.tierFlipbookTrack} style={trackStyle}>
        {frames.filter((frame) => frame.image).map((frame, index) => (
          <img
            key={`${frame.id ?? frame.image}-${index}`}
            src={resolveAsset(project, frame.image)}
            alt=""
            loading="lazy"
            aria-hidden="true"
            style={{flex: `0 0 ${frameWidth}%`}}
          />
        ))}
      </div> : <span className={styles.visualFallback} aria-hidden="true">◇</span>}
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
  const source = entry.itemImage ?? entry.render ?? entry.image ?? fallback;
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
          <div><b>{entry.tier}</b><code>{entry.identifier ?? entry.id}</code></div>
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

function catalogEntryFor(project, value) {
  const normalized = value.replace(/^\d+×\s*/, '').replace(/\s+\([^)]*\).*$/, '').trim().toLowerCase();
  return [...(project.lookupItems ?? project.allItems ?? project.items), ...(project.lookupBlocks ?? project.blocks)]
    .find((entry) => entry.id === value || entry.identifier === value || entry.name.toLowerCase() === normalized);
}

function visualFor(project, value) {
  const entry = catalogEntryFor(project, value);
  if (!entry) return null;
  const assetProject = entry.assetRoot ? {...project, assetRoot: entry.assetRoot} : project;
  return resolveAsset(assetProject, entry.image ?? entry.itemImage ?? entry.render ?? entry.faces?.right ?? Object.values(entry.faces ?? {}).find(Boolean));
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

function RecipeCard({recipe}) {
  const project = useWikiProject();
  const station = project.stationMeta[recipe.station] ?? {
    label: formatIdentifier(recipe.station),
    face: project.recipeFallbackFace,
  };
  const type = recipe.type ? 'processing' : 'crafting';
  const detailHref = `${project.basePath}/recipes/${type}-${recipe.id}`;

  return (
    <article className={styles.recipeCard}>
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
      <div className={styles.recipeFlow}>
        <div className={styles.craftingSlots}>{recipe.slots.map((ingredient, slot) => <RecipeSlot key={slot} ingredient={ingredient} />)}</div>
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
    assetRoot, blocks, craftingRecipes, entities, generators, items, machines, mechanics,
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
          <ul className={styles.simpleCatalogList} aria-label={`${groupName} item catalog`}>
            {entries.map((entry) => <ItemCard key={entry.id} entry={entry} />)}
          </ul>
        </section>
      ))}</div> : <ul className={styles.simpleCatalogList} aria-label={`${project.name} item catalog`}>
        {visible.map((entry) => <ItemCard key={entry.id} entry={entry} />)}
      </ul>}
      {!visible.length && <p className={styles.empty}>No items match the current filters.</p>}
    </>
  );
}

function BlocksPage({query}) {
  const project = useWikiProject();
  const {blocks} = project;
  const [category, setCategory] = useState('All');
  const normalized = query.trim().toLowerCase();
  const visible = blocks.filter((entry) => (category === 'All' || entry.category === category)
    && `${entry.name} ${entry.category} ${entry.tier} ${entry.id}`.toLowerCase().includes(normalized));
  return (
    <>
      <PageIntro section="blocks" count={blocks.length} countLabel="blocks found" />
      <FilterChips categories={categoriesFor(blocks)} active={category} setActive={setCategory} />
      <p className={styles.resultCount}>{visible.length} entries shown</p>
      <ul className={styles.simpleCatalogList} aria-label={`${project.name} block catalog`}>
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
  const {blocks, machineControllerIds = {}, machines} = project;
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
  const {generators} = project;
  const normalized = query.trim().toLowerCase();
  const visible = generators.filter((entry) => `${entry.name} ${entry.status ?? ''} ${entry.fuel ?? ''} ${entry.description ?? ''}`.toLowerCase().includes(normalized));
  return (
    <>
      <PageIntro section="generators" count={generators.length} countLabel="energy systems" eyebrow="Technology add-on section" />
      <section className={styles.generatorList}>
        {visible.map((generator) => (
          <Link className={styles.selectableCard} to={`${project.basePath}/generators/${generator.id}`} key={generator.id}>
            <article className={styles.generatorCard}>
              <div className={styles.generatorImage}>
                {generator.faces
                  ? <BlockPreview entry={generator} size="min(100%, 15rem)" />
                  : generator.image
                    ? <img src={resolveAsset(project, generator.image)} alt="" loading="lazy" />
                    : <span className={styles.visualFallback} aria-hidden="true">◉</span>}
                {generator.status && <span className={generator.status === 'Experimental' ? styles.experimental : undefined}>{generator.status}</span>}
              </div>
              <div className={styles.generatorContent}>
                <span>{generator.tier} {generator.systemType?.toLowerCase() ?? 'energy system'}</span><h2>{generator.name}</h2>
                <dl><div><dt>Input</dt><dd>{generator.fuel}</dd></div><div><dt>Output</dt><dd>{generator.output}</dd></div><div><dt>Operational note</dt><dd>{generator.risk}</dd></div></dl>
                {(generator.components ?? []).length > 0 && <div className={styles.moduleList}>{generator.components.map((component) => <span key={component}>{component}</span>)}</div>}
              </div>
            </article>
          </Link>
        ))}
      </section>
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
  const identifiers = new Set([entry.id, entry.identifier, ...(entry.variants ?? []).flatMap((variant) => [variant.id, variant.identifier])].filter(Boolean));
  return project.craftingRecipeDetails.filter((recipe) => identifiers.has(recipe.result?.id));
}

function AcquisitionCard({icon, eyebrow, title, chance, quantity, note}) {
  return (
    <article className={styles.acquisitionCard}>
      <span className={styles.acquisitionIcon}><DetailIcon name={icon} /></span>
      <div><small>{eyebrow}</small><h3>{title}</h3>{note && <p>{note}</p>}<footer>{chance && <strong>{chance}</strong>}{quantity && <span>{quantity}</span>}</footer></div>
    </article>
  );
}

function ItemDetail({entry, visual}) {
  const project = useWikiProject();
  const documentation = normalizedItemDocumentation(entry);
  const groups = capabilityGroups(documentation.capabilities);
  const recipes = obtainingRecipes(project, entry);
  const basics = [
    ['Item Type', documentation.basic.itemType],
    ['Equip Slot', documentation.basic.equipSlot && documentation.basic.equipSlot !== 'Not a trinket slot' ? documentation.basic.equipSlot : null],
    ['Maximum Stack', documentation.basic.maximumStack],
    ['Identifier', documentation.basic.identifier],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
  return (
    <article className={styles.itemDetailPage}>
      <header className={styles.itemDetailHero}>
        <div className={styles.itemDetailVisual}>{visual}</div>
        <div className={styles.itemDetailHeading}><p className={styles.eyebrow}>Item entry</p><h1>{entry.name}</h1><p>{documentation.description}</p></div>
      </header>

      <section className={styles.itemEditorialSection} aria-labelledby="item-basic-information">
        <ItemSectionHeading id="item-basic-information" icon="info">Basic Information</ItemSectionHeading>
        <dl className={styles.itemBasicList}>{basics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}{label === 'Identifier' && <CopyIdentifierButton identifier={value} />}</dd></div>)}</dl>
      </section>

      {groups.length > 0 && <section className={styles.itemEditorialSection} aria-labelledby="item-capabilities">
        <ItemSectionHeading id="item-capabilities" icon="capabilities">Trinket Capabilities</ItemSectionHeading>
        <div className={styles.capabilityGrid}>{groups.map((group) => <CapabilityGroup key={group.id} group={group} />)}</div>
      </section>}

      <section className={styles.itemEditorialSection} aria-labelledby="item-obtain">
        <ItemSectionHeading id="item-obtain" icon="obtain">How to Obtain</ItemSectionHeading>
        <div className={styles.acquisitionGrid}>
          {documentation.acquisition.entityDrops.map((drop, index) => <AcquisitionCard key={`${drop.entity}-${index}`} icon="entity" eyebrow="Entity Drop" title={formatIdentifier(drop.entity)} chance={formatChance(drop.chance)} quantity={quantityLabel(drop)} />)}
          {documentation.acquisition.structures.map((loot, index) => {
            const dimension = loot.conditions?.dimension ? formatIdentifier(loot.conditions.dimension) : null;
            const structure = loot.structure === 'default' ? (dimension ? `${dimension} Loot` : 'World Loot') : formatIdentifier(loot.structure);
            return <AcquisitionCard key={`${loot.structure}-${index}`} icon="structure" eyebrow="Structure Loot" title={structure} chance={formatChance(loot.chance)} note={loot.table ?? loot.category} />;
          })}
          {documentation.acquisition.biomes.map((loot, index) => <AcquisitionCard key={`${loot.biome}-${index}`} icon="biome" eyebrow="Biome Loot" title={formatIdentifier(loot.biome)} chance={formatChance(loot.chance)} />)}
          <section className={styles.recipeAcquisition}>
            <header><DetailIcon name="recipe" /><div><small>Recipe</small><h3>{recipes.length ? `${recipes.length} crafting recipe${recipes.length === 1 ? '' : 's'}` : 'No crafting recipe'}</h3></div></header>
            {recipes.length ? <div>{recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div> : <p>This item cannot be crafted with the currently indexed recipes.</p>}
          </section>
        </div>
      </section>

      {documentation.usage && <section className={styles.itemEditorialSection} aria-labelledby="item-usage">
        <ItemSectionHeading id="item-usage" icon="usage">Usage</ItemSectionHeading>
        <div className={styles.itemUsage}><DetailIcon name="usage" /><p>{documentation.usage}</p></div>
      </section>}
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
    assetRoot, blocks, craftingRecipeDetails, entities, generators, machineControllerIds,
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

  if (entryType === 'machines') {
    const controller = blocks.find((candidate) => candidate.slug === (entry.blockSlug ?? machineControllerIds[entry.id]));
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
    facts = [['Category', entry.category], ['Tier', entry.tier], ['Identifier', entry.identifier ?? entry.id], ['Entry type', 'Block']];
  } else if (entryType === 'generators') {
    visual = <div className={styles.detailGuideVisual}>{entry.faces
      ? <BlockPreview entry={entry} size="min(100%, 17rem)" />
      : entry.image
        ? <img src={resolveAsset(project, entry.image)} alt="" />
        : <span className={styles.visualFallback} aria-hidden="true">◉</span>}</div>;
    facts = [['System type', entry.systemType ?? entry.status], ['Structure tier', entry.tier], ['Input', entry.fuel], ['Output', entry.output], ['Operational note', entry.risk], ['Components', entry.components]];
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
            <DetailFacts facts={facts} />
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
