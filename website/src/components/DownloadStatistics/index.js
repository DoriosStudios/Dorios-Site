import React, {useEffect, useId, useRef, useState} from 'react';
import {IconBrandGithub, IconInfoCircle, IconPackage, IconWorld, IconX} from '@tabler/icons-react';
import {CurseForgeIcon, McpedlIcon} from '../ProjectDetailPage/PlatformIcons';
import {useSiteI18n} from '../../i18n/site';
import {statisticsCopy} from './copy';
import styles from './styles.module.css';

const icons = {github: IconBrandGithub, curseforge: CurseForgeIcon, mcpedl: McpedlIcon, package: IconPackage};
export default function DownloadStatistics({statistics, children}) {
  const {locale, formatNumber} = useSiteI18n();
  const copy = statisticsCopy(locale);
  const [open, setOpen] = useState(false);
  const root = useRef(null), trigger = useRef(null), pinned = useRef(false);
  const id = useId();
  useEffect(() => {
    if (!open) return undefined;
    const dismiss = event => { if (!root.current?.contains(event.target)) {pinned.current = false; setOpen(false);} };
    const escape = event => { if (event.key === 'Escape') { pinned.current = false; setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <span className={styles.root} ref={root}
    onMouseEnter={() => {if (window.matchMedia?.('(hover:hover)').matches) setOpen(true);}}
    onMouseLeave={() => {if (!pinned.current && !root.current?.contains(document.activeElement)) setOpen(false);}}
    onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) {pinned.current = false; setOpen(false);}}}>
    <button type="button" className={styles.trigger} ref={trigger} aria-label={copy.details} aria-expanded={open} aria-controls={id} onClick={() => {pinned.current = !pinned.current; setOpen(pinned.current);}}>
      {children}<IconInfoCircle size={15} aria-hidden="true" />
    </button>
    {open && <span className={styles.popup} id={id} role="region" aria-label={copy.title}>
      <span className={styles.heading}><strong>{copy.title}</strong><button type="button" aria-label={copy.close} onClick={() => {pinned.current = false; setOpen(false); trigger.current?.focus();}}><IconX size={18} /></button></span>
      <span className={styles.rows}>{(statistics?.sources ?? []).map(source => {
        const Icon = icons[source.icon] ?? IconWorld;
        const status = source.duplicate ? 'duplicate' : source.status;
        return <span className={styles.row} key={source.id}>
          <Icon size={20} aria-hidden="true" />
          <span><strong>{source.name}</strong><small>{copy[source.metric] ?? source.metric}</small>
            {status !== 'available' && <small>{copy[status] ?? copy.unavailable}</small>}
            {source.updatedAt && <small>{copy.updated}: {new Date(source.updatedAt).toLocaleDateString(locale)}</small>}
          </span>
          <b>{source.value === null ? '—' : formatNumber(source.value)}</b>
        </span>;
      })}</span>
      <span className={styles.total}><strong>{copy.total}</strong><b>{statistics?.available ? formatNumber(statistics.total) : '—'}</b></span>
      {statistics?.sources?.some(source => source.metric === 'download-starts') && <small className={styles.note}>{copy.note}</small>}
    </span>}
  </span>;
}
