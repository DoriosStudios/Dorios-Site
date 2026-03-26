import React from 'react';
import styles from './styles.module.css';

export default function BlockInfoGrid({
  leftLabel = 'Setting',
  rightLabel = 'Value',
  items = []
}) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className={styles.wrap} role="table" aria-label="Block information">
      <div className={styles.head} role="rowgroup">
        <div className={styles.headCell} role="columnheader">{leftLabel}</div>
        <div className={styles.headCell} role="columnheader">{rightLabel}</div>
      </div>

      <div className={styles.body} role="rowgroup">
        {items.map((item, index) => (
          <div className={styles.row} role="row" key={`${item.label}-${index}`}>
            <div className={styles.label} role="cell">{item.label}</div>
            <div className={styles.value} role="cell">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
