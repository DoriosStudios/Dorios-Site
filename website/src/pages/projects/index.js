import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {projectCardPalette} from '../../data/cardPalettes';
import {featuredProjects, getProject, listedProjects} from '../../data/projects';
import styles from './projects.module.css';

const compactFeaturedSummaries = {
  'heavy-machinery': 'Large-scale multiblocks and late-game industrial processing for UtilityCraft.',
  'ascendant-technology': 'Superior machines and advanced materials for UtilityCraft’s end game.',
};

const primaryCarouselProjects = ['utilitycraft', 'trinkets']
  .map((projectSlug) => getProject(projectSlug))
  .filter(Boolean);

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

function FeaturedCard({project, primary = false, carousel = false}) {
  if (primary) {
    return (
      <Link className={`${styles.featureCard} ${styles.utilityCard} ${carousel ? styles.carouselCard : ''}`} to={project.routes.project} style={projectCardPalette(project)}>
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

function FeaturedCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || primaryCarouselProjects.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % primaryCarouselProjects.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused]);
  if (!primaryCarouselProjects.length) return null;
  return (
    <section className={styles.primaryCarousel} aria-label="Featured projects" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <FeaturedCard key={primaryCarouselProjects[index].id} project={primaryCarouselProjects[index]} primary carousel />
      {primaryCarouselProjects.length > 1 && <div className={styles.carouselPager} aria-label="Featured project carousel">
        {primaryCarouselProjects.map((project, projectIndex) => <button type="button" key={project.id} className={projectIndex === index ? styles.carouselPagerActive : ''} onClick={() => setIndex(projectIndex)} aria-label={`Show ${project.name}`} aria-current={projectIndex === index ? 'true' : undefined} />)}
      </div>}
    </section>
  );
}

function HowToPlayShortcut() {
  return (
    <Link className={styles.howToPlayCard} to="/wiki/utilitycraft/how-to-play" style={projectCardPalette('how-to-play')}>
      <div className={styles.howToPlayVisual} aria-hidden="true">
        <img src="/img/wiki/utilitycraft/how-to-play/title.png" alt="" loading="lazy" />
      </div>
      <div className={styles.howToPlayCopy}>
        <p className={styles.overline}>UtilityCraft player guide · 8 steps</p>
        <h2>How To Play</h2>
        <p>Follow the complete progression from your first Hammer and Sieve to Steel, Dorios Energy, machines, generators, and automation.</p>
      </div>
      <span className={styles.howToPlayAction}>Start the guide <i aria-hidden="true">→</i></span>
    </Link>
  );
}

export default function ProjectsPage() {
  const featuredIds = new Set([...featuredProjects, ...primaryCarouselProjects].map((project) => project.id));
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
            <FeaturedCarousel />
            {featuredProjects.filter((project) => project.id !== 'utilitycraft').slice(0, 2).map((project) => <FeaturedCard project={project} key={project.id} />)}
          </section>

          <HowToPlayShortcut />

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
