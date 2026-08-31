import React from 'react';
import '@fontsource-variable/space-grotesk';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {projectCardPalette} from '../../data/cardPalettes';
import {formatDownloadCount, projectCatalog, relatedProjects} from '../../data/projects';
import styles from './styles.module.css';

const metricLabels = {
  items: 'Items',
  blocks: 'Blocks',
  machines: 'Machines',
  energySystems: 'Energy systems',
  generators: 'Generators',
  entities: 'Entities',
  recipes: 'Recipes',
  structures: 'Structures',
  downloads: 'Downloads',
};

const primaryMetricKeys = ['downloads', 'items', 'blocks', 'machines', 'recipes'];

function availableMetrics(project) {
  return Object.entries(project.metrics ?? {})
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      label: metricLabels[key] ?? key,
      value: key === 'downloads' ? formatDownloadCount(value) : value.toLocaleString('en-US'),
    }));
}

function primaryMetrics(project) {
  const metrics = availableMetrics(project);
  const preferred = primaryMetricKeys
    .map((key) => metrics.find((metric) => metric.key === key))
    .filter(Boolean);
  const fallback = metrics.filter((metric) => !primaryMetricKeys.includes(metric.key));
  return [...preferred, ...fallback].slice(0, 4);
}

const highlightCopy = {
  Automation: 'Connected systems designed for repeatable, scalable production.',
  Energy: 'Power generation, storage, and distribution for technical builds.',
  Utility: 'Practical tools and systems that improve everyday survival play.',
  Multiblock: 'Large structures with purpose-built industrial behavior.',
  Industry: 'Processing chains focused on throughput and factory planning.',
  'End Game': 'Advanced materials and goals for established worlds.',
  Machines: 'Dedicated machinery for specialized production workflows.',
  Optimization: 'Systems that reward compact layouts and deliberate upgrades.',
  Equipment: 'Purpose-built gear that expands how players approach progression.',
  Adventure: 'Discoverable rewards and mechanics beyond base building.',
  Progression: 'A structured path from early access to stronger capabilities.',
  Storage: 'Organized inventory solutions for growing bases and networks.',
  Building: 'Blocks and systems designed to support expressive construction.',
};

function projectHighlights(project) {
  const tagHighlights = (project.tags ?? []).slice(0, 3).map((tag) => ({
    title: tag,
    copy: highlightCopy[tag] ?? `${tag} is one of the project’s core gameplay focuses.`,
  }));
  if (tagHighlights.length) return tagHighlights;
  return availableMetrics(project)
    .filter((metric) => metric.key !== 'downloads')
    .slice(0, 3)
    .map((metric) => ({title: `${metric.value} ${metric.label}`, copy: `Documented ${metric.label.toLowerCase()} included in the current project catalog.`}));
}

function Tags({project}) {
  return (
    <div className={styles.tags} aria-label="Project classification">
      <span>Free</span>
      <span>{project.kind}</span>
      <span>{project.category}</span>
      {project.ownership === 'community' && <span>Community</span>}
      {project.visibility === 'unlisted' && <span>Preview</span>}
    </div>
  );
}

function ProjectAction({href, children, variant = 'neutral', internal = false}) {
  const className = `${styles.projectAction} ${styles[`${variant}Action`]}`;
  const content = <>{children}<span aria-hidden="true">{internal ? '→' : '↗'}</span></>;
  return internal
    ? <Link className={className} to={href}>{content}</Link>
    : <a className={className} href={href} target="_blank" rel="noreferrer">{content}</a>;
}

function ProjectArtwork({project}) {
  const artwork = project.media.cover ?? project.media.icon;
  const isCover = Boolean(project.media.cover);
  return (
    <div className={`${styles.artwork} ${!isCover ? styles.iconArtwork : ''}`}>
      <div className={styles.artworkWords} aria-hidden="true">
        <span>{project.name}</span><span>{project.category}</span><span>Dorios Studios</span>
      </div>
      <img
        src={artwork}
        alt={project.media.alt}
        style={{objectFit: isCover ? project.media.coverFit : 'contain'}}
      />
    </div>
  );
}

