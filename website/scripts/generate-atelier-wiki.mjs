import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {readJson, filesUnder} from './bedrock-pack.mjs';
export async function generateAtelierWiki({source, website=path.resolve(import.meta.dirname,'..')}={}) {
  source??=process.env.ATELIER_PROJECT_PATH??path.resolve(website,'../../..',"Dorios' Atelier");
  const vanilla=await readJson(path.join(website,'src/data/atelierVanilla.json'));
  const catalog=await readJson(path.join(website,'static/atelier-builder/catalog.json'));

  const assets=await readJson(path.join(website,'src/data/vanillaAssetIndex.json'));
  const nativeColors={white:'Branco',orange:'Laranja',magenta:'Magenta',light_blue:'Azul-claro',yellow:'Amarelo',lime:'Verde-limão',pink:'Rosa',gray:'Cinza',light_gray:'Cinza-claro',cyan:'Ciano',purple:'Roxo',blue:'Azul',brown:'Marrom',green:'Verde',red:'Vermelho',black:'Preto'};
  const nativeHex={white:'#e7e7e7',orange:'#e78b25',magenta:'#b951c3',light_blue:'#61add0',yellow:'#edcd3d',lime:'#8ebe28',pink:'#df9bb8',gray:'#555b5e',light_gray:'#a6a7a1',cyan:'#25899b',purple:'#7e3bb0',blue:'#364d9a',brown:'#785232',green:'#547329',red:'#a9352f',black:'#25282c'};
  const ids=[], idIndex=new Map(), records=[], byId=new Map();
  const idFor=id=>{if(!idIndex.has(id)){idIndex.set(id,ids.length);ids.push(id);}return idIndex.get(id);};
  const exists=async file=>{try{await fs.access(file);return true;}catch{return false;}};
  const localizedNames={...vanilla.names};
  for(const [locale,file] of [['en','en_US'],['pt-BR','pt_BR'],['es-MX','es_MX']]){
    try {for(const line of (await fs.readFile(path.join(source,'RP/texts',file+'.lang'),'utf8')).split(/\r?\n/)){
      const i=line.indexOf('=');if(i<0)continue;const id=line.slice(0,i).replace(/^(tile|item)\./,'').replace(/\.name$/,'');
      localizedNames[id]??={};localizedNames[id][locale]=line.slice(i+1).replace(/§./g,'');
    }}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  const labelFor=(id,fallback)=>localizedNames[id]??fallback;
  async function sprite(file) {
    const relative=path.relative(path.join(website,'static'),file).replaceAll(path.sep,'/');
    if(relative.startsWith('../'))throw Error('Image outside static folder: '+file);
    return '/'+relative;
  }
  function blockProps(block){
    const c=block.components??{},keys=Object.keys(c),result={};
    const mining=c['minecraft:destructible_by_mining'];if(typeof mining?.seconds_to_destroy==='number')result.time=mining.seconds_to_destroy;
    if(keys.some(k=>k.includes('is_pickaxe_item_destructible')))result.tool='Picareta';
    else if(keys.some(k=>k.includes('is_axe_item_destructible')))result.tool='Machado';
    else if(keys.some(k=>k.includes('is_shovel_item_destructible')))result.tool='Pá';
    if(typeof c['minecraft:light_emission']==='number'&&c['minecraft:light_emission'])result.light=c['minecraft:light_emission'];
    const methods=Object.values(c['minecraft:material_instances']??{}).map(m=>m.render_method);
    if(methods.some(m=>m==='blend'))result.surface='Translúcido';
    else if(methods.some(m=>m?.startsWith('alpha_test')))result.surface='Recorte transparente';
    else if(methods.includes('opaque'))result.surface='Opaco';
    if(c['minecraft:flammable'])result.flammable=true;
    if(block.description?.traits?.['minecraft:placement_direction'])result.direction=true;
    return result;
  }
  async function addRecord(id,m,g,shape,color,file,block,origin='Atelier'){
    if(byId.has(id))return byId.get(id);
    const p=await sprite(file), index=records.length;
    const features=block?blockProps(block):{};
    records.push([idFor(id),m,g,shape,color,p,features,origin]);byId.set(id,index);return index;
  }
  const materials=catalog.families.map((f,i)=>({id:f.id,label:f.labels,category:f.id.endsWith('_wood')?'Madeiras':['wool','concrete','glass'].includes(f.id)?'Cores e transparências':f.id==='grass'?'Natureza':'Pedras e minerais',
    groups:f.variants.map(v=>({id:v.id,label:v.labels,records:[]})),colors:f.colors.map(c=>({id:c.id,label:c.labels,hex:c.hex??nativeHex[c.id]})),addonCount:catalog.records.filter(r=>r.kind==='block'&&r.family===f.id).length}));
  for(const record of catalog.records.filter(r=>r.kind==='block')){
    const m=materials.findIndex(m=>m.id===record.family),g=materials[m].groups.findIndex(g=>g.id===record.variant);
    const block=(await readJson(path.join(source,record.file)))['minecraft:block'];
    const i=await addRecord(record.id,m,g,record.shape,record.color,path.join(website,'static/atelier-builder',record.preview),block);
    materials[m].groups[g].records.push(i);
  }
  function manualAsset(id){const name=id.replace(/^minecraft:/,'');const asset=assets[name]??(name==='grass_block'?assets.grass:undefined);return asset?path.join(website,'static',asset.replace(/^\//,'')):undefined;}
  async function addVanilla(id,m,g,color='none'){
    const file=manualAsset(id);if(!file||!await exists(file))return null;
    const i=await addRecord(id,m,g,'block',color,file,undefined,'Minecraft');
    if(!materials[m].groups[g].records.includes(i))materials[m].groups[g].records.push(i);
    return i;
  }
  for(const [mi,m] of materials.entries()){
    const seed=vanilla.bases[m.id];if(!seed)throw Error('Missing vanilla dependency snapshot for material '+m.id);
    m.baseId=seed.id;
    let gi=m.groups.findIndex(g=>g.id===m.id||g.id==='plain'&&['wool','concrete'].includes(m.id));
    if(gi<0){gi=m.groups.length;m.groups.push({id:'natural',label:m.label,records:[]});}
    m.base=await addVanilla(m.baseId,mi,gi,['concrete','wool'].includes(m.id)?'white':'none');
    if(m.base===null)throw Error(`Missing raw material render: ${m.id} (${m.baseId})`);
    m.baseLabel={...m.label,...seed.labels};
    for(const [gidx,g] of m.groups.entries()){
      if(!g.records.some(i=>records[i][3]==='block')&&g.id!=='natural')await addVanilla('minecraft:'+g.id,mi,gidx);
    }
    if(['wool','concrete'].includes(m.id)){
      const plain=m.groups.findIndex(g=>g.id==='plain');
      for(const [color,label] of Object.entries(nativeColors)){
        const i=await addVanilla(`minecraft:${color}_${m.id}`,mi,plain,color);
        if(i!==null&&!m.colors.some(c=>c.id===color))m.colors.push({id:color,label:{en:color.replaceAll('_',' '),'pt-BR':label,'es-MX':color.replaceAll('_',' ')},hex:nativeHex[color]});
      }
    }
    m.texture=seed.texture;

  }

  const recipes=[];
  function ingredientId(input){return typeof input==='string'?input:input?.item??(input?.tag?'#'+input.tag:undefined);}
  const recipeDocuments=[...await Promise.all((await filesUnder(path.join(source,'BP/recipes'))).map(async file=>({source:path.relative(source,file).replaceAll(path.sep,'/'),data:await readJson(file)}))),...vanilla.recipes];
  for(const document of recipeDocuments){
    {
      const data=document.data;
      const key=Object.keys(data).find(k=>k.startsWith('minecraft:recipe_'));if(!key)continue;
      const value=data[key], results=Array.isArray(value.result)?value.result:[value.result??value.output];
      const inputs=new Map();
      const add=(input,count=1)=>{const id=ingredientId(input);if(id)inputs.set(id,(inputs.get(id)??0)+count*(typeof input==='object'?(input.count??1):1));};
      if(value.pattern){for(const row of value.pattern)for(const character of row)if(value.key?.[character])add(value.key[character]);}
      else if(value.ingredients)for(const ingredient of value.ingredients)add(ingredient);
      else if(value.input)add(value.input);
      for(const out of results){const id=ingredientId(out);if(!byId.has(id))continue;
        const tags=value.tags??[];const method=tags.includes('stonecutter')?'Cortador de pedras':key==='minecraft:recipe_furnace'?(tags.includes('blast_furnace')?'Forno / Alto-forno':'Forno'):tags.includes('crafting_table')?'Bancada':'Inventário';
        recipes.push([[...inputs].map(([id,count])=>[idFor(id),count]),idFor(id),typeof out==='object'?(out.count??1):1,method,value.cookingtime??null,document.source,value.description?.identifier??null]);
      }
    }
  }
  // Present equivalent recipes once, while retaining every contributing definition.
  const uniqueByVisual=new Map();
  for(const recipe of recipes){
    const key=JSON.stringify(recipe.slice(0,5)),origin={source:recipe[5],identifier:recipe[6]};
    if(uniqueByVisual.has(key))uniqueByVisual.get(key)[7].push(origin);
    else uniqueByVisual.set(key,[...recipe,[origin]]);
  }
  const uniqueRecipes=[...uniqueByVisual.values()];
  const refSprites={},refNames={};
  for(const id of ids){const index=idFor(id);refNames[index]=labelFor(id,id.split(':').pop().replaceAll('_',' '));if(byId.has(id))continue;const file=manualAsset(id);if(file&&await exists(file))refSprites[index]=await sprite(file);}

  const variants=await import(pathToFileURL(path.join(source,'BP/scripts/variants.js')).href);
  const cycles=variants.MATERIAL_CYCLES.map(c=>c.map(id=>idFor(id)));
  const paintingData=await import(pathToFileURL(path.join(source,'BP/scripts/paintingData.js')).href);
  const paintSource=(await fs.readFile(path.join(source,'BP/scripts/paintingResolver.js'),'utf8')).replace(/^import .*;\r?\n/gm,'').replace('export function resolvePaintTarget','function resolvePaintTarget');
  const knownIds=new Set([...byId.keys(),...Object.keys(assets).map(id=>'minecraft:'+id)]);
  const context=vm.createContext({BlockTypes:{get:id=>knownIds.has(id)?{id}:undefined},PAINT_COLORS:paintingData.PAINT_COLORS});
  vm.runInContext(paintSource+'\nthis.paintTarget=resolvePaintTarget;',context);
  const paint={};
  for(const [recordIndex,r] of records.entries()){
    const destinations=[];
    for(const color of Object.keys(paintingData.PAINT_COLORS)){
      const target=context.paintTarget(ids[r[0]],color);
      if(target&&target!==ids[r[0]]&&byId.has(target))destinations.push([color,byId.get(target)]);
    }
    if(destinations.length)paint[recordIndex]=destinations;
  }
  const payload={schemaVersion:1,materials,records,ids,recipes:uniqueRecipes,refSprites,refNames,cycles,paint,nativeHex,
    sourceCount:catalog.records.filter(r=>r.kind==='block').length};
  await fs.writeFile(path.join(website,'src/data/atelierWiki.json'),JSON.stringify(payload)+'\n');
  console.log(`[atelier-wiki] ${materials.length} materials; ${payload.sourceCount} Atelier blocks; ${uniqueRecipes.length} recipes; original image URLs.`);
  return payload;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generateAtelierWiki();
