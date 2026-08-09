import React from 'react';
import '@fontsource-variable/space-grotesk';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {projectCardPalette} from '../../data/cardPalettes';
import githubReleaseStats from '../../data/githubReleaseStats.json';
import curseForgeStats from '../../data/curseForgeStats.json';
import {projectCatalog, relatedProjects} from '../../data/projects';
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

function abbreviatedDownloadCount(value) {
  const count = Math.max(0, Math.floor(Number(value) || 0));
  if (count < 100) return '<100';
  if (count < 1000) return `${Math.floor(count / 100) * 100}+`;
  const units = [[1_000_000_000, 'B'], [1_000_000, 'M'], [1_000, 'K']];
  const [size, suffix] = units.find(([unitSize]) => count >= unitSize);
  const truncated = Math.floor((count / size) * 10) / 10;
  return `${Number.isInteger(truncated) ? truncated.toFixed(0) : truncated.toFixed(1)}${suffix}+`;
}

function availableMetrics(project) {
  const releaseDownloads = curseForgeStats[project.id]?.downloads ?? githubReleaseStats[project.id]?.downloads;
  const metrics = releaseDownloads === undefined
    ? project.metrics
    : {downloads: releaseDownloads, ...project.metrics};
  return Object.entries(metrics ?? {})
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      label: metricLabels[key] ?? key,
      value: key === 'downloads' ? abbreviatedDownloadCount(value) : value.toLocaleString('en-US'),
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
  const actions = [
    project.links.curseforge && {href: project.links.curseforge, label: 'CurseForge', variant: 'curseforge'},
    project.links.mcpedl && {href: project.links.mcpedl, label: 'MCPEDL', variant: 'mcpedl'},
    project.routes.wiki && {href: project.routes.wiki, label: 'Wiki', variant: 'neutral', internal: true},
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
      {metrics.map((metric) => <div key={metric.key}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
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
  const highlightedKeys = new Set(primaryMetrics(project).map((metric) => metric.key));
  const additionalMetrics = availableMetrics(project).filter((metric) => !highlightedKeys.has(metric.key));
  const metadata = [
    ['Ownership', project.ownership === 'community' ? 'Community extension' : 'Dorios Studios'],
    ['Minecraft version', project.minecraftVersion ? `${project.minecraftVersion}+` : 'Bedrock Edition'],
  ];

  return (
    <section className={styles.projectDetails} aria-labelledby="project-details-title">
      {additionalMetrics.length > 0 && (
        <article className={`${styles.detailsPanel} ${styles.metricsPanel}`}>
          <div className={styles.detailsHeading}>
            <p className={styles.eyebrow}>Beyond the essentials</p>
            <h2 id="project-details-title">Additional metrics.</h2>
          </div>
          <dl className={styles.additionalMetrics}>
            {additionalMetrics.map((metric) => <div key={metric.key}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
          </dl>
        </article>
      )}
      <article className={`${styles.detailsPanel} ${styles.metadataPanel}`}>
        <div className={styles.detailsHeading}>
          <p className={styles.eyebrow}>Project details</p>
          <h2 id={additionalMetrics.length ? undefined : 'project-details-title'}>At a glance.</h2>
        </div>
        <dl className={styles.metadataList}>
          {metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </article>
    </section>
  );
}

function ProjectLinkIcon({type}) {
  if (type === 'wiki') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5c3.2-.8 5.7-.2 7.5 1.5v12c-1.8-1.7-4.3-2.2-7.5-1.5zM19.5 5.5c-3.2-.8-5.7-.2-7.5 1.5v12c1.8-1.7 4.3-2.2 7.5-1.5z" /></svg>;
  if (type === 'repository') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="5" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="6" cy="19" r="2" /><path d="M6 7v10M8 9c5 0 4-2 8-2" /></svg>;
  if (type === 'curseforge') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 7 4v10l-7 4-7-4V7zM5 7l7 4 7-4M12 11v10" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M5 20h14" /></svg>;
}

function ProjectLinkCard({link}) {
  const content = <>
    <span className={styles.linkIcon}><ProjectLinkIcon type={link.type} /></span>
    <span className={styles.linkCopy}><small>Project resource</small><strong>{link.label}</strong><span>{link.copy}</span></span>
    <b aria-hidden="true">{link.internal ? '→' : '↗'}</b>
  </>;
  return link.internal
    ? <Link to={link.href} data-resource={link.type}>{content}</Link>
    : <a href={link.href} target="_blank" rel="noreferrer" data-resource={link.type}>{content}</a>;
}

function ProjectLinks({project}) {
  const links = [
    project.links.curseforge && {type: 'curseforge', href: project.links.curseforge, label: 'CurseForge', copy: 'Download the public release and follow version updates.'},
    project.links.mcpedl && {type: 'mcpedl', href: project.links.mcpedl, label: 'MCPEDL', copy: 'View the community listing and Bedrock download information.'},
    project.routes.wiki && {type: 'wiki', href: project.routes.wiki, label: 'Wiki', copy: 'Browse guides, content indexes, recipes, and technical references.', internal: true},
    project.links.repository && {type: 'repository', href: project.links.repository, label: 'GitHub', copy: 'Inspect source, releases, issues, and current development.'},
  ].filter(Boolean);
  if (!links.length) return null;
  return (
    <section className={styles.linkSection} aria-labelledby="project-links-title">
      <div><p className={styles.eyebrow}>Continue exploring</p><h2 id="project-links-title">Project links.</h2></div>
      <div className={styles.linkGrid}>
        {links.map((link) => <ProjectLinkCard key={link.label} link={link} />)}
      </div>
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

          <section className={`${styles.hero} ${!hasPrimaryMetrics ? styles.heroStandalone : ''}`} aria-labelledby="project-title" style={projectCardPalette(project)}>
            <div className={styles.heroCopy}>
              <Link className={styles.backLink} to="/projects"><span aria-hidden="true">←</span> Back to projects</Link>
              <Tags project={project} />
              <h1 id="project-title" className={singleWordTitle ? styles.singleWordTitle : undefined}>{project.name}</h1>
              <p>{project.summary}</p>
              <HeroMetadata project={project} />
              <PrimaryActions project={project} />
            </div>
            <ProjectArtwork project={project} />
          </section>

          {hasPrimaryMetrics && <PrimaryMetrics project={project} />}

          <section className={styles.about} aria-labelledby="about-project-title">
            <div><p className={styles.eyebrow}>About the project</p><h2 id="about-project-title">Built with a clear purpose.</h2></div>
            <div className={styles.aboutCopy}>
              <p>{project.description}</p>
              <DependencyCards project={project} />
              {project.kind !== 'Extension' && project.requires.length > 0 && <div className={styles.requirements}><span>Requires</span>{project.requires.map((requirement) => <strong key={requirement}>{requirement}</strong>)}</div>}
            </div>
          </section>

          <ProjectFacts project={project} />
          <ProjectLinks project={project} />

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
