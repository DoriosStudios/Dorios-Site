import technicalEntityProjects from '../data/technicalEntityProjects.json' with {type: 'json'};

// A client texture atlas is source data, never an entity portrait.
export function entityVisual(entry, {compact = false} = {}) {
  const legacy = entry.imageKind !== 'texture' && !/(?:^|\/)textures\//i.test(entry.image ?? '') ? entry.image : undefined;
  return compact ? entry.face || entry.portrait || entry.render || legacy
    : entry.render || legacy || entry.portrait || entry.face;
}

export function hasEntityVisuals(manifest) {
  return (manifest.content?.entities ?? []).some(entry => Boolean(entityVisual(entry)));
}

export function hasPublicEntitySection(projectId, manifest) {
  return !technicalEntityProjects.includes(projectId) && hasEntityVisuals(manifest);
}
