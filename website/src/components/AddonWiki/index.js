import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import '@fontsource-variable/space-grotesk';
import {
  IconBattery,
  IconBolt,
  IconBook,
  IconBrandGithub,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCube,
  IconDroplet,
  IconExternalLink,
  IconFileText,
  IconHelpCircle,
  IconAdjustmentsHorizontal,
  IconSearch,
  IconSettings,
  IconSword,
  IconTool,
  IconUsers,
  IconWind,
  IconX,
} from '@tabler/icons-react';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {StepAccordionList, StepCardList, StepCompactList, StepTimelineList} from './stepLists';
import {findGlobalCatalogEntry, getWikiProject} from '../../wiki/projects';
import {RECIPE_ORIGINS, recipeOriginFor as resolveRecipeOrigin} from '../../wiki/recipeOrigins';
import {fluidVisualFor, MACHINE_RESOURCE_ICONS} from '../../data/resourceVisuals';
import {getProjectByWikiPath} from '../../data/projects';
import {projectCardPalette} from '../../data/cardPalettes';
import vanillaAssetIndex from '../../data/vanillaAssetIndex.json';
import styles from './styles.module.css';

const WikiProjectContext = createContext(null);

const WIKI_ICONS = {
  battery: IconBattery,
  bolt: IconBolt,
  book: IconBook,
  cube: IconCube,
  droplet: IconDroplet,
  'file-text': IconFileText,
  'help-circle': IconHelpCircle,
  settings: IconSettings,
  sword: IconSword,
  tool: IconTool,
  users: IconUsers,
  wind: IconWind,
};

function WikiIcon({name, size = 20, stroke = 1.8}) {
  const Icon = WIKI_ICONS[name] ?? IconHelpCircle;
  return <Icon aria-hidden="true" size={size} stroke={stroke} />;
}

const WIKI_SECTION_GROUPS = [
  {id: 'overview', label: 'Overview', sections: ['overview', 'how-to-play']},
  {id: 'content', label: 'Content', sections: ['items', 'blocks', 'entities']},
  {id: 'systems', label: 'Systems', sections: ['machines', 'generators']},
  {id: 'reference', label: 'Reference', sections: ['recipes', 'mechanics']},
];
const TRINKET_TYPE_SECTION_IDS = new Set(['hearty-charms', 'feet', 'rings', 'head', 'body', 'necklaces', 'charms', 'talismans', 'gauntlets', 'dolls', 'archaic-charms', 'amulets']);
const EQUIPMENT_SECTION_IDS = new Set(['armor-sets', 'ring-materials', 'utility-items']);
const CATALOG_PAGE_SIZE = 60;

function groupedWikiSections(sections) {
  const assigned = new Set();
  const groups = WIKI_SECTION_GROUPS.map((group) => {
    const matches = group.sections.map((id) => sections.find((section) => section.id === id)).filter(Boolean);
    matches.forEach((section) => assigned.add(section.id));
    return {...group, sections: matches};
  }).filter((group) => group.sections.length);
  const remaining = sections.filter((section) => !assigned.has(section.id));
  const trinketTypes = remaining.filter((section) => TRINKET_TYPE_SECTION_IDS.has(section.id));
  const equipment = remaining.filter((section) => EQUIPMENT_SECTION_IDS.has(section.id));
  if (trinketTypes.length) groups.splice(Math.min(1, groups.length), 0, {id: 'trinket-types', label: 'Trinket Types', sections: trinketTypes});
  if (equipment.length) groups.splice(Math.min(2, groups.length), 0, {id: 'equipment', label: 'Equipment', sections: equipment});
  const ungrouped = remaining.filter((section) => !TRINKET_TYPE_SECTION_IDS.has(section.id) && !EQUIPMENT_SECTION_IDS.has(section.id));
  if (ungrouped.length) groups.push({id: 'more', label: 'More', sections: ungrouped});
  return groups;
}

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

function blockRenderCandidates(project, entry) {
  const assetProject = entry.assetRoot ? {...project, assetRoot: entry.assetRoot} : project;
  const identifier = String(entry.identifier ?? entry.id ?? '');
  const shortId = String(entry.shortId ?? identifier.replace(/^.*:/, ''));
  const renderNames = [...new Set([
    shortId,
    identifier.replace(':', '_'),
    identifier.replace(':', '/'),
    entry.slug,
    String(entry.name ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
  ].filter(Boolean))];
  const northFace = entry.faces?.north ?? entry.faces?.right;
  const remainingFaces = Object.entries(entry.faces ?? {})
    .filter(([face, source]) => source && !['north', 'right'].includes(face))
    .map(([, source]) => source);
  return [...new Set([
    entry.render,
    ...renderNames.map((name) => `renders/${name}.png`),
    northFace,
    ...remainingFaces,
    entry.itemImage,
    entry.image,
  ].filter(Boolean).map((source) => resolveAsset(assetProject, source)))];
}

function socialRender(source) {
  return source?.replace(/^\/img\/wiki\/([^/]+)\/renders\//, '/img/social/wiki/$1/renders/');
}

function entrySocialImage(project, entryType, entry, controller, recipe) {
  if (entryType === 'machines') {
    return resolveAsset(project, controller?.render ?? controller?.itemImage ?? controller?.image ?? Object.values(controller?.faces ?? {}).find(Boolean) ?? project.overview.heroImage);
  }
  if (entryType === 'items') return resolveAsset(project, entry.image ?? project.fallbackImage);
  if (entryType === 'blocks') return resolveAsset(project, entry.render ?? entry.faces?.north ?? entry.faces?.right ?? entry.itemImage ?? entry.image ?? Object.values(entry.faces ?? {}).find(Boolean) ?? project.fallbackImage);
  if (entryType === 'generators') return resolveAsset(project, entry.render ?? entry.faces?.north ?? entry.faces?.right ?? entry.itemImage ?? entry.image ?? Object.values(entry.faces ?? {}).find(Boolean) ?? project.fallbackImage);
  if (entryType === 'entities') return resolveAsset(project, entry.image ?? project.overview.heroImage);
  if (entryType === 'recipes') return visualFor(project, recipe?.result?.id ?? recipe?.result?.label) ?? resolveAsset(project, project.recipeFallbackFace ?? project.fallbackImage);
  return resolveAsset(project, project.mechanicsGuide?.image ?? project.overview.heroImage ?? project.fallbackImage);
}

function sectionSocialImage(project, section, itemCategory) {
  if (itemCategory) return resolveAsset(project, project.items.find(({category}) => categoriesInSection(itemCategory).includes(category))?.image ?? project.fallbackImage);
  if (section.startsWith('how-to-play')) {
    const pageId = section.split('/')[1] ?? 'introduction';
    const page = project.howToPlay?.pages?.find(({id}) => id === pageId) ?? project.howToPlay?.pages?.[0];
    return resolveAsset(project, page?.hero ?? project.overview.heroImage);
  }
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

function WikiSearch({query, setQuery, placeholder, compact = false}) {
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
    <label className={`${styles.search} ${compact ? styles.compactWikiSearch : ''}`}>
      <IconSearch aria-hidden="true" size={18} stroke={1.8} />
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(() => new Set(active.startsWith('how-to-play') ? ['how-to-play'] : []));
  const activeRootSection = project.wikiSections.find((section) => active === section.id || active.startsWith(`${section.id}/`));
  const activeChildSection = activeRootSection?.children?.find((child) => (
    active === (child.id === 'introduction' ? activeRootSection.id : `${activeRootSection.id}/${child.id}`)
  ));
  const mobileNavigationLabel = activeChildSection?.label ?? activeRootSection?.label ?? 'Wiki navigation';

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem('dorios-wiki-sidebar-collapsed') === 'true');
  }, []);

  useEffect(() => {
    activeSectionRef.current?.scrollIntoView({block: 'nearest', inline: 'center'});
    setMobileNavigationOpen(false);
  }, [active]);

  useEffect(() => {
    if (!mobileNavigationOpen) return;
    window.requestAnimationFrame(() => activeSectionRef.current?.scrollIntoView({block: 'nearest', inline: 'center'}));
  }, [mobileNavigationOpen]);

  useEffect(() => {
    if (!mobileNavigationOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileNavigationOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileNavigationOpen]);

  useEffect(() => {
    if (!active.startsWith('how-to-play')) return;
    setExpandedSections((current) => new Set([...current, 'how-to-play']));
  }, [active]);

  const toggleSection = (sectionId) => setExpandedSections((current) => {
    const next = new Set(current);
    if (next.has(sectionId)) next.delete(sectionId);
    else next.add(sectionId);
    return next;
  });

  const toggleSidebar = () => setSidebarCollapsed((current) => {
    const next = !current;
    window.localStorage.setItem('dorios-wiki-sidebar-collapsed', String(next));
    return next;
  });

  const renderWikiSection = (section) => {
    const isActive = active === section.id || (section.children?.length && active.startsWith(`${section.id}/`));
    if (!section.children?.length) return (
      <Link
        key={section.id}
        to={section.href}
        aria-current={active === section.id ? 'page' : undefined}
        className={isActive ? styles.activeNav : undefined}
        ref={isActive ? activeSectionRef : undefined}
        title={section.label}
      >
        <span className={styles.navIcon}><WikiIcon name={section.icon} /></span>
        <span className={styles.navLabel}>{section.label}</span>
      </Link>
    );

    const expanded = expandedSections.has(section.id);
    return (
      <div className={styles.navGroup} key={section.id}>
        <div className={styles.navGroupHeader}>
          <Link
            to={section.href}
            aria-current={active === section.id ? 'page' : undefined}
            className={isActive ? styles.activeNav : undefined}
            ref={isActive ? activeSectionRef : undefined}
            title={section.label}
          >
            <span className={styles.navIcon}><WikiIcon name={section.icon} /></span>
            <span className={styles.navLabel}>{section.label}</span>
          </Link>
          <button
            type="button"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${section.label} pages`}
            aria-expanded={expanded}
            aria-controls={`wiki-nav-${section.id}`}
            onClick={() => toggleSection(section.id)}
          >
            <IconChevronDown aria-hidden="true" size={17} stroke={1.9} />
          </button>
        </div>
        {expanded && (
          <div className={styles.navSubmenu} id={`wiki-nav-${section.id}`}>
            {section.children.map((child) => {
              const childSection = child.id === 'introduction' ? section.id : `${section.id}/${child.id}`;
              const childActive = active === childSection;
              return <Link key={child.id} to={child.href} className={childActive ? styles.activeSubNav : undefined}>{child.label}</Link>;
            })}
          </div>
        )}
      </div>
    );
  };

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

        <div className={`${styles.wikiLayout} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
          <aside className={styles.sidebar} aria-label={`${project.name} wiki sections`}>
            <div className={styles.mobileSidebarBar}>
              <div className={styles.mobileSidebarCurrent}>
                <span className={styles.navIcon}><WikiIcon name={activeRootSection?.icon ?? 'book'} /></span>
                <span><strong>{mobileNavigationLabel}</strong></span>
              </div>
              <WikiSearch query={query} setQuery={setQuery} placeholder="Search…" compact />
              <button
                type="button"
                className={styles.mobileSidebarToggle}
                data-wiki-menu
                onClick={() => setMobileNavigationOpen((current) => !current)}
                aria-label={mobileNavigationOpen ? 'Close wiki navigation' : 'Open wiki navigation'}
                aria-expanded={mobileNavigationOpen}
                aria-controls="wiki-navigation"
              >
                <span>{mobileNavigationOpen ? 'Close' : 'Browse'}</span>
                <IconChevronDown aria-hidden="true" size={18} stroke={2} />
              </button>
            </div>
            <div className={styles.sidebarHeader}>
              <p>{project.name}</p>
              <button
                type="button"
                className={styles.sidebarToggle}
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? 'Expand wiki sidebar' : 'Collapse wiki sidebar'}
                aria-expanded={!sidebarCollapsed}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed
                  ? <IconChevronRight aria-hidden="true" size={18} stroke={1.9} />
                  : <IconChevronLeft aria-hidden="true" size={18} stroke={1.9} />}
              </button>
            </div>
            <div id="wiki-navigation" className={`${styles.mobileNavContent} ${mobileNavigationOpen ? styles.mobileNavOpen : ''}`}>
              <nav>
                {groupedWikiSections(project.wikiSections).map((group) => (
                  <section className={styles.navSection} key={group.id} aria-label={group.label}>
                    <p className={styles.navSectionLabel}>{group.label}</p>
                    <div>{group.sections.map(renderWikiSection)}</div>
                  </section>
                ))}
              </nav>
              {project.repository && (
                <a className={styles.repoSideLink} href={project.repository} target="_blank" rel="noreferrer">
                  <IconBrandGithub aria-hidden="true" size={18} stroke={1.8} />
                  <span>GitHub repository</span>
                  <IconExternalLink className={styles.repoExternalIcon} aria-hidden="true" size={16} stroke={1.8} />
                </a>
              )}
            </div>
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

function FilterChips({categories, active, setActive, ariaLabel = 'Filter categories'}) {
  return (
    <div className={styles.filterChips} aria-label={ariaLabel}>
      {categories.map(({id, name, count, origin}) => {
        const value = id ?? name;
        return (
        <button
          type="button"
          key={value}
          aria-pressed={active === value}
          className={active === value ? styles.activeChip : undefined}
          onClick={() => setActive(value)}
          data-origin={origin ? 'true' : undefined}
          style={origin ? {'--filter-origin-accent': origin.accent} : undefined}
        >
          {name} <span>{count}</span>
        </button>
        );
      })}
    </div>
  );
}

function catalogPageNumbers(currentPage, totalPages) {
  const visiblePages = new Set([1, totalPages]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) visiblePages.add(page);
  }
  const sorted = [...visiblePages].sort((left, right) => left - right);
  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1];
    return previous && page - previous > 1 ? [`gap-${previous}-${page}`, page] : [page];
  });
}

function CatalogPagination({page, totalItems, onPageChange, targetId}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / CATALOG_PAGE_SIZE));
  if (totalPages <= 1) return null;

  const changePage = (nextPage) => {
    const resolved = Math.min(totalPages, Math.max(1, nextPage));
    if (resolved === page) return;
    onPageChange(resolved);
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  };

  return (
    <nav className={styles.catalogPagination} aria-label="Catalog pages">
      <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1} aria-label="Previous page">←</button>
      <div>
        {catalogPageNumbers(page, totalPages).map((value) => typeof value === 'string'
          ? <span key={value} aria-hidden="true">…</span>
          : <button
            type="button"
            key={value}
            className={value === page ? styles.activeCatalogPage : undefined}
            aria-current={value === page ? 'page' : undefined}
            aria-label={`Page ${value}`}
            onClick={() => changePage(value)}
          >{value}</button>)}
      </div>
      <button type="button" onClick={() => changePage(page + 1)} disabled={page === totalPages} aria-label="Next page">→</button>
    </nav>
  );
}

