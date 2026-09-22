import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {IconArrowUpRight, IconDownload, IconSortAscendingLetters, IconTrendingUp} from '@tabler/icons-react';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {projectCardPalette} from '../../data/cardPalettes';
import {listedProjects} from '../../data/projects';
import {useSiteI18n} from '../../i18n/site';
import {localizeProjects} from '../../i18n/projects';
import styles from './projects.module.css';

const catalogPreviewSize = 8;

const featuredSummaries = {
  utilitycraft: 'A complete Bedrock automation foundation built around machines, energy, fluids, transport, resources, and deliberate survival progression.',
  trinkets: 'Dedicated equipment slots, collectible accessories, combat effects, mobility tools, and exploration-driven progression.',
  'heavy-machinery': 'Large-scale multiblocks and late-game industrial processing for UtilityCraft.',
  'ascendant-technology': 'Superior machines and advanced materials for UtilityCraft’s end game.',
};

const primaryCarouselProjectIds = ['utilitycraft', 'trinkets'];

function Tags({project}) {
  const {t} = useSiteI18n();
  return (
    <div className={styles.tags}>
      <span>{project.kind}</span>
      <span>{project.category}</span>
      {project.ownership === 'community' && <span>{t('community')}</span>}
    </div>
  );
}

function DownloadBadge({project}) {
  const {t, formatNumber} = useSiteI18n();
  const {downloadStats} = project;
  return (
    <span
      className={styles.downloadBadge}
      title={t('combinedDownloads', {count: formatNumber(downloadStats.total)})}>
      <IconDownload aria-hidden="true" size={14} stroke={2} />
      <strong>{downloadStats.display}</strong>
      <span>{t('downloads')}</span>
    </span>
  );
}

function CardArrow() {
  return (
    <span className={styles.cardArrow} aria-hidden="true">
      <IconArrowUpRight size={20} stroke={1.8} />
    </span>
  );
}

function ProjectArtwork({project, eager = false, className = ''}) {
  const usesCover = Boolean(project.media.cover);
  return (
    <div className={`${styles.artwork} ${!usesCover ? styles.iconArtwork : ''} ${className}`}>
      <img
        src={project.media.cover ?? project.media.icon}
        alt={project.media.alt}
        loading={eager ? 'eager' : 'lazy'}
        style={{objectFit: usesCover ? project.media.coverFit : 'contain'}}
      />
    </div>
  );
}

function UtilityFeaturedCard({project}) {
  const {t} = useSiteI18n();
  if (!project) return null;
  return (
    <Link
      className={`${styles.featureCard} ${styles.utilityCard}`}
      to={project.routes.project}
      style={projectCardPalette(project)}>
      <ProjectArtwork project={project} eager className={styles.utilityArtwork} />
      <div className={styles.utilityContent}>
        <div className={styles.utilityMetadata}>
          <p className={styles.overline}>{t('featuredProject')}</p>
          <Tags project={project} />
        </div>
        <h2>{project.name}</h2>
        <p className={styles.description}>{featuredSummaries[project.id]}</p>
        <DownloadBadge project={project} />
        <CardArrow />
      </div>
    </Link>
  );
}

function FeaturedCarousel({projects}) {
  const {t} = useSiteI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || projects.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % projects.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, projects.length]);

  if (!projects.length) return null;
  const activeProject = projects[activeIndex];
  return (
    <div
      className={styles.primaryCarousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <UtilityFeaturedCard key={activeProject.id} project={activeProject} />
      <div className={styles.carouselPager} aria-label={t('featuredCarousel')}>
        {projects.map((project, index) => <button
          type="button"
          key={project.id}
          className={index === activeIndex ? styles.carouselPagerActive : undefined}
          aria-label={t('showProject', {project: project.name})}
          aria-current={index === activeIndex ? 'true' : undefined}
          onClick={() => setActiveIndex(index)}
        />)}
      </div>
    </div>
  );
}

function BannerFeaturedCard({project}) {
  if (!project) return null;
  return (
    <Link
      className={`${styles.featureCard} ${styles.bannerCard}`}
      to={project.routes.project}
      style={projectCardPalette(project)}>
      <ProjectArtwork project={project} eager className={styles.bannerArtwork} />
      <div className={styles.bannerOverlay} aria-hidden="true" />
      <div className={styles.bannerContent}>
        <Tags project={project} />
        <p className={styles.overline}>{project.lifecycle}</p>
        <h2>{project.name}</h2>
        <p className={styles.bannerDescription}>{featuredSummaries[project.id] ?? project.summary}</p>
        <DownloadBadge project={project} />
      </div>
      <CardArrow />
    </Link>
  );
}

