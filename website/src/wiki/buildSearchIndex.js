import projectCatalog from '../data/projectCatalog.json';
import {localizeProjects} from '../i18n/projects';
import {data as atelier, records as atelierBlocks, blockPath} from '../components/AtelierWiki/model.mjs';
import {atelierCopy, localizedLabel} from '../components/AtelierWiki/copy';
import {containerSearchProject} from '../components/BetterContainersWiki/model.mjs';
import {wikiProjects, getWikiProject} from './projects';
import {wikiGuideEntries} from './guideSearch.mjs';
import {createWikiSearchIndex} from './search.mjs';

export function buildGlobalWikiSearchIndex(locale) {
  const label = value => localizedLabel(value, locale);
  const copy = atelierCopy(locale);
  const atelierProject = {
    id: 'atelier', name: "Dorios' Atelier", wikiSections: [{id: 'blocks', icon: 'cube'}],
    blocks: atelierBlocks.map(record => {
      const material = atelier.materials[record.material];
      const color = material.colors.find(entry => entry.id === record.color);
      const name = record.index === material.base
        ? label(material.baseLabel)
        : [label(material.groups[record.group].label), record.color !== 'none' && label(color?.label),
          record.shape !== 'block' && copy(record.shape)].filter(Boolean).join(' · ');
      return {name, id: record.id, href: blockPath(record)};
    }),
  };
  const containers = containerSearchProject(locale);
  const listedProjects = projectCatalog.projects.filter(project => project.visibility !== 'unlisted');
  const projects = localizeProjects(listedProjects, locale).flatMap(project => {
    const {id, name} = project;
    if (id === 'atelier') return [atelierProject];
    if (id === containers.id) return [containers];
    const searchEntries = wikiGuideEntries(project, locale);
    if (wikiProjects[id]) return [{...getWikiProject(id, locale), searchEntries}];
    return searchEntries.length ? [{id, name, wikiSections: [], searchEntries}] : [];
  }).sort((a, b) => a.name.localeCompare(b.name, locale));

  return createWikiSearchIndex(projects);
}
