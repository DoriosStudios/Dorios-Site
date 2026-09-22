import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import '@fontsource-variable/space-grotesk';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {projectCardPalette} from '../../data/cardPalettes';
import {listedProjects} from '../../data/projects';
import {useSiteI18n} from '../../i18n/site';
import {localizeProjects} from '../../i18n/projects';
import {wikiProjects} from '../../wiki/projects';
import styles from './wikiHub.module.css';

const wikis = listedProjects.filter((project) => project.routes.wiki);

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function cardImages(wiki) {
  const project = wikiProjects[wiki.id];
  const source = project?.overview?.cardImage;
  const resolvedSource = source && (source.startsWith('/') ? source : `${project.assetRoot}/${source}`);
  return [...new Set([
    wiki.id === 'bonsais' && '/img/wiki/utilitycraft/renders/bonsai.png',
    resolvedSource,
    wiki.media.icon,
    project?.fallbackImage && (project.fallbackImage.startsWith('/') ? project.fallbackImage : `${project.assetRoot}/${project.fallbackImage}`),
    wiki.media.cover,
  ].filter(Boolean))];
}

function WikiCardImage({wiki, eager}) {
  const sources = cardImages(wiki);
  const sourceKey = sources.join('|');
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => setSourceIndex(0), [sourceKey]);

  if (!sources[sourceIndex]) return null;
  return <img
    src={sources[sourceIndex]}
    alt=""
    loading={eager ? 'eager' : 'lazy'}
    onError={() => setSourceIndex((current) => current + 1)}
  />;
}

function cardMetrics(wiki, t, formatNumber) {
  const project = wikiProjects[wiki.id];
  const values = {
    items: project?.items?.length ?? wiki.metrics?.items,
    blocks: project?.blocks?.length ?? wiki.metrics?.blocks,
    recipes: project ? (project.craftingRecipeDetails?.length ?? 0) + (project.processingRecipes?.length ?? 0) : wiki.metrics?.recipes,
    machines: project?.machines?.length ?? wiki.metrics?.machines,
  };
  return Object.entries(values)
    .filter(([, value]) => Number(value) > 0)
    .slice(0, 3)
    .map(([label, value]) => `${formatNumber(value)} ${t(`${label}Metric`)}`);
}

function WikiCard({wiki, index}) {
  const {t, formatNumber} = useSiteI18n();
  const metrics = cardMetrics(wiki, t, formatNumber);
  return (
    <Link className={styles.wikiLink} to={wiki.routes.wiki} style={projectCardPalette(wiki)}>
      <article className={styles.wikiCard}>
        <span className={styles.cardVisual} aria-hidden="true">
          <WikiCardImage wiki={wiki} eager={index === 0} />
        </span>
        <div className={styles.cardCopy}>
          <span>{wiki.kind} · {wiki.category}</span>
          <h3>{wiki.name}</h3>
          <p>{wiki.summary}</p>
          {metrics.length > 0 && <small>{metrics.join(' · ')}</small>}
        </div>
        <i className={styles.cardArrow} aria-hidden="true"><ArrowIcon /></i>
      </article>
    </Link>
  );
}

export default function WikiHub() {
  const {t, locale} = useSiteI18n();
  const localizedWikis = React.useMemo(() => localizeProjects(wikis, locale), [locale]);
  const featuredWikis = localizedWikis
    .filter((project) => Number.isInteger(project.featuredRank))
    .sort((left, right) => left.featuredRank - right.featuredRank);
  const libraryWikis = localizedWikis.filter((project) => !Number.isInteger(project.featuredRank));
  return (
    <Layout title="Dorios Studios Wikis" description={t('technicalLibrary')} noFooter>
      <DoriosMarketingShell activePage="wiki">
        <main className={styles.page}>
          <header className={styles.hero}>
            <p>{t('technicalLibrary')}</p>
            <h1>{t('chooseProject')}</h1>
            <span>{t('wikiHubLead')}</span>
          </header>

          {featuredWikis.length > 0 && (
            <section className={styles.collection} aria-labelledby="core-wikis-title">
              <div className={styles.sectionHeading}>
                <div>
                  <p>{t('startHere')}</p>
                  <h2 id="core-wikis-title">{t('coreReferences')}</h2>
                </div>
                <span>{t('featuredCount', {count: featuredWikis.length})}</span>
              </div>
              <div className={styles.wikiGrid}>
                {featuredWikis.map((wiki, index) => (
                  <WikiCard key={wiki.id} wiki={wiki} index={index} />
                ))}
              </div>
            </section>
          )}

          {libraryWikis.length > 0 && (
            <section className={styles.collection} aria-labelledby="library-wikis-title">
              <div className={styles.sectionHeading}>
                <div>
                  <p>{t('projectLibrary')}</p>
                  <h2 id="library-wikis-title">{t('moreWikis')}</h2>
                </div>
                <span>{t('referenceCount', {count: libraryWikis.length})}</span>
              </div>
              <div className={styles.wikiGrid}>
                {libraryWikis.map((wiki, index) => (
                  <WikiCard
                    key={wiki.id}
                    wiki={wiki}
                    index={featuredWikis.length + index}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
