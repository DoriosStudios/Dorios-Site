import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {IconArrowRight, IconBox} from '@tabler/icons-react';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {useSiteI18n} from '../../i18n/site';
import {getProject} from '../../data/projects';
import {catalogPath, containers, containerName, containerPath, families, familyName, ingredient} from './model.mjs';
import styles from './styles.module.css';

const project = getProject('better-containers');
const copy = {
  en: {
    lead: 'Compare storage capacity and crafting recipes for drawers, chests, barrels, and shulker boxes.',
    families: 'Container families', compare: 'Compare variants', recipe: 'Crafting table recipe',
    stacks: n => n + ' stacks per item type', types: (n, formatNumber) => formatNumber(n) + (n === 1 ? ' item type' : ' item types'),
    slots: n => n + ' slots', double: n => n + ' slots when paired',
  },
  'pt-BR': {
    lead: 'Compare a capacidade e as receitas de gavetas, baús, barris e caixas de shulker.',
    families: 'Famílias de recipientes', compare: 'Comparar variantes', recipe: 'Receita na bancada',
    stacks: n => n + ' pilhas por tipo', types: (n, formatNumber) => formatNumber(n) + (n === 1 ? ' tipo de item' : ' tipos de item'),
    slots: n => n + ' espaços', double: n => n + ' espaços no baú duplo',
  },
  'es-MX': {
    lead: 'Compara la capacidad y las recetas de cajones, cofres, barriles y cajas de shulker.',
    families: 'Familias de contenedores', compare: 'Comparar variantes', recipe: 'Receta en la mesa de trabajo',
    stacks: n => n + ' pilas por tipo', types: (n, formatNumber) => formatNumber(n) + (n === 1 ? ' tipo de objeto' : ' tipos de objeto'),
    slots: n => n + ' espacios', double: n => n + ' espacios en el cofre doble',
  },
};

function CatalogImage({image, size}) {
  const src = useBaseUrl(image);
  return <img src={src} alt="" width={size} height={size}/>;
}

function Recipe({container, locale, labels, formatNumber}) {
  const counts = new Map();
  for (const slot of container.recipe.slots) if (slot) counts.set(slot, (counts.get(slot) ?? 0) + 1);
  return (
    <section className={styles.recipe} aria-labelledby="container-recipe">
      <h3 id="container-recipe">{labels.recipe}</h3>
      <div className={styles.recipeBody}>
        <div className={styles.recipeGrid} style={{'--recipe-columns': container.recipe.columns}} aria-hidden="true">
          {container.recipe.slots.map((id, index) => {
            const item = id && ingredient(id, locale);
            return <span key={index} className={styles.recipeSlot} title={item?.name}>
              {item && (item.image ? <CatalogImage image={item.image} size={30}/> : <IconBox size={23}/>)}
            </span>;
          })}
        </div>
        <IconArrowRight size={20} aria-hidden="true"/>
        <span className={styles.recipeResult}>
          <CatalogImage image={container.image} size={54}/>
          <strong>{formatNumber(container.recipe.count)} × {containerName(container, locale)}</strong>
        </span>
      </div>
      <ul className={styles.ingredients}>
        {[...counts].map(([id, count]) => {
          const {name, href} = ingredient(id, locale);
          return <li key={id}>{formatNumber(count)} × {href ? <Link to={href}>{name}</Link> : name}</li>;
        })}
      </ul>
    </section>
  );
}

export default function BetterContainersWiki({routeData = {}}) {
  const {locale, t, formatNumber} = useSiteI18n();
  const labels = copy[locale] ?? copy.en;
  const family = routeData.family ?? families[0];
  const variants = containers.filter(container => container.family === family);
  const container = variants.find(entry => entry.slug === routeData.variant) ?? variants[0];
  const name = containerName(container, locale);
  const title = routeData.variant ? name : routeData.family ? familyName(family, locale) : project.name;
  const pagePath = routeData.variant ? containerPath(container) : routeData.family ? catalogPath + '/' + family : catalogPath;
  const capacity = ({stacks, slots}) => stacks ? labels.stacks(formatNumber(stacks)) : labels.slots(formatNumber(slots));
  const secondary = ({types, doubleSlots}) => types
    ? labels.types(types, formatNumber) : doubleSlots ? labels.double(formatNumber(doubleSlots)) : null;
  return (
    <Layout title={routeData.family ? title + ' · Better Containers Wiki' : 'Better Containers Wiki'} description={labels.lead} noFooter>
      <SocialMetadata title={title} parent="Better Containers" type="Wiki" description={labels.lead}
        path={pagePath} image={routeData.family ? container.image : project.media.icon}/>
      <DoriosMarketingShell activePage="wiki" project={project}>
        <main className={styles.page}>
          <nav className={styles.breadcrumbs} aria-label={t('wiki')}>
            <Link to="/wiki">{t('wiki')}</Link><span aria-hidden="true">/</span>
            <Link to={catalogPath} aria-current={!routeData.family ? 'page' : undefined}>{project.name}</Link>
            {routeData.family && <><span aria-hidden="true">/</span><span>{familyName(family, locale)}</span></>}
          </nav>
          <h1>{project.name}</h1>
          <p className={styles.lead}>{labels.lead}</p>
          <nav aria-label={labels.families} className={styles.families}>
            {families.map(group => {
              const image = containers.find(value => value.family === group && value.tier === 'iron')?.image;
              return <Link key={group} to={catalogPath + '/' + group} aria-current={group === family ? 'location' : undefined}>
                <CatalogImage image={image} size={42}/>
                <strong>{familyName(group, locale)}</strong>
              </Link>;
            })}
          </nav>
          <div className={styles.columns}>
            <article className={styles.panel + ' ' + styles.details} aria-labelledby="container-title">
              <header className={styles.hero}>
                <CatalogImage image={container.image} size={120}/>
                <div>
                  <h2 id="container-title">{name}</h2>
                  <strong>{capacity(container.capacity)}</strong>
                  {secondary(container.capacity) && <p>{secondary(container.capacity)}</p>}
                </div>
              </header>
              <Recipe container={container} locale={locale} labels={labels} formatNumber={formatNumber}/>
            </article>
            <section className={styles.panel + ' ' + styles.compare} aria-labelledby="container-compare">
              <h2 id="container-compare">{familyName(family, locale)}</h2>
              <ul className={styles.tiers} aria-label={labels.compare}>
                {variants.map(variant => <li key={variant.id}>
                  <Link to={containerPath(variant)} aria-current={variant.id === container.id ? 'true' : undefined}>
                    <CatalogImage image={variant.image} size={38}/>
                    <span><strong>{containerName(variant, locale)}</strong><small>{capacity(variant.capacity)}</small></span>
                  </Link>
                </li>)}
              </ul>
            </section>
          </div>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
