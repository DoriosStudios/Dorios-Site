import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {projectCardPalette} from '../../data/cardPalettes';
import {featuredProjects, listedProjects} from '../../data/projects';
import styles from './projects.module.css';

const compactFeaturedSummaries = {
  'heavy-machinery': 'Large-scale multiblocks and late-game industrial processing for UtilityCraft.',
  'ascendant-technology': 'Superior machines and advanced materials for UtilityCraft’s end game.',
};

function Tags({project}) {
  return <div className={styles.tags}><span>{project.kind}</span><span>{project.category}</span>{project.ownership === 'community' && <span>Community</span>}</div>;
}

function ProjectImage({project, eager = false}) {
  const usesCover = Boolean(project.media.cover);
  return (
    <div className={`${styles.visualFrame} ${!usesCover ? styles.iconFrame : ''}`}>
      <img
        src={project.media.cover ?? project.media.icon}
        alt={project.media.alt}
        loading={eager ? 'eager' : 'lazy'}
        style={{objectFit: usesCover ? project.media.coverFit : 'contain'}}
      />
    </div>
  );
}

function FeaturedCard({project, primary = false}) {
  if (primary) {
    return (
      <Link className={`${styles.featureCard} ${styles.utilityCard}`} to={project.routes.project} style={projectCardPalette(project)}>
        <ProjectImage project={project} eager />
        <div className={styles.featureCopy}>
          <div><p className={styles.overline}>Featured project</p><Tags project={project} /></div>
          <h2>{project.name}</h2>
          <p className={styles.description}>{project.summary}</p>
          <i className={styles.featureArrow} aria-hidden="true">↗</i>
        </div>
      </Link>
    );
  }
  return (
    <Link className={`${styles.featureCard} ${styles.sideCard}`} to={project.routes.project} style={projectCardPalette(project)}>
      <ProjectImage project={project} eager />
      <div className={styles.compactCopy}>
        <Tags project={project} />
        <p className={styles.overline}>{project.lifecycle}</p>
        <h2>{project.name}</h2>
        <p>{compactFeaturedSummaries[project.id] ?? project.summary}</p>
        <i className={styles.cardArrow} aria-hidden="true">↗</i>
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const featuredIds = new Set(featuredProjects.map((project) => project.id));
  const catalogProjects = listedProjects.filter((project) => !featuredIds.has(project.id));
  return (
    <Layout title="Projects" description="Minecraft Bedrock projects by Dorios Studios." noFooter>
      <DoriosMarketingShell activePage="projects">
        <main className={styles.projectsPage}>
          <section className={styles.intro} aria-labelledby="projects-title">
            <p className={styles.kicker}>The work · {listedProjects.length} listed projects</p>
            <h1 id="projects-title">Built for more ways <span>to play.</span></h1>
            <p>From essential utilities to new adventures, explore a growing catalog of active projects and established studio releases.</p>
          </section>

          <section className={styles.spotlightGrid} aria-label="Featured projects">
            {featuredProjects[0] && <FeaturedCard project={featuredProjects[0]} primary />}
            {featuredProjects.slice(1, 3).map((project) => <FeaturedCard project={project} key={project.id} />)}
          </section>

          <section className={styles.catalog} aria-labelledby="catalog-title">
            <div className={styles.catalogHeader}><p className={styles.kicker}>More from Dorios</p><h2 id="catalog-title">Find your next project.</h2></div>
            <div className={styles.catalogGrid}>
              {catalogProjects.map((project) => (
                <Link className={styles.catalogCard} key={project.id} to={project.routes.project} style={projectCardPalette(project)}>
                  <div className={`${styles.catalogImage} ${!project.media.cover ? styles.iconFrame : ''}`}>
                    <img src={project.media.cover ?? project.media.icon} alt={project.media.alt} loading="lazy" style={{objectFit: project.media.cover ? project.media.coverFit : 'contain'}} />
                  </div>
                  <div className={styles.catalogCopy}><Tags project={project} /><h3>{project.name}</h3><span aria-hidden="true">↗</span></div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
