import React, {useId} from 'react';
import {IconChevronRight} from '@tabler/icons-react';
import styles from './StepLists.module.css';

export default function StepCompactList({title, sectionNumber, steps = [], embedded = false}) {
  const headingId = useId();
  return (
    <section className={`${styles.stepList} ${styles.compactList} ${embedded ? styles.embedded : ''}`} aria-labelledby={embedded ? undefined : headingId}>
      {!embedded && <header className={styles.stepHeader}>
        <span>{String(sectionNumber).padStart(2, '0')}</span>
        <h2 id={headingId}>{title}</h2>
      </header>}
      <ol className={styles.compactItems}>
        {steps.map((step, index) => <li key={`${index}-${step}`}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <p>{step}</p>
          <IconChevronRight aria-hidden="true" size={18} stroke={1.8} />
        </li>)}
      </ol>
    </section>
  );
}
