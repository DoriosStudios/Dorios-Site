import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';
import dependency0 from '../utilitycraft';
import documentationProfiles from './documentationProfiles.generated.json';

const panelDescriptions = {
  'utilitycraft:wireless_panel_off': 'Use the panel on an online Storage Center to pair it. The linked panel opens the network inventory while its Storage Center is online.',
  'utilitycraft:wireless_panel_on': 'Paired Wireless Panel. It opens the network inventory while the linked Storage Center is online. Use it on the same center to unlink it.',
  'utilitycraft:wireless_crafting_panel_off': 'Use the crafting panel on an online Storage Center to pair it with the network and access its inventory and crafting grid.',
  'utilitycraft:wireless_crafting_panel_on': 'Paired Wireless Crafting Panel. It opens the network inventory and crafting grid while the linked Storage Center is online.',
  'utilitycraft:storage_filler': 'Internal interface item that fills unused storage menu slots.',
};

const itemProfiles = Object.fromEntries(Object.entries(documentationProfiles.items).map(([id, profile]) =>
  [id, panelDescriptions[id] ? {...profile, description: panelDescriptions[id]} : profile]));

const project = createGeneratedProject({
  manifest,
  id: "digital-storage",
  name: "Digital Storage",
  repository: "https://github.com/DoriosStudios/UtilityCraft-Digital-Storage",
  dependencyProjects: [dependency0],
  itemProfiles,
  machineFilter: (block) => block.componentKeys?.includes('tag:dorios:machine'),
  overview: {
    eyebrow: 'Storage networks',
    description: 'Build a network around a Storage Center, install storage cells, and access its inventory from terminals or linked wireless panels.',
    stepsTitle: 'Set up a storage network',
    steps: [
      {title: 'Install storage cells', copy: 'Use Storage Cells to add capacity to the network. The Storage Cell page lists each tier and its recipe.'},
      {title: 'Access the network', copy: 'Open the network inventory at a Storage Terminal or pair a wireless panel with an online Storage Center.'},
      {title: 'Automate item transfer', copy: 'Use importers and exporters to move items between the network and other inventories.'},
    ],
  },
});

export default project;