function PrimaryActions({project}) {
  const howToPlayHref = project.id === 'utilitycraft' && project.routes.wiki
    ? `${project.routes.wiki}/how-to-play`
    : null;
  const actions = [
    project.links.curseforge && {href: project.links.curseforge, label: 'CurseForge', variant: 'curseforge'},
    project.links.mcpedl && {href: project.links.mcpedl, label: 'MCPEDL', variant: 'mcpedl'},
    project.routes.wiki && {href: project.routes.wiki, label: 'Wiki', variant: 'neutral', internal: true},
    howToPlayHref && {href: howToPlayHref, label: 'How To Play', variant: 'guide', internal: true},
    project.links.repository && {href: project.links.repository, label: 'GitHub', variant: 'neutral'},
    !project.links.repository && project.links.releases && {href: project.links.releases, label: 'GitHub releases', variant: 'neutral'},
  ].filter(Boolean);

  return (
    <div className={styles.actions}>
      {actions.map((action) => <ProjectAction key={action.label} {...action}>{action.label}</ProjectAction>)}
      {!actions.length && <ProjectAction href="/support" variant="accent" internal>Follow development</ProjectAction>}
    </div>
  );
}

function HeroMetadata({project}) {
  const stats = [
    {label: 'Lifecycle', value: project.lifecycle},
    {label: project.version ? 'Release' : 'Project type', value: project.version ? `v${project.version}` : project.kind},
    {label: 'Access', value: '100% Free'},
  ];

  return (
    <dl className={styles.heroMetadata} aria-label="Project release information">
      {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
    </dl>
  );
}

function PrimaryMetrics({project}) {
  const metrics = primaryMetrics(project);
  if (!metrics.length) return null;

  return (
    <dl className={styles.heroStats} aria-label="Primary project metrics" style={projectCardPalette(project)}>
      {metrics.map((metric) => <div key={metric.key}>
        <dt>{metric.label}</dt>
        <dd>{metric.value}</dd>
        {metric.key === 'downloads' && <small className={styles.downloadSources}>
          {project.downloadStats.hasCurseForge ? `CurseForge ${project.downloadStats.curseForge.toLocaleString('en-US')}` : 'CurseForge 0'}
          <span>+</span>
          {project.downloadStats.hasGitHub ? `GitHub ${project.downloadStats.github.toLocaleString('en-US')}` : 'GitHub 0'}
        </small>}
      </div>)}
    </dl>
  );
}

function dependencyProjects(project) {
  if (project.kind !== 'Extension') return [];
  return project.requires.map((requirement) => {
    const normalized = requirement.toLowerCase().trim();
    const dependency = projectCatalog.find((candidate) => (
      normalized === candidate.name.toLowerCase()
      || normalized.startsWith(`${candidate.name.toLowerCase()} `)
    ));
    return {requirement, dependency};
  });
}

function DependencyCards({project}) {
  const dependencies = dependencyProjects(project);
  if (!dependencies.length) return null;

  return (
    <div className={styles.dependencyList} aria-label="Required project dependencies">
      {dependencies.map(({requirement, dependency}) => {
        const content = <>
          <span className={styles.dependencyVisual}>
            <img src={dependency?.media.icon ?? project.media.icon} alt="" loading="lazy" />
          </span>
          <span className={styles.dependencyCopy}>
            <small>Required dependency</small>
            <strong>{dependency?.name ?? requirement}</strong>
            <span>{requirement}</span>
          </span>
          <b aria-hidden="true">{dependency ? '↗' : '•'}</b>
        </>;

        return dependency
          ? <Link className={styles.dependencyCard} to={dependency.routes.project} key={requirement} style={projectCardPalette(dependency)}>{content}</Link>
          : <article className={styles.dependencyCard} key={requirement} style={projectCardPalette(project)}>{content}</article>;
      })}
    </div>
  );
}

function ProjectFacts({project}) {
  const metadata = [
    ['Owner', project.ownership === 'community' ? 'Community extension' : 'Dorios Studios'],
    ['Version', project.version ? `v${project.version}` : 'In development'],
    ['Minecraft', project.minecraftVersion ? `${project.minecraftVersion}+` : 'Bedrock Edition'],
    ['Status', project.lifecycle],
    ['Access', 'Free'],
    ['Project type', project.kind],
  ];

  return (
    <section className={styles.projectDetails} aria-labelledby="project-details-title">
      <article className={`${styles.detailsPanel} ${styles.metadataPanel}`}>
        <div className={styles.detailsHeading}>
          <p className={styles.eyebrow}>Project details</p>
          <h2 id="project-details-title">At a glance.</h2>
        </div>
        <dl className={styles.metadataList}>
          {metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </article>
    </section>
  );
}

function ProjectHighlights({project}) {
  const highlights = projectHighlights(project);
  if (!highlights.length) return null;
  return (
    <section className={styles.highlights} aria-labelledby="project-highlights-title">
      <div><p className={styles.eyebrow}>Project highlights</p><h2 id="project-highlights-title">What it adds.</h2></div>
      <div className={styles.highlightGrid}>
        {highlights.map((highlight, index) => <article key={highlight.title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{highlight.title}</strong>
          <p>{highlight.copy}</p>
        </article>)}
      </div>
      <DependencyCards project={project} />
      {project.kind !== 'Extension' && project.requires.length > 0 && <div className={styles.requirements}><span>Requires</span>{project.requires.map((requirement) => <strong key={requirement}>{requirement}</strong>)}</div>}
    </section>
  );
}

export default function ProjectDetailPage({project}) {
  if (!project) {
    return <Layout title="Project not found"><DoriosMarketingShell activePage="projects"><main className={styles.notFound}><h1>Project not found.</h1><Link to="/projects">Return to projects</Link></main></DoriosMarketingShell></Layout>;
  }
  const related = relatedProjects(project);
  const singleWordTitle = !project.name.trim().includes(' ');
  const hasPrimaryMetrics = primaryMetrics(project).length > 0;
  return (
    <Layout title={project.name} description={project.summary} noFooter>
      <SocialMetadata
        title={project.name}
        parent="Dorios Studios"
        type={project.kind}
        description={project.summary}
        path={project.routes.project}
        image={project.media.cover ?? project.media.icon}
        imageAlt={project.media.alt}
        largeImage={Boolean(project.media.cover)}
      />
      <DoriosMarketingShell activePage="project" project={project}>
        <main className={styles.projectPage}>
          <nav className={styles.breadcrumb} aria-label="Project hierarchy">
            <Link to="/projects">Projects</Link><span aria-hidden="true">/</span><strong>{project.name}</strong>{project.routes.wiki && <><span aria-hidden="true">/</span><Link to={project.routes.wiki}>Wiki</Link></>}
          </nav>

          <section className={styles.hero} aria-labelledby="project-title" style={projectCardPalette(project)}>
            <div className={styles.heroCopy}>
              <Link className={styles.backLink} to="/projects"><span aria-hidden="true">←</span> Back to projects</Link>
              <Tags project={project} />
              <h1 id="project-title" className={singleWordTitle ? styles.singleWordTitle : undefined}>{project.name}</h1>
              <p>{project.summary}</p>
              <HeroMetadata project={project} />
              {hasPrimaryMetrics && <PrimaryMetrics project={project} />}
              <PrimaryActions project={project} />
            </div>
            <ProjectArtwork project={project} />
          </section>

          <ProjectHighlights project={project} />
          <ProjectFacts project={project} />

          <section className={styles.relatedSection} aria-labelledby="related-projects-title">
            <div><p className={styles.eyebrow}>More from Dorios</p><h2 id="related-projects-title">Related projects.</h2></div>
            <div className={styles.relatedGrid}>
              {related.map((candidate) => <Link to={candidate.routes.project} key={candidate.id} style={projectCardPalette(candidate)}>
                <span className={styles.relatedVisual}><img src={candidate.media.icon ?? candidate.media.cover} alt="" /></span>
                <span className={styles.relatedCopy}><small>{candidate.kind} · {candidate.category}</small><strong>{candidate.name}</strong></span>
                <b aria-hidden="true">→</b>
              </Link>)}
            </div>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
