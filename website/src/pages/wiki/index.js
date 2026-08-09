import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import '@fontsource-variable/space-grotesk';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {projectCardPalette} from '../../data/cardPalettes';
import {listedProjects} from '../../data/projects';
import styles from './wikiHub.module.css';

const wikis = listedProjects.filter((project) => project.routes.wiki);
const featuredWikis = wikis
  .filter((project) => Number.isInteger(project.featuredRank))
  .sort((left, right) => left.featuredRank - right.featuredRank);
const libraryWikis = wikis.filter((project) => !Number.isInteger(project.featuredRank));

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function ProjectTags({project}) {
  return (
    <div className={styles.tags} aria-label={`${project.kind}, ${project.lifecycle}`}>
      <span>{project.kind}</span>
      <span>{project.lifecycle}</span>
    </div>
  );
}

function FeaturedWikiCard({wiki, index}) {
  return (
    <Link className={styles.featuredLink} to={wiki.routes.wiki} style={projectCardPalette(wiki)}>
      <article className={styles.featuredCard}>
        <div className={styles.cardTopline}>
          <span className={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</span>
          <ProjectTags project={wiki} />
        </div>

        <div className={styles.featuredVisual} aria-hidden="true">
          <img src={wiki.media.cover || wiki.media.icon} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
        </div>

        <div className={styles.featuredCopy}>
          <p>{wiki.category}</p>
          <h2>{wiki.name}</h2>
          <div>{wiki.summary}</div>
        </div>

        <span className={styles.cardAction}>
          Explore wiki
          <i><ArrowIcon /></i>
        </span>
      </article>
    </Link>
  );
}

function LibraryWikiCard({wiki, index}) {
  return (
    <Link className={styles.libraryLink} to={wiki.routes.wiki} style={projectCardPalette(wiki)}>
      <article className={styles.libraryCard}>
        <div className={styles.cardTopline}>
          <span className={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</span>
          <ProjectTags project={wiki} />
        </div>
        <div className={styles.libraryCopy}>
          <p>{wiki.category}</p>
          <h2>{wiki.name}</h2>
          <div>{wiki.summary}</div>
        </div>
        <span className={styles.cardAction}>
          Open reference
          <i><ArrowIcon /></i>
        </span>
      </article>
    </Link>
  );
}

export default function WikiHub() {
  return (
    <Layout title="Dorios Studios Wikis" description="Technical references for Dorios Studios add-ons." noFooter>
      <DoriosMarketingShell activePage="wiki">
        <main className={styles.page}>
          <header className={styles.hero}>
            <p>Technical reference library</p>
            <h1>Choose a project.</h1>
            <span>Each wiki is generated from its own add-on data and uses the shared Dorios catalog interface.</span>
          </header>

          {featuredWikis.length > 0 && (
            <section className={styles.collection} aria-labelledby="core-wikis-title">
              <div className={styles.sectionHeading}>
                <div>
                  <p>Start here</p>
                  <h2 id="core-wikis-title">Core references</h2>
                </div>
                <span>{featuredWikis.length} featured projects</span>
              </div>
              <div className={styles.featuredGrid}>
                {featuredWikis.map((wiki, index) => (
                  <FeaturedWikiCard key={wiki.id} wiki={wiki} index={index} />
                ))}
              </div>
            </section>
          )}

          {libraryWikis.length > 0 && (
            <section className={styles.collection} aria-labelledby="library-wikis-title">
              <div className={styles.sectionHeading}>
                <div>
                  <p>Project library</p>
                  <h2 id="library-wikis-title">More project wikis</h2>
                </div>
                <span>{libraryWikis.length} references</span>
              </div>
              <div className={styles.libraryGrid}>
                {libraryWikis.map((wiki, index) => (
                  <LibraryWikiCard
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
