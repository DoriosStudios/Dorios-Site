import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {memberCardPalette} from '../../data/cardPalettes';
import {staffGroups as groups} from '../../data/staffProfiles';
import {useSiteI18n} from '../../i18n/site';
import {getPageCopy, pageText} from '../../i18n/pages';
import styles from './studioSubpage.module.css';

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
        <Link to="/studio/staff" aria-current="page">{copy.staff}</Link>
        <Link to="/studio/credits">{copy.credits}</Link>
      </div>
    </nav>
  );
}

function PersonCard({person, featured, copy}) {
  return (
    <Link className={`${styles.personCard} ${featured ? styles.featuredCard : ''}`} style={memberCardPalette(person)} to={`/studio/staff/${person.id}`} aria-label={pageText(copy, 'profileLabel', {name: person.name})}>
      <div className={styles.portrait}>
        <img src={`/img/about/${person.image}`} alt={pageText(copy, 'portraitLabel', {name: person.name})} loading="lazy" />
        {featured && <span className={styles.ownerBadge}>{copy.owner}</span>}
      </div>
      <div className={styles.personCopy}>
        <p>{person.role}</p>
        <h3>{person.name}</h3>
        <div className={styles.specialties} aria-label={pageText(copy, 'specialtiesLabel', {name: person.name})}>
          {person.specialties.map((specialty) => <span key={specialty}>{specialty}</span>)}
        </div>
        <span className={styles.personBio}>{person.bio}</span>
      </div>
    </Link>
  );
}

export default function StaffPage() {
  const {locale} = useSiteI18n();
  const copy = getPageCopy(locale, 'staff');
  return (
    <Layout title={copy.title} description={copy.description} noFooter>
      <DoriosMarketingShell activePage="studio">
        <main className={styles.page}>
          <StudioNavigation copy={copy} />

          <header className={styles.hero}>
            <div>
              <p className={styles.breadcrumb}><Link to="/studio">{copy.title.split(' · ')[1]}</Link><span>/</span> {copy.staff}</p>
              <p className={styles.kicker}>{copy.kicker}</p>
              <h1>{copy.headingBefore}<span>{copy.headingAccent}</span></h1>
              <p className={styles.lead}>{copy.lead}</p>
            </div>
            <aside className={styles.recordNote} aria-label={copy.recordLabel}>
              <span>{copy.recordTitle}</span>
              <p>{copy.recordCopy}</p>
            </aside>
          </header>

          <section className={styles.teamDirectory} aria-label={copy.directoryLabel}>
            {groups.map((group) => {
              const [title, groupCopy] = copy.groups[group.id] ?? [group.title, group.copy];
              return (
              <section className={styles.teamGroup} id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
                <header className={styles.teamGroupHeader}>
                  <span>{group.number}</span>
                  <div>
                    <h2 id={`${group.id}-title`}>{title}</h2>
                    <p>{groupCopy}</p>
                  </div>
                </header>
                <div className={`${styles.peopleGrid} ${group.featured ? styles.founderGrid : ''}`}>
                  {group.people.map((person) => <PersonCard key={person.id} person={person} featured={group.featured} copy={copy} />)}
                </div>
              </section>
              );
            })}
          </section>

          <section className={styles.documentationBar} aria-labelledby="documentation-title">
            <div>
              <p className={styles.kicker}>{copy.developerKicker}</p>
              <h2 id="documentation-title">{copy.developerTitle}</h2>
              <p>{copy.developerCopy}</p>
            </div>
            <Link to="/documentation/dorios_core/">{copy.openDocs} <ArrowIcon /></Link>
          </section>

          <section className={styles.nextPage} aria-labelledby="credits-cta-title">
            <div>
              <p className={styles.kicker}>{copy.nextKicker}</p>
              <h2 id="credits-cta-title">{copy.nextTitle}</h2>
              <p>{copy.nextCopy}</p>
            </div>
            <Link to="/studio/credits">{copy.exploreCredits} <ArrowIcon /></Link>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
