import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {memberCardPalette} from '../../data/cardPalettes';
import {staffGroups as groups} from '../../data/staffProfiles';
import styles from './studioSubpage.module.css';

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
        <Link to="/studio/staff" aria-current="page">Staff</Link>
        <Link to="/studio/credits">Credits</Link>
      </div>
    </nav>
  );
}

function PersonCard({person, featured}) {
  return (
    <Link className={`${styles.personCard} ${featured ? styles.featuredCard : ''}`} style={memberCardPalette(person)} to={`/studio/staff/${person.id}`} aria-label={`View ${person.name}'s profile`}>
      <div className={styles.portrait}>
        <img src={`/img/about/${person.image}`} alt={`Portrait of ${person.name}`} loading="lazy" />
        {featured && <span className={styles.ownerBadge}>Owner</span>}
      </div>
      <div className={styles.personCopy}>
        <p>{person.role}</p>
        <h3>{person.name}</h3>
        <div className={styles.specialties} aria-label={`${person.name} specialties`}>
          {person.specialties.map((specialty) => <span key={specialty}>{specialty}</span>)}
        </div>
        <span className={styles.personBio}>{person.bio}</span>
      </div>
    </Link>
  );
}

export default function StaffPage() {
  return (
    <Layout title="Staff · The Studio" description="Meet the staff and collaborating creators behind Dorios Studios." noFooter>
      <DoriosMarketingShell activePage="studio">
        <main className={styles.page}>
          <StudioNavigation />

          <header className={styles.hero}>
            <div>
              <p className={styles.breadcrumb}><Link to="/studio">The Studio</Link><span>/</span> Staff</p>
              <p className={styles.kicker}>People behind the work</p>
              <h1>Different disciplines. <span>One studio.</span></h1>
              <p className={styles.lead}>
                Development, interfaces, art, animation and community work come together here.
                Profiles are grouped by each person’s primary published role.
              </p>
            </div>
            <aside className={styles.recordNote} aria-label="About this staff record">
              <span>About this record</span>
              <p>
                Roles follow the studio’s currently published team profiles. No personal links are shown
                unless the studio has provided one publicly.
              </p>
            </aside>
          </header>

          <section className={styles.teamDirectory} aria-label="Dorios Studios team directory">
            {groups.map((group) => (
              <section className={styles.teamGroup} id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
                <header className={styles.teamGroupHeader}>
                  <span>{group.number}</span>
                  <div>
                    <h2 id={`${group.id}-title`}>{group.title}</h2>
                    <p>{group.copy}</p>
                  </div>
                </header>
                <div className={`${styles.peopleGrid} ${group.featured ? styles.founderGrid : ''}`}>
                  {group.people.map((person) => <PersonCard key={person.id} person={person} featured={group.featured} />)}
                </div>
              </section>
            ))}
          </section>

          <section className={styles.documentationBar} aria-labelledby="documentation-title">
            <div>
              <p className={styles.kicker}>Developer resources</p>
              <h2 id="documentation-title">Build with Dorios scripts.</h2>
              <p>Browse the scripting reference, examples and APIs used across the studio’s Bedrock projects.</p>
            </div>
            <Link to="/documentation/dorios_core/">Open script documentation <ArrowIcon /></Link>
          </section>

          <section className={styles.nextPage} aria-labelledby="credits-cta-title">
            <div>
              <p className={styles.kicker}>Beyond the staff</p>
              <h2 id="credits-cta-title">Many more hands make the work possible.</h2>
              <p>Continue to contributors, testers, special thanks and the tools behind Dorios Studios.</p>
            </div>
            <Link to="/studio/credits">Explore the credits <ArrowIcon /></Link>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
