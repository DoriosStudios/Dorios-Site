import ascendantTechnology from './ascendant-technology';
import generatedProjects from './generatedProjects';
import heavyMachinery from './heavy-machinery';
import utilitycraft from './utilitycraft';

const projects = {
  [ascendantTechnology.id]: ascendantTechnology,
  [heavyMachinery.id]: heavyMachinery,
  [utilitycraft.id]: utilitycraft,
  ...generatedProjects,
};

export function getWikiProject(projectId) {
  const project = projects[projectId];
  if (!project) throw new Error(`Unknown wiki project: ${projectId}`);
  return project;
}

export {projects as wikiProjects};
