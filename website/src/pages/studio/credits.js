import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {useSiteI18n} from '../../i18n/site';
import {getPageCopy, pageText} from '../../i18n/pages';
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

function StudioNavigation({copy}) {
  return (
    <nav className={styles.subnav} aria-label={copy.sectionsLabel}>
      <Link className={styles.backLink} to="/studio">
        <span aria-hidden="true">←</span> {copy.title.split(' · ')[1]}
      </Link>
      <div>
        <Link to="/studio">{copy.overview}</Link>
        <Link to="/studio/staff">{copy.staff}</Link>
        <Link to="/studio/credits" aria-current="page">{copy.credits}</Link>
      </div>
    </nav>
  );
}

export default function CreditsPage() {
  const {locale} = useSiteI18n();
  const copy = getPageCopy(locale, 'credits');
  return (
    <Layout title={copy.title} description={copy.description} noFooter>
      <DoriosMarketingShell activePage="studio">
        <main className={styles.page}>
          <StudioNavigation copy={copy} />

          <header className={styles.hero}>
            <div>
              <p className={styles.breadcrumb}><Link to="/studio">{copy.title.split(' · ')[1]}</Link><span>/</span> {copy.credits}</p>
              <p className={styles.kicker}>{copy.kicker}</p>
              <h1>{copy.headingBefore}<span>{copy.headingAccent}</span></h1>
              <p className={styles.lead}>{copy.lead}</p>
            </div>
            <aside className={styles.recordNote} aria-label={copy.policyLabel}>
              <span>{copy.policyTitle}</span>
              <p>{copy.policyCopy}</p>
              <a href="https://discord.gg/x36H3ZtmK5" target="_blank" rel="noreferrer">{copy.correction} <ArrowIcon /></a>
            </aside>
          </header>

          <div className={styles.creditsGrid}>
            <section className={styles.creditSection} aria-labelledby="contributors-title">
              <header>
                <span>01</span>
                <div><p>{copy.contributorsEyebrow}</p><h2 id="contributors-title">{copy.contributorsTitle}</h2></div>
              </header>
              <div className={styles.creditRows}>
                <div className={styles.creditRow}>
                  <strong>Kauziin</strong>
                  <span>{copy.contributor}</span>
                </div>
                <div className={styles.creditRow}>
                  <strong>JR.ice</strong>
                  <span>{copy.contributor}</span>
                </div>
                <div className={styles.creditRow}>
                  <strong>Cloud</strong>
                  <span>{copy.creator}</span>
                </div>
              </div>
            </section>

            <section className={styles.creditSection} aria-labelledby="translators-title">
              <header>
                <span>02</span>
                <div><p>{copy.translatorsEyebrow}</p><h2 id="translators-title">{copy.translatorsTitle}</h2></div>
              </header>
              <div className={styles.emptyCredit}>
                <strong>{copy.noTranslators}</strong>
                <p>{copy.translatorsCopy}</p>
              </div>
            </section>

            <section className={`${styles.creditSection} ${styles.wideCredit}`} aria-labelledby="testers-title">
              <header>
                <span>03</span>
                <div><p>{copy.testersEyebrow}</p><h2 id="testers-title">{copy.testersTitle}</h2></div>
              </header>
              <p className={styles.sectionLead}>
                {copy.testersCopy}
              </p>
              <ul className={styles.testerList}>
                {testers.map((tester) => (
                  <li key={tester.id}>
                    <img src={`/img/about/${tester.id}.jpg`} alt="" loading="lazy" />
                    <strong>{tester.name}</strong>
                    <span>{copy.communityTester}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.creditSection} aria-labelledby="thanks-title">
              <header>
                <span>04</span>
                <div><p>{copy.thanksEyebrow}</p><h2 id="thanks-title">{copy.thanksTitle}</h2></div>
              </header>
              <div className={styles.featureCredit}>
                <span>Mindustry</span>
                <h3>Anuke</h3>
                <p>{copy.thanksCopy}</p>
                <a href="https://github.com/Anuken/Mindustry" target="_blank" rel="noreferrer">
                  {copy.originalWork} <ArrowIcon />
                </a>
              </div>
            </section>

            <section className={styles.creditSection} aria-labelledby="community-title">
              <header>
                <span>05</span>
                <div><p>{copy.communityEyebrow}</p><h2 id="community-title">{copy.communityTitle}</h2></div>
              </header>
              <div className={styles.proseCredit}>
                <p>{copy.communityCopy}</p>
                <Link to="/support">{copy.joinCommunity} <ArrowIcon /></Link>
              </div>
            </section>

            <section className={`${styles.creditSection} ${styles.wideCredit}`} aria-labelledby="tools-title">
              <header>
                <span>06</span>
                <div><p>{copy.toolsEyebrow}</p><h2 id="tools-title">{copy.toolsTitle}</h2></div>
              </header>
              <p className={styles.sectionLead}>
                {copy.toolsCopy}
              </p>
              <ul className={styles.toolList}>
                {tools.map((tool, index) => (
                  <li key={tool.name}>
                    <div><strong>{tool.name}</strong><span>{copy.toolUses[index] ?? tool.use}</span></div>
                    <a href={tool.href} target="_blank" rel="noreferrer" aria-label={pageText(copy, 'visitTool', {name: tool.name})}><ArrowIcon /></a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className={styles.nextPage} aria-labelledby="staff-cta-title">
            <div>
              <p className={styles.kicker}>{copy.nextKicker}</p>
              <h2 id="staff-cta-title">{copy.nextTitle}</h2>
              <p>{copy.nextCopy}</p>
            </div>
            <Link to="/studio/staff">{copy.exploreStaff} <ArrowIcon /></Link>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
