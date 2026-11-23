import React from 'react';
import Link from '@docusaurus/Link';
import {IconArrowRight,IconSettings} from '@tabler/icons-react';
import WikiIcon from '../WikiIcon';
import {WIKI_UPGRADE_ICONS,wikiStatValue,isWikiPropertyFlag,wikiHeartIcons} from '../../data/wikiUiIcons.mjs';
import styles from './playerGuide.module.css';
import {capitalizeGuideStep,meaningfulValue} from '../../wiki/playerGuide.mjs';

export function WikiStatValue({label,value,w,size=24,compact=false}) {
  const sourceValue=Array.isArray(value)?value.join(' · '):value;
  const formatted = wikiStatValue(label,sourceValue);
  const hearts=wikiHeartIcons(label,sourceValue);
  const description = `${w(label)}: ${w(sourceValue)}`;
  const display=hearts!==null&&formatted.value!==sourceValue
    ? `${String(formatted.value).startsWith('+')?'+':''}${w(Number(String(formatted.value).replace(',','.')))}`
    : w(formatted.value);
  return <span className={styles.inlineValue} title={description} data-stat-label={label}>
    <span className={styles.screenReaderOnly}>{description}</span>
    <span className={styles.inlineValueContent} aria-hidden="true">{compact&&!formatted.icon&&`${w(label)} `}{hearts===null&&formatted.icon==='full_heart'?w(sourceValue):display}
      {hearts!==null?<span className={styles.heartIcons}>{hearts.map((icon,index)=><WikiIcon key={index} name={icon} size={size} className={styles.heartGlyph}/>)}</span>
        :formatted.icon&&formatted.icon!=='full_heart'&&<WikiIcon name={formatted.icon} size={size}/>}
    </span>
  </span>;
}

export function WikiStatGrid({facts,w}) {
  if (!facts.length) return null;
  const values=facts.filter(([label,value])=>!isWikiPropertyFlag(label,value));
  const flags=facts.filter(([label,value])=>isWikiPropertyFlag(label,value));
  return <>
    {values.length>0&&<dl className={styles.playerStats}>{values.map(([label,value])=><div key={label}>
      <dt>{w(label)}</dt><dd><WikiStatValue label={label} value={value} w={w}/></dd>
    </div>)}</dl>}
    {flags.length>0&&<ul className={styles.propertyFlags}>{flags.map(([label])=><li key={label}>
      <WikiIcon label={label}/><span>{w(label)}</span>
    </li>)}</ul>}
  </>;
}

export function WikiTechnicalDetails({w,children}) {
  return <details className={styles.playerTechnical}><summary><WikiIcon name="stats" size={20} fallback={IconSettings}/>{w('Technical details')}</summary>
    <div className={styles.playerTechnicalBody}>{children}</div>
  </details>;
}

export function WikiProcessFlow({inputs,outputs,visual,w}) {
  if (!inputs.length || !outputs.length) return null;
  const parts = values => values.flatMap(value => String(w(value)).split(/\s+\+\s+/).map(capitalizeGuideStep));
  const Part = ({value}) => <p>{value}</p>;
  return <section className={styles.playerProcess} aria-label={w('Process schematic')}>
    <header><h2>{w('How it works')}</h2><small>{w('Process schematic — not a specific recipe')}</small></header>
    <div className={styles.playerFlow}>
      <div className={styles.playerFlowGroup}><h3>{w('Input')}</h3>{parts(inputs).map((value,index)=><Part key={index} value={value}/>)}</div>
      <IconArrowRight className={styles.playerFlowArrow} aria-hidden="true"/>
      <div className={styles.playerFlowMachine}>{visual}</div>
      <IconArrowRight className={styles.playerFlowArrow} aria-hidden="true"/>
      <div className={styles.playerFlowGroup}><h3>{w('Output')}</h3>{parts(outputs).map((value,index)=><Part key={index} value={value}/>)}</div>
    </div>
  </section>;
}

export function MachinePlayerGuide({guide,visual,w,technical}) {
  return <div className={styles.playerGuide}>
    <WikiStatGrid facts={guide.metrics} w={w}/>
    {guide.features.length>0&&<div className={styles.playerFeatures}>{guide.features.map(([label,value])=><section key={label}>
      <div><h3>{w(label)}</h3><p>{w(value)}</p></div>
    </section>)}</div>}
    <WikiProcessFlow inputs={guide.inputs} outputs={guide.outputs} visual={visual} w={w}/>
    {guide.steps.length>0&&<ol className={styles.playerSteps}>{guide.steps.map((step,index)=><li key={index}>{capitalizeGuideStep(w(step))}</li>)}</ol>}
    {guide.upgrades.length>0&&<section className={styles.playerUpgrades}><h2>{w('Supported upgrades')}</h2><ul>{guide.upgrades.map(type=><li key={type}><WikiIcon name={WIKI_UPGRADE_ICONS[type]} size={24}/>{w(type.replace(/\b\w/g,c=>c.toUpperCase()))}</li>)}</ul></section>}
    <WikiTechnicalDetails w={w}>{technical}</WikiTechnicalDetails>
  </div>;
}

export function WikiCatalogRows({entries,renderVisual,entryHref,benefitsFor,w}) {
  return <ul className={styles.playerCatalog}>{entries.map(entry=>{
    const benefits=benefitsFor(entry);
    const source=(entry.summaryFacts??[]).find(([label])=>label==='Best source')?.[1];
    return <li key={entry.id}><Link to={entryHref(entry)} className={styles.playerCatalogRow}>
      <div className={styles.playerCatalogImage}>{renderVisual(entry)}</div>
      <h2>{entry.name}</h2>
      <ul className={styles.playerCatalogBenefits}>{benefits.map((benefit,index)=><li key={index} data-kind={benefit.kind}>
        {benefit.kind==='attribute'?<WikiStatValue label={benefit.label} value={benefit.value} w={w} size={18} compact/>:<><WikiIcon label={benefit.label} kind={benefit.kind} size={18}/><span>{benefit.kind==='immunity'?`${w('Immunity')}: `:''}{w(benefit.label)}</span></>}
      </li>)}</ul>
      {meaningfulValue(source)&&<div className={styles.playerCatalogSource}><small>{w('Best source')}</small><span>{w(source)}</span></div>}
    </Link></li>;
  })}</ul>;
}
