import React, {useEffect, useMemo, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {downloadAttempt, recordDownloadStarted} from '../../data/downloadEvents.mjs';
import {IconChevronDown, IconDeviceFloppy, IconDownload, IconPackage, IconSettings, IconUpload} from '@tabler/icons-react';
import {useSiteI18n} from '../../i18n/site';
import {builderCopy} from './copy';
import BuilderControls from './BuilderControls';
import {defaultSelection as defaults, selectedRecords} from './selection.mjs';
import styles from './styles.module.css';

const anchor = 'atelier-custom-installation';
const storageKey = 'dorios-atelier-selection-v1';
const validSelection = (catalog, value) => value && Array.isArray(value.tools)
  && catalog.families.every(family => value.families?.[family.id]
    && ['variants', 'shapes', 'colors'].every(key => Array.isArray(value.families[family.id][key])));

export function AtelierBuilderLink({className}) {
  const {locale} = useSiteI18n();
  return <a className={className} href={`#${anchor}`}>{builderCopy(locale)('title')}
    <IconSettings size={16} stroke={1.9} aria-hidden="true" focusable="false" style={{flexShrink: 0}} />
  </a>;
}

export default function AtelierBuilder() {
  const {siteConfig} = useDocusaurusContext();
  const countDownload = eventId => { void recordDownloadStarted({endpoint: siteConfig.customFields?.downloadCounterUrl,
    project: 'atelier', event: 'custom-install-started', eventId}); };
  const {locale, formatNumber} = useSiteI18n();
  const t = builderCopy(locale);
  const base = useBaseUrl('/atelier-builder/');
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(null);
  const [download, setDownload] = useState(null);
  const [notice, setNotice] = useState(null);
  const worker = useRef(null);
  const presetInput = useRef(null);
  const busy = Boolean(stage);

  useEffect(() => {
    const checkHash = () => { if (window.location.hash === `#${anchor}`) setOpen(true); };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => { window.removeEventListener('hashchange', checkHash); worker.current?.terminate(); };
  }, []);
  useEffect(() => {
    if (!open || catalog) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`${base}catalog.json`, {signal: controller.signal, cache: 'no-cache'})
      .then(response => { if (!response.ok) throw new Error('unavailable'); return response.json(); })
      .then(value => {
        if (value.schemaVersion !== 1 || !Array.isArray(value.families)) throw new Error('unavailable');
        let initial = defaults(value);
        try {
          const saved = JSON.parse(localStorage.getItem(storageKey));
          if (saved?.fingerprint === value.fingerprint && validSelection(value, saved.selection)) {
            initial = saved.selection;
          }
        } catch { /* Private browsing can disable storage. */ }
        setSelection(initial);
        setCatalog(value);
      }).catch(cause => { if (cause.name !== 'AbortError') setError('unavailable'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, catalog, base, attempt]);
  useEffect(() => {
    if (!catalog || !selection) return;
    try { localStorage.setItem(storageKey, JSON.stringify({fingerprint: catalog.fingerprint, selection})); } catch { /* Optional. */ }
    setDownload(null);
    setNotice(null);
  }, [catalog, selection]);
  useEffect(() => () => { if (download) URL.revokeObjectURL(download.url); }, [download]);

  const selected = useMemo(() => catalog && selection ? selectedRecords(catalog, selection) : [], [catalog, selection]);
  const totals = {blocks: formatNumber(selected.filter(record => record.kind === 'block').length),
    items: formatNumber(selected.filter(record => record.kind === 'tool').length)};
  const startBuild = () => {
    if (!selected.length || busy) return;
    setError(null);
    setDownload(null);
    setStage('downloading');
    worker.current?.terminate();
    try {
      const job = new Worker(`${base}builder-worker.js?v=${catalog.fingerprint}`);
      worker.current = job;
      const eventId = downloadAttempt();
      let completed = false;
      const fail = code => { setError(code === 'VERSION_CHANGED' ? 'changed' : 'error'); setStage(null); job.terminate(); };
      job.onerror = () => fail('error');
      job.onmessage = ({data}) => {
        if (worker.current !== job || completed) return;
        if (data.type === 'progress') setStage(data.stage);
        else if (data.type === 'error') fail(data.code);
        else if (data.type === 'complete') {
          completed = true;
          const url = URL.createObjectURL(new Blob([data.bytes], {type: 'application/octet-stream'}));
          const filename = `Dorios-Atelier-${catalog.source.version}-Custom.mcaddon`;
          setDownload({url, filename, summary: data.summary, eventId});
          setStage(null);
          const link = document.createElement('a');
          link.href = url; link.download = filename;
          document.body.appendChild(link); link.click(); link.remove();
          countDownload(eventId);
          job.terminate();
        }
      };
      job.postMessage({fingerprint: catalog.fingerprint, selection});
    } catch { setError('error'); setStage(null); }
  };
  const savePreset = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({schemaVersion: 1, fingerprint: catalog.fingerprint, selection}, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'Atelier-selection.json';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setNotice('saved');
  };
  const loadPreset = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('invalid');
      const preset = JSON.parse(await file.text());
      if (preset.fingerprint !== catalog.fingerprint) throw new Error('changed');
      if (!validSelection(catalog, preset.selection)) throw new Error('invalid');
      setSelection(preset.selection);
      setError(null);
    } catch (cause) { setError(cause.message === 'changed' ? 'changed' : 'invalid'); }
  };

  return <details id={anchor} className={styles.builder} open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className={styles.heading}>
      <span className={styles.headingIcon}><IconSettings size={26} stroke={1.5} aria-hidden="true" /></span>
      <span className={styles.headingCopy}><strong>{t('title')}</strong><span>{t('lead')}</span></span>
      <IconChevronDown className={styles.expand} size={22} stroke={1.7} aria-hidden="true" />
    </summary>
    <div className={styles.body}>
      {loading && <p role="status">{t('loading')}</p>}
      {error && <div role="alert" className={styles.error}><p>{t(error)}</p>
        <button type="button" onClick={() => error === 'changed' ? window.location.reload()
          : catalog ? error === 'invalid' ? setError(null) : startBuild()
            : setAttempt(value => value + 1)} disabled={busy}>{t(error === 'changed' ? 'reload' : 'retry')}</button>
      </div>}
      {catalog && selection && <>
        <p className={styles.version}>{t('version', catalog.source)}</p>
        <BuilderControls catalog={catalog} selection={selection} onChange={setSelection} busy={busy}
          locale={locale} formatNumber={formatNumber} t={t} />
        <div className={styles.footer}>
          <div className={styles.packageSummary}>
            <IconPackage size={29} stroke={1.4} aria-hidden="true" />
            <div><p className={styles.eyebrow}>{t('yourPackage')}</p><strong>{t('chosen', totals)}</strong></div>
            <button type="button" className={styles.primary} disabled={!selected.length || busy} onClick={startBuild}><IconDownload size={19} aria-hidden="true" />{t('build')}</button>
          </div>
          <p className={styles.dependencyNote}>{t('dependencyNote')}</p>
          <div className={styles.downloadActions}>
            {busy && <button type="button" onClick={() => { worker.current?.terminate(); setStage(null); }}>{t('cancel')}</button>}
            {!busy && <button type="button" disabled={!selected.length} onClick={savePreset}><IconDeviceFloppy size={16} aria-hidden="true" />{t('preset')}</button>}
            {!busy && <button type="button" onClick={() => presetInput.current?.click()}><IconUpload size={16} aria-hidden="true" />{t('import')}</button>}
            <input ref={presetInput} type="file" accept=".json,application/json" hidden onChange={loadPreset} />
          </div>
          {!selected.length && <p>{t('empty')}</p>}
          <div role="status" aria-live="polite">
            {busy && <p className={styles.progress}>{t(stage)}</p>}
            {notice && <p>{t(notice)}</p>}
            {download && <div className={styles.success}>
              <p>{t('complete', Object.fromEntries(Object.entries(download.summary).map(([key, value]) => [key, typeof value === 'number' ? formatNumber(value) : value])))}</p>
              <a href={download.url} download={download.filename} onClick={() => countDownload(download.eventId)}>{t('download')}</a>
              {download.summary.dependencies.length > 0 && <details><summary>{t('extras', {count: formatNumber(download.summary.dependencies.length)})}</summary>
                <ul aria-label={t('details')}>{download.summary.dependencies.map(id => <li key={id}>{id.replace('dorios_atelier:', '').replaceAll('_', ' ')}</li>)}</ul>
              </details>}
            </div>}
          </div>
          <p className={styles.replaceNote}>{t('replaceNote')}</p>
        </div>
      </>}
    </div>
  </details>;
}
