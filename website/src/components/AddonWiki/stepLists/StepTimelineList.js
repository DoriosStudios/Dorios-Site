import React, {useId} from 'react';
import styles from './StepLists.module.css';

export default function StepTimelineList({title, sectionNumber, steps = [], embedded = false}) {
  const headingId = useId();
  return (
    <section className={`${styles.stepList} ${styles.timelineList} ${embedded ? styles.embedded : ''}`} aria-labelledby={embedded ? undefined : headingId}>
      {!embedded && <header className={styles.stepHeader}>
        <span>{String(sectionNumber).padStart(2, '0')}</span>
        <h2 id={headingId}>{title}</h2>
      </header>}
      <ol className={styles.timelineItems}>
        {steps.map((step, index) => <li key={`${index}-${step}`}>
          <i aria-hidden="true" />
          <span>{String(index + 1).padStart(2, '0')}</span>
          <p>{step}</p>
        </li>)}
      </ol>
    </section>
  );
}
