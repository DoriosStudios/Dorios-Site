import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {IconShield, IconSparkles, IconTool} from '@tabler/icons-react';
import {WIKI_UI_ICONS, wikiIconKey} from '../../data/wikiUiIcons.mjs';
import styles from './styles.module.css';

// Decorative: the adjacent text always supplies the accessible meaning.
export default function WikiIcon({name, label, kind = 'metric', size = 24, className = '', fallback: Fallback}) {
  const key = name ?? wikiIconKey(label, kind);
  const source = WIKI_UI_ICONS[key];
  const url = useBaseUrl(source ?? '/');
  const Icon = Fallback ?? (kind === 'immunity' ? IconShield : kind === 'effect' ? IconSparkles : IconTool);
  return <span className={`${styles.icon} ${className}`} style={{'--wiki-icon-size':`${size}px`}} aria-hidden="true" data-wiki-icon={source ? key : 'fallback'}>
    {source ? <img src={url} alt="" width={size} height={size} decoding="async"/> : <Icon size={size} stroke={1.6}/>}
    {kind === 'immunity' && source && <svg className={styles.immunity} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m5 5 14 14"/></svg>}
  </span>;
}