function pageFromSearch(search) {
  const value = Number(new URLSearchParams(search).get('page'));
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function useCatalogPage(resetValues) {
  const location = useLocation();
  const history = useHistory();
  const pageParameter = new URLSearchParams(location.search).get('page');
  const hasValidPage = /^\d+$/.test(pageParameter ?? '') && Number(pageParameter) > 0;
  const page = pageFromSearch(location.search);
  const resetKey = resetValues.map((value) => String(value ?? '')).join('\u0001');
  const searchQuery = String(resetValues[0] ?? '').trim();
  const previousResetKey = useRef(resetKey);

  const setPage = useCallback((nextPage, options = {}) => {
    const params = new URLSearchParams(location.search);
    params.set('page', String(Math.max(1, Number(nextPage) || 1)));
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    const destination = {
      pathname: location.pathname,
      search: `?${params.toString()}`,
      hash: location.hash,
    };
    if (options.replace) history.replace(destination);
    else history.push(destination);
  }, [history, location.hash, location.pathname, location.search, searchQuery]);

  useEffect(() => {
    if (!hasValidPage) setPage(1, {replace: true});
  }, [hasValidPage, setPage]);

  useEffect(() => {
    if (previousResetKey.current === resetKey) return;
    previousResetKey.current = resetKey;
    setPage(1, {replace: true});
  }, [resetKey, setPage]);

  return [page, setPage];
}

function paginatedResultLabel(totalItems, page) {
  if (!totalItems) return '0 entries shown';
  const first = (page - 1) * CATALOG_PAGE_SIZE + 1;
  const last = Math.min(page * CATALOG_PAGE_SIZE, totalItems);
  return `${first}–${last} of ${totalItems} entries shown`;
}

function CatalogResultBar({id, totalItems, page, setPage}) {
  return <div className={styles.catalogResultBar}>
    <p id={id} className={styles.resultCount} aria-live="polite">{paginatedResultLabel(totalItems, page)}</p>
    <CatalogPagination page={page} totalItems={totalItems} onPageChange={setPage} targetId={id} />
  </div>;
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

function FilterSelect({label, categories, active, setActive, ariaLabel = label}) {
  return (
    <label className={styles.filterSelect}>
      <span>{label}</span>
      <select value={active} onChange={(event) => setActive(event.target.value)} aria-label={ariaLabel}>
        {categories.map(({id, name, count}) => {
          const value = id ?? name;
          return <option key={value} value={value}>{name} ({count})</option>;
        })}
      </select>
    </label>
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
  const sources = blockRenderCandidates(project, entry);
  const sourceKey = sources.join('|');
  const [sourceIndex, setSourceIndex] = useState(0);
  useEffect(() => setSourceIndex(0), [sourceKey]);
  if (!sources[sourceIndex]) return <div className={styles.blockFallback} style={{'--block-preview-size': size}} aria-hidden="true">◆</div>;
  return (
    <figure
      className={`${styles.blockPreview} ${entry.itemImage ? styles.itemBlockPreview : ''}`}
      style={{'--block-preview-size': size}}
    >
      <img
        src={sources[sourceIndex]}
        alt={`${entry.name} render`}
        loading="lazy"
        onError={() => setSourceIndex((current) => current + 1)}
      />
    </figure>
  );
}

function BlockCard({entry, tags = []}) {
  const project = useWikiProject();
  return (
    <li className={styles.catalogListItem}>
      <Link className={styles.selectableCard} to={`${project.basePath}/blocks/${entry.slug}`}>
        <article className={styles.catalogRow}>
        <BlockPreview entry={entry} size="4.5rem" />
        <div className={styles.blockCopy}>
          <span>{entry.category}</span>
          <h2>{entry.name}</h2>
          {tags.length > 0 && <div className={styles.blockTags}>{tags.slice(0, 4).map((tag) => <b key={tag}>{tag}</b>)}</div>}
        </div>
          <i className={styles.catalogArrow} aria-hidden="true">→</i>
        </article>
      </Link>
    </li>
  );
}

function formatIdentifier(identifier = '') {
  return String(identifier ?? '').replace(/^.*:/, '').replace(/[_/-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const localEntries = [
    ...(project.lookupItems ?? project.allItems ?? project.items),
    ...(project.lookupBlocks ?? project.blocks),
  ];
  return localEntries.find((entry) => (
    entry.id === identifier || entry.identifier === identifier || entry.shortId === identifier
  )) ?? localEntries.find((entry) => entry.name?.toLowerCase() === normalized) ?? findGlobalCatalogEntry(identifier);
}

const VANILLA_ASSET_ALIASES = {
  acacia_sapling: 'sapling_acacia',
  beetroot_seeds: 'seeds_beetroot',
  birch_sapling: 'sapling_birch',
  black_dye: 'dye_powder_black',
  blue_dye: 'dye_powder_blue',
  brown_dye: 'dye_powder_brown',
  clock: 'clock_item',
  cocoa_beans: 'cocoa_seeds',
  cyan_dye: 'dye_powder_cyan',
  dark_oak_sapling: 'sapling_roofed_oak',
  fermented_spider_eye: 'spider_eye_fermented',
  fishing_rod: 'fishing_rod_uncast',
  golden_apple: 'apple_golden',
  golden_axe: 'gold_axe',
  golden_carrot: 'carrot_golden',
  golden_hoe: 'gold_hoe',
  golden_pickaxe: 'gold_pickaxe',
  golden_shovel: 'gold_shovel',
  golden_sword: 'gold_sword',
  grass_block: 'grass',
  heart_of_the_sea: 'heartofthesea_closed',
  jungle_sapling: 'sapling_jungle',
  lava_bucket: 'bucket_lava',
  light_blue_dye: 'dye_powder_light_blue',
  light_gray_dye: 'dye_powder_silver',
  lime_dye: 'dye_powder_lime',
  magenta_dye: 'dye_powder_magenta',
  melon_seeds: 'seeds_melon',
  nether_brick: 'netherbrick',
  oak_sapling: 'sapling_oak',
  orange_dye: 'dye_powder_orange',
  pink_dye: 'dye_powder_pink',
  popped_chorus_fruit: 'chorus_fruit_popped',
  potion: 'potion_bottle_drinkable',
  pumpkin_seeds: 'seeds_pumpkin',
  purple_dye: 'dye_powder_purple',
  red_dye: 'dye_powder_red',
  redstone: 'redstone_dust',
  slime_ball: 'slimeball',
  spruce_sapling: 'sapling_spruce',
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
  const resourceKind = ingredient.kind ?? ingredient.resourceType;
  const isFluid = resourceKind === 'fluid' || String(ingredient.id ?? '').startsWith('fluid:');
  const isGas = resourceKind === 'gas' || String(ingredient.id ?? '').startsWith('gas:');
  const fluidVisual = isFluid ? fluidVisualFor(ingredient.id ?? ingredient.resourceId ?? ingredient.label) : null;
  const resourceIcon = fluidVisual?.icon ?? (isGas ? MACHINE_RESOURCE_ICONS.gas : null);
  const image = resourceIcon ?? visualFor(project, ingredient.id ?? ingredient.label);
  const name = ingredient.label ?? formatIdentifier(ingredient.id);
  const description = ingredient.description ?? fluidVisual?.description;
  const tooltip = description ? `${name} — ${description}` : name;
  const link = detailLinkFor(project, ingredient.id ?? ingredient.label);
  const style = fluidVisual ? {
    '--fluid-primary': fluidVisual.palette.primary,
    '--fluid-secondary': fluidVisual.palette.secondary,
    '--fluid-glow': fluidVisual.palette.glow,
  } : undefined;
  const content = (
    <>
      {image ? <img className={isFluid || isGas ? styles.resourceSlotIcon : undefined} src={image} alt="" loading="lazy" />
        : isFluid ? <span className={styles.fluidSlotGlyph} aria-hidden="true">≋</span>
          : isGas ? <span className={styles.gasSlotGlyph} aria-hidden="true">◌</span>
            : <span className={styles.slotFallback}>{name}</span>}
      {(ingredient.count ?? 1) > 1 && <b className={styles.slotCount}>{ingredient.count}</b>}
    </>
  );
  const className = `${styles.recipeSlot} ${result ? styles.resultSlot : ''} ${isFluid ? styles.fluidRecipeSlot : ''} ${isGas ? styles.gasRecipeSlot : ''}`;
  return link ? <Link className={className} to={link} aria-label={tooltip} title={tooltip} data-tooltip={tooltip} style={style}>{content}</Link>
    : <span className={className} role="img" aria-label={tooltip} title={tooltip} data-tooltip={tooltip} style={style}>{content}</span>;
}

// Processing recipes can be registered by a different add-on from the machine
// that runs them. Keep the origin on the recipe rather than inferring it from
// the current wiki, so a Crusher recipe added by an expansion stays visibly
// attributed when it appears in the UtilityCraft catalog.
function recipeOriginFor(recipe, project) {
  const supplied = recipe?.origin && typeof recipe.origin === 'object' ? recipe.origin : {};
  const inferredId = supplied.id ?? (typeof recipe?.origin === 'string' ? recipe.origin : null) ?? recipe?.originId ?? project.recipeOrigin?.id ?? project.id;
  const resolved = resolveRecipeOrigin({...supplied, id: inferredId});
  const fallback = RECIPE_ORIGINS[inferredId];
  const label = supplied.label ?? supplied.category ?? fallback?.label ?? project.recipeOrigin?.label ?? project.name;
  return {
    ...resolved,
    id: inferredId,
    label,
    category: supplied.category ?? fallback?.category ?? label,
    addonLabel: supplied.addonLabel ?? (inferredId === 'utilitycraft' ? 'UtilityCraft' : label),
    accent: supplied.accent ?? fallback?.accent ?? project.recipeOrigin?.accent ?? resolved.accent,
  };
}

function RecipeOriginBadge({recipe, compact = false}) {
  const project = useWikiProject();
  const origin = recipeOriginFor(recipe, project);
  const originProject = getProjectByWikiPath(`/wiki/${origin.id}`);
  const className = `${styles.recipeOriginBadge} ${compact ? styles.compactRecipeOriginBadge : ''}`;
  const style = {'--recipe-origin-accent': origin.accent};
  const content = <><i aria-hidden="true" /><span>{origin.category}</span></>;
  return originProject
    ? <Link className={className} style={style} to={originProject.routes.project} title={`Open ${origin.addonLabel} project`}>{content}</Link>
    : <span className={className} style={style} title={`Recipe added by ${origin.addonLabel}`}>{content}</span>;
}

function normalizedResourceIngredient(resource, defaultResourceType = 'fluid') {
  if (!resource) return null;
  const type = resource.type ?? resource.id ?? resource.label;
  if (!type) return null;
  const amount = resource.amount ?? resource.count;
  const resourceType = resource.resourceType ?? (type === 'xp' ? 'xp' : defaultResourceType);
  const unit = resource.unit ?? (resourceType === 'xp' ? 'XP' : 'mB');
  const id = String(type).includes(':') ? type : `${resourceType}:${type}`;
  const fluidVisual = resourceType === 'fluid' ? fluidVisualFor(id) : null;
  const baseLabel = resource.label ?? fluidVisual?.label ?? formatIdentifier(type);
  const amountLabel = amount ? `${Number(amount).toLocaleString('en-US')} ${unit}` : null;
  const label = amountLabel && !String(baseLabel).includes(amountLabel) ? `${baseLabel} · ${amountLabel}` : baseLabel;
  return {id, label, count: 1, amount, unit, kind: resourceType, description: resource.description ?? fluidVisual?.description};
}

const normalizedFluidIngredient = (fluid) => normalizedResourceIngredient(fluid, 'fluid');

function recipePrimaryInputs(recipe) {
  return Array.isArray(recipe.inputs) && recipe.inputs.length
    ? recipe.inputs.filter(Boolean)
    : recipe.slots?.filter(Boolean) ?? [];
}

function recipeCatalysts(recipe) {
  return Array.isArray(recipe.catalysts) ? recipe.catalysts.filter(Boolean) : [];
}

function recipeFluidInputs(recipe) {
  return [recipe.fluid, recipe.inputFluid].map(normalizedFluidIngredient).filter(Boolean);
}

function recipeInputGroups(recipe) {
  const inputs = recipePrimaryInputs(recipe);
  const catalysts = recipeCatalysts(recipe);
  const fluids = recipeFluidInputs(recipe);
  return [
    inputs.length && {label: 'Input', ingredients: inputs},
    catalysts.length && {label: 'Catalysts', ingredients: catalysts},
    fluids.length && {label: recipe.inputFluid ? 'Fluid input' : 'Fluid', ingredients: fluids},
  ].filter(Boolean);
}

function recipeByproducts(recipe) {
  return [
    ...(Array.isArray(recipe.byproducts) ? recipe.byproducts : []),
    ...(recipe.byproduct ? [recipe.byproduct] : []),
  ].filter(Boolean);
}

function recipeDrops(recipe) {
  return Array.isArray(recipe.drops) ? recipe.drops.filter(Boolean) : [];
}

function recipeConditionLabels(recipe) {
  const source = Array.isArray(recipe.conditions) ? recipe.conditions : recipe.conditions ? [recipe.conditions] : [];
  return source.map((condition) => {
    if (typeof condition === 'string') return condition;
    if (!condition || typeof condition !== 'object') return null;
    if (condition.label && condition.value) return `${condition.label}: ${condition.value}`;
    return condition.label ?? condition.value ?? null;
  }).filter(Boolean);
}

function recipeSearchTerms(recipe) {
  return [
    ...(recipe.slots ?? []),
    ...(recipe.inputs ?? []),
    ...(recipe.catalysts ?? []),
    ...(recipe.results ?? []),
    ...(recipe.outputs ?? []),
    ...recipeByproducts(recipe),
    ...recipeDrops(recipe),
    normalizedFluidIngredient(recipe.fluid),
    normalizedFluidIngredient(recipe.inputFluid),
    normalizedFluidIngredient(recipe.outputFluid),
    normalizedResourceIngredient(recipe.outputGas, 'gas'),
    recipe.result,
  ].filter(Boolean).map((ingredient) => `${ingredient.id ?? ''} ${ingredient.label ?? ''}`).join(' ')
    + ` ${(recipe.inputGroups ?? []).flatMap((group) => group.alternatives ?? []).map((entry) => entry.id ?? entry.label ?? '').join(' ')} ${recipeConditionLabels(recipe).join(' ')} ${recipe.note ?? ''}`;
}

function recipeOriginFilters(recipes, project) {
  const origins = recipes.reduce((result, recipe) => {
    const origin = recipeOriginFor(recipe, project);
    const current = result.get(origin.id) ?? {id: origin.id, name: origin.category, count: 0, origin};
    current.count += 1;
    result.set(origin.id, current);
    return result;
  }, new Map());
  const order = ['Base', 'Ascendant Technology', 'Heavy Machinery'];
  return [
    {id: 'All', name: 'All', count: recipes.length},
    ...[...origins.values()].sort((left, right) => {
      const leftOrder = order.indexOf(left.name);
      const rightOrder = order.indexOf(right.name);
      return (leftOrder < 0 ? Number.MAX_SAFE_INTEGER : leftOrder) - (rightOrder < 0 ? Number.MAX_SAFE_INTEGER : rightOrder)
        || left.name.localeCompare(right.name);
    }),
  ];
}

function recipeMatchesOrigin(recipe, originFilter, project) {
  return originFilter === 'All' || recipeOriginFor(recipe, project).id === originFilter;
}

function RecipeOriginFilters({recipes, active, setActive}) {
  const project = useWikiProject();
  const origins = useMemo(() => recipeOriginFilters(recipes, project), [recipes, project]);
  if (origins.length <= 2) return null;
  return <FilterChips categories={origins} active={active} setActive={setActive} ariaLabel="Filter recipes by add-on origin" />;
}

function processingInputSlots(recipe) {
  const groups = recipeInputGroups(recipe);
  return groups.flatMap(({ingredients}) => ingredients).slice(0, 9);
}

function normalizedProcessingRecipe(recipe) {
  const sourceSlots = recipe.slots ?? processingInputSlots(recipe);
  const sourceResult = recipe.result ?? (typeof recipe.output === 'object' ? recipe.output : null);
  if (sourceSlots.length && sourceResult) {
    const seenResults = new Set();
    const results = [{...sourceResult}, ...[
      ...(Array.isArray(recipe.results) ? recipe.results : []),
      ...(Array.isArray(recipe.outputs) ? recipe.outputs : []),
      ...(Array.isArray(recipe.secondaryOutputs) ? recipe.secondaryOutputs : []),
    ]].filter(Boolean).filter((ingredient) => {
      const key = `${ingredient.id ?? ingredient.label}|${ingredient.count ?? 1}`;
      if (seenResults.has(key)) return false;
      seenResults.add(key);
      return true;
    });
    return {
      ...recipe,
      slots: [...sourceSlots, ...Array(9)].slice(0, 9),
      result: {...sourceResult},
      results,
    };
  }
  const slots = Array(9).fill(null);
  const rawInputs = typeof recipe.input === 'string' ? recipe.input.split(' + ') : [];
  rawInputs.forEach((raw, index) => {
    const match = raw.match(/^(\d+)×\s*(.*)$/);
    slots[index] = {label: match ? match[2] : raw, count: match ? Number(match[1]) : 1};
  });
  const rawOutputs = typeof recipe.output === 'string' ? recipe.output.split(' + ') : [];
  const outputs = rawOutputs.map((raw) => {
    const outputMatch = raw.match(/^(\d+)×\s*(.*)$/);
    return {label: outputMatch ? outputMatch[2] : raw, count: outputMatch ? Number(outputMatch[1]) : 1};
  });
  return {
    ...recipe,
    slots,
    result: outputs[0] ?? {label: 'Unknown output', count: 1},
    results: outputs,
  };
}

function ingredientLabel(ingredient) {
  if (!ingredient) return 'Unknown item';
  return ingredient.label ?? (ingredient.id ? formatIdentifier(ingredient.id) : 'Unknown item');
}

function recipeOutputs(recipe) {
  return recipe.results?.filter(Boolean) ?? [recipe.result].filter(Boolean);
}

function usesLinearRecipeFlow(recipe) {
  return Boolean(recipe?.result && (recipe?.type || recipe?.kind !== 'shaped'));
}

function craftingGridFor(recipe) {
  const sourceSlots = Array.isArray(recipe?.slots) ? recipe.slots : [];
  const occupiedSlots = sourceSlots.map((ingredient, index) => ingredient ? index : null).filter((index) => index !== null);
  const compactSlotArray = sourceSlots.length === 4;
  const embeddedTwoByTwo = sourceSlots.length > 4
    && occupiedSlots.length > 0
    && occupiedSlots.every((index) => [0, 1, 3, 4].includes(index));
  return {
    twoByTwo: compactSlotArray || embeddedTwoByTwo,
    slots: embeddedTwoByTwo ? [0, 1, 3, 4].map((index) => sourceSlots[index]) : sourceSlots,
  };
}

function compactProcessingMetric(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return `${Number(value).toLocaleString('en-US')} DE/action`;
  const source = String(value).trim();
  const match = source.match(/^([\d,.]+)\s*DE(?:\/(t|action))?$/i);
  if (!match) return source;
  const amount = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(amount)) return source;
  const unit = [[1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k']].find(([threshold]) => amount >= threshold);
  const display = unit
    ? `${Number((amount / unit[0]).toFixed(amount / unit[0] >= 100 ? 0 : 1))} ${unit[1]}DE`
    : `${amount.toLocaleString('en-US')} DE`;
  return match[2] ? `${display}/${match[2]}` : display;
}

function processingMetric(recipe, machine) {
  return compactProcessingMetric(
    recipe.cost ?? recipe.energyCost ?? recipe.energy ?? machine?.machineData?.energyCost,
  ) ?? (recipe.chance !== undefined ? `${Math.round(recipe.chance * 100)}% chance` : null);
}

function RecipeCard({recipe}) {
  const project = useWikiProject();
  const station = project.stationMeta[recipe.station] ?? {
    label: formatIdentifier(recipe.station),
    face: project.recipeFallbackFace,
  };
  const type = recipe.type ? 'processing' : 'crafting';
  const detailHref = `${project.basePath}/recipes/${type}-${recipe.id}`;
  const linear = usesLinearRecipeFlow(recipe);
  const inputs = recipeInputGroups(recipe).flatMap(({ingredients}) => ingredients);
  const outputs = recipeOutputs(recipe);
  const inputName = inputs.map(ingredientLabel).join(' + ');
  const outputName = outputs.map(ingredientLabel).join(' + ');
  const origin = recipeOriginFor(recipe, project);
  const catalystWeaver = isCatalystWeaverRecipe(recipe);
  const energyMetric = compactProcessingMetric(recipe.cost ?? recipe.energyCost ?? recipe.energy);
  const primaryInputs = recipePrimaryInputs(recipe);
  const catalysts = recipeCatalysts(recipe);
  const {twoByTwo, slots: craftingSlots} = craftingGridFor(recipe);

  return (
    <article className={`${styles.recipeCard} ${linear ? styles.linearRecipeCard : ''}`} style={{'--recipe-origin-accent': origin.accent}}>
      <Link className={styles.recipeCardTarget} to={detailHref} aria-label={`Open recipe for ${outputName}`} />
      <header>
        {station.face
          ? <img src={resolveAsset(project, station.face)} alt="" />
          : <span className={styles.stationFallback} aria-hidden="true">▦</span>}
        <div>
          <span>{station.label}</span>
          {energyMetric && <small className={styles.recipeStationMetric}><img src={MACHINE_RESOURCE_ICONS.energy} alt="" />{energyMetric}</small>}
        </div>
        {origin.id !== project.id && <RecipeOriginBadge recipe={recipe} compact />}
      </header>
      {catalystWeaver ? <CatalystWeaverRecipeFlow recipe={recipe} showMetric={false} /> : (
        <div className={`${styles.recipeFlow} ${linear ? styles.linearRecipeFlow : ''}`}>
          {linear
            ? <div className={styles.linearRecipeInput}>
              {catalysts.length > 0 ? <div className={styles.catalyzedRecipeSlots}>
                <div className={styles.catalystRecipeSlots}>
                  {catalysts.map((ingredient, index) => <React.Fragment key={`${ingredient.id ?? ingredient.label}-${index}`}>
                    {index > 0 && <span className={styles.recipeFlowJoin} aria-hidden="true">+</span>}
                    <RecipeSlot ingredient={ingredient} />
                  </React.Fragment>)}
                </div>
                <span className={styles.catalystCornerArrow} aria-hidden="true">↳</span>
                <div className={styles.primaryRecipeSlots}>
                  {primaryInputs.map((ingredient, index) => <React.Fragment key={`${ingredient.id ?? ingredient.label}-${index}`}>
                    {index > 0 && <span className={styles.recipeFlowJoin} aria-hidden="true">+</span>}
                    <RecipeSlot ingredient={ingredient} />
                  </React.Fragment>)}
                </div>
              </div> : <div className={styles.linearRecipeSlots}>
                {primaryInputs.map((ingredient, index) => <React.Fragment key={`${ingredient.id ?? ingredient.label}-${index}`}>
                  {index > 0 && <span className={styles.recipeFlowJoin} aria-hidden="true">+</span>}
                  <RecipeSlot ingredient={ingredient} />
                </React.Fragment>)}
              </div>}
              <strong title={inputName}>{inputName}</strong>
            </div>
            : <div className={`${styles.craftingSlots} ${twoByTwo ? styles.craftingSlots2 : ''}`}>{craftingSlots.map((ingredient, slot) => <RecipeSlot key={slot} ingredient={ingredient} />)}</div>}
          <span className={styles.recipeArrow} aria-hidden="true">→</span>
          <div className={styles.recipeResult}>
            <div className={styles.recipeResultSlots}>
              {outputs.map((ingredient, index) => <React.Fragment key={`${ingredient.id ?? ingredient.label}-${index}`}>
                {index > 0 && <span className={styles.recipeFlowJoin} aria-hidden="true">+</span>}
                <RecipeSlot ingredient={ingredient} result />
              </React.Fragment>)}
            </div>
            <strong title={outputName}>{outputName}</strong>
            {recipeDrops(recipe).length > 0 && <small className={styles.recipeDropSummary}>{recipeDrops(recipe).length} possible drops</small>}
          </div>
        </div>
      )}
    </article>
  );
}

function OverviewPage({query}) {
  const project = useWikiProject();
  const {
    assetRoot, blocks, craftingRecipeDetails = [], craftingRecipes, entities = [], generators, items, machines, mechanics,
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
      ...craftingRecipeDetails.map((recipe) => ({
        name: formatIdentifier(recipe.result?.id ?? recipe.result?.label ?? recipe.identifier),
        category: `${recipe.category ?? ''} ${recipe.station ?? ''}`,
        description: 'Crafting recipe',
        section: 'Recipes',
        href: `${project.basePath}/recipes/crafting-${recipe.id}`,
      })),
      ...processingRecipes.map(normalizedProcessingRecipe).map((recipe) => {
        const origin = recipeOriginFor(recipe, project);
        return {
          name: formatIdentifier(recipe.result?.id ?? recipe.result?.label ?? recipe.identifier),
          category: `${recipe.category ?? ''} ${recipe.station ?? ''} ${origin.category} ${origin.addonLabel}`,
          description: `Machine recipe ${recipeSearchTerms(recipe)}`,
          section: 'Recipes',
          href: `${project.basePath}/recipes/processing-${recipe.id}`,
        };
      }),
    ];
    return entries.filter((entry) => `${entry.name} ${entry.category ?? ''} ${entry.description}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [normalized]);

  const categoryImages = overview.categoryImages ?? {};
  const allBlocks = project.allBlocks ?? blocks;
  const resourceBlock = blocks.find((entry) => /(?:ore|resource|material|storage)/i.test(`${entry.category} ${entry.name}`));
  const machineImage = machines.map((machine) => {
    const block = allBlocks.find((entry) => entry.slug === (machine.blockSlug ?? project.machineControllerIds?.[machine.id]));
    return block?.itemImage ?? block?.render ?? block?.faces?.right ?? machine.image;
  }).find(Boolean);
  const difficultRecipeItem = [...items].reverse().find((entry) => entry.image)?.image;
  const categoryCards = [
    {id: 'how-to-play', count: `${project.howToPlay?.pages?.length ?? 0} guided steps`, image: project.howToPlay?.pages?.[0]?.hero},
    {id: 'items', count: `${items.length} entries`, image: categoryImages.items ?? items.find((entry) => entry.image)?.image},
    {id: 'blocks', count: `${blocks.length} entries`, image: categoryImages.blocks ?? resourceBlock?.itemImage ?? resourceBlock?.render ?? resourceBlock?.faces?.right},
    {
      id: 'machines',
      count: `${machines.length} systems`,
      image: categoryImages.machines ?? machineImage,
    },
    {id: 'generators', count: `${generators.length} systems`, image: categoryImages.generators ?? generators.map((entry) => entry.image ?? entry.faces?.right).find(Boolean)},
    {id: 'entities', count: `${entities.length} entries`, image: entities.find((entry) => entry.image)?.image},
    {id: 'recipes', count: `${craftingRecipes.length + processingRecipes.length} indexed`, image: categoryImages.recipes ?? difficultRecipeItem ?? project.fallbackImage},
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
                : <span className={styles.categoryFallback}><WikiIcon name={section.icon} size={30} stroke={1.6} /></span>}
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

function GuideTable({table}) {
  if (!table?.headers?.length || !table?.rows?.length) return null;
  return (
    <div className={styles.guideTableWrap}>
      <table className={styles.guideTable}>
        <thead><tr>{table.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, rowIndex) => (
          <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function GuideImages({images, title}) {
  if (!images?.length) return null;
  const project = useWikiProject();
  return (
    <div className={styles.guideImages} data-count={Math.min(images.length, 5)}>
      {images.map((source, index) => <figure
        key={source}
        data-shape={/(?:basics_render|meshes_flipbook|tools_render|cobble_gens_render|machines_render|batteries_render|fluid_tanks_render|mob_grinding_render|hammers_render|flint_knife_render|sieve_scaling_render|breaking_blocks(?:_comp)?_render|getting_mud_render|crucible_obsidian_process_render)/.test(source) ? 'wide' : 'standard'}
      >
        <img
          src={resolveAsset(project, source)}
          alt={`${title} visual ${index + 1}`}
          loading="lazy"
        />
      </figure>)}
    </div>
  );
}

function GuideCards({cards}) {
  const project = useWikiProject();
  if (!cards?.length) return null;
  return (
    <div className={styles.guideCardGrid}>
      {cards.map((card) => <article className={styles.guideCard} key={card.title}>
        {card.image && <div className={styles.guideCardImage}><img src={resolveAsset(project, card.image)} alt="" loading="lazy" /></div>}
        <div>
          <h3>{card.title}</h3>
          <p>{card.copy}</p>
          {card.stats?.length > 0 && <dl>{card.stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
        </div>
      </article>)}
    </div>
  );
}

const STEP_LIST_COMPONENTS = {
  step_card_list: StepCardList,
  step_timeline_list: StepTimelineList,
  step_compact_list: StepCompactList,
  step_accordion_list: StepAccordionList,
};

function StepListForSection({section, sectionNumber, embedded = false}) {
  if (!section.steps?.length) return null;
  const variant = section.stepVariant ?? (section.steps.length >= 4 ? 'step_timeline_list' : 'step_card_list');
  const StepList = STEP_LIST_COMPONENTS[variant] ?? StepCardList;
  return <StepList title={section.title} sectionNumber={sectionNumber} steps={section.steps} embedded={embedded} />;
}

function GuideSection({section, index}) {
  const images = section.images ?? (section.image ? [section.image] : []);
  const hasSupportingContent = Boolean(section.paragraphs?.length || images.length || section.table || section.tables?.length || section.cards?.length || section.links?.length);
  if (section.steps?.length && !hasSupportingContent) {
    return <StepListForSection section={section} sectionNumber={index + 1} />;
  }
  return (
    <section className={styles.guideSection} aria-labelledby={`guide-section-${index}`}>
      <header>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <h2 id={`guide-section-${index}`}>{section.title}</h2>
      </header>
      {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <StepListForSection section={section} sectionNumber={index + 1} embedded />
      <GuideImages images={images} title={section.title} />
      <GuideTable table={section.table} />
      {section.tables?.length > 0 && <div className={styles.guideTableGrid}>{section.tables.map((table) => <div key={table.label}><h3>{table.label}</h3><GuideTable table={table} /></div>)}</div>}
      <GuideCards cards={section.cards} />
      {section.links?.length > 0 && <div className={styles.guideLinks}>{section.links.map((link) => <Link key={link.href} to={link.href}>{link.label}<span aria-hidden="true">→</span></Link>)}</div>}
    </section>
  );
}

function HowToPlayPage({section, query}) {
  const project = useWikiProject();
  const guide = project.howToPlay;
  const requestedId = section.split('/')[1] ?? 'introduction';
  const pageIndex = Math.max(0, guide.pages.findIndex(({id}) => id === requestedId));
  const page = guide.pages[pageIndex] ?? guide.pages[0];
  const previous = guide.pages[pageIndex - 1];
  const next = guide.pages[pageIndex + 1];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = normalizedQuery
    ? page.sections.filter((entry) => JSON.stringify(entry).toLowerCase().includes(normalizedQuery))
    : page.sections;
  const pageHref = (candidate, index) => index === 0
    ? `${project.basePath}/how-to-play`
    : `${project.basePath}/how-to-play/${candidate.id}`;

  return (
    <article className={styles.guidePage}>
      <header className={styles.guideHero}>
        <div>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <span>Step {String(pageIndex + 1).padStart(2, '0')} of {String(guide.pages.length).padStart(2, '0')}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        {page.hero && <img src={resolveAsset(project, page.hero)} alt={`${page.label} guide`} />}
      </header>

      <nav className={styles.guideProgress} aria-label="How To Play progression">
        {guide.pages.map((entry, index) => <Link
          key={entry.id}
          to={pageHref(entry, index)}
          aria-current={index === pageIndex ? 'step' : undefined}
          className={index === pageIndex ? styles.guideProgressActive : undefined}
        ><span>{String(index + 1).padStart(2, '0')}</span>{entry.label}</Link>)}
      </nav>

      <div className={styles.guideSections}>
        {visibleSections.map((entry, index) => <GuideSection key={entry.title} section={entry} index={index} />)}
        {normalizedQuery && visibleSections.length === 0 && <p className={styles.empty}>No tutorial sections match “{query}”.</p>}
      </div>

      <nav className={styles.guidePager} aria-label="Tutorial pages">
        {previous ? <Link to={pageHref(previous, pageIndex - 1)}><span>Previous</span><strong>← {previous.label}</strong></Link> : <span />}
        {next ? <Link to={pageHref(next, pageIndex + 1)}><span>Next step</span><strong>{next.label} →</strong></Link> : <Link to={`${project.basePath}/machines`}><span>Continue exploring</span><strong>Machine catalog →</strong></Link>}
      </nav>
    </article>
  );
}

function ItemsPage({query, categorySection}) {
  const project = useWikiProject();
  const {items} = project;
  const itemCatalogClass = project.itemCatalogColumns === 1 ? styles.simpleCatalogList : `${styles.simpleCatalogList} ${styles.itemCatalogList}`;
  const [category, setCategory] = useState('All');
  const [page, setPage] = useCatalogPage([query, category, categorySection?.id]);
  const fixedCategories = categoriesInSection(categorySection);
  const normalized = query.trim().toLowerCase();
  const visible = items.filter((entry) => {
    const matchesCategory = fixedCategories.length
      ? fixedCategories.includes(entry.category)
      : (category === 'All' || entry.category === category);
    return matchesCategory
      && `${entry.name} ${entry.category} ${entry.id} ${entry.description ?? ''}`.toLowerCase().includes(normalized);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / CATALOG_PAGE_SIZE)));
  useEffect(() => {
    if (page !== currentPage) setPage(currentPage, {replace: true});
  }, [currentPage, page, setPage]);
  const pageEntries = visible.slice((currentPage - 1) * CATALOG_PAGE_SIZE, currentPage * CATALOG_PAGE_SIZE);
  const categoryOrder = project.itemCategoryOrder ?? [];
  const filters = categoriesFor(items).sort((left, right) => {
    if (left.name === 'All') return -1;
    if (right.name === 'All') return 1;
    const leftIndex = categoryOrder.indexOf(left.name);
    const rightIndex = categoryOrder.indexOf(right.name);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
  const grouped = pageEntries.reduce((groups, item) => {
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
      <CatalogResultBar id="items-page-results" totalItems={visible.length} page={currentPage} setPage={setPage} />
      {project.groupItemsByCategory ? <div className={styles.itemGroups}>{groupedEntries.map(([groupName, entries]) => (
        <section className={styles.itemGroup} key={groupName}>
          <header><div><span>Item category</span><h2>{groupName}</h2></div><b>{entries.length}</b></header>
          <ul className={itemCatalogClass} aria-label={`${groupName} item catalog`}>
            {entries.map((entry) => <ItemCard key={entry.id} entry={entry} />)}
          </ul>
        </section>
      ))}</div> : <ul className={itemCatalogClass} aria-label={`${project.name} item catalog`}>
        {pageEntries.map((entry) => <ItemCard key={entry.id} entry={entry} />)}
      </ul>}
      <CatalogPagination page={currentPage} totalItems={visible.length} onPageChange={setPage} targetId="items-page-results" />
      {!visible.length && <p className={styles.empty}>No items match the current filters.</p>}
    </>
  );
}

const HAMMER_TIER_LABELS = [
  'Wooden Hammer',
  'Stone, Copper, or Golden Hammer',
  'Iron or Steel Hammer',
  'Diamond or Netherite Hammer',
  'Aetherium Hammer',
  'Titanium Hammer',
];

function blockIdentifiers(entry) {
  return new Set([entry.id, entry.identifier, entry.shortId].filter(Boolean));
}

function sieveGroupForBlock(project, entry) {
  const identifiers = blockIdentifiers(entry);
  const recipes = project.processingRecipes
    .map(normalizedProcessingRecipe)
    .filter((recipe) => recipe.station === 'autosieve' && recipePrimaryInputs(recipe).some((input) => identifiers.has(input.id)));
  return autosieveRecipeGroups(recipes)[0] ?? null;
}

function hammerRequirementForBlock(project, entry) {
  const identifiers = blockIdentifiers(entry);
  const recipe = project.processingRecipes
    .map(normalizedProcessingRecipe)
    .filter((candidate) => candidate.station === 'crusher' && recipeOutputs(candidate).some((result) => identifiers.has(result.id)))
    .sort((left, right) => Number(left.tier ?? 0) - Number(right.tier ?? 0))[0];
  if (!recipe) return null;
  const tier = Number(recipe.tier ?? 0);
  return {tier, label: HAMMER_TIER_LABELS[tier] ?? `Tier ${tier} Hammer`, source: recipePrimaryInputs(recipe)[0]};
}

function blockTagsFor(entry, sieveGroup) {
  const source = `${entry.name} ${entry.id} ${entry.identifier} ${entry.category}`.toLowerCase();
  const tags = ['Block'];
  if (sieveGroup) tags.push('Siftable');
  if (/crushed/.test(source)) tags.push('Crushed');
  if (/compressed/.test(source)) tags.push('Compressed');
  if (/\bore\b|_ore/.test(source)) tags.push('Ore');
  if (/endstone|end_stone|\bend\b/.test(source)) tags.push('End');
  else if (/nether|blackstone|basalt|soul/.test(source)) tags.push('Nether');
  else tags.push('Overworld');
  if (entry.category && !tags.some((tag) => tag.toLowerCase() === entry.category.toLowerCase())) tags.push(entry.category);
  return [...new Set(tags)];
}

function BlocksPage({query}) {
  const project = useWikiProject();
  const {blocks, machines = [], generators = [], processingRecipes = []} = project;
  const specializedBlockSlugs = new Set([
    ...machines.map((entry) => entry.blockSlug ?? entry.id),
    ...generators.map((entry) => entry.blockSlug ?? entry.id),
  ]);
  const [tag, setTag] = useState('All');
  const [page, setPage] = useCatalogPage([query, tag]);
  const normalized = query.trim().toLowerCase();
  const catalog = useMemo(() => blocks
    .filter((entry) => !specializedBlockSlugs.has(entry.slug) && !specializedBlockSlugs.has(entry.shortId))
    .map((entry) => {
      const sieveGroup = sieveGroupForBlock(project, entry);
      return {entry, tags: blockTagsFor(entry, sieveGroup)};
    }), [blocks, processingRecipes]);
  const tagCounts = catalog.reduce((counts, item) => {
    item.tags.forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1));
    return counts;
  }, new Map());
  const tagOrder = ['Block', 'Siftable', 'Crushed', 'Compressed', 'Ore', 'End', 'Nether', 'Overworld'];
  const filters = [
    {name: 'All', count: catalog.length},
    ...[...tagCounts].map(([name, count]) => ({name, count})).sort((left, right) => {
      const leftIndex = tagOrder.indexOf(left.name);
      const rightIndex = tagOrder.indexOf(right.name);
      return (leftIndex < 0 ? tagOrder.length : leftIndex) - (rightIndex < 0 ? tagOrder.length : rightIndex) || left.name.localeCompare(right.name);
    }),
  ];
  const visible = catalog.filter(({entry, tags}) => (tag === 'All' || tags.includes(tag))
    && `${entry.name} ${entry.category} ${entry.tier} ${entry.id} ${tags.join(' ')}`.toLowerCase().includes(normalized));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / CATALOG_PAGE_SIZE)));
  useEffect(() => {
    if (page !== currentPage) setPage(currentPage, {replace: true});
  }, [currentPage, page, setPage]);
  const pageEntries = visible.slice((currentPage - 1) * CATALOG_PAGE_SIZE, currentPage * CATALOG_PAGE_SIZE);
  return (
    <>
      <PageIntro section="blocks" count={blocks.length} countLabel="blocks found" />
      <FilterChips categories={filters} active={tag} setActive={setTag} ariaLabel="Filter blocks by tag" />
      <CatalogResultBar id="blocks-page-results" totalItems={visible.length} page={currentPage} setPage={setPage} />
      <ul className={`${styles.simpleCatalogList} ${styles.blockCatalogList}`} aria-label={`${project.name} block catalog`}>
        {pageEntries.map(({entry, tags}) => <BlockCard key={entry.id} entry={entry} tags={tags} />)}
      </ul>
      <CatalogPagination page={currentPage} totalItems={visible.length} onPageChange={setPage} targetId="blocks-page-results" />
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

function compactNumber(value) {
  return Number(value).toLocaleString('en-US');
}

function uniqueFacts(pairs) {
  const seen = new Set();
  return pairs.filter((pair) => Array.isArray(pair)).filter(([label, value]) => value !== undefined && value !== null && value !== '').filter(([label, value]) => {
    const key = `${String(label).trim().toLowerCase()}|${Array.isArray(value) ? value.join(',') : String(value).trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function categoryTagsForMachine(machine, controller) {
  const components = controller?.componentKeys ?? [];
  const tags = ['Machine', 'Technology'];
  if (machine.category) tags.push(machine.category);
  if (components.some((component) => /dorios:energy|energy/.test(component))) tags.push('Power');
  if (components.some((component) => /machine_recipes/.test(component))) tags.push('Processing');
  if (/storage/i.test(machine.category ?? '')) tags.push('Storage');
  if (/automation/i.test(machine.category ?? '')) tags.push('Automation');
  if (/generator/i.test(machine.category ?? '')) tags.push('Generator');
  if (/utility/i.test(machine.category ?? '')) tags.push('Utility');
  return [...new Set(tags)];
}

function machineBlockDetails(machine, controller) {
  const data = controller?.blockData ?? {};
  const breakTime = data.breakTime !== undefined ? `${compactNumber(data.breakTime)} s` : null;
  return {
    items: uniqueFacts([
      breakTime && ['Breaking time', breakTime],
      data.tool && ['Required tool', data.tool],
      data.toolTier && ['Required tool tier', data.toolTier],
    ]),
    tags: categoryTagsForMachine(machine, controller),
  };
}

function machineSpecificationFacts(machine) {
  const data = machine.machineData ?? {};
  const rate = Number(data.baseRate);
  const cost = Number(data.energyCost);
  const processingTime = Number.isFinite(rate) && rate > 0 && Number.isFinite(cost) && cost > 0
    ? `${compactNumber(Math.ceil(cost / rate))} ticks / ${Number((cost / rate / 20).toFixed(2))}s`
    : null;
  const upgradeTypes = data.upgrades?.map((upgrade) => formatIdentifier(upgrade.type)).filter(Boolean);
  const upgradeSlots = data.upgradeSlots?.length ?? data.upgrades?.length;
  const generatedLabels = /^(?:base consumption|energy capacity|base energy rate|nominal base cycle|interface container|fluid capacity|gas capacity|production type|upgrade support|orientation)$/i;
  const configuredSpecifications = (machine.specifications ?? []).filter(([label]) => !generatedLabels.test(String(label)));
  const configuredIo = (machine.io ?? []).flatMap(([label, value]) => {
    if (/^energy$/i.test(String(label)) && (data.energyCapacity > 0 || data.energyCost > 0)) return [];
    if (/^configured (?:item|fluid|gas|energy) sides$/i.test(String(value))) return [];
    if (/^items$/i.test(String(label))) {
      const itemLabel = /output|extract/i.test(String(value)) ? 'Item output' : /input|insert/i.test(String(value)) ? 'Item input' : 'Items';
      return [[itemLabel, value]];
    }
    return [[label, value]];
  });
  return uniqueFacts([
    data.energyCapacity > 0 && ['Energy capacity', `${compactNumber(data.energyCapacity)} DE`],
    data.energyCost > 0 && ['Base energy consumption', `${compactNumber(data.energyCost)} DE/action`],
    data.baseRate > 0 && ['Base energy rate', `${compactNumber(data.baseRate)} DE/t`],
    processingTime && ['Base processing time', processingTime],
    data.fluidCapacity > 0 && ['Fluid capacity', `${compactNumber(data.fluidCapacity)} mB`],
    data.gasCapacity > 0 && ['Gas capacity', `${compactNumber(data.gasCapacity)} mB`],
    upgradeSlots > 0 && ['Upgrade slots', upgradeSlots],
    upgradeTypes?.length && ['Supported upgrades', upgradeTypes],
    machine.productionType && ['Production type', machine.productionType],
    ['Input', machine.input],
    ['Output', machine.output],
    ...configuredSpecifications,
    ...configuredIo,
  ]);
}

function normalizedStationId(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function machineRecipeSets(project, machine, controller) {
  const stationIds = new Set([
    machine.id,
    machine.recipe,
    machine.machineData?.recipeType,
    machine.machineData?.component?.split(':').pop(),
  ].filter(Boolean).map(normalizedStationId));
  const resultIds = new Set([
    controller?.id,
    controller?.identifier,
    machine.id,
    machine.identifier,
  ].filter(Boolean));
  return {
    obtain: project.craftingRecipeDetails.filter((recipe) => resultIds.has(recipe.result?.id)),
    catalog: project.processingRecipes
      .map(normalizedProcessingRecipe)
      .filter((recipe) => stationIds.has(normalizedStationId(recipe.station))),
  };
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
  const {craftingRecipeDetails, processingRecipes, stationMeta} = project;
  const [stationFilter, setStationFilter] = useState('All');
  const [originFilter, setOriginFilter] = useState('All');
  const [recipeMode, setRecipeMode] = useState('standard');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterButtonRef = useRef(null);
  const filterDialogRef = useRef(null);
  const [page, setPage] = useCatalogPage([query, stationFilter, originFilter, recipeMode]);
  const normalized = query.trim().toLowerCase();
  const allRecipes = useMemo(() => [
    ...craftingRecipeDetails,
    ...processingRecipes.map(normalizedProcessingRecipe),
  ], []);
  const catalystRecipeCount = allRecipes.filter((recipe) => isCatalystWeaverRecipe(recipe)).length;
  const standardRecipeCount = allRecipes.length - catalystRecipeCount;
  const modeRecipes = useMemo(() => allRecipes.filter((recipe) => (
    recipeMode === 'catalyst' ? isCatalystWeaverRecipe(recipe) : !isCatalystWeaverRecipe(recipe)
  )), [allRecipes, recipeMode]);
  const stationFilters = useMemo(() => {
    const counts = modeRecipes.reduce((result, recipe) => {
      const label = stationMeta[recipe.station]?.label ?? formatIdentifier(recipe.station);
      result[label] = (result[label] ?? 0) + 1;
      return result;
    }, {});
    return [{name: 'All', count: modeRecipes.length}, ...Object.entries(counts).map(([name, count]) => ({name, count}))];
  }, [modeRecipes, stationMeta]);
  const originFilters = useMemo(() => recipeOriginFilters(modeRecipes, project), [modeRecipes, project]);
  const visible = modeRecipes.filter((recipe) => {
    const stationLabel = stationMeta[recipe.station]?.label ?? formatIdentifier(recipe.station);
    const matchesStation = stationFilter === 'All' || stationFilter === stationLabel;
    const origin = recipeOriginFor(recipe, project);
    const searchable = `${recipe.identifier} ${recipe.category} ${stationLabel} ${origin.category} ${origin.addonLabel} ${recipeSearchTerms(recipe)}`.toLowerCase();
    return matchesStation && recipeMatchesOrigin(recipe, originFilter, project) && searchable.includes(normalized);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / CATALOG_PAGE_SIZE)));
  useEffect(() => {
    if (page !== currentPage) setPage(currentPage, {replace: true});
  }, [currentPage, page, setPage]);
  const pageRecipes = visible.slice((currentPage - 1) * CATALOG_PAGE_SIZE, currentPage * CATALOG_PAGE_SIZE);
  const selectRecipeMode = (mode) => {
    if (mode === recipeMode) return;
    setRecipeMode(mode);
    setStationFilter('All');
    setOriginFilter('All');
  };
  const activeFilterCount = Number(stationFilter !== 'All') + Number(originFilter !== 'All') + Number(recipeMode !== 'standard');
  const filterSummary = recipeMode === 'catalyst'
    ? 'Catalyst Weaver only'
    : activeFilterCount > 0 ? `${activeFilterCount} active` : 'Standard recipes';
  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
    requestAnimationFrame(() => filterButtonRef.current?.focus());
  }, []);
  const resetFilters = () => {
    setRecipeMode('standard');
    setStationFilter('All');
    setOriginFilter('All');
  };
  useEffect(() => {
    if (!filtersOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeFilters();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...filterDialogRef.current.querySelectorAll('button:not(:disabled), select, [href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === filterDialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => filterDialogRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeFilters, filtersOpen]);
  return (
    <>
      <PageIntro section="recipes" count={allRecipes.length} countLabel="documented entries" />
      <div className={styles.recipeFilterToolbar}>
        <button
          ref={filterButtonRef}
          type="button"
          className={styles.openRecipeFilters}
          aria-expanded={filtersOpen}
          aria-controls="recipe-filter-dialog"
          onClick={() => setFiltersOpen(true)}
        >
          <IconAdjustmentsHorizontal aria-hidden="true" size={20} stroke={1.8} />
          <span><strong>Filters</strong><small>{filterSummary}</small></span>
          {activeFilterCount > 0 && <b aria-label={`${activeFilterCount} active filters`}>{activeFilterCount}</b>}
        </button>
      </div>
      {filtersOpen && <div className={styles.recipeFilterOverlay} onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeFilters();
      }}>
        <section
          id="recipe-filter-dialog"
          ref={filterDialogRef}
          className={styles.recipeFilterDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="recipe-filter-title"
          tabIndex={-1}
        >
          <header>
            <div><span>Recipe catalog</span><h2 id="recipe-filter-title">Filters</h2></div>
            <button type="button" onClick={closeFilters} aria-label="Close recipe filters"><IconX aria-hidden="true" size={21} /></button>
          </header>
          <div className={styles.recipeFilterContent}>
            <div className={styles.recipeFilterFields}>
              <FilterSelect label="Recipe station" categories={stationFilters} active={stationFilter} setActive={setStationFilter} />
              {originFilters.length > 2 && <FilterSelect label="Added by" categories={originFilters} active={originFilter} setActive={setOriginFilter} ariaLabel="Filter recipes by add-on origin" />}
            </div>
            {catalystRecipeCount > 0 && <section className={styles.recipeFamilyFilter}>
              <div><span>Recipe family</span><p>Catalyst Weaver recipes stay hidden until selected and are shown separately from every other station.</p></div>
              <div role="radiogroup" aria-label="Choose which recipe family is shown">
                <button type="button" role="radio" aria-checked={recipeMode === 'standard'} onClick={() => selectRecipeMode('standard')}>
                  <i aria-hidden="true" /><span><strong>Standard recipes</strong><small>{standardRecipeCount.toLocaleString('en-US')} entries</small></span>
                </button>
                <button type="button" role="radio" aria-checked={recipeMode === 'catalyst'} onClick={() => selectRecipeMode('catalyst')}>
                  <i aria-hidden="true" /><span><strong>Catalyst Weaver</strong><small>{catalystRecipeCount.toLocaleString('en-US')} entries</small></span>
                </button>
              </div>
            </section>}
          </div>
          <footer>
            <button type="button" className={styles.resetRecipeFilters} onClick={resetFilters} disabled={activeFilterCount === 0}>Reset</button>
            <button type="button" className={styles.applyRecipeFilters} onClick={closeFilters}>Show {visible.length.toLocaleString('en-US')} recipes</button>
          </footer>
        </section>
      </div>}
      <CatalogResultBar id="recipes-page-results" totalItems={visible.length} page={currentPage} setPage={setPage} />
      <section className={styles.recipeGrid}>
        {pageRecipes.map((recipe) => <RecipeCard key={`${recipe.station}-${recipe.id}`} recipe={recipe} />)}
      </section>
      <CatalogPagination page={currentPage} totalItems={visible.length} onPageChange={setPage} targetId="recipes-page-results" />
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
          return <Link className={styles.selectableCard} to={`${project.basePath}/mechanics/${slug}`} key={mechanic.name}><article><span><WikiIcon name={mechanic.icon} size={21} /></span><div><h2>{mechanic.name}</h2><p>{mechanic.description}</p></div></article></Link>;
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
    ['Identifier', entry.identifier ?? entry.id],
    ['Block type', entry.blockType ?? 'Block'],
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
    ...(entry.blockDetails ?? []),
  ].filter(Boolean);
}

function blockCategoryTags(entry) {
  const components = entry.componentKeys ?? [];
  const tags = [entry.category];
  if (components.some((component) => /dorios:energy|tag:dorios:energy/.test(component))) tags.push('Power');
  if (components.some((component) => /dorios:fluid/.test(component))) tags.push('Fluid');
  if (components.some((component) => /dorios:machine/.test(component))) tags.push('Machine');
  if (components.some((component) => /dorios:generator/.test(component))) tags.push('Generator');
  if (entry.blockData?.lightEmission !== undefined) tags.push('Lighting');
  return [...new Set(tags.filter(Boolean))];
}

function entryReferenceGroups(entryType, entry) {
  if (entryType === 'blocks') {
    return [
      {
        id: 'details',
        title: 'Block Details',
        copy: 'Physical behavior, useful limits and registry information for this block.',
        items: blockDetailFacts(entry),
        tags: blockCategoryTags(entry),
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
            <PropertyTags tags={group.tags} />
          </section>
        ))}
      </div>
    </section>
  );
}

function romanNumeral(value) {
  let remainder = Math.max(0, Math.floor(Number(value) || 0));
  if (remainder === 0) return '0';
  const tokens = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let result = '';
  tokens.forEach(([amount, symbol]) => {
    while (remainder >= amount) {
      result += symbol;
      remainder -= amount;
    }
  });
  return result;
}

function MiningReference({mining}) {
  const [activeTab, setActiveTab] = useState('drops');
  if (!mining) return null;
  const tabs = [
    {id: 'drops', label: 'Drops by enchantment'},
    {id: 'locations', label: 'Where to find'},
    {id: 'modifiers', label: 'Modifiers'},
  ];
  return (
    <section className={styles.oreMiningReference} aria-labelledby="ore-mining-reference">
      <header>
        <div><p className={styles.eyebrow}>Resource reference</p><h2 id="ore-mining-reference">Mining &amp; drops</h2></div>
        <p>Base loot is listed separately from optional StatsCore effects, so tool-specific drops remain clear.</p>
      </header>
      <div className={styles.oreMiningFacts}>
        <span><small>Required tool</small><strong>{mining.requiredTool}</strong></span>
        {mining.silkDrop && <span><small>Silk Touch</small><strong>{formatIdentifier(mining.silkDrop.id)} {mining.silkDrop.amount}</strong></span>}
      </div>
      <div className={styles.oreMiningTabs} role="tablist" aria-label="Mining documentation sections">
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? styles.activeOreMiningTab : undefined} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
      </div>
      {activeTab === 'drops' && <div className={styles.oreDropTable} role="table" aria-label="Drops by mining enchantment">
        <div className={styles.oreDropHeader} role="row"><span>Enchantment</span><span>Drop</span><span>Amount</span></div>
        <div className={styles.oreDropRows}>
          {mining.silkDrop && <div className={styles.oreDropRow} role="row" key="silk-touch">
            <strong>Silk Touch</strong>
            <span className={styles.oreDropItem}><RecipeSlot ingredient={{id: mining.silkDrop.id, label: formatIdentifier(mining.silkDrop.id)}} /><em>{formatIdentifier(mining.silkDrop.id)}</em></span>
            <span>{mining.silkDrop.amount ?? '×1'}</span>
          </div>}
          {mining.drops.map((drop) => <div className={styles.oreDropRow} role="row" key={drop.fortune}>
          <strong>Fortune {romanNumeral(drop.fortune)}</strong>
          <span className={styles.oreDropItem}><RecipeSlot ingredient={{id: drop.id, label: formatIdentifier(drop.id)}} /><em>{formatIdentifier(drop.id)}</em></span>
          <span>{drop.amount}</span>
        </div>)}
        </div>
      </div>}
      {activeTab === 'locations' && <div className={styles.oreLocationList}>{mining.locations.map((location, index) => <article key={`${location.dimension}-${location.height}-${index}`}>
        <strong>{location.dimension}</strong><span>{location.height}</span><small>Replaces {location.replace} · {location.detail}</small>
      </article>)}</div>}
      {activeTab === 'modifiers' && <div className={`${styles.oreDropTable} ${styles.oreModifierTable}`} role="table" aria-label="Drops changed by special mining abilities">
        <div className={styles.oreModifierHeader} role="row"><span>Special ability</span><span>Possible drop</span><span>Loot behavior</span></div>
        <div className={styles.oreModifierRows}>{mining.modifiers.map((modifier) => <div className={styles.oreModifierRow} role="row" key={modifier.title}>
          <strong>{modifier.title}</strong>
          <span className={styles.oreModifierDrops}>{modifier.dropLabel
            ? <span className={styles.oreModifierTextDrop}>{modifier.dropLabel}</span>
            : meaningfulList(modifier.drops).map((drop, index) => <span className={styles.oreDropItem} key={`${drop.id}-${index}`}><RecipeSlot ingredient={{id: drop.id, label: formatIdentifier(drop.id)}} /><span><em>{formatIdentifier(drop.id)}</em>{drop.amount && <small>{drop.amount}</small>}</span></span>)}</span>
          <p>{modifier.copy}</p>
        </div>)}</div>
      </div>}
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
    statisticsTitle: source.statisticsTitle,
    statistics: meaningfulList(source.statistics),
    sections: meaningfulList(source.sections),
    tier: source.tier ?? entry.tier,
    properties: meaningfulList(source.properties),
    primarySources: meaningfulList(source.primarySources),
    mainUses: meaningfulList(source.mainUses),
    relatedItems: meaningfulList(source.relatedItems),
    trivia: meaningfulList(source.trivia),
    acquisition: {
      entityDrops: meaningfulList(source.acquisition?.entityDrops),
      structures: meaningfulList(source.acquisition?.structures),
      biomes: meaningfulList(source.acquisition?.biomes),
    },
    usage: source.usage,
  };
}

function compactItemDescription(entry, documentation) {
  const description = String(documentation.description ?? '').trim();
  const slot = documentation.basic.equipSlot;
  const behavior = description.match(/\b(grants?|provides?|applies?|prevents?|increases?|reduces?)\b.+$/i)?.[0];
  if (slot && slot !== 'Not a trinket slot' && behavior) {
    return `${slot}-slot trinket that ${behavior.charAt(0).toLowerCase()}${behavior.slice(1)}`;
  }
  const escapedName = entry.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const withoutRepeatedName = description.replace(new RegExp(`^${escapedName}\\s+is\\s+(?:an?|the)\\s+`, 'i'), '');
  if (withoutRepeatedName !== description) return `${withoutRepeatedName.charAt(0).toUpperCase()}${withoutRepeatedName.slice(1)}`;
  return description;
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

function SiftableBlockReference({entry, group, hammer}) {
  const [expanded, setExpanded] = useState(false);
  if (!group?.drops?.length) return null;
  const contentId = `block-${autosieveContentId(entry.id ?? entry.slug)}`;
  const minimumTier = Math.min(...group.drops.map((drop) => drop.tier));
  return (
    <section className={styles.siftableBlockReference} aria-labelledby="siftable-block-reference">
      <header>
        <SieveItemVisual ingredient={group.input} className={styles.autosieveInputVisual} />
        <div><p className={styles.eyebrow}>Sifting reference</p><h2 id="siftable-block-reference">Siftable block</h2><p>{group.drops.length} possible drops, each rolled independently.</p></div>
      </header>
      <div className={styles.siftableBlockFacts}>
        {hammer && <span><small>Required hammer</small><strong>{hammer.label}</strong>{hammer.source && <em>Created from {ingredientLabel(hammer.source)}</em>}</span>}
        <span><small>Minimum mesh</small><SieveMeshBadge tier={minimumTier} /></span>
        <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((current) => !current)}>
          <span>{expanded ? 'Hide drop table' : 'Show drop table'}</span><b aria-hidden="true">{expanded ? '−' : '+'}</b>
        </button>
      </div>
      {expanded && <div id={contentId} className={styles.autosieveDropList}>
        <div className={styles.autosieveDropHeader} aria-hidden="true"><span>Drop</span><span>Chance</span><span>Amount</span><span>Min. tier</span></div>
        <AutoSieveDropRows drops={group.drops} />
      </div>}
    </section>
  );
}

function useWikiQuery() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('q') ?? '');
  }, [location.search]);
  return [query, setQuery];
}

function DocumentationSection({section}) {
  const project = useWikiProject();
  const facts = meaningfulList(section.facts).filter((fact) => Array.isArray(fact) && fact[1] !== undefined && fact[1] !== null && fact[1] !== '');
  const entries = meaningfulList(section.entries);
  const repairs = meaningfulList(section.repairs);
  const enchantmentGroups = [
    {label: 'Damage — choose one', names: ['Sharpness', 'Smite', 'Bane of Arthropods']},
    {label: 'Protection — choose one', names: ['Protection', 'Fire Protection', 'Blast Protection', 'Projectile Protection']},
    {label: 'Mining drops — choose one', names: ['Fortune', 'Silk Touch']},
    {label: 'Boot movement — choose one', names: ['Depth Strider', 'Frost Walker']},
    {label: 'Bow infinity — choose one', names: ['Infinity', 'Mending']},
  ];
  const groupedEntries = (() => {
    if (section.id !== 'enchantments') return entries.map((entry) => ({entry}));
    const available = new Set(entries);
    const groupsByFirstEntry = new Map();
    enchantmentGroups.forEach((group) => {
      const names = group.names.filter((name) => available.has(name));
      if (names.length > 1) {
        names.forEach((name) => available.delete(name));
        groupsByFirstEntry.set(Math.min(...names.map((name) => entries.indexOf(name))), {...group, names});
      }
    });
    const result = [];
    entries.forEach((entry, index) => {
      if (groupsByFirstEntry.has(index)) result.push({group: groupsByFirstEntry.get(index)});
      if (available.has(entry)) result.push({entry});
    });
    return result;
  })();
  return (
    <section className={`${styles.itemEditorialSection} ${styles.documentationSection}`} aria-labelledby={`item-section-${section.id}`}>
      <ItemSectionHeading id={`item-section-${section.id}`} icon="capabilities">{section.title ?? section.label}</ItemSectionHeading>
      {section.copy && <p className={styles.documentationCopy}>{section.copy}</p>}
      {facts.length > 0 && <dl className={styles.itemBasicList}>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join(', ') : value}</dd></div>)}</dl>}
      {repairs.length > 0 && <ul className={styles.repairItemList} aria-label="Repair materials">{repairs.map((repair, index) => {
        const target = catalogEntryFor(project, repair.id);
        const href = detailLinkFor(project, repair.id);
        const image = visualFor(project, repair.id);
        const content = <>{image && <img src={image} alt="" loading="lazy" />}<strong>{repair.label ?? target?.name ?? formatIdentifier(repair.id)}</strong>{repair.value && <q>{repair.value}</q>}</>;
        return <li key={`${repair.id}-${index}`}>{href ? <Link to={href}>{content}</Link> : <span>{content}</span>}</li>;
      })}</ul>}
      {entries.length > 0 && <ul className={styles.documentationList} data-layout={section.id === 'enchantments' ? 'list' : undefined}>{groupedEntries.map((item, index) => item.group
        ? <li className={styles.enchantmentGroup} key={item.group.label}><strong>{item.group.label}</strong><ul>{item.group.names.map((name) => <li key={name}>{name}</li>)}</ul></li>
        : <li key={`${item.entry}-${index}`}>{item.entry}</li>)}</ul>}
    </section>
  );
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
  return recipes.filter((recipe) => [
    ...(recipe.slots ?? []),
    ...recipePrimaryInputs(recipe),
    ...recipeCatalysts(recipe),
    ...(recipe.inputGroups ?? []).flatMap((group) => group.alternatives ?? []),
  ].some((ingredient) => identifiers.has(ingredient?.id ?? ingredient?.identifier)));
}

function relatedItemsFor(project, entry, usedIn, curated = []) {
  const identifiers = itemIdentifiers(entry);
  if (curated.length) return curated.map((value) => catalogEntryFor(project, value)).filter(Boolean);
  const sameCategory = (project.items ?? []).filter((candidate) => (
    candidate.category === entry.category && !identifiers.has(candidate.id) && !identifiers.has(candidate.identifier)
  ));
  const family = String(entry.shortId ?? entry.id).split('_')[0];
  const recipeNeighbours = usedIn.map((recipe) => catalogEntryFor(project, recipe.result)).filter(Boolean);
  const familyItems = sameCategory.filter((candidate) => String(candidate.shortId ?? candidate.id).includes(family));
  const seen = new Set();
  return [...recipeNeighbours, ...familyItems, ...sameCategory].filter((candidate) => {
    const key = candidate.identifier ?? candidate.id;
    if (!key || identifiers.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}

function itemRecipeHref(project, recipe) {
  return `${project.basePath}/recipes/${recipe.type ? 'processing' : 'crafting'}-${recipe.id}`;
}

function recipeMatchesReference(recipe, reference = {}) {
  if (reference.id && recipe.id !== reference.id) return false;
  if (reference.station && recipe.station !== reference.station) return false;
  if (reference.result && recipe.result?.id !== reference.result) return false;
  if (reference.input) {
    const ingredients = [...recipePrimaryInputs(recipe), ...recipeCatalysts(recipe), ...(recipe.slots ?? [])];
    if (!ingredients.some((ingredient) => ingredient?.id === reference.input)) return false;
  }
  return Boolean(reference.id || reference.station || reference.result || reference.input);
}

function resolveEditorialRecipe(project, reference) {
  if (!reference) return null;
  const recipes = [
    ...project.craftingRecipeDetails,
    ...project.processingRecipes.map(normalizedProcessingRecipe),
  ];
  return recipes.find((recipe) => recipeMatchesReference(recipe, reference)) ?? null;
}

function aggregateIngredients(ingredients) {
  const result = [];
  for (const ingredient of ingredients.filter(Boolean)) {
    const key = ingredient.id ?? ingredient.label;
    const current = result.find((item) => (item.id ?? item.label) === key);
    if (current) current.count = (current.count ?? 1) + (ingredient.count ?? 1);
    else result.push({...ingredient, count: ingredient.count ?? 1});
  }
  return result;
}

function ItemRecipeGroup({label, ingredients, result = false}) {
  if (!ingredients.length) return null;
  return <div className={styles.itemRecipeGroup}>
    <small>{label}</small>
    <div>{aggregateIngredients(ingredients).map((ingredient, index) => <div className={styles.itemRecipeIngredient} key={`${ingredient.id ?? ingredient.label}-${index}`}>
      <RecipeSlot ingredient={ingredient} result={result} />
      <span><strong>{ingredientLabel(ingredient)}</strong>{(ingredient.count ?? 1) > 1 && <small>×{ingredient.count}</small>}</span>
    </div>)}</div>
  </div>;
}

function ItemCraftingRecipeGroup({recipe}) {
  const {twoByTwo, slots} = craftingGridFor(recipe);
  const ingredients = aggregateIngredients(slots);
  if (!ingredients.length) return null;
  return <div className={styles.itemCraftingRecipeGroup}>
    <div className={`${styles.craftingSlots} ${twoByTwo ? styles.craftingSlots2 : ''}`}>
      {slots.map((ingredient, slot) => <RecipeSlot key={slot} ingredient={ingredient} />)}
    </div>
    <div className={styles.itemCraftingRecipeLegend}>
      <small>Input</small>
      <div>{ingredients.map((ingredient, index) => <span key={`${ingredient.id ?? ingredient.label}-${index}`}>
        <strong>{ingredientLabel(ingredient)}</strong>
        {(ingredient.count ?? 1) > 1 && <em>×{ingredient.count}</em>}
      </span>)}</div>
    </div>
  </div>;
}

function ItemRecipeCard({recipe}) {
  const project = useWikiProject();
  const station = project.stationMeta[recipe.station] ?? {label: formatIdentifier(recipe.station), face: project.recipeFallbackFace};
  const outputs = recipeOutputs(recipe);
  const byproducts = recipeByproducts(recipe);
  const hasCraftingGrid = !recipe.type && Array.isArray(recipe.slots) && recipe.slots.some(Boolean);
  const metrics = [
    [recipe.cost ?? recipe.energyCost, 'Energy', `${Number(recipe.cost ?? recipe.energyCost).toLocaleString('en-US')} DE`],
    [recipe.ticks, 'Time', `${recipe.ticks} ticks · ${(recipe.ticks / 20).toLocaleString('en-US', {maximumFractionDigits: 2})}s`],
    [recipe.chance, 'Chance', formatChance(recipe.chance)],
  ].filter(([condition]) => condition !== undefined && condition !== null);
  return <article className={styles.itemRecipeCard}>
    <header>{station.face ? <img src={resolveAsset(project, station.face)} alt="" /> : <span className={styles.stationFallback} aria-hidden="true">▦</span>}
      <div><small>Station</small><strong>{station.label}</strong></div>
      <Link to={itemRecipeHref(project, recipe)} aria-label={`Open full ${station.label} recipe`}>Full recipe →</Link>
    </header>
    <div className={styles.itemRecipeFlow}>
      {hasCraftingGrid
        ? <ItemCraftingRecipeGroup recipe={recipe} />
        : <ItemRecipeGroup label="Input" ingredients={recipePrimaryInputs(recipe)} />}
      <ItemRecipeGroup label="Catalysts" ingredients={recipeCatalysts(recipe)} />
      <ItemRecipeGroup label={recipe.inputFluid ? 'Fluid input' : 'Fluid'} ingredients={recipeFluidInputs(recipe)} />
      <span className={styles.itemRecipeArrow} aria-hidden="true">↓</span>
      <ItemRecipeGroup label="Output" ingredients={outputs} result />
      <ItemRecipeGroup label="Secondary output" ingredients={byproducts} result />
    </div>
    {metrics.length > 0 && <dl className={styles.itemRecipeMetrics}>{metrics.map(([, label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
  </article>;
}

function ItemSection({id, title, children, className = ''}) {
  return <section className={`${styles.itemWikiSection} ${className}`} aria-labelledby={id}>
    <header><h2 id={id}>{title}</h2></header>
    {children}
  </section>;
}

function SourceMethod({source, recipe}) {
  const project = useWikiProject();
  const sourceItems = [...(source.items ?? []), ...(source.item ? [source.item] : [])];
  const visuals = sourceItems.map((item) => {
    const target = catalogEntryFor(project, item);
    return {
      id: item,
      label: target?.name ?? formatIdentifier(item),
      image: visualFor(project, item),
      href: detailLinkFor(project, item),
    };
  });
  if (source.station) {
    const station = project.stationMeta[source.station];
    const stationTarget = catalogEntryFor(project, source.station);
    visuals.push({
      id: `station-${source.station}`,
      label: station?.label ?? stationTarget?.name ?? formatIdentifier(source.station),
      image: station?.face ? resolveAsset(project, station.face) : visualFor(project, source.station),
      href: detailLinkFor(project, source.station),
      station: true,
    });
  }
  const outputItems = [...(source.outputs ?? []), ...(source.output ? [source.output] : [])];
  const outputVisuals = outputItems.map((item) => {
    const target = catalogEntryFor(project, item);
    return {
      id: `output-${item}`,
      label: target?.name ?? formatIdentifier(item),
      image: visualFor(project, item),
      href: detailLinkFor(project, item),
      output: true,
    };
  });
  const renderVisual = (entry) => {
    const content = <><img src={entry.image} alt="" loading="lazy" /><span>{entry.label}</span></>;
    return entry.href
      ? <Link className={styles.sourceVisual} data-station={entry.station || undefined} to={entry.href} key={entry.id}>{content}</Link>
      : <span className={styles.sourceVisual} data-station={entry.station || undefined} key={entry.id}>{content}</span>;
  };
  const hasProcess = outputVisuals.length > 0 || source.minimumMeshTier !== undefined;
  return <article className={styles.sourceMethod} data-source-type={String(source.type ?? '').toLowerCase().replace(/\s+/g, '-')}>
    <div className={styles.sourceMethodHeading}>
      <div><small>{source.type ?? 'Primary source'}</small><h3>{source.title}</h3>{source.description && <p>{source.description}</p>}</div>
      {!hasProcess && visuals.some(({image}) => image) && <div className={styles.sourceVisuals}>{visuals.filter(({image}) => image).map(renderVisual)}</div>}
    </div>
    {hasProcess && <div className={styles.sourceProcess}>
      {visuals.some(({image}) => image) && <div className={styles.sourceVisuals}>{visuals.filter(({image}) => image).map(renderVisual)}</div>}
      {outputVisuals.length > 0 && <><b className={styles.sourceProcessArrow} aria-hidden="true">→</b><div className={`${styles.sourceVisuals} ${styles.sourceOutputs}`}>{outputVisuals.filter(({image}) => image).map(renderVisual)}</div></>}
      {source.minimumMeshTier !== undefined && <div className={styles.sourceMesh}><small>Minimum mesh</small><SieveMeshBadge tier={source.minimumMeshTier} /></div>}
    </div>}
    {source.facts?.length > 0 && <dl>{source.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{source.emphasizeFacts ? <strong>{value}</strong> : value}</dd></div>)}</dl>}
    {recipe && <ItemRecipeCard recipe={recipe} />}
  </article>;
}

function MainUse({use, recipe}) {
  const project = useWikiProject();
  const target = catalogEntryFor(project, use.item ?? recipe?.result);
  const href = target ? detailLinkFor(project, target) : null;
  const image = target ? visualFor(project, target) : null;
  const heading = <>{image && <img src={image} alt="" />}<span><small>Main use</small><strong>{use.title ?? target?.name ?? formatIdentifier(recipe?.result?.id)}</strong></span></>;
  return <article className={styles.mainUse}>
    {href ? <Link className={styles.mainUseHeading} to={href}>{heading}<b aria-hidden="true">→</b></Link> : <div className={styles.mainUseHeading}>{heading}</div>}
    {use.description && <p>{use.description}</p>}
    {recipe && <ItemRecipeCard recipe={recipe} />}
  </article>;
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

function SourceGroup({icon, title, children}) {
  return (
    <section className={styles.sourceGroup}>
      <header><DetailIcon name={icon} /><h3>{title}</h3></header>
      <div className={styles.acquisitionGrid}>{children}</div>
    </section>
  );
}

function ItemDocumentation({entry, project, documentation, properties, groups, recipes, usedIn, relatedItems}) {
  const recipeCount = recipes.crafting.length + recipes.machine.length;
  const hasSources = documentation.acquisition.entityDrops.length > 0
    || documentation.acquisition.structures.length > 0
    || documentation.acquisition.biomes.length > 0;
  const selectedPrimary = documentation.primarySources.map((source) => ({source, recipe: resolveEditorialRecipe(project, source.recipe)}));
  const selectedRecipeIds = new Set(selectedPrimary.map(({recipe}) => recipe?.id).filter(Boolean));
  const fallbackRecipes = [...recipes.crafting, ...recipes.machine].slice(0, 2);
  const visibleRecipes = selectedPrimary.length ? [] : fallbackRecipes;
  const otherMethodCount = Math.max(0, recipeCount - selectedRecipeIds.size - visibleRecipes.length);
  const selectedUses = documentation.mainUses.map((use) => ({use, recipe: resolveEditorialRecipe(project, use.recipe)}));
  const visibleUses = selectedUses.length ? selectedUses : usedIn.slice(0, 2).map((recipe) => ({
    use: {id: recipe.id, item: recipe.result, description: `Used in a ${project.stationMeta[recipe.station]?.label ?? formatIdentifier(recipe.station)} recipe.`},
    recipe,
  }));
  const additionalUses = Math.max(0, usedIn.length - visibleUses.length);
  const recipeHref = `${project.basePath}/recipes?q=${encodeURIComponent(entry.identifier ?? entry.id)}`;
  return <div className={styles.itemArticleBody}>
    <ItemSection id="item-properties" eyebrow="Reference" title="Properties">
      <dl className={styles.itemProperties}>{properties.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {documentation.sections.map((section) => <DocumentationSection section={section} key={section.id} />)}
    </ItemSection>

    {(selectedPrimary.length > 0 || visibleRecipes.length > 0 || hasSources) && <ItemSection id="item-obtain" eyebrow="Sources" title="How to Obtain">
      {selectedPrimary.length > 0 && <><h3 className={styles.itemSubheading}>Primary Sources</h3><div className={styles.primarySources}>{selectedPrimary.map(({source, recipe}) => <SourceMethod key={source.id ?? source.title} source={source} recipe={recipe} />)}</div></>}
      {visibleRecipes.length > 0 && <div className={styles.primaryRecipes}>{visibleRecipes.map((recipe) => <ItemRecipeCard key={`${recipe.type ?? 'crafting'}-${recipe.id}`} recipe={recipe} />)}</div>}
      {hasSources && <div className={styles.sourceGroups}>
          {documentation.acquisition.entityDrops.length > 0 && <SourceGroup icon="entity" title="Entity Drops">
            {documentation.acquisition.entityDrops.map((drop, index) => <AcquisitionCard key={`${drop.entity}-${index}`} icon="entity" eyebrow="Entity Drop" title={formatIdentifier(drop.entity)} chance={formatChance(drop.chance)} quantity={quantityLabel(drop)} />)}
          </SourceGroup>}
          {documentation.acquisition.structures.length > 0 && <SourceGroup icon="structure" title="Structure Loot">
            {documentation.acquisition.structures.map((loot, index) => {
              const dimension = loot.conditions?.dimension ? formatIdentifier(loot.conditions.dimension) : null;
              const structure = loot.structure === 'default' ? (dimension ? `${dimension} Loot` : 'World Loot') : formatIdentifier(loot.structure);
              return <AcquisitionCard key={`${loot.structure}-${index}`} icon="structure" eyebrow="Structure Loot" title={structure} chance={formatChance(loot.chance)} note={loot.table ?? loot.category} />;
            })}
          </SourceGroup>}
          {documentation.acquisition.biomes.length > 0 && <SourceGroup icon="biome" title="Biome Loot">
            {documentation.acquisition.biomes.map((loot, index) => <AcquisitionCard key={`${loot.biome}-${index}`} icon="biome" eyebrow="Biome Loot" title={formatIdentifier(loot.biome)} chance={formatChance(loot.chance)} />)}
          </SourceGroup>}
      </div>}
      {(otherMethodCount > 0 || recipeCount > 0) && <div className={styles.itemMoreLink}><span><strong>Other Methods</strong>{otherMethodCount > 0 ? `${otherMethodCount} additional documented recipe${otherMethodCount === 1 ? '' : 's'} and conversion${otherMethodCount === 1 ? '' : 's'}.` : 'See this method in the complete recipe catalog.'}</span><Link to={recipeHref}>View all recipes →</Link></div>}
    </ItemSection>}

    {visibleUses.length > 0 && <ItemSection id="item-main-uses" eyebrow="Progression" title="Main Uses">
      <div className={styles.mainUses}>{visibleUses.map(({use, recipe}) => <MainUse key={use.id ?? recipe?.id} use={use} recipe={recipe} />)}</div>
      {(additionalUses > 0 || usedIn.length > 0) && <div className={styles.itemMoreLink}><span><strong>Additional uses</strong>{additionalUses > 0 ? `${additionalUses} more documented use${additionalUses === 1 ? '' : 's'}.` : 'Explore every documented use in the recipe catalog.'}</span><Link to={recipeHref}>View all uses →</Link></div>}
    </ItemSection>}

    {groups.length > 0 && <ItemSection id="item-capabilities" eyebrow="Equipment" title="Trinket Capabilities"><div className={styles.capabilityGrid}>{groups.map((group) => <CapabilityGroup key={group.id} group={group} />)}</div></ItemSection>}
    {documentation.usage && <ItemSection id="item-usage" eyebrow="Gameplay" title="Usage"><p className={styles.itemUsageCopy}>{documentation.usage}</p></ItemSection>}
    {(relatedItems.length > 0 || documentation.trivia.length > 0) && <div className={styles.itemClosingGrid}>
      {relatedItems.length > 0 && <ItemSection id="item-related" eyebrow="Continue reading" title="Related Items"><div className={styles.relatedItemGrid}>{relatedItems.map((item) => <RelatedItemCard project={project} item={item} key={item.identifier ?? item.id} />)}</div></ItemSection>}
      {documentation.trivia.length > 0 && <ItemSection id="item-trivia" eyebrow="Notes" title="Trivia"><ul className={styles.itemTrivia}>{documentation.trivia.map((note, index) => <li key={index}>{note}</li>)}</ul></ItemSection>}
    </div>}
  </div>;
}

function ItemDetail({entry, visual}) {
  const project = useWikiProject();
  const documentation = normalizedItemDocumentation(entry);
  const groups = capabilityGroups(documentation.capabilities);
  const statistics = documentation.statistics;
  const recipes = obtainingRecipes(project, entry);
  const usedIn = recipesUsingItem(project, entry);
  const relatedItems = relatedItemsFor(project, entry, usedIn, documentation.relatedItems);
  const rawProperties = [
    ['Type', documentation.basic.itemType],
    ['Tier', documentation.tier],
    ['Equip Slot', documentation.basic.equipSlot && documentation.basic.equipSlot !== 'Not a trinket slot' ? documentation.basic.equipSlot : null],
    ['Stack Size', documentation.basic.maximumStack],
    ['Add-on', project.name],
    ...documentation.properties,
    ...statistics,
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
  const properties = [...new Map(rawProperties.map((property) => [property[0].toLowerCase(), property])).values()];
  const typeLabel = String(documentation.basic.itemType ?? entry.category ?? 'Item').toUpperCase();
  return (
    <article className={styles.itemDetailPage}>
      <header className={styles.itemDetailHero}>
        <div className={styles.itemDetailVisual}>{visual}</div>
        <div className={styles.itemDetailHeading}>
          <p className={styles.eyebrow}>Item · {typeLabel}</p><h1>{entry.name}</h1>
          <div className={styles.itemHeaderMeta}><span>{documentation.basic.itemType}</span>{documentation.tier && <span>{documentation.tier} tier</span>}<span>{project.name}</span></div>
        </div>
        <div className={styles.itemDetailCopy}>
          <p>{compactItemDescription(entry, documentation)}</p>
          {documentation.basic.identifier && <div className={styles.itemIdentifier}><span>Identifier</span><code>{documentation.basic.identifier}</code><CopyIdentifierButton identifier={documentation.basic.identifier} /></div>}
        </div>
      </header>
      <ItemDocumentation
        entry={entry}
        project={project}
        documentation={documentation}
        properties={properties}
        groups={groups}
        recipes={recipes}
        usedIn={usedIn}
        relatedItems={relatedItems}
      />
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

function PropertyTags({tags}) {
  if (!tags?.length) return null;
  return <div className={styles.propertyTags} aria-label="Category tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>;
}

function MachineReferencePanel({index, title, copy, items, tags}) {
  if (!items.length && !tags?.length) return null;
  return (
    <section className={styles.machineReferenceGroup} data-group={title.toLowerCase().replace(/\s+/g, '-')}>
      <div className={styles.machineReferenceHeading}>
        <span aria-hidden="true">{String(index).padStart(2, '0')}</span>
        <div><h3>{title}</h3><p>{copy}</p></div>
      </div>
      <MachinePropertyList items={items} />
      <PropertyTags tags={tags} />
    </section>
  );
}

function dropQuantityLabel(drop) {
  const minimum = drop.min ?? drop.minimum ?? drop.count ?? drop.amount ?? 1;
  const maximum = drop.max ?? drop.maximum ?? drop.count ?? drop.amount ?? minimum;
  return minimum === maximum ? `×${minimum}` : `×${minimum}–${maximum}`;
}

function RecipeDropTable({drops}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? drops : drops.slice(0, 4);
  return (
    <div className={styles.machineProcessRequirement}>
      <small>Possible drops</small>
      <div className={styles.machineDropTable}>
        {visible.map((drop, index) => <span className={styles.machineDropSlot} key={`${drop.id ?? drop.label}-${index}`}>
          <RecipeSlot ingredient={drop} result />
          <em>{dropQuantityLabel(drop)}{drop.chance !== undefined && Number(drop.chance) < 1 ? ` · ${formatChance(drop.chance)}` : ''}</em>
        </span>)}
        {drops.length > 4 && <button type="button" className={styles.machineDropToggle} onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>
          {expanded ? 'Show less' : `+${drops.length - 4} more`}
        </button>}
      </div>
    </div>
  );
}

function RecipeValueInputGroups({groups}) {
  return (
    <div className={styles.machineProcessRequirement}>
      <small>Value inputs</small>
      <div className={styles.machineValueGroups}>{groups.map((group) => (
        <section className={styles.machineValueGroup} key={group.id ?? group.label}>
          <strong>{group.label ?? 'Input group'}{group.requiredValue ? ` · ${group.requiredValue} value` : ''}</strong>
          <div>{(group.alternatives ?? []).map((alternative, index) => <span className={styles.machineValueAlternative} key={`${alternative.id ?? alternative.label}-${index}`}>
            <RecipeSlot ingredient={{...alternative, count: 1}} />
            {alternative.value !== undefined && <em>{alternative.value}</em>}
            {alternative.value === undefined && alternative.power !== undefined && <em>×{alternative.power}</em>}
          </span>)}</div>
        </section>
      ))}</div>
    </div>
  );
}

function RecipeProcessRequirements({recipe, embeddedCatalysts = false, embeddedFluids = false, embeddedByproducts = false}) {
  const groups = recipeInputGroups(recipe).filter(({label}) => (
    label !== 'Input'
    && !(embeddedCatalysts && label === 'Catalysts')
    && !(embeddedFluids && /fluid/i.test(label))
  ));
  const byproducts = recipeByproducts(recipe);
  const visibleByproducts = embeddedByproducts ? [] : byproducts;
  const drops = recipeDrops(recipe);
  const conditions = recipeConditionLabels(recipe);
  const inputGroups = Array.isArray(recipe.inputGroups) ? recipe.inputGroups.filter(Boolean) : [];
  if (!groups.length && !visibleByproducts.length && !drops.length && !conditions.length && !inputGroups.length && !recipe.note) return null;
  return (
    <div className={styles.machineProcessRequirements}>
      {groups.map(({label, ingredients}) => (
        <div className={styles.machineProcessRequirement} key={label}>
          <small>{label}</small>
          <div>{ingredients.map((ingredient, index) => <React.Fragment key={`${ingredient.id ?? ingredient.label}-${index}`}>
            <RecipeSlot ingredient={ingredient} />
            {ingredient.kind === 'fluid' && <em className={styles.fluidRequirementLabel}>{ingredient.label}</em>}
          </React.Fragment>)}</div>
        </div>
      ))}
      {visibleByproducts.length > 0 && <div className={styles.machineProcessRequirement}>
        <small>Byproducts</small>
        <div>{visibleByproducts.map((ingredient, index) => <span className={styles.byproductSlot} key={`${ingredient.id ?? ingredient.label}-${index}`}>
          <RecipeSlot ingredient={ingredient} result />
          {ingredient.chance !== undefined && <em>{formatChance(ingredient.chance)}</em>}
        </span>)}</div>
      </div>}
      {drops.length > 0 && <RecipeDropTable drops={drops} />}
      {inputGroups.length > 0 && <RecipeValueInputGroups groups={inputGroups} />}
      {conditions.length > 0 && <div className={styles.machineProcessRequirement}>
        <small>Conditions</small>
        <div className={styles.machineProcessConditions}>{conditions.map((condition) => <span key={condition}>{condition}</span>)}</div>
      </div>}
      {recipe.note && <p className={styles.machineProcessNote}>{recipe.note}</p>}
    </div>
  );
}

function isCatalystWeaverRecipe(recipe, machine) {
  return [recipe.station, machine?.id, machine?.recipe, machine?.machineData?.recipeType]
    .filter(Boolean)
    .map(normalizedStationId)
    .some((value) => value === 'catalyst_weaver' || value.includes('catalyst_weaver'));
}

function CatalystWeaverRecipeFlow({recipe, machine, showMetric = true}) {
  const inputs = recipePrimaryInputs(recipe);
  const catalysts = recipeCatalysts(recipe);
  const fluids = recipeFluidInputs(recipe);
  const results = recipeOutputs(recipe);
  const byproducts = recipeByproducts(recipe);
  const metric = processingMetric(recipe, machine);
  const primaryInput = inputs[0];
  const primaryResult = results[0];
  const secondaryResult = results.slice(1);
  const fluid = fluids[0];
  const fluidName = fluid ? (fluidVisualFor(fluid.id)?.label ?? formatIdentifier(String(fluid.id).replace(/^fluid:/, ''))) : null;
  const fluidAmount = fluid?.amount ? `${Number(fluid.amount).toLocaleString('en-US')} ${fluid.unit ?? 'mB'}` : null;
  return (
    <div className={styles.catalystWeaverRecipeFlow}>
      <div className={styles.catalystWeaverInputMatrix} aria-label="Catalyst Weaver inputs">
        {Array.from({length: 6}, (_, index) => <span className={styles.catalystWeaverCatalyst} key={`catalyst-${index}`}>
          <RecipeSlot ingredient={catalysts[index]} />
        </span>)}
        <span className={styles.catalystWeaverPrimaryInput}>
          <RecipeSlot ingredient={primaryInput} />
        </span>
      </div>
      <div className={styles.catalystWeaverProcess}>
        <span className={styles.machineProcessArrow} aria-hidden="true">→</span>
        {showMetric && metric && <small><img src={MACHINE_RESOURCE_ICONS.energy} alt="" />{metric}</small>}
      </div>
      <div className={styles.catalystWeaverOutputArea}>
        <span className={styles.catalystWeaverMainOutput}><RecipeSlot ingredient={primaryResult} result /></span>
        <div className={styles.catalystWeaverSecondaryOutputs}>
          {byproducts.slice(0, 1).map((ingredient, index) => <span className={styles.catalystWeaverByproduct} key={`${ingredient.id ?? ingredient.label}-${index}`}>
            <RecipeSlot ingredient={{...ingredient, count: 1}} result />
            <em>{dropQuantityLabel(ingredient)}{ingredient.chance !== undefined ? ` · ${formatSieveChance(ingredient.chance)}` : ''}</em>
          </span>)}
          {secondaryResult.map((ingredient, index) => <span className={styles.catalystWeaverByproduct} key={`${ingredient.id ?? ingredient.label}-${index}`}>
            <RecipeSlot ingredient={{...ingredient, count: 1}} result />
            <em>{dropQuantityLabel(ingredient)}</em>
          </span>)}
        </div>
      </div>
      {fluid && <span className={styles.catalystWeaverFluid}>
        <RecipeSlot ingredient={fluid} />
        <span><strong>{fluidName}</strong>{fluidAmount && <em>{fluidAmount}</em>}</span>
      </span>}
    </div>
  );
}

function ProcessingCatalogCard({recipe, machine}) {
  const project = useWikiProject();
  const origin = recipeOriginFor(recipe, project);
  const inputs = recipePrimaryInputs(recipe);
  const results = recipeOutputs(recipe);
  const title = results.map(ingredientLabel).join(' + ');
  const metric = processingMetric(recipe, machine);
  const catalystWeaver = isCatalystWeaverRecipe(recipe, machine);
  return (
    <article className={`${styles.machineProcessCard} ${catalystWeaver ? styles.catalystWeaverProcessCard : ''}`} style={{'--recipe-origin-accent': recipeOriginFor(recipe, project).accent}}>
      <header><h4 title={title}>{title}</h4>{origin.id !== project.id && <RecipeOriginBadge recipe={recipe} compact />}</header>
      {catalystWeaver ? <CatalystWeaverRecipeFlow recipe={recipe} machine={machine} /> : <div className={styles.machineProcessFlow}>
        <div className={styles.machineProcessInputs}>
          {inputs.map((ingredient, index) => <React.Fragment key={`${ingredient.id ?? ingredient.label}-${index}`}>
            {index > 0 && <span className={styles.machineProcessJoin} aria-hidden="true">+</span>}
            <RecipeSlot ingredient={ingredient} />
          </React.Fragment>)}
        </div>
        <div className={styles.machineProcessCenter}>
          <span className={styles.machineProcessArrow} aria-hidden="true">→</span>
          {metric && <small><img className={styles.machineMetricIcon} src={MACHINE_RESOURCE_ICONS.energy} alt="" />{metric}</small>}
        </div>
        <div className={styles.machineProcessOutputs}>
          {results.map((ingredient, index) => <React.Fragment key={`${ingredient.id ?? ingredient.label}-${index}`}>
            {index > 0 && <span className={styles.machineProcessJoin} aria-hidden="true">+</span>}
            <RecipeSlot ingredient={ingredient} result />
          </React.Fragment>)}
        </div>
      </div>}
      <RecipeProcessRequirements recipe={recipe} embeddedCatalysts={catalystWeaver} embeddedFluids={catalystWeaver} embeddedByproducts={catalystWeaver} />
    </article>
  );
}

const SIEVE_MESH_TIERS = [
  'String',
  'Flint',
  'Copper',
  'Iron',
  'Golden',
  'Emerald',
  'Diamond',
  'Netherite',
];

function sieveTierForRecipe(recipe) {
  const explicitTier = Number(recipe.meshTier ?? recipe.tier);
  if (Number.isInteger(explicitTier) && explicitTier >= 0) {
    return Math.min(explicitTier, SIEVE_MESH_TIERS.length - 1);
  }
  const identifier = String(recipe.id ?? recipe.identifier ?? '');
  const matchedTier = identifier.match(/mesh-tier-(\d+)/i);
  return matchedTier ? Math.min(Number(matchedTier[1]), SIEVE_MESH_TIERS.length - 1) : 0;
}

function formatSieveChance(chance) {
  const percentage = Number(chance ?? 0) * 100;
  return `${percentage.toLocaleString('en-US', {maximumFractionDigits: 2})}%`;
}

function formatSieveAmount(amount) {
  const maximum = Number(amount ?? 1);
  return maximum > 1 ? `1–${maximum}` : '1';
}

function autosieveContentId(value) {
  return `autosieve-drops-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function autosieveRecipeGroups(recipes) {
  const grouped = new Map();
  recipes.forEach((recipe) => {
    const input = recipe.slots?.find(Boolean);
    const result = recipe.result;
    if (!input || !result) return;
    const id = input.id ?? input.label ?? recipe.id;
    if (!grouped.has(id)) grouped.set(id, {id, input, drops: []});
    grouped.get(id).drops.push({
      id: recipe.id,
      result,
      chance: Number(recipe.chance ?? result.chance ?? recipe.drops?.[0]?.chance ?? 0),
      amount: result.count ?? 1,
      tier: sieveTierForRecipe(recipe),
      origin: recipeOriginFor(recipe, {id: recipe.origin?.id ?? recipe.originId ?? 'utilitycraft', name: 'UtilityCraft'}),
    });
  });

  const priority = ['minecraft:dirt', 'minecraft:gravel', 'minecraft:sand'];
  return [...grouped.values()]
    .map((group) => ({
      ...group,
      drops: group.drops.sort((first, second) => first.tier - second.tier || second.chance - first.chance || ingredientLabel(first.result).localeCompare(ingredientLabel(second.result))),
    }))
    .sort((first, second) => {
      const firstPriority = priority.indexOf(first.id);
      const secondPriority = priority.indexOf(second.id);
      if (firstPriority !== -1 || secondPriority !== -1) {
        return (firstPriority === -1 ? priority.length : firstPriority) - (secondPriority === -1 ? priority.length : secondPriority);
      }
      return ingredientLabel(first.input).localeCompare(ingredientLabel(second.input));
    });
}

function SieveItemVisual({ingredient, className}) {
  const project = useWikiProject();
  const value = ingredient?.id ?? ingredient?.label;
  const name = ingredientLabel(ingredient);
  const image = visualFor(project, value);
  const href = detailLinkFor(project, value);
  const content = image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true">◇</span>;
  return href
    ? <Link className={className} to={href} aria-label={name} title={name}>{content}</Link>
    : <span className={className} role="img" aria-label={name} title={name}>{content}</span>;
}

function SieveMeshBadge({tier, className = ''}) {
  const project = useWikiProject();
  const name = SIEVE_MESH_TIERS[tier] ?? SIEVE_MESH_TIERS[0];
  const identifier = `utilitycraft:${name.toLowerCase()}_mesh`;
  const image = visualFor(project, identifier);
  const href = detailLinkFor(project, identifier);
  const content = <>{image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true">▧</span>}<span>{name}</span></>;
  const classes = `${styles.sieveMeshBadge} ${className}`.trim();
  return href
    ? <Link className={classes} to={href} title={`Open ${name} Mesh`}>{content}</Link>
    : <span className={classes} title={`${name} mesh`}>{content}</span>;
}

function AutoSieveDropRows({drops}) {
  const project = useWikiProject();
  return (
    <div className={styles.autosieveDropRows}>
      {drops.map((drop) => (
        <div className={styles.autosieveDropRow} key={drop.id} style={{'--recipe-origin-accent': drop.origin.accent}}>
          <div className={styles.autosieveDropName}><SieveItemVisual ingredient={drop.result} className={styles.autosieveDropVisual} /><strong>{ingredientLabel(drop.result)}</strong>{drop.origin.id !== project.id && <RecipeOriginBadge recipe={{origin: drop.origin}} compact />}</div>
          <span>{formatSieveChance(drop.chance)}</span>
          <span>{formatSieveAmount(drop.amount)}</span>
          <SieveMeshBadge tier={drop.tier} />
        </div>
      ))}
    </div>
  );
}

function AutoSieveSiftCard({group}) {
  const project = useWikiProject();
  const [expanded, setExpanded] = useState(false);
  const contentId = autosieveContentId(group.id);
  const minimumTier = Math.min(...group.drops.map((drop) => drop.tier));
  const origins = [...new Map(group.drops.map((drop) => [drop.origin.id, drop.origin])).values()];
  const externalOrigins = origins.filter((origin) => origin.id !== project.id);
  const singleOrigin = origins.length === 1 ? origins[0] : null;
  return (
    <article className={styles.autosieveSiftCard} data-expanded={expanded || undefined} style={singleOrigin ? {'--recipe-origin-accent': singleOrigin.accent} : undefined}>
      <header className={styles.autosieveSiftHeader}>
        <SieveItemVisual ingredient={group.input} className={styles.autosieveInputVisual} />
        <div className={styles.autosieveSiftCopy}>
          <div className={styles.autosieveSiftTitleRow}>
            <h4>{ingredientLabel(group.input)}</h4>
            <button type="button" className={styles.autosieveToggle} aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((current) => !current)}>
              <span>{expanded ? 'Hide drops' : 'Show drops'}</span><b aria-hidden="true">{expanded ? '−' : '+'}</b>
            </button>
          </div>
          <p>Sieveable block <span aria-hidden="true">·</span> {group.drops.length} possible drop{group.drops.length === 1 ? '' : 's'}</p>
          <div className={styles.autosieveMinTier}><small>Minimum mesh</small><SieveMeshBadge tier={minimumTier} /></div>
          {externalOrigins.length > 0 && <div className={styles.autosieveOriginBadges}>{externalOrigins.map((origin) => <RecipeOriginBadge key={origin.id} recipe={{origin}} compact />)}</div>}
        </div>
      </header>
      {expanded && <div id={contentId} className={styles.autosieveDropList}>
        <div className={styles.autosieveDropHeader} aria-hidden="true"><span>Drop</span><span>Chance</span><span>Amount</span><span>Min. tier</span></div>
        <AutoSieveDropRows drops={group.drops} />
      </div>}
    </article>
  );
}

function AutoSieveRecipeCatalog({recipes}) {
  const groups = autosieveRecipeGroups(recipes);
  return (
    <section className={`${styles.machineRecipeSubsection} ${styles.autosieveRecipeSection}`} aria-labelledby="machine-autosieve-recipes">
      <div>
        <p className={styles.eyebrow}>02 / Processing</p>
        <h3 id="machine-autosieve-recipes">Sifting Results</h3>
        <p className={styles.autosieveRecipeDescription}>The Autosieve rolls each sieveable block into its available drops. Results depend on the supplied block and the minimum mesh tier shown for each drop.</p>
      </div>
      <div className={styles.autosieveSiftGrid}>
        {groups.map((group) => <AutoSieveSiftCard group={group} key={group.id} />)}
      </div>
      <p className={styles.autosieveRecipeNote}>Chances are evaluated independently for every Autosieve roll.</p>
    </section>
  );
}

const ABYSSAL_LOOT_CATEGORIES = {
  fish: {label: 'Fish', description: 'Common catches from the abyssal waters', icon: 'minecraft:cod'},
  junk: {label: 'Junk', description: 'Utility finds and worn equipment', icon: 'minecraft:string'},
  treasure: {label: 'Treasure', description: 'Rare valuables and special rewards', icon: 'minecraft:heart_of_the_sea'},
};

function abyssalContentId(value) {
  return `abyssal-fisher-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function abyssalFisherGroups(recipes) {
  const groups = new Map();
  recipes.forEach((recipe) => {
    const category = recipe.lootCategory ?? recipe.conditions?.find((condition) => condition.id === 'loot-category')?.value;
    const result = recipe.result ?? recipe.drops?.[0];
    if (!category || !result) return;
    const definition = ABYSSAL_LOOT_CATEGORIES[category] ?? {label: titleize(category), description: 'Abyssal fishing loot', icon: result.id};
    if (!groups.has(category)) groups.set(category, {...definition, id: category, drops: []});
    groups.get(category).drops.push({
      id: recipe.id,
      result,
      tier: Number(recipe.minimumTier ?? recipe.conditions?.find((condition) => condition.id === 'tier')?.value ?? 0),
      amount: result.max ?? result.count ?? 1,
      minimumAmount: result.min ?? result.count ?? 1,
      weight: Number(recipe.relativeWeight ?? recipe.conditions?.find((condition) => condition.id === 'weight')?.value ?? 0),
      categoryWeight: Number(recipe.categoryBaseWeight ?? 0),
      durabilityDamageRange: recipe.durabilityDamageRange,
      randomEnchant: recipe.randomEnchant,
      bookEnchant: recipe.bookEnchant,
    });
  });
  const order = ['fish', 'junk', 'treasure'];
  return [...groups.values()]
    .map((group) => ({...group, drops: group.drops.sort((left, right) => left.tier - right.tier || right.weight - left.weight || ingredientLabel(left.result).localeCompare(ingredientLabel(right.result)))}))
    .sort((left, right) => (order.indexOf(left.id) === -1 ? order.length : order.indexOf(left.id)) - (order.indexOf(right.id) === -1 ? order.length : order.indexOf(right.id)));
}

function formatAbyssalAmount(drop) {
  return drop.minimumAmount !== drop.amount ? `${drop.minimumAmount}–${drop.amount}` : String(drop.amount);
}

function formatAbyssalWeight(weight) {
  const display = Math.round(weight * 10000) / 100;
  return `${display}%`;
}

function formatAbyssalRelativeWeight(weight) {
  return String(Math.round(weight * 100000) / 100000);
}

function abyssalDropSpecial(drop) {
  const special = [];
  if (drop.randomEnchant) special.push('May be enchanted');
  if (drop.bookEnchant) special.push('May become enchanted');
  if (drop.durabilityDamageRange) {
    const [minimum, maximum] = drop.durabilityDamageRange;
    special.push(`Worn: ${Math.round(minimum * 100)}–${Math.round(maximum * 100)}% damage`);
  }
  return special.join(' · ');
}

function AbyssalFisherDropRows({drops}) {
  return (
    <div className={styles.abyssalDropRows}>
      {drops.map((drop) => (
        <div className={styles.abyssalDropRow} key={drop.id}>
          <div className={styles.abyssalDropName}><SieveItemVisual ingredient={drop.result} className={styles.autosieveDropVisual} /><strong>{ingredientLabel(drop.result)}</strong></div>
          <span>Tier {drop.tier}</span>
          <span>{formatAbyssalAmount(drop)}</span>
          <span title="Relative weight within this category">{formatAbyssalRelativeWeight(drop.weight)}</span>
          <small>{abyssalDropSpecial(drop) || '—'}</small>
        </div>
      ))}
    </div>
  );
}

function AbyssalFisherLootCard({group}) {
  const [expanded, setExpanded] = useState(false);
  const contentId = abyssalContentId(group.id);
  const minimumTier = Math.min(...group.drops.map((drop) => drop.tier));
  const categoryWeight = group.drops[0]?.categoryWeight ?? 0;
  return (
    <article className={styles.abyssalLootCard} data-expanded={expanded || undefined}>
      <header className={styles.abyssalLootHeader}>
        <SieveItemVisual ingredient={{id: group.icon, label: group.label}} className={styles.autosieveInputVisual} />
        <div className={styles.autosieveSiftCopy}>
          <div className={styles.autosieveSiftTitleRow}>
            <h4>{group.label}</h4>
            <button type="button" className={styles.autosieveToggle} aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((current) => !current)}>
              <span>{expanded ? 'Hide loot' : 'Show loot'}</span><b aria-hidden="true">{expanded ? '−' : '+'}</b>
            </button>
          </div>
          <p>{group.drops.length} possible catch{group.drops.length === 1 ? '' : 'es'} <span aria-hidden="true">·</span> tier {minimumTier}+</p>
          <div className={styles.abyssalCategoryMeta}><span>Base category roll <b>{formatAbyssalWeight(categoryWeight)}</b></span><span>{group.description}</span></div>
        </div>
      </header>
      {expanded && <div id={contentId} className={styles.abyssalDropList}>
        <div className={styles.abyssalDropHeader} aria-hidden="true"><span>Catch</span><span>Tier</span><span>Amount</span><span>Weight</span><span>Variant</span></div>
        <AbyssalFisherDropRows drops={group.drops} />
      </div>}
    </article>
  );
}

function AbyssalFisherRecipeCatalog({recipes}) {
  const groups = abyssalFisherGroups(recipes);
  return (
    <section className={`${styles.machineRecipeSubsection} ${styles.abyssalRecipeSection}`} aria-labelledby="machine-abyssal-fisher-recipes">
      <div>
        <p className={styles.eyebrow}>02 / Abyssal fishing</p>
        <h3 id="machine-abyssal-fisher-recipes">Fishing Loot</h3>
        <p className={styles.autosieveRecipeDescription}>Each attempt rolls a loot category first, then picks a weighted catch that is available at the machine tier. The weights below only compare catches inside their own category.</p>
      </div>
      <div className={styles.abyssalLootGrid}>{groups.map((group) => <AbyssalFisherLootCard group={group} key={group.id} />)}</div>
      <p className={styles.autosieveRecipeNote}>Base category rolls are Fish 85%, Junk 10%, and Treasure 5%. Luck of the Sea and machine upgrades can change category weights and the number of attempts.</p>
    </section>
  );
}

const DYNAMIC_MACHINE_OPERATIONS = {
  arcane_enchanter: {
    title: 'Dynamic Enchantment',
    description: 'The result depends on the item and its compatible enchantments, so it has no finite recipe list.',
    steps: [
      ['Input', 'One enchantable item'],
      ['Required', 'Enchantability Module, Lapis Lazuli, XP fluid and energy'],
      ['Optional', 'Curse Protection Module to prevent curse enchantments'],
      ['Result', 'The same item with a compatible enchantment plan applied'],
      ['Costs', '6 seconds; 300 XP and 12 lapis per enchantment, plus energy scaled by the plan and module'],
    ],
  },
  disenchanter: {
    title: 'Dynamic Disenchantment',
    description: 'Choose a mode in the machine UI. The source must be a single enchanted item.',
    steps: [
      ['Extraction', 'Enchanted item + Book → item with one enchantment removed + Enchanted Book'],
      ['Absorption', 'Enchanted item → fully disenchanted item + recovered XP fluid'],
      ['Energy', '10,000 DE per extraction or 7,000 DE per absorption'],
      ['Output rule', 'Extraction needs an empty book-output slot; absorption needs free XP-tank capacity'],
    ],
  },
  duplicator: {
    title: 'Template Duplication',
    description: 'The machine creates a recipe at runtime for every eligible template; rarity determines the time and energy cost.',
    steps: [
      ['Input', 'One eligible item or block template'],
      ['Fluid', '1,000 mB Liquified Aetherium per copy'],
      ['Result', 'The original template is returned and one identical copy is produced'],
      ['Base cost', '1,600,000 DE and 30 minutes before rarity multipliers'],
      ['Restrictions', 'Unclonnable-tagged templates and configured exclusions cannot be duplicated'],
    ],
  },
  enchantment_station: {
    title: 'Multi-lane Enchantment Station',
    description: 'This station evaluates the items and installed modules at runtime, so compatible outcomes cannot be represented by a fixed recipe table.',
    steps: [
      ['Processing', 'Repairs, reinforces and applies compatible enchantment plans to single items'],
      ['XP', 'Enchanting plans consume XP fluid; an empty or incompatible tank pauses that lane'],
      ['Disenchantment', 'With the station catalyst and Books, extracts enchantments; without them, absorbs enchantments into XP'],
      ['Energy', 'Main operations start at 64,000 DE; extraction scales with the number of enchantments'],
    ],
  },
  reinforcement_anvil: {
    title: 'Repair & Reinforcement',
    description: 'The operation is determined by the inserted tool or armor and, when present, its reinforcement module.',
    steps: [
      ['Repair', 'Restores durability on a damaged compatible item'],
      ['Reinforce', 'A Reinforcement Module raises the item’s reinforcement target when it has remaining capacity'],
      ['Combined result', 'The same item is repaired and/or reinforced in place'],
      ['Energy', '8,000 DE for repair plus 14,000 DE when reinforcement is applied'],
    ],
  },
  pattern_placer: {
    title: 'World Placement Pattern',
    description: 'This machine consumes valid block items and places them in the selected world pattern; the target positions make every operation contextual.',
    steps: [
      ['Input', 'Placeable blocks from the machine inventory'],
      ['Mode', 'Select the placement pattern in the machine UI'],
      ['Result', 'Blocks are placed into free target positions in front of the machine'],
      ['Energy', 'Base energy cost is multiplied by the number of blocks placed'],
    ],
  },
  seismic_breaker: {
    title: 'World Breaking Pattern',
    description: 'Drops are determined by the targeted blocks, the installed tool and the selected breaking pattern rather than by a static recipe registry.',
    steps: [
      ['Input', 'A valid mining tool'],
      ['Mode', 'Select the breaking pattern in the machine UI'],
      ['Result', 'Mines eligible world blocks and sends their real drops to the output'],
      ['Energy', 'Base energy cost is multiplied by the number of blocks broken'],
    ],
  },
  laser_barrier: {
    title: 'Laser Field Projection',
    description: 'The barrier is a continuous world effect, not a processing recipe.',
    steps: [
      ['Activation', 'Enable the projector and provide energy'],
      ['Field', 'Projects in the facing direction until blocked; contacts are damaged'],
      ['Upgrades', 'Length and Height upgrades expand the field; energy upgrades reduce its consumption'],
      ['Cost', 'Consumes energy continuously while the field is active'],
    ],
  },
};

function DynamicMachineOperation({machine}) {
  const operation = DYNAMIC_MACHINE_OPERATIONS[machine.id];
  if (!operation) return null;
  return (
    <section className={styles.machineRecipeSubsection} aria-labelledby="machine-dynamic-operation">
      <div><p className={styles.eyebrow}>02 / Dynamic operation</p><h3 id="machine-dynamic-operation">{operation.title}</h3><p className={styles.autosieveRecipeDescription}>{operation.description}</p></div>
      <dl className={styles.dynamicOperationList}>{operation.steps.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>
  );
}

function MachineRecipes({machine, recipes}) {
  const usesSiftingCatalog = machine.id === 'autosieve';
  const usesAbyssalFisherCatalog = machine.id === 'abyssal_fisher';
  const [originFilter, setOriginFilter] = useState('All');
  const project = useWikiProject();
  const visibleCatalog = recipes.catalog.filter((recipe) => recipeMatchesOrigin(recipe, originFilter, project));
  return (
    <div className={styles.machineRecipes}>
      <section className={styles.machineRecipeSubsection} aria-labelledby="machine-obtain">
        <div><p className={styles.eyebrow}>01 / Acquisition</p><h3 id="machine-obtain">How to Obtain</h3></div>
        {recipes.obtain.length ? <div className={styles.machineObtainGrid}>{recipes.obtain.map((recipe) => <RecipeCard recipe={recipe} key={`obtain-${recipe.id}`} />)}</div>
          : <p className={styles.machineRecipeEmpty}>No crafting recipe is indexed for this machine.</p>}
      </section>
      {recipes.catalog.length > 0 && <RecipeOriginFilters recipes={recipes.catalog} active={originFilter} setActive={setOriginFilter} />}
      {visibleCatalog.length > 0 && usesSiftingCatalog ? <AutoSieveRecipeCatalog recipes={visibleCatalog} />
        : visibleCatalog.length > 0 && usesAbyssalFisherCatalog ? <AbyssalFisherRecipeCatalog recipes={visibleCatalog} />
        : visibleCatalog.length > 0 && <section className={styles.machineRecipeSubsection} aria-labelledby="machine-recipes-catalog">
        <div><p className={styles.eyebrow}>02 / Processing</p><h3 id="machine-recipes-catalog">Recipes Catalog</h3></div>
        <div className={styles.machineRecipeCatalog}>{visibleCatalog.map((recipe) => <ProcessingCatalogCard recipe={recipe} machine={machine} key={`process-${recipe.id}`} />)}</div>
      </section>}
      {!recipes.catalog.length && <DynamicMachineOperation machine={machine} />}
      {recipes.catalog.length > 0 && !visibleCatalog.length && <p className={styles.machineRecipeEmpty}>No recipes match the selected add-on origin.</p>}
    </div>
  );
}

function MachineDocumentationTabs({machine, controller, blockDetails, specifications}) {
  const project = useWikiProject();
  const [activeTab, setActiveTab] = useState('block-details');
  const recipes = machineRecipeSets(project, machine, controller);
  const tabs = [
    {
      id: 'block-details',
      label: 'Block Details',
      content: <div className={styles.machineReferenceGrid}>
        <MachineReferencePanel index={1} title="Block Details" copy="Minecraft block properties, mining requirements and applicable categories." items={blockDetails.items} tags={blockDetails.tags} />
      </div>,
    },
    {
      id: 'machine-specifications',
      label: 'Machine Specifications',
      content: <div className={styles.machineReferenceGrid}>
        <MachineReferencePanel index={2} title="Machine Specifications" copy="Capacity, operating values, interfaces and machine-specific limits." items={specifications} />
      </div>,
    },
    {
      id: 'recipes',
      label: 'Recipes',
      content: <MachineRecipes machine={machine} recipes={recipes} />,
    },
  ];
  return (
    <section className={styles.machineReference} aria-labelledby="machine-reference">
      <header>
        <div>
          <p className={styles.eyebrow}>Technical reference</p>
          <h2 id="machine-reference">Built to be understood</h2>
        </div>
        <p>Choose a section to inspect block properties, technical capabilities, or the recipes this machine supports.</p>
      </header>
      <div className={styles.machineTabs} role="tablist" aria-label="Machine documentation sections">
        {tabs.map((tab) => <button
          key={tab.id}
          id={`machine-tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`machine-panel-${tab.id}`}
          className={activeTab === tab.id ? styles.activeMachineTab : undefined}
          onClick={() => setActiveTab(tab.id)}
        >{tab.label}</button>)}
      </div>
      {tabs.map((tab) => <div
        key={tab.id}
        id={`machine-panel-${tab.id}`}
        role="tabpanel"
        aria-labelledby={`machine-tab-${tab.id}`}
        className={styles.machineTabPanel}
        hidden={activeTab !== tab.id}
      >{tab.content}</div>)}
    </section>
  );
}

function MachineDetail({entry, controller, sequence}) {
  const machine = documentedMachine(entry);
  const blockDetails = machineBlockDetails(machine, controller);
  const specifications = machineSpecificationFacts(machine);
  return (
    <>
      <article className={styles.machineDetailHero} data-category={machine.category.toLowerCase()}>
        <div className={styles.machineDetailVisual}>
          {controller ? <BlockPreview entry={controller} size="min(100%, 14rem)" /> : <span className={styles.visualFallback} aria-hidden="true">▦</span>}
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

      <MachineDocumentationTabs machine={machine} controller={controller} blockDetails={blockDetails} specifications={specifications} />
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
  const relatedProcessing = project.processingRecipes
    .map(normalizedProcessingRecipe)
    .filter((recipe) => identifiers.has(recipe.result?.id)
      || recipe.results?.some((result) => identifiers.has(result?.id))
      || recipeInputGroups(recipe).some(({ingredients}) => ingredients.some((ingredient) => identifiers.has(ingredient?.id)))
      || recipeByproducts(recipe).some((byproduct) => identifiers.has(byproduct?.id)));
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
  const [query, setQuery] = useWikiQuery();
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
  let blockSieveGroup;
  let blockHammer;
  let blockTags = [];

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
    visual = <div className={styles.detailCubeVisual}><BlockPreview entry={entry} size="min(100%, 12.5rem)" /></div>;
    facts = blockDetailFacts(entry);
    referenceGroups = entryReferenceGroups(entryType, entry);
    blockSieveGroup = sieveGroupForBlock(project, entry);
    blockHammer = hammerRequirementForBlock(project, entry);
    blockTags = blockTagsFor(entry, blockSieveGroup);
  } else if (entryType === 'generators') {
    visual = <div className={styles.detailGuideVisual}>{entry.faces
      ? <BlockPreview entry={entry} size="min(100%, 12.5rem)" />
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
    visual = <div className={styles.detailMechanicVisual}><WikiIcon name={entry.icon} size={70} stroke={1.35} /></div>;
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
              ...(recipeOriginFor(recipe, project).id !== project.id ? [['Added by', <RecipeOriginBadge recipe={recipe} />]] : []),
              ['Used slots', recipe.slotCount],
              ['Energy', recipe.cost],
              ['Duration', recipe.duration ?? (recipe.ticks ? `${recipe.ticks} ticks` : null)],
              ['Fluid', normalizedFluidIngredient(recipe.fluid)?.label],
              ['Input fluid', normalizedFluidIngredient(recipe.inputFluid)?.label],
              ['Output fluid', normalizedFluidIngredient(recipe.outputFluid)?.label],
              ['Output gas', normalizedResourceIngredient(recipe.outputGas, 'gas')?.label],
              ['Tier requirement', recipe.tier],
              ['Conditions', recipeConditionLabels(recipe).join(', ')],
              ['Notes', recipe.note],
            ]} />
          </section>
        ) : (
          <>
            <article className={`${styles.detailHero} ${entryType === 'blocks' ? styles.blockDetailHero : ''}`}>
              {visual}
              <div className={styles.detailHeading}><p className={styles.eyebrow}>{entryTypeLabel} entry</p><h1>{entry.name}</h1>{entry.description && <p>{entry.description}</p>}{blockTags.length > 0 && <div className={styles.detailBlockTags}>{blockTags.map((tag) => <span key={tag}>{tag}</span>)}</div>}</div>
            </article>
            {referenceGroups?.length ? <EntryReference entryType={entryType} groups={referenceGroups} /> : <DetailFacts facts={facts} />}
            {entryType === 'blocks' && <MiningReference mining={entry.mining} />}
            {entryType === 'blocks' && <SiftableBlockReference entry={entry} group={blockSieveGroup} hammer={blockHammer} />}
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
  'how-to-play': HowToPlayPage,
};

function AddonWikiContent({section}) {
  const project = useWikiProject();
  const [query, setQuery] = useWikiQuery();
  const itemCategory = project.itemCategorySections?.find(({id}) => id === section);
  const isHowToPlay = section.startsWith('how-to-play');
  const Page = itemCategory ? ItemsPage : (isHowToPlay ? HowToPlayPage : (pageComponents[section] ?? OverviewPage));
  const [title, description] = project.pageMeta[section] ?? project.pageMeta.overview;
  const sectionNavigation = project.wikiSections.find(({id}) => id === section || (id === 'how-to-play' && isHowToPlay));
  const previewTitle = section === 'overview' ? project.wikiName : (isHowToPlay ? title.replace(`${project.name} `, '') : (sectionNavigation?.label ?? title.replace(`${project.name} `, '')));
  const previewType = section === 'overview' ? 'Wiki' : 'Wiki section';
  const previewPath = section === 'overview' ? project.basePath : `${project.basePath}/${section}`;

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
        <Page query={query} categorySection={itemCategory} section={section} />
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
