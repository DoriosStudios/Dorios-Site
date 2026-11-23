export function searchWikiProjects(projects, query, limit = 12) {
  const needle = query.trim().toLocaleLowerCase();
  if (needle.length < 2) return [];
  const results = [];
  for (const project of projects) for (const type of ['machines','items','blocks','entities','generators','mechanics']) {
    for (const entry of project[type] ?? []) {
      if (!`${entry.name} ${entry.identifier ?? entry.id ?? ''} ${entry.category ?? ''}`.toLocaleLowerCase().includes(needle)) continue;
      const slug = type === 'machines' ? entry.id : type === 'mechanics'
        ? entry.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') : entry.slug ?? entry.id;
      results.push({name:entry.name,type,project:project.name,projectId:project.id,href:`${project.basePath}/${type}/${slug}`,
        icon:project.wikiSections.find(section=>section.id===type)?.icon ?? 'book'});
      if (results.length >= limit) return results;
    }
  }
  return results;
}
