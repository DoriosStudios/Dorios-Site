import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../components/DoriosMarketingShell';
import styles from './studio.module.css';

const timeline = [
  {
    year: '2020',
    title: 'The first experiments',
    copy: 'Milo504 began creating Bedrock add-ons with More Armors, followed by Tools, Weapons and More—the project that would eventually grow into UtilityCraft.',
  },
  {
    year: '2022',
    title: 'Dorios Studios takes shape',
    copy: 'Milo504 and WeatherVictor founded Dorios Studios on September 9, bringing development and interface design under one shared identity.',
  },
  {
    year: '2024',
    title: 'A clearer visual language',
    copy: 'JR.ice joined as lead designer and texture artist. UtilityCraft 3.0 followed, giving the studio its first major milestone in the Bedrock community.',
  },
];

const approaches = [
  {
    number: '01',
    title: 'Bedrock first',
    summary: 'Design for the platform players actually use.',
    copy: 'Controls, multiplayer, performance and the Bedrock add-on ecosystem shape each decision from the beginning—they are not an adaptation step at the end.',
  },
  {
    number: '02',
    title: 'Systems with purpose',
    summary: 'Give every mechanic a place in progression.',
    copy: 'Useful automation, readable progression and room for experimentation turn isolated features into worlds that remain interesting tomorrow.',
  },
  {
    number: '03',
    title: 'Community shaped',
    summary: 'Treat feedback as part of the work.',
    copy: 'Players and testers help reveal what is unclear, unbalanced or simply not fun yet. That feedback informs how add-ons are refined over time.',
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M7 5h8v8" />
    </svg>
  );
}

export default function StudioPage() {
  return (
    <Layout title="The Studio" description="The people, history and principles behind Dorios Studios." noFooter>
      <DoriosMarketingShell activePage="studio">
        <main className={styles.page}>
          <section className={styles.hero} aria-labelledby="studio-title">
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Independent Bedrock studio · Est. 2022</p>
              <h1 id="studio-title">Small team. <span>Bigger worlds.</span></h1>
              <p className={styles.lead}>
                Dorios Studios is a collective of creators building free Minecraft Bedrock add-ons
                around useful systems, deliberate progression and a community that keeps shaping the work.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryAction} to="/studio/staff">
                  Meet the staff <ArrowIcon />
                </Link>
                <Link className={styles.secondaryAction} to="/projects">Explore projects</Link>
              </div>
            </div>

            <dl className={styles.studioFacts} aria-label="Studio at a glance">
              <div><dt>Founded</dt><dd>09.09.2022</dd></div>
              <div><dt>Platform</dt><dd>Minecraft Bedrock</dd></div>
              <div><dt>Focus</dt><dd>Free, player-first add-ons</dd></div>
            </dl>
          </section>

          <section className={styles.mission} aria-labelledby="mission-title">
            <div className={styles.sectionHeading}>
              <p className={styles.kicker}>Why we exist</p>
              <h2 id="mission-title">Build more possibility into every world.</h2>
            </div>
            <div className={styles.missionCopy}>
              <p>
                We believe Bedrock players should have access to ambitious, high-quality experiences
                without putting the most interesting ideas behind a paywall.
              </p>
              <p>
                Our work ranges from industrial automation to exploration and custom mechanics, but the
                standard stays the same: approachable at the start, rewarding as a system, and worth sharing.
              </p>
            </div>
          </section>

          <section className={styles.story} aria-labelledby="story-title">
            <header className={styles.inlineHeading}>
              <div>
                <p className={styles.kicker}>Our story</p>
                <h2 id="story-title">Built through iteration.</h2>
              </div>
              <p>From individual experiments to a multidisciplinary Bedrock collective.</p>
            </header>
            <ol className={styles.timeline}>
              {timeline.map((event) => (
                <li key={event.year}>
                  <span>{event.year}</span>
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.approach} aria-labelledby="approach-title">
            <header className={styles.inlineHeading}>
              <div>
                <p className={styles.kicker}>Our approach</p>
                <h2 id="approach-title">Principles that survive the prototype.</h2>
              </div>
              <p>Open a principle to see how it guides the work.</p>
            </header>
            <div className={styles.approachGrid}>
              {approaches.map((item, index) => (
                <details className={styles.approachCard} key={item.number} open={index === 0}>
                  <summary>
                    <span className={styles.cardNumber}>{item.number}</span>
                    <span className={styles.cardTitle}>
                      <strong>{item.title}</strong>
                      <small>{item.summary}</small>
                    </span>
                    <span className={styles.cardToggle} aria-hidden="true">+</span>
                  </summary>
                  <p>{item.copy}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.directory} aria-labelledby="directory-title">
            <header className={styles.inlineHeading}>
              <div>
                <p className={styles.kicker}>Inside the studio</p>
                <h2 id="directory-title">People and acknowledgements.</h2>
              </div>
              <p>Staff records who makes the work. Credits records everyone and everything that helps it happen.</p>
            </header>
            <div className={styles.directoryGrid}>
              <Link className={styles.directoryCard} to="/studio/staff">
                <span>01 / People</span>
                <h3>Staff</h3>
                <p>Meet the studio team, their primary disciplines and the collaborating creators around them.</p>
                <b>View staff <ArrowIcon /></b>
              </Link>
              <Link className={styles.directoryCard} to="/studio/credits">
                <span>02 / Acknowledgements</span>
                <h3>Credits</h3>
                <p>Contributors, testers, community support and the open-source tools behind the site.</p>
                <b>Read credits <ArrowIcon /></b>
              </Link>
            </div>
          </section>

          <section className={styles.community} aria-labelledby="community-title">
            <div>
              <p className={styles.kicker}>Community &amp; values</p>
              <h2 id="community-title">Feedback belongs in the process.</h2>
              <p>
                Share what works, report what does not, and help us understand what Bedrock players want
                to build next. Thoughtful community input makes every release stronger.
              </p>
            </div>
            <div className={styles.communityActions}>
              <a href="https://discord.gg/x36H3ZtmK5" target="_blank" rel="noreferrer">
                Join the conversation <ArrowIcon />
              </a>
              <Link to="/support">Support the studio</Link>
            </div>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
