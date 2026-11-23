// This module (including wiki catalogs) is loaded only when global search opens.
import React, {useEffect,useMemo,useRef,useState} from 'react';
import Link from '@docusaurus/Link';
import {wikiProjects,getWikiProject} from '../../wiki/projects';
import {searchWikiProjects} from '../../wiki/search.mjs';
import {useSiteI18n} from '../../i18n/site';
import {data as atelier,records as atelierBlocks} from '../AtelierWiki/model.mjs';
import {atelierCopy,localizedLabel} from '../AtelierWiki/copy';
import styles from './styles.module.css';

export default function GlobalSearch({onNavigate}) {
  const {t,locale}=useSiteI18n();
  const [query,setQuery]=useState('');
  const input=useRef(null);
  useEffect(()=>{input.current?.focus();},[]);
  const projects=useMemo(()=>{
    const label=value=>localizedLabel(value,locale),copy=atelierCopy(locale);
    const atelierProject={id:'atelier',name:"Dorios' Atelier",basePath:'/wiki/atelier',wikiSections:[{id:'blocks',icon:'cube'}],blocks:atelierBlocks.map(record=>{
      const material=atelier.materials[record.material],color=material.colors.find(color=>color.id===record.color);
      const name=record.index===material.base?label(material.baseLabel):[label(material.groups[record.group].label),record.color!=='none'&&label(color?.label),record.shape!=='block'&&copy(record.shape)].filter(Boolean).join(' · ');
      return {name,id:record.id,identifier:record.id,slug:record.id.replace(':','/')};
    })};
    return [...Object.keys(wikiProjects).map(id=>getWikiProject(id,locale)),atelierProject];
  },[locale]);
  const results=useMemo(()=>searchWikiProjects(projects,query),[projects,query]);
  return <>
    <label className={styles.globalSearchInput}><span>{t('searchWiki')}</span><input ref={input} type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={t('searchWiki')}/></label>
    <div className={styles.globalSearchResults} aria-label={t('searchResults')}>
      {results.map(result=><Link key={`${result.projectId}:${result.href}`} to={result.href} onClick={onNavigate}><strong>{result.name}</strong><small>{t(result.type)} · {result.project}</small></Link>)}
      {query.trim().length>=2&&!results.length&&<p>{t('noSearchResults')}</p>}
    </div>
  </>;
}
