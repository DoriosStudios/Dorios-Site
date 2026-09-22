import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../components/DoriosMarketingShell';
import {useSiteI18n} from '../i18n/site';
import {getPageCopy} from '../i18n/pages';
import styles from './studio.module.css';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M7 5h8v8" />
    </svg>
  );
}

export default function StudioPage() {
  const {locale} = useSiteI18n();
  const copy = getPageCopy(locale, 'studio');
  return (
    <Layout title={copy.title} description={copy.description} noFooter>
      <DoriosMarketingShell activePage="studio">
        <main className={styles.page}>
          <section className={styles.hero} aria-labelledby="studio-title">
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>{copy.kicker}</p>
              <h1 id="studio-title">{copy.headingBefore}<span>{copy.headingAccent}</span></h1>
              <p className={styles.lead}>{copy.lead}</p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryAction} to="/studio/staff">
                  {copy.meetStaff} <ArrowIcon />
                </Link>
                <Link className={styles.secondaryAction} to="/projects">{copy.exploreProjects}</Link>
              </div>
            </div>

            <dl className={styles.studioFacts} aria-label={copy.factsLabel}>
              {copy.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          </section>

          <section className={styles.mission} aria-labelledby="mission-title">
            <div className={styles.sectionHeading}>
              <p className={styles.kicker}>{copy.missionKicker}</p>
              <h2 id="mission-title">{copy.missionTitle}</h2>
            </div>
            <div className={styles.missionCopy}>
              {copy.mission.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>

          <section className={styles.story} aria-labelledby="story-title">
            <header className={styles.inlineHeading}>
              <div>
                <p className={styles.kicker}>{copy.storyKicker}</p>
                <h2 id="story-title">{copy.storyTitle}</h2>
              </div>
              <p>{copy.storyLead}</p>
            </header>
            <ol className={styles.timeline}>
              {copy.timeline.map(([year, title, eventCopy]) => (
                <li key={year}>
                  <span>{year}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{eventCopy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.approach} aria-labelledby="approach-title">
            <header className={styles.inlineHeading}>
              <div>
                <p className={styles.kicker}>{copy.approachKicker}</p>
                <h2 id="approach-title">{copy.approachTitle}</h2>
              </div>
              <p>{copy.approachLead}</p>
            </header>
            <div className={styles.approachGrid}>
              {copy.approaches.map(([number, title, summary, itemCopy], index) => (
                <details className={styles.approachCard} key={number} open={index === 0}>
                  <summary>
                    <span className={styles.cardNumber}>{number}</span>
                    <span className={styles.cardTitle}>
                      <strong>{title}</strong>
                      <small>{summary}</small>
                    </span>
                    <span className={styles.cardToggle} aria-hidden="true">+</span>
                  </summary>
                  <p>{itemCopy}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.directory} aria-labelledby="directory-title">
            <header className={styles.inlineHeading}>
              <div>
                <p className={styles.kicker}>{copy.directoryKicker}</p>
                <h2 id="directory-title">{copy.directoryTitle}</h2>
              </div>
              <p>{copy.directoryLead}</p>
            </header>
            <div className={styles.directoryGrid}>
              <Link className={styles.directoryCard} to="/studio/staff">
                <span>{copy.peopleLabel}</span>
                <h3>{copy.staff}</h3>
                <p>{copy.staffCopy}</p>
                <b>{copy.viewStaff} <ArrowIcon /></b>
              </Link>
              <Link className={styles.directoryCard} to="/studio/credits">
                <span>{copy.creditsLabel}</span>
                <h3>{copy.credits}</h3>
                <p>{copy.creditsCopy}</p>
                <b>{copy.readCredits} <ArrowIcon /></b>
              </Link>
            </div>
          </section>

          <section className={styles.community} aria-labelledby="community-title">
            <div>
              <p className={styles.kicker}>{copy.communityKicker}</p>
              <h2 id="community-title">{copy.communityTitle}</h2>
              <p>{copy.communityCopy}</p>
            </div>
            <div className={styles.communityActions}>
              <a href="https://discord.gg/x36H3ZtmK5" target="_blank" rel="noreferrer">
                {copy.joinConversation} <ArrowIcon />
              </a>
              <Link to="/support">{copy.supportStudio}</Link>
            </div>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
