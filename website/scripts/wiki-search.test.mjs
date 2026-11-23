import test from 'node:test';import assert from 'node:assert/strict';import {searchWikiProjects} from '../src/wiki/search.mjs';
const project={id:'demo',name:'Demo',basePath:'/wiki/demo',wikiSections:[{id:'machines',icon:'tool'}],machines:[{id:'catalyst_weaver',name:'Catalyst Weaver'}],items:[{id:'demo:catalyst',slug:'catalyst-item',name:'Catalyst'}],mechanics:[{name:'Catalyst Basics'}]};
test('shared wiki search preserves canonical machine, item and mechanic routes',()=>{
 const results=searchWikiProjects([project],' catalyst ');assert.deepEqual(results.map(r=>r.href),['/wiki/demo/machines/catalyst_weaver','/wiki/demo/items/catalyst-item','/wiki/demo/mechanics/catalyst-basics']);
 assert.equal(results[0].icon,'tool');assert.equal(searchWikiProjects([project],'c').length,0);assert.equal(searchWikiProjects([project],'catalyst',1).length,1);assert.equal(searchWikiProjects([project],'demo:catalyst')[0].type,'items');
});
