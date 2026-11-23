import data from '../../data/atelierWiki.json' with {type: 'json'};
export {data};
export const records = data.records.map((r,index) => ({index,idIndex:r[0],id:data.ids[r[0]],material:r[1],group:r[2],shape:r[3],color:r[4],image:r[5],props:r[6],origin:r[7]}));
export const byId = new Map(records.map(record => [record.id, record]));
export const recipes = data.recipes.map((r,index) => ({index,inputs:r[0],out:r[1],count:r[2],method:r[3],time:r[4],source:r[5],identifier:r[6]}));
export const incoming = new Map(), outgoing = new Map();
for (const recipe of recipes) {
  if (!incoming.has(recipe.out)) incoming.set(recipe.out, []);
  incoming.get(recipe.out).push(recipe);
  for (const [id] of recipe.inputs) {if (!outgoing.has(id)) outgoing.set(id, []);outgoing.get(id).push(recipe);}
}
export const blockPath = record => `/wiki/atelier/blocks/${record.id.replace(':','/')}`;
export const materialPath = material => `/wiki/atelier/materials/${material.id}`;
export function lineage(record) {
  const start = records[data.materials[record.material].base].idIndex;
  const queue = [{nodes:[start], edges:[]}], seen = new Set([start]);
  if (start === record.idIndex) return queue[0];
  while (queue.length) {
    const path = queue.shift();
    if (path.edges.length >= 5) continue;
    for (const edge of outgoing.get(path.nodes.at(-1)) ?? []) {
      if (edge.inputs.length !== 1 || seen.has(edge.out) || byId.get(data.ids[edge.out])?.material !== record.material) continue;
      const next = {nodes:[...path.nodes,edge.out],edges:[...path.edges,edge]};
      if (edge.out === record.idIndex) return next;
      seen.add(edge.out);queue.push(next);
    }
  }
  const direct = incoming.get(record.idIndex)?.find(recipe => recipe.inputs.length === 1 && byId.has(data.ids[recipe.inputs[0][0]]) && recipe.inputs[0][0] !== record.idIndex);
  return direct ? {nodes:[direct.inputs[0][0],record.idIndex],edges:[direct]} : {nodes:[start],edges:[],reference:true};
}
