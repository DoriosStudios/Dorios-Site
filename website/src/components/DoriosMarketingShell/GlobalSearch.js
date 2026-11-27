import React, {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {searchWikiIndex} from '../../wiki/search.mjs';
import {useSiteI18n} from '../../i18n/site';
import styles from './styles.module.css';

let indexRequest;
function loadSearchIndex() {
  indexRequest ??= import('@generated/dorios-wiki-search-index/default/index.json').then(module => module.default).catch(error => {
    indexRequest = undefined;
    throw error;
  });
  return indexRequest;
}

export default function GlobalSearch({onNavigate}) {
  const {t} = useSiteI18n();
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('');
  const [index, setIndex] = useState(null);
  const [failed, setFailed] = useState(false);
  const input = useRef(null);
  useEffect(() => {
    let active = true;
    input.current?.focus();
    loadSearchIndex().then(
      data => { if (active) setIndex(data); },
      () => { if (active) setFailed(true); },
    );
    return () => { active = false; };
  }, []);

  const results = useMemo(() => index
    ? searchWikiIndex(projectId ? index.filter(project => project.id === projectId) : index, query)
    : [], [index, projectId, query]);

  return <>
    <div className={styles.globalSearchControls}>
      <label className={styles.globalSearchInput}>
        <span>{t('searchWiki')}</span>
        <input ref={input} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchWiki')}/>
      </label>
      <label className={styles.globalSearchInput}>
        <span>{t('searchProject')}</span>
        <select value={projectId} onChange={event => setProjectId(event.target.value)}>
          <option value="">{t('searchAllProjects')}</option>
          {index?.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </label>
    </div>
    <div className={styles.globalSearchResults} role="region" aria-label={t('searchResults')} aria-busy={!index && !failed}>
      {results.map(result => <Link key={result.projectId + ':' + result.href} to={result.href} onClick={onNavigate} prefetch={false}>
        <strong>{result.name}</strong><small>{t(result.type)} · {result.project}</small>
      </Link>)}
      {failed && <p role="status">{t('searchUnavailable')}</p>}
      {index && query.trim().length >= 2 && !results.length && <p role="status">{t('noSearchResults')}</p>}
    </div>
  </>;
}