function CatalogCard({project}) {
  return (
    <Link
      className={styles.catalogCard}
      to={project.routes.project}
      style={projectCardPalette(project)}>
      <ProjectArtwork project={project} className={styles.catalogArtwork} />
      <div className={styles.catalogContent}>
        <h3>{project.name}</h3>
        <Tags project={project} />
        <p>{project.summary}</p>
        <DownloadBadge project={project} />
        <CardArrow />
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const {t, locale} = useSiteI18n();
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [sortMode, setSortMode] = useState('downloads');
  const localizedProjects = React.useMemo(() => localizeProjects(listedProjects, locale), [locale]);
  const byId = React.useMemo(() => new Map(localizedProjects.map((project) => [project.id, project])), [localizedProjects]);
  const primaryCarouselProjects = primaryCarouselProjectIds.map((projectId) => byId.get(projectId)).filter(Boolean);
  const heavyMachinery = byId.get('heavy-machinery');
  const ascendantTechnology = byId.get('ascendant-technology');
  const featuredIds = new Set(['utilitycraft', 'trinkets', 'heavy-machinery', 'ascendant-technology']);
  const catalogProjects = localizedProjects
    .filter((project) => !featuredIds.has(project.id))
    .sort((left, right) => sortMode === 'alphabetical'
      ? left.name.localeCompare(right.name, locale, {sensitivity: 'base'})
      : right.downloadStats.total - left.downloadStats.total || left.name.localeCompare(right.name));
  const visibleCatalogProjects = showAllProjects
    ? catalogProjects
    : catalogProjects.slice(0, catalogPreviewSize);

  return (
    <Layout title={t('projects')} description={t('projectsHeroDescription')} noFooter>
      <DoriosMarketingShell activePage="projects">
        <main className={styles.projectsPage}>
          <header className={styles.hero} aria-labelledby="projects-title">
            <p className={styles.kicker}>{t('workCount', {count: localizedProjects.length})}</p>
            <h1 id="projects-title">{t('projectsHeroBefore')} <span>{t('projectsHeroAccent')}</span></h1>
            <p className={styles.heroDescription}>{t('projectsHeroDescription')}</p>
          </header>

          <section className={styles.featuredSection} aria-label={t('featuredProjects')}>
            <div className={styles.featuredGrid}>
              <FeaturedCarousel projects={primaryCarouselProjects} />
              <div className={styles.bannerStack}>
                <BannerFeaturedCard project={heavyMachinery} />
                <BannerFeaturedCard project={ascendantTechnology} />
              </div>
            </div>
          </section>

          <section className={styles.catalog} aria-labelledby="catalog-title">
            <div className={styles.catalogHeader}>
              <div><p className={styles.kicker}>{t('moreFromDorios')}</p><h2 id="catalog-title">{t('findNextProject')}</h2></div>
              <div className={styles.sortControl} role="group" aria-label={t('sortProjects')}>
                <span>{t('sortBy')}</span>
                <button type="button" aria-pressed={sortMode === 'downloads'} onClick={() => setSortMode('downloads')}>
                  <IconTrendingUp aria-hidden="true" size={16} stroke={1.9} /> {t('downloadsMetric')}
                </button>
                <button type="button" aria-pressed={sortMode === 'alphabetical'} onClick={() => setSortMode('alphabetical')}>
                  <IconSortAscendingLetters aria-hidden="true" size={16} stroke={1.9} /> {t('alphabetical')}
                </button>
              </div>
            </div>
            <div className={styles.catalogGrid} id="project-catalog">
              {visibleCatalogProjects.map((project) => <CatalogCard project={project} key={project.id} />)}
            </div>
            {catalogProjects.length > catalogPreviewSize && (
              <button
                className={styles.viewAllButton}
                type="button"
                aria-expanded={showAllProjects}
                aria-controls="project-catalog"
                onClick={() => setShowAllProjects((current) => !current)}>
                {showAllProjects ? t('showFewerProjects') : t('viewAllProjects')}
                <IconArrowUpRight aria-hidden="true" size={18} stroke={1.9} />
              </button>
            )}
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
