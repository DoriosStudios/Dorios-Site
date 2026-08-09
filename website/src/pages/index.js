import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../components/DoriosMarketingShell';
import {projectCardPalette} from '../data/cardPalettes';
import {getProject} from '../data/projects';
import styles from './home.module.css';

const wordRows = [
  {text: 'DORIOS  •  BEDROCK  •  WORLDS  •  ADDONS  •  DORIOS  •  BEDROCK  •  WORLDS  •  ADDONS  •  ', direction: 'left'},
  {text: 'AUTOMATION  •  ADVENTURE  •  COMMUNITY  •  CREATIVITY  •  AUTOMATION  •  ADVENTURE  •  COMMUNITY  •  CREATIVITY  •  ', direction: 'right'},
  {text: 'BUILD  •  EXPLORE  •  CREATE  •  PLAY  •  BUILD  •  EXPLORE  •  CREATE  •  PLAY  •  ', direction: 'left'},
  {text: 'MINECRAFT BEDROCK  •  FREE ADDONS  •  MINECRAFT BEDROCK  •  FREE ADDONS  •  ', direction: 'right'},
];

function MovingWordField() {
  return (
    <div className={styles.wordField} aria-hidden="true">
      {wordRows.map(({text, direction}, index) => (
        <div className={styles.wordRow} key={text}>
          <div className={`${styles.wordTrack} ${styles[direction]} ${styles[`track${index + 1}`]}`}>
            <span>{text}</span><span>{text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const destinations = [
  {number: '01', label: 'Projects', to: '/projects', arrow: '↗'},
  {number: '02', label: 'The Studio', to: '/studio', arrow: '↗'},
  {number: '03', label: 'Wikis', to: '/wiki', arrow: '↗'},
  {number: '04', label: 'Support us', to: '/support', arrow: '↗'},
];

const featuredShortcuts = ['utilitycraft', 'trinkets']
  .map((projectSlug) => getProject(projectSlug))
  .filter(Boolean);

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M7 5h8v8" />
    </svg>
  );
}

export default function Home() {
  const [hoveredDestination, setHoveredDestination] = useState(null);
  const [focusedDestination, setFocusedDestination] = useState(null);
  const activeDestination = hoveredDestination ?? focusedDestination;

  return (
    <Layout title="Dorios Studios" description="Free Minecraft Bedrock addons made with imagination, care, and the community in mind." noFooter>
      <DoriosMarketingShell activePage="home">
        <main className={styles.homeMain}>
          <section className={styles.hero} aria-labelledby="home-title">
            <MovingWordField />
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>Independent Minecraft Bedrock studio</p>
                <h1 id="home-title">Made to make <span>your world</span> bigger.</h1>
                <p className={styles.heroLead}>Dorios Studios creates free, memorable addons that give players more ways to build, automate, explore, and play together.</p>
                <Link className={styles.primaryButton} to="/projects">Explore our projects <span aria-hidden="true">→</span></Link>
              </div>

              <nav
                className={styles.editorialNav}
                aria-label="Explore Dorios Studios"
                onMouseLeave={() => setHoveredDestination(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setFocusedDestination(null);
                  }
                }}>
                {destinations.map((destination) => {
                  const isActive = activeDestination === destination.number;
                  const isInactive = activeDestination !== null && !isActive;

                  return (
                    <Link
                      key={destination.number}
                      to={destination.to}
                      className={`${styles.editorialCard} ${isActive ? styles.editorialCardActive : ''} ${isInactive ? styles.editorialCardInactive : ''}`}
                      onPointerEnter={() => setHoveredDestination(destination.number)}
                      onFocus={() => {
                        setHoveredDestination(null);
                        setFocusedDestination(destination.number);
                      }}>
                      <span>{destination.number}</span><strong>{destination.label}</strong><i aria-hidden="true">{destination.arrow}</i>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className={styles.heroFootnote}><span>Discover the studio</span><span className={styles.scrollLine} aria-hidden="true" /><span>Since 2021</span></div>
            <section className={styles.featuredProjects} aria-label="Featured projects">
              {featuredShortcuts.map((project) => (
                <Link className={styles.featuredProjectCard} to={project.routes.project} key={project.id} style={projectCardPalette(project)}>
                  <span className={styles.featuredThumbnail}>
                    <img src={project.media.icon} alt="" loading="lazy" />
                  </span>
                  <span className={styles.featuredCopy}>
                    <span className={styles.featuredTags}>
                      <span>{project.kind}</span>
                      <span>{project.category}</span>
                    </span>
                    <strong>{project.name}</strong>
                  </span>
                  <span className={styles.featuredArrow}><ArrowUpRight /></span>
                </Link>
              ))}
            </section>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
