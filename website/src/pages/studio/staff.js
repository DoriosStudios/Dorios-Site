import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../../components/DoriosMarketingShell';
import {memberCardPalette} from '../../data/cardPalettes';
import styles from './studioSubpage.module.css';

const groups = [
  {
    id: 'leadership',
    number: '01',
    title: 'Leadership',
    copy: 'Direction, development and the foundation of the studio.',
    featured: true,
    people: [
      {
        id: 'milo504',
        name: 'Milo504 (Drag504)',
        role: 'Owner & Lead Developer',
        specialties: ['Founder', 'Systems'],
        bio: 'Leads UtilityCraft development and the studio’s technical direction.',
      },
      {
        id: 'weathervictor',
        name: 'WeatherVictor',
        role: 'Owner & UI Designer',
        specialties: ['Co-Founder', 'Interface'],
        bio: 'Designs interfaces and supports the shared code behind studio projects.',
      },
    ],
  },
  {
    id: 'development',
    number: '02',
    title: 'Development',
    copy: 'Code, quality review and systems implementation.',
    people: [
      {
        id: 'kauzin',
        name: 'Kauziin',
        role: 'Coder & Quality Checker',
        specialties: ['Code', 'UI', 'Quality Checker'],
        bio: 'Builds code and interfaces while leading quality-of-life review.',
      },
      {
        id: 'srgui',
        name: 'Sr Gui',
        role: 'Builder & Developer',
        specialties: ['Building', 'Development'],
        bio: 'Creates builds and supports implementation across current projects.',
      },
      {
        id: 'the_white_cat',
        image: 'the_white_cat.png',
        name: 'The White Cat',
        role: 'Coder & Art Designer',
        specialties: ['Code', 'Art design'],
        bio: "Develops recent studio projects such as Dorios' Feast and contributes to other projects.",
      },
      {
        id: 'sh_pro',
        image: 'sh_pro.png',
        name: 'SH.PRO',
        role: 'Coder & UI Designer',
        specialties: ['Code', 'UI design'],
        bio: "Created Digital Storage and Dorios' Backpacks, working primarily on user interfaces.",
      },
    ],
  },
  {
    id: 'art-design',
    number: '03',
    title: 'Art & Design',
    copy: 'The visual language, movement and spaces that give projects character.',
    people: [
      {
        id: 'jrice',
        name: 'JR.ice',
        role: 'Designer',
        specialties: ['Visual Direction', 'Textures'],
        bio: 'Shapes UtilityCraft’s textures and the studio’s visual language.',
      },
      {
        id: 'sam',
        name: 'Sam',
        role: 'Animator',
        specialties: ['Animation', 'Creative'],
        bio: 'Creates animation and motion for Endless Agony and other projects.',
      },
      {
        id: 'mikey',
        name: 'Mikey',
        role: 'Builder',
        specialties: ['Building'],
        bio: 'Builds environments and structures for Endless Agony and UtilitySky.',
      },
      {
        id: 'druski',
        name: 'Druski',
        role: 'Art Designer & Modeler',
        specialties: ['Textures', 'Models', 'Animation'],
        bio: 'Creates textures, models and animations across a range of studio projects.',
      },
    ],
  },
  {
    id: 'community',
    number: '04',
    title: 'Community',
    copy: 'Independent creators who collaborate with the studio and its projects.',
    people: [
      {
        id: 'cloud',
        name: 'Cloud',
        role: 'Independent Creator',
        specialties: ['Better Smelters', 'Collaboration'],
        bio: 'Develops Better Smelters and collaborates on shared addon work.',
      },
      {
        id: 'mainmas',
        name: 'Mainmas',
        role: 'Independent Creator',
        specialties: ['Community', 'Project support'],
        bio: 'Supports community work and helps studio projects move forward.',
      },
      {
        id: 'yusou',
        name: 'Yusou',
        role: 'Independent Creator',
        specialties: ['Independent work', 'Collaboration'],
        bio: 'Develops independent work while collaborating with the studio.',
      },
      {
        id: 'luna',
        name: 'Luna (Jordan J)',
        role: 'Server Manager & Content Creator',
        specialties: ['Servers', 'Tutorials', 'Content'],
        bio: 'Hosts servers and creates tutorials and other content for the studio’s projects.',
      },
    ],
  },
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
        <Link to="/studio/staff" aria-current="page">Staff</Link>
        <Link to="/studio/credits">Credits</Link>
      </div>
    </nav>
  );
}

function PersonCard({person, featured}) {
  return (
    <article className={`${styles.personCard} ${featured ? styles.featuredCard : ''}`} style={memberCardPalette(person)}>
      <div className={styles.portrait}>
        <img src={`/img/about/${person.image ?? `${person.id}.jpg`}`} alt={`Portrait of ${person.name}`} loading="lazy" />
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
    </article>
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
