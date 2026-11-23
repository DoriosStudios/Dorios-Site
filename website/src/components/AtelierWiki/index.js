import React, {useEffect,useId,useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import NotFound from '@theme/NotFound';
import DoriosMarketingShell from '../DoriosMarketingShell';
import SocialMetadata from '../SocialMetadata';
import {getProject} from '../../data/projects';
import {useSiteI18n} from '../../i18n/site';
import {atelierCopy,localizedLabel} from './copy';
import {data,records,byId,incoming,outgoing,lineage,blockPath,materialPath} from './model.mjs';
import styles from './styles.module.css';

const root='/wiki/atelier';
const order=['block','stairs','slab','vertical_slab','wall','carpet'];
const stationTextures={'Bancada':['crafting_table_top'],'Cortador de pedras':['stonecutter2_top'],Forno:['furnace_top'],'Forno / Alto-forno':['furnace_top','blast_furnace_top']};
function Image({src,size=48,label=''}) {
  const url=useBaseUrl(src??'/img/projects/atelier/pack_icon.png');
  return src ? <img className="ag-sprite" src={url} alt={label} width={128} height={128} loading="lazy" decoding="async" style={{'--s':`${size}px`}}/> : null;
}
function Station({method,t}) {
  const [open,setOpen]=useState(false),id=useId();
  return <span className="ag-station-tip"><button className="ag-station" type="button" aria-label={t(method)} aria-describedby={id} onClick={()=>setOpen(!open)} onBlur={()=>setOpen(false)}>
    {stationTextures[method]?.map(name=><Image key={name} src={`/img/wiki/atelier/textures/${name}.png`} size={24}/> )??<span aria-hidden="true">▦</span>}
  </button><span id={id} role="tooltip" className={`ag-tooltip${open?' ag-tooltip-open':''}`}>{t(method)}</span></span>;
}
export default function AtelierWiki({routeData={}}) {
  const {locale,formatNumber}=useSiteI18n(),t=atelierCopy(locale),label=value=>localizedLabel(value,locale);
  const current=routeData.blockId?byId.get(routeData.blockId):null;
  const material=current?data.materials[current.material]:data.materials.find(item=>item.id===routeData.materialId);
  const [color,setColor]=useState(current?.color??material?.colors.find(c=>c.id==='none')?.id??material?.colors[0]?.id??'none');
  const [tab,setTab]=useState('obtain');
  useEffect(()=>{setColor(current?.color??material?.colors.find(c=>c.id==='none')?.id??material?.colors[0]?.id??'none');setTab('obtain');},[current?.id,material?.id]);
  if ((routeData.blockId&&!current)||(routeData.materialId&&!material)) return <NotFound/>;
  const groupOf=record=>data.materials[record.material].groups[record.group];
  const name=record=>{
    const m=data.materials[record.material];
    if (record.index===m.base) return label(m.baseLabel);
    const c=m.colors.find(value=>value.id===record.color);
    return [label(groupOf(record).label),record.color!=='none'&&label(c?.label),record.shape!=='block'&&t(record.shape)].filter(Boolean).join(' · ');
  };
  const nodeName=id=>byId.has(data.ids[id])?name(byId.get(data.ids[id])):label(data.refNames[id])||data.ids[id]?.replace(/^.*:/,'').replaceAll('_',' ');
  const nodeImage=id=>byId.get(data.ids[id])?.image??data.refSprites[id];
  const forms=(m,g,c=color)=>g.records.map(index=>records[index]).filter(record=>record.color===c).sort((a,b)=>order.indexOf(a.shape)-order.indexOf(b.shape));
  const Form=({record,size=42})=><Link className="ag-form" to={blockPath(record)} aria-label={name(record)} aria-current={current?.id===record.id?'page':undefined}><Image src={record.image} size={size}/><span>{t(record.shape)}</span></Link>;
  const Endpoint=({id,count})=>{
    const record=byId.get(data.ids[id]);
    const content=<><Image src={nodeImage(id)} size={32}/><span className="ag-item-label">{count} × {nodeName(id)}</span></>;
    return record?<Link className="ag-item" to={blockPath(record)} title={`${nodeName(id)} · ${record.origin}`}>{content}</Link>:<span className="ag-item">{content}</span>;
  };
  const Recipe=({recipe})=><article className="ag-recipe" title={recipe.identifier??recipe.source}>
    <div className="ag-recipe-items">{recipe.inputs.map(([id,count])=><Endpoint key={id} id={id} count={count}/>)}</div>
    <div className="ag-method"><Station method={recipe.method} t={t}/><strong aria-hidden="true">→</strong></div>
    <div className="ag-recipe-items"><Endpoint id={recipe.out} count={recipe.count}/></div>
  </article>;
  const RecipeList=({list})=>list.length?<><div className="ag-recipes">{list.slice(0,8).map(recipe=><Recipe key={recipe.index} recipe={recipe}/>)}</div>{list.length>8&&<details><summary>{t('more')} ({list.length-8})</summary><div className="ag-recipes">{list.slice(8).map(recipe=><Recipe key={recipe.index} recipe={recipe}/>)}</div></details>}</>:<p className="ag-empty">{t('empty')}</p>;
  const colorPicker=material?.colors.length>1?<label className="ag-color-select">{t('color')}<select aria-label={t('color')} value={color} onChange={event=>setColor(event.target.value)}>{material.colors.map(c=><option key={c.id} value={c.id}>{label(c.label)}</option>)}</select></label>:null;
  let content,title=t('materials');
  if (!material) content=<>
    <div className="ag-intro"><span className="ag-overline">{t('library')}</span><h1>{title}</h1><p>{t('lead')}</p><div className="ag-overview">{formatNumber(data.materials.length)} {t('materials').toLowerCase()} · {formatNumber(data.sourceCount)} {t('blocks')} · {t('minecraft')}</div></div>
    {['Pedras e minerais','Madeiras','Cores e transparências','Natureza'].map(category=><section className="ag-section" key={category}><div className="ag-section-title"><h2>{t(category)}</h2></div><div className="ag-material-grid">{data.materials.filter(m=>m.category===category).map(m=><Link className="ag-material" key={m.id} to={materialPath(m)}><div className="ag-material-media"><Image src={records[m.base].image} size={75}/><span className="ag-texture-stack"><Image src={m.texture} size={34} label={`${t('original')}: ${label(m.label)}`}/></span></div><span className="ag-material-name"><strong>{label(m.label)}</strong><small>{m.addonCount} {t('blocks')}</small></span></Link>)}</div></section>)}
  </>;
  else if (!current) {
    title=label(material.label);
    const base=records[material.base];
    content=<><section className="ag-raw-hero"><Image src={base.image} size={142}/><div><span className="ag-overline">{t('material')}</span><h1>{title}</h1><p>{label(material.baseLabel)}</p><div className="ag-tags"><span className="ag-tag">Minecraft</span><span className="ag-tag">{material.addonCount} {t('blocks')}</span></div><Link className="ag-code" to={blockPath(base)}>{base.id}</Link></div><div className="ag-texture-stack"><Image src={material.texture} size={76} label={t('original')}/><small>{t('original')}</small></div></section>
      <div className="ag-controls"><div><h2>{t('families')}</h2><p>{t('choose')}</p></div>{colorPicker}</div><div className="ag-family-grid">{material.groups.map(group=>({group,entries:forms(material,group)})).filter(({entries})=>entries.length).map(({group,entries})=><article className="ag-family" key={group.id}><div className="ag-family-heading"><Image src={(entries.find(record=>record.shape==='block')??entries[0]).image} size={55}/><div><h3>{label(group.label)}</h3><small>{entries.length} · {t('forms')}</small></div></div><div className="ag-forms">{entries.map(record=><Form key={record.id} record={record}/>)}</div></article>)}</div></>;
  } else {
    title=name(current);
    const ins=incoming.get(current.idIndex)??[],outs=(outgoing.get(current.idIndex)??[]).filter(recipe=>recipe.out!==current.idIndex);
    const paint=data.paint[current.index]??[],cycle=data.cycles.find(c=>c.includes(current.idIndex));
    const route=lineage(current),all=[...ins,...outs],g=groupOf(current),p=current.props;
    const returns=outs.some(recipe=>{const target=byId.get(data.ids[recipe.out]);return target&&current.shape!=='block'&&target.shape==='block'&&target.material===current.material&&target.group===current.group&&target.color===current.color;});
    const capabilities=[['cut',all.some(r=>r.method==='Cortador de pedras'),outs.some(r=>r.method==='Cortador de pedras')?'transform':'obtain'],['return',returns,'transform'],['burn',all.some(r=>r.method.startsWith('Forno')),outs.some(r=>r.method.startsWith('Forno'))?'transform':'obtain'],['paint',paint.length>0,'paint'],['chisel',!!cycle,'tools']];
    const fields=[['material',label(material.label)],['finish',label(g.label)],['shape',t(current.shape)],['origin',current.origin],p.tool&&['tool',t(p.tool)],p.time!==undefined&&['time',`${p.time} ${t('seconds')}`],p.surface&&['surface',t(p.surface)],p.light&&['light',p.light]].filter(Boolean);
    content=<><div className="ag-intro"><span className="ag-overline">{label(material.label)} / {label(g.label)} / {t(current.shape)}</span><h1>{title}</h1></div>
      <section className="ag-lineage"><span className="ag-overline">{t(route.reference?'reference':'route')}</span><div className="ag-lineage-row">{route.nodes.map((id,i)=>{const node=byId.get(data.ids[id]),edge=route.edges[i];return <React.Fragment key={id}><Link className="ag-ancestor" data-current={node.id===current.id||undefined} to={blockPath(node)}><Image src={node.image} size={39}/><span className="ag-ancestor-copy">{name(node)}<small>{node.origin}</small></span></Link>{edge&&<span className="ag-edge"><Station method={edge.method} t={t}/><b aria-hidden="true">→</b><span>{edge.inputs[0][1]} → {edge.count}</span></span>}</React.Fragment>;})}</div></section>
      <section className="ag-block-grid"><div className="ag-block-preview"><Image src={current.image} size={180} label={title}/><small>{t(current.shape)} · {current.origin}</small></div><div className="ag-block-info"><h2>{t('facts')}</h2><code className="ag-code">{current.id}</code><div className="ag-properties">{fields.map(([key,value])=><div className="ag-property" key={key}><small>{t(key)}</small><span>{value}</span></div>)}</div><div className="ag-capabilities">{capabilities.map(([key,enabled,destination])=><button className="ag-capability" key={key} type="button" disabled={!enabled} onClick={()=>setTab(destination)}>{enabled?'✓':'—'} {t(key)}</button>)}</div></div></section>
      <section className="ag-related"><h3>{t('forms')} · {label(g.label)}</h3><div className="ag-forms">{forms(material,g,current.color).map(record=><Form key={record.id} record={record} size={55}/>)}</div></section>
      <nav className="ag-tabs" role="tablist" aria-label={t('transform')}>{[['obtain',ins.length],['transform',outs.length],['paint',paint.length],['tools',cycle?1:0]].map(([key,count])=><button type="button" key={key} role="tab" id={`atelier-tab-${key}`} aria-selected={tab===key} aria-controls="atelier-tab-panel" onClick={()=>setTab(key)}>{t(key)}{count?` · ${count}`:''}</button>)}</nav>
      <div className="ag-tab-content" id="atelier-tab-panel" role="tabpanel" aria-labelledby={`atelier-tab-${tab}`}>
        {tab==='obtain'&&<RecipeList list={ins}/>} {tab==='transform'&&<RecipeList list={outs}/>}
        {tab==='paint'&&(paint.length?<><p className="ag-instructions">{t('paintGuide')}</p><div className="ag-paint-grid">{paint.map(([c,index])=>{const record=records[index];return <Link key={c} className="ag-paint-target" to={blockPath(record)}><Image src={record.image} size={58}/><span>{label(data.materials[record.material].colors.find(item=>item.id===c)?.label)||c}</span></Link>;})}</div></>:<p className="ag-empty">{t('none')}</p>)}
        {tab==='tools'&&(cycle?<><p className="ag-instructions">{t('chiselGuide')}</p><div className="ag-paint-grid">{cycle.filter(id=>byId.has(data.ids[id])).map(id=>{const record=byId.get(data.ids[id]);return <Link className="ag-paint-target" key={id} to={blockPath(record)}><Image src={record.image} size={58}/><span>{label(groupOf(record).label)}</span></Link>;})}</div></>:<p className="ag-empty">{t('none')}</p>)}
      </div></>;
  }
  const project=getProject('atelier'),path=current?blockPath(current):material?materialPath(material):root;
  return <Layout title={`${title} · Atelier Wiki`} description={t('lead')} noFooter><SocialMetadata title={title} parent="Dorios' Atelier" type="Wiki" path={path} description={t('lead')} image={current?.image??project.media.icon}/><DoriosMarketingShell activePage="wiki" project={project}><main className={styles.wiki}><div className="ag-body"><nav className="ag-breadcrumbs" aria-label={t('materials')}><Link to="/wiki">Wiki</Link><span>/</span><Link to={root}>Atelier</Link>{material&&<><span>/</span><Link to={materialPath(material)}>{label(material.label)}</Link></>}{current&&<><span>/</span><span>{name(current)}</span></>}</nav>{content}<footer className="ag-footer">Dorios' Atelier · {t('footer')}</footer></div></main></DoriosMarketingShell></Layout>;
}
