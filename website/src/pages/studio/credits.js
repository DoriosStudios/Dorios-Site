import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import styles from './studioSubpage.module.css';

const testers = [
  {id: 'fear', name: 'Fear'},
  {id: 'fresh', name: '!FreshInk¡'},
  {id: 'roger', name: 'RogerZeew'},
  {id: 'yash', name: 'Yash'},
  {id: 'brando', name: 'Brando'},
];

const tools = [
  {name: 'Docusaurus', use: 'Static site and documentation framework', href: 'https://docusaurus.io/'},
  {name: 'React', use: 'Component rendering and interaction layer', href: 'https://react.dev/'},
  {name: 'MDX', use: 'Documentation content with component support', href: 'https://mdxjs.com/'},
  {name: 'Prism React Renderer', use: 'Readable syntax highlighting for technical content', href: 'https://github.com/FormidableLabs/prism-react-renderer'},
  {name: 'Fontsource', use: 'Self-hosted Space Grotesk and League Spartan font packages', href: 'https://fontsource.org/'},
  {name: 'Docusaurus Search Local', use: 'Local documentation search', href: 'https://github.com/easyops-cn/docusaurus-search-local'},
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M7 5h8v8" />
    </svg>
  );
}

function StudioNavigation() {
  return (
    <nav className={styles.subnav} aria-label="The Studio sections">
      <Link className={styles.backLink} to="/studio">
        <span aria-hidden="true">←</span> The Studio
      </Link>
      <div>
        <Link to="/studio">Overview</Link>
        <Link to="/studio/staff">Staff</Link>
        <Link to="/studio/credits" aria-current="page">Credits</Link>
      </div>
    </nav>
  );
}

export default function CreditsPage() {
  return (
    <Layout title="Credits · The Studio" description="Contributors, testers, acknowledgements and tools behind Dorios Studios." noFooter>
      <DoriosMarketingShell activePage="studio">
        <main className={styles.page}>
          <StudioNavigation />

          <header className={styles.hero}>
            <div>
              <p className={styles.breadcrumb}><Link to="/studio">The Studio</Link><span>/</span> Credits</p>
              <p className={styles.kicker}>Acknowledgements</p>
              <h1>Credit where <span>credit is due.</span></h1>
              <p className={styles.lead}>
                Dorios Studios grows through project contributions, patient testing, community feedback
                and open tools. This record names only credits supported by the studio’s project files.
              </p>
            </div>
            <aside className={styles.recordNote} aria-label="Credit policy">
              <span>Credit policy</span>
              <p>
                A missing name is left open instead of guessed. If a published credit needs to be added or
                corrected, contact the studio through Discord.
              </p>
              <a href="https://discord.gg/x36H3ZtmK5" target="_blank" rel="noreferrer">Request a correction <ArrowIcon /></a>
            </aside>
          </header>

          <div className={styles.creditsGrid}>
            <section className={styles.creditSection} aria-labelledby="contributors-title">
              <header>
                <span>01</span>
                <div><p>Project work</p><h2 id="contributors-title">Contributors</h2></div>
              </header>
              <div className={styles.creditRows}>
                <div className={styles.creditRow}>
                  <strong>Kauziin</strong>
                  <span>Named contributor · Ascendant Technology 0.8</span>
                </div>
                <div className={styles.creditRow}>
                  <strong>JR.ice</strong>
                  <span>Named contributor · Ascendant Technology 0.8</span>
                </div>
                <div className={styles.creditRow}>
                  <strong>Cloud</strong>
                  <span>Creator · Better Smelters</span>
                </div>
              </div>
            </section>

            <section className={styles.creditSection} aria-labelledby="translators-title">
              <header>
                <span>02</span>
                <div><p>Localization</p><h2 id="translators-title">Translators</h2></div>
              </header>
              <div className={styles.emptyCredit}>
                <strong>No individual translators are currently published.</strong>
                <p>Verified localization credits will be listed here as they are provided by the studio.</p>
              </div>
            </section>

            <section className={`${styles.creditSection} ${styles.wideCredit}`} aria-labelledby="testers-title">
              <header>
                <span>03</span>
                <div><p>Quality &amp; feedback</p><h2 id="testers-title">Testers</h2></div>
              </header>
              <p className={styles.sectionLead}>
                These testers are explicitly acknowledged for helping refine Dorios Studios projects through feedback and play.
              </p>
              <ul className={styles.testerList}>
                {testers.map((tester) => (
                  <li key={tester.id}>
                    <img src={`/img/about/${tester.id}.jpg`} alt="" loading="lazy" />
                    <strong>{tester.name}</strong>
                    <span>Community tester</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.creditSection} aria-labelledby="thanks-title">
              <header>
                <span>04</span>
                <div><p>Asset permission</p><h2 id="thanks-title">Special Thanks</h2></div>
              </header>
              <div className={styles.featureCredit}>
                <span>Mindustry</span>
                <h3>Anuke</h3>
                <p>
                  For granting permission to use the water and Cryofluid icon assets documented by
                  Ascendant Technology.
                </p>
                <a href="https://github.com/Anuken/Mindustry" target="_blank" rel="noreferrer">
                  View the original work <ArrowIcon />
                </a>
              </div>
            </section>

            <section className={styles.creditSection} aria-labelledby="community-title">
              <header>
                <span>05</span>
                <div><p>The wider circle</p><h2 id="community-title">Community Support</h2></div>
              </header>
              <div className={styles.proseCredit}>
                <p>
                  To every player who reports a bug, explains a confusing system, shares a build or stays
                  through an early release: your feedback helps turn experiments into reliable add-ons.
                </p>
                <Link to="/support">Join or support the community <ArrowIcon /></Link>
              </div>
            </section>

            <section className={`${styles.creditSection} ${styles.wideCredit}`} aria-labelledby="tools-title">
              <header>
                <span>06</span>
                <div><p>Website foundation</p><h2 id="tools-title">Tools &amp; Open Source</h2></div>
              </header>
              <p className={styles.sectionLead}>
                Packages named here are declared directly by the Dorios website project.
              </p>
              <ul className={styles.toolList}>
                {tools.map((tool) => (
                  <li key={tool.name}>
                    <div><strong>{tool.name}</strong><span>{tool.use}</span></div>
                    <a href={tool.href} target="_blank" rel="noreferrer" aria-label={`Visit ${tool.name}`}><ArrowIcon /></a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className={styles.nextPage} aria-labelledby="staff-cta-title">
            <div>
              <p className={styles.kicker}>The current team</p>
              <h2 id="staff-cta-title">Meet the people behind Dorios Studios.</h2>
              <p>See the published roles across leadership, development, art, design and community.</p>
            </div>
            <Link to="/studio/staff">Explore the staff <ArrowIcon /></Link>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
