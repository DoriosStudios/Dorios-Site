import React from 'react';
import '@fontsource-variable/space-grotesk';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {projectCardPalette} from '../../data/cardPalettes';
import {formatDownloadCount, projectCatalog, relatedProjects} from '../../data/projects';
import {useSiteI18n} from '../../i18n/site';
import {localizeProject} from '../../i18n/projects';
import styles from './styles.module.css';

const metricLabels = {
  items: 'itemsMetric',
  blocks: 'blocksMetric',
  machines: 'machinesMetric',
  energySystems: 'energySystemsMetric',
  generators: 'generatorsMetric',
  entities: 'entitiesMetric',
  recipes: 'recipesMetric',
  structures: 'structuresMetric',
  downloads: 'downloadsMetric',
};

const primaryMetricKeys = ['downloads', 'items', 'blocks', 'machines', 'recipes'];

function availableMetrics(project, t, formatNumber) {
  return Object.entries(project.metrics ?? {})
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      label: metricLabels[key] ? t(metricLabels[key]) : key,
      value: key === 'downloads' ? formatDownloadCount(value) : formatNumber(value),
    }));
}

function primaryMetrics(project, t, formatNumber) {
  const metrics = availableMetrics(project, t, formatNumber);
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

const localizedHighlightCopy = {
  'pt-BR': {
    Automation: 'Sistemas conectados para uma produção repetível e escalável.', Energy: 'Geração, armazenamento e distribuição de energia para construções técnicas.', Utility: 'Ferramentas e sistemas práticos que melhoram a sobrevivência cotidiana.', Multiblock: 'Estruturas grandes com comportamento industrial especializado.', Industry: 'Cadeias de processamento focadas em rendimento e planejamento de fábricas.', 'End Game': 'Materiais e objetivos avançados para mundos estabelecidos.', Machines: 'Máquinas dedicadas a fluxos de produção especializados.', Optimization: 'Sistemas que recompensam layouts compactos e melhorias planejadas.', Equipment: 'Equipamentos específicos que ampliam as formas de progredir.', Adventure: 'Recompensas e mecânicas descobertas além da construção de bases.', Progression: 'Um caminho estruturado do início até capacidades mais fortes.', Storage: 'Soluções organizadas para inventários, bases e redes crescentes.', Building: 'Blocos e sistemas criados para construções mais expressivas.',
  },
  'es-MX': {
    Automation: 'Sistemas conectados para una producción repetible y escalable.', Energy: 'Generación, almacenamiento y distribución de energía para construcciones técnicas.', Utility: 'Herramientas y sistemas prácticos que mejoran la supervivencia cotidiana.', Multiblock: 'Estructuras grandes con comportamiento industrial especializado.', Industry: 'Cadenas de procesamiento centradas en rendimiento y planificación de fábricas.', 'End Game': 'Materiales y objetivos avanzados para mundos establecidos.', Machines: 'Maquinaria dedicada a flujos de producción especializados.', Optimization: 'Sistemas que recompensan diseños compactos y mejoras deliberadas.', Equipment: 'Equipo especializado que amplía las formas de progresar.', Adventure: 'Recompensas y mecánicas por descubrir más allá de la construcción de bases.', Progression: 'Un camino estructurado desde el acceso inicial hasta capacidades mayores.', Storage: 'Soluciones organizadas para inventarios, bases y redes en crecimiento.', Building: 'Bloques y sistemas creados para construcciones más expresivas.',
  },
};

const highlightFallback = {
  en: (label) => `${label} is one of the project’s core gameplay focuses.`,
  'pt-BR': (label) => `${label} é um dos principais focos de jogabilidade do projeto.`,
  'es-MX': (label) => `${label} es uno de los enfoques principales del proyecto.`,
};

const metricFallback = {
  en: (label) => `Documented ${label.toLowerCase()} included in the current project catalog.`,
  'pt-BR': (label) => `${label} documentados e incluídos no catálogo atual do projeto.`,
  'es-MX': (label) => `${label} documentados e incluidos en el catálogo actual del proyecto.`,
};

function projectHighlights(project, t, formatNumber, locale) {
  const sourceTags = project.tagIds ?? project.tags ?? [];
  const tagHighlights = (project.tags ?? []).slice(0, 3).map((tag, index) => ({
    title: tag,
    copy: localizedHighlightCopy[locale]?.[sourceTags[index]] ?? highlightCopy[sourceTags[index]] ?? highlightFallback[locale](tag),
  }));
  if (tagHighlights.length) return tagHighlights;
  return availableMetrics(project, t, formatNumber)
    .filter((metric) => metric.key !== 'downloads')
    .slice(0, 3)
    .map((metric) => ({title: `${metric.value} ${metric.label}`, copy: metricFallback[locale](metric.label)}));
}

function Tags({project}) {
  const {t} = useSiteI18n();
  return (
    <div className={styles.tags} aria-label={t('projectClassification')}>
      <span>{t('free')}</span>
      <span>{project.kind}</span>
      <span>{project.category}</span>
      {project.ownership === 'community' && <span>{t('community')}</span>}
      {project.visibility === 'unlisted' && <span>{t('preview')}</span>}
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
  const {t} = useSiteI18n();
  const howToPlayHref = project.id === 'utilitycraft' && project.routes.wiki
    ? `${project.routes.wiki}/how-to-play`
    : null;
  const actions = [
    project.links.curseforge && {href: project.links.curseforge, label: 'CurseForge', variant: 'curseforge'},
    project.links.mcpedl && {href: project.links.mcpedl, label: 'MCPEDL', variant: 'mcpedl'},
    howToPlayHref && {href: howToPlayHref, label: t('howToPlay'), variant: 'guide', internal: true},
    project.routes.wiki && {href: project.routes.wiki, label: 'Wiki', variant: 'neutral', internal: true},
    project.links.repository && {href: project.links.repository, label: 'GitHub', variant: 'neutral'},
    !project.links.repository && project.links.releases && {href: project.links.releases, label: t('githubReleases'), variant: 'neutral'},
  ].filter(Boolean);

  return (
    <div className={styles.actions}>
      {actions.map((action) => <ProjectAction key={action.label} {...action}>{action.label}</ProjectAction>)}
      {!actions.length && <ProjectAction href="/support" variant="accent" internal>{t('followDevelopment')}</ProjectAction>}
    </div>
  );
}

function HeroMetadata({project}) {
  const {t} = useSiteI18n();
  const stats = [
    {label: t('lifecycle'), value: project.lifecycle},
    {label: project.version ? t('release') : t('projectType'), value: project.version ? `v${project.version}` : project.kind},
    {label: t('access'), value: t('freeAccess')},
  ];

  return (
    <dl className={styles.heroMetadata} aria-label={t('projectReleaseInformation')}>
      {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
    </dl>
  );
}

function PrimaryMetrics({project}) {
  const {t, formatNumber} = useSiteI18n();
  const metrics = primaryMetrics(project, t, formatNumber);
  if (!metrics.length) return null;

  return (
    <dl className={styles.heroStats} aria-label={t('primaryProjectMetrics')} style={projectCardPalette(project)}>
      {metrics.map((metric) => <div key={metric.key}>
        <dt>{metric.label}</dt>
        <dd>{metric.value}</dd>
        {metric.key === 'downloads' && <small className={styles.downloadSources}>
          {project.downloadStats.hasCurseForge ? `CurseForge ${formatNumber(project.downloadStats.curseForge)}` : 'CurseForge 0'}
          <span>+</span>
          {project.downloadStats.hasGitHub ? `GitHub ${formatNumber(project.downloadStats.github)}` : 'GitHub 0'}
        </small>}
      </div>)}
    </dl>
  );
}

function dependencyProjects(project) {
  if ((project.kindId ?? project.kind) !== 'Extension') return [];
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
  const {t} = useSiteI18n();
  const dependencies = dependencyProjects(project);
  if (!dependencies.length) return null;

  return (
    <div className={styles.dependencyList} aria-label={t('requiredDependencies')}>
      {dependencies.map(({requirement, dependency}) => {
        const content = <>
          <span className={styles.dependencyVisual}>
            <img src={dependency?.media.icon ?? project.media.icon} alt="" loading="lazy" />
          </span>
          <span className={styles.dependencyCopy}>
            <small>{t('requiredDependency')}</small>
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
  const {t} = useSiteI18n();
  const metadata = [
    [t('owner'), project.ownership === 'community' ? t('community') : 'Dorios Studios'],
    [t('version'), project.version ? `v${project.version}` : t('inDevelopment')],
    [t('minecraft'), project.minecraftVersion ? `${project.minecraftVersion}+` : t('bedrockEdition')],
    [t('status'), project.lifecycle],
    [t('access'), t('free')],
    [t('projectType'), project.kind],
  ];

  return (
    <section className={styles.projectDetails} aria-labelledby="project-details-title">
      <article className={`${styles.detailsPanel} ${styles.metadataPanel}`}>
        <div className={styles.detailsHeading}>
          <p className={styles.eyebrow}>{t('projectDetails')}</p>
          <h2 id="project-details-title">{t('atGlance')}</h2>
        </div>
        <dl className={styles.metadataList}>
          {metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </article>
    </section>
  );
}

function ProjectHighlights({project}) {
  const {t, formatNumber, locale} = useSiteI18n();
  const highlights = projectHighlights(project, t, formatNumber, locale);
  if (!highlights.length) return null;
  return (
    <section className={styles.highlights} aria-labelledby="project-highlights-title">
      <div><p className={styles.eyebrow}>{t('projectHighlights')}</p><h2 id="project-highlights-title">{t('whatItAdds')}</h2></div>
      <div className={styles.highlightGrid}>
        {highlights.map((highlight, index) => <article key={highlight.title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{highlight.title}</strong>
          <p>{highlight.copy}</p>
        </article>)}
      </div>
      <DependencyCards project={project} />
      {(project.kindId ?? project.kind) !== 'Extension' && project.requires.length > 0 && <div className={styles.requirements}><span>{t('requires')}</span>{project.requires.map((requirement) => <strong key={requirement}>{requirement}</strong>)}</div>}
    </section>
  );
}

export default function ProjectDetailPage({project: sourceProject}) {
  const {t, formatNumber, locale} = useSiteI18n();
  const project = React.useMemo(() => localizeProject(sourceProject, locale), [sourceProject, locale]);
  if (!project) {
    return <Layout title={t('projectNotFound')}><DoriosMarketingShell activePage="projects"><main className={styles.notFound}><h1>{t('projectNotFound')}</h1><Link to="/projects">{t('returnProjects')}</Link></main></DoriosMarketingShell></Layout>;
  }
  const related = relatedProjects(sourceProject).map((candidate) => localizeProject(candidate, locale));
  const singleWordTitle = !project.name.trim().includes(' ');
  const hasPrimaryMetrics = primaryMetrics(project, t, formatNumber).length > 0;
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
      <DoriosMarketingShell activePage="projects" project={project}>
        <main className={styles.projectPage}>
          <nav className={styles.breadcrumb} aria-label={t('projectHierarchy')}>
            <Link to="/projects">{t('projects')}</Link><span aria-hidden="true">/</span><strong>{project.name}</strong>{project.routes.wiki && <><span aria-hidden="true">/</span><Link to={project.routes.wiki}>{t('wiki')}</Link></>}
          </nav>

          <section className={styles.hero} aria-labelledby="project-title" style={projectCardPalette(project)}>
            <div className={styles.heroCopy}>
              <Link className={styles.backLink} to="/projects"><span aria-hidden="true">←</span> {t('backProjects')}</Link>
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
            <div><p className={styles.eyebrow}>{t('moreFromDorios')}</p><h2 id="related-projects-title">{t('relatedProjects')}</h2></div>
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
