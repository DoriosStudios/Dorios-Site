import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase,
  IconCalendar,
  IconExternalLink,
  IconLayoutGrid,
  IconTools,
} from '@tabler/icons-react';
import DoriosMarketingShell from '../DoriosMarketingShell';
import projectCatalog from '../../data/projectCatalog.json';
import {memberCardPalette, projectCardPalette} from '../../data/cardPalettes';
import {staffMemberById, staffMembers} from '../../data/staffProfiles';
import styles from './styles.module.css';

const catalogById = Object.fromEntries(projectCatalog.projects.map((project) => [project.id, project]));

function projectRecord(entry) {
  const catalogProject = entry.projectId ? catalogById[entry.projectId] : null;
  const desktopCover = entry.cover ?? catalogProject?.media?.cover ?? null;
  return {
    ...entry,
    name: entry.name ?? catalogProject?.name ?? entry.projectId,
    href: entry.href ?? catalogProject?.routes?.project ?? null,
    desktopImage: desktopCover ?? entry.image ?? catalogProject?.media?.icon ?? null,
    mobileImage: entry.image ?? catalogProject?.media?.icon ?? entry.cover ?? catalogProject?.media?.cover ?? null,
    hasDesktopCover: Boolean(desktopCover),
    paletteId: catalogProject?.id ?? null,
  };
}

function ProjectCard({entry}) {
  const project = projectRecord(entry);
  const content = <>
    <span className={styles.projectVisual} data-has-cover={project.hasDesktopCover} aria-hidden="true">
      {project.desktopImage || project.mobileImage
        ? <picture>
          {project.mobileImage && <source media="(max-width: 680px)" srcSet={project.mobileImage} />}
          <img src={project.desktopImage ?? project.mobileImage} alt="" />
        </picture>
        : <b>{project.name.slice(0, 2).toUpperCase()}</b>}
    </span>
    <span className={styles.projectCopy}>
      {project.role && <small>{project.role}</small>}
      <strong>{project.name}</strong>
      {project.summary && <span>{project.summary}</span>}
    </span>
    {project.href && <IconArrowRight className={styles.projectArrow} aria-hidden="true" />}
  </>;

  const palette = project.paletteId ? projectCardPalette(project.paletteId) : undefined;
  return project.href
    ? <Link className={styles.projectCard} style={palette} to={project.href}>{content}</Link>
    : <article className={styles.projectCard} style={palette}>{content}</article>;
}

function ProjectSection({number, title, entries, emptyCopy}) {
  return (
    <section className={styles.projectSection} aria-labelledby={`profile-projects-${number}`}>
      <header className={styles.sectionHeading}>
        <span>{number}</span>
        <div><small>Projects</small><h2 id={`profile-projects-${number}`}>{title}</h2></div>
      </header>
      {entries.length
        ? <div className={styles.projectList}>{entries.map((entry, index) => <ProjectCard entry={entry} key={entry.projectId ?? `${entry.name}-${index}`} />)}</div>
        : <p className={styles.emptyProjects}>{emptyCopy}</p>}
    </section>
  );
}

function ProfileFacts({member}) {
  return (
    <dl className={styles.profileFacts}>
      {!member.founder && member.joined && <div><IconCalendar aria-hidden="true" /><dt>Member since</dt><dd>{member.joined}</dd></div>}
      <div><IconBriefcase aria-hidden="true" /><dt>Department</dt><dd>{member.department}</dd></div>
      <div><IconLayoutGrid aria-hidden="true" /><dt>Focus</dt><dd>{member.focus}</dd></div>
    </dl>
  );
}

