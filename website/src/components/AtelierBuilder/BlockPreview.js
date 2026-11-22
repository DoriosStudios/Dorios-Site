import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// These PNGs are rendered once during preparation, never in the visitor's UI.
export default function BlockPreview({record, className}) {
  const base = useBaseUrl('/atelier-builder/');
  return <img className={className} src={`${base}${record.preview}`} width={128} height={128}
    alt="" loading="lazy" decoding="async" aria-hidden="true" />;
}

export function representativeBlock(records, preferred = {}, required = {}) {
  const candidates = records.filter(record => Object.entries(required).every(([key, value]) => record[key] === value));
  const score = record => (record.shape === (preferred.shape ?? 'block') ? 8 : 0)
    + (record.variant === preferred.variant ? 4 : 0) + (record.color === preferred.color ? 2 : 0);
  return candidates.reduce((best, record) => !best || score(record) > score(best) ? record : best, undefined);
}
