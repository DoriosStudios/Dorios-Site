import React from 'react';
import Link from '@docusaurus/Link';
import {IconBolt,IconHeart,IconShield,IconTool,IconDroplet,IconClock,IconCube,IconArrowRight,IconSettings,IconAlertTriangle} from '@tabler/icons-react';
import styles from './playerGuide.module.css';
import {meaningfulValue} from '../../wiki/playerGuide.mjs';

function MetricIcon({label}) {
  const Icon = /health|heart|vida|saúde|salud/i.test(label) ? IconHeart
    : /energy|consum|energ/i.test(label) ? IconBolt
    : /fluid|gas|líquid|fluido/i.test(label) ? IconDroplet
    : /time|cycle|tempo|ciclo/i.test(label) ? IconClock
    : /durab|resist/i.test(label) ? IconShield : IconTool;
  return <Icon size={22} stroke={1.6} aria-hidden="true"/>;
}

export function WikiStatGrid({facts,w}) {
  if (!facts.length) return null;
  return <dl className={styles.playerStats}>{facts.map(([label,value])=><div key={label}>
    <MetricIcon label={label}/><dt>{w(label)}</dt><dd>{w(Array.isArray(value)?value.join(' · '):value)}</dd>
  </div>)}</dl>;
}

export function WikiTechnicalDetails({w,children}) {
  return <details className={styles.playerTechnical}><summary><IconSettings size={19} aria-hidden="true"/>{w('Technical details')}</summary>
    <div className={styles.playerTechnicalBody}>{children}</div>
  </details>;
}

export function WikiProcessFlow({inputs,outputs,visual,w}) {
  if (!inputs.length || !outputs.length) return null;
  const parts = values => values.flatMap(value=>String(w(value)).split(/\s+\+\s+/));
  const Part = ({value}) => {const Icon=/fluid|líquid|fluido/i.test(value)?IconDroplet:IconCube;return <p><Icon size={24} aria-hidden="true"/>{value}</p>;};
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
      <IconAlertTriangle size={23} aria-hidden="true"/><div><h3>{w(label)}</h3><p>{w(value)}</p></div>
    </section>)}</div>}
    <WikiProcessFlow inputs={guide.inputs} outputs={guide.outputs} visual={visual} w={w}/>
    {guide.steps.length>0&&<ol className={styles.playerSteps}>{guide.steps.map((step,index)=><li key={index}>{w(step)}</li>)}</ol>}
    {guide.upgrades.length>0&&<section className={styles.playerUpgrades}><h2>{w('Supported upgrades')}</h2><ul>{guide.upgrades.map(type=><li key={type}><IconTool size={20} aria-hidden="true"/>{w(type.replace(/\b\w/g,c=>c.toUpperCase()))}</li>)}</ul></section>}
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
        {benefit.kind==='attribute'?<><span>{w(benefit.label)}</span><strong>{w(benefit.value)}</strong></>:<span>{benefit.kind==='immunity'?`${w('Immunity')}: `:''}{w(benefit.label)}</span>}
      </li>)}</ul>
      {meaningfulValue(source)&&<div className={styles.playerCatalogSource}><small>{w('Best source')}</small><span>{w(source)}</span></div>}
      <IconArrowRight className={styles.playerCatalogArrow} size={18} aria-hidden="true"/>
    </Link></li>;
  })}</ul>;
}