function historyParagraphs(history, fallback) {
  const source = history ?? fallback;
  if (Array.isArray(source)) return source.filter(Boolean);
  return String(source ?? '').split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function AtAGlance({member}) {
  const rows = [
    {label: 'Focus', value: member.focus, icon: IconLayoutGrid},
    {label: 'Tools', value: member.tools?.join(' · '), icon: IconTools},
    {label: 'Main areas', value: member.areas?.join(' · '), icon: IconBriefcase},
  ].filter((row) => row.value);
  if (!rows.length) return null;
  return (
    <aside className={styles.glance} aria-label={`${member.name} at a glance`}>
      <p>At a glance</p>
      {rows.map(({label, value, icon: Icon}) => <div key={label}><Icon aria-hidden="true" /><strong>{label}</strong><span>{value}</span></div>)}
    </aside>
  );
}

function MemberNavigation({member}) {
  const index = staffMembers.findIndex((candidate) => candidate.id === member.id);
  const previous = staffMembers[(index - 1 + staffMembers.length) % staffMembers.length];
  const next = staffMembers[(index + 1) % staffMembers.length];
  return (
    <nav className={styles.memberNavigation} aria-label="Browse staff profiles">
      <Link to={`/studio/staff/${previous.id}`}>
        <IconArrowLeft aria-hidden="true" />
        <img src={`/img/about/${previous.image}`} alt="" />
        <span><small>Previous member</small><strong>{previous.shortName ?? previous.name}</strong><em>{previous.role}</em></span>
      </Link>
      <Link className={styles.directoryLink} to="/studio/staff" aria-label="Return to staff directory"><IconLayoutGrid aria-hidden="true" /></Link>
      <Link to={`/studio/staff/${next.id}`}>
        <span><small>Next member</small><strong>{next.shortName ?? next.name}</strong><em>{next.role}</em></span>
        <img src={`/img/about/${next.image}`} alt="" />
        <IconArrowRight aria-hidden="true" />
      </Link>
    </nav>
  );
}

export default function StaffProfilePage({memberId}) {
  const member = staffMemberById[memberId];
  if (!member) return null;
  const linkEntries = Object.entries(member.links ?? {}).filter(([, href]) => href);

  return (
    <Layout title={`${member.name} · Staff`} description={`${member.name}, ${member.role} at Dorios Studios.`} noFooter>
      <DoriosMarketingShell activePage="studio">
        <main className={styles.page} style={memberCardPalette(member)}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/studio">The Studio</Link><span aria-hidden="true">/</span>
            <Link to="/studio/staff">Staff</Link><span aria-hidden="true">/</span>
            <strong>{member.shortName ?? member.name}</strong>
          </nav>

          <header className={styles.profileHero}>
            <div className={styles.profilePortrait}>
              <img src={`/img/about/${member.image}`} alt={`Portrait of ${member.name}`} />
            </div>
            <div className={styles.profileIdentity}>
              <p>{member.founder ? 'Studio founder' : 'Studio member'}</p>
              <h1>{member.name}</h1>
              <h2>{member.role}</h2>
              <p className={styles.profileBio}>{member.bio}</p>
              {linkEntries.length > 0 && <div className={styles.profileLinks}>
                {linkEntries.map(([label, href]) => <a href={href} target="_blank" rel="noreferrer" key={label}>{label}<IconExternalLink aria-hidden="true" /></a>)}
              </div>}
            </div>
            <div className={styles.profileAside}>
              {member.quote && <blockquote>“{member.quote}”</blockquote>}
              <ProfileFacts member={member} />
            </div>
          </header>

          <section className={styles.aboutSection} aria-labelledby="profile-about-title">
            <div>
              <header className={styles.sectionHeading}>
                <span>01</span><div><small>About</small><h2 id="profile-about-title">About {member.shortName ?? member.name}</h2></div>
              </header>
              <div className={styles.historyCopy}>
                {historyParagraphs(member.history, member.bio).map((paragraph, index) => <p key={`${member.id}-history-${index}`}>{paragraph}</p>)}
              </div>
            </div>
            <AtAGlance member={member} />
          </section>

          <div className={styles.projectColumns}>
            <ProjectSection number="02" title="Projects Created" entries={member.createdProjects ?? []} emptyCopy="No creator credit has been documented for this profile yet." />
            <ProjectSection number="03" title="Projects Contributed To" entries={member.collaboratedProjects ?? []} emptyCopy="Project collaborations for this profile are still being documented." />
          </div>

          {member.timeline?.length > 0 && <section className={styles.timeline} aria-labelledby="profile-timeline-title">
            <header className={styles.sectionHeading}><span>04</span><div><small>Timeline</small><h2 id="profile-timeline-title">Journey at Dorios Studios</h2></div></header>
            <div>{member.timeline.map((entry) => <article key={`${entry.period}-${entry.title}`}><span /><strong>{entry.period}</strong><h3>{entry.title}</h3><p>{entry.description}</p></article>)}</div>
          </section>}

          <MemberNavigation member={member} />
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
