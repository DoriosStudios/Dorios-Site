import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

/**
 * A data-driven project grid that can be reused on any Dorios landing page.
 */
export default function ProjectShowcase({ id, title, intro, projects }) {
  return (
    <section className={styles.showcase} id={id} aria-labelledby={`${id}-title`}>
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>Selected projects</p>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        <p>{intro}</p>
      </div>

      <div className={styles.projectGrid}>
        {projects.map((project) => (
          <Link key={project.folder} className={styles.projectCard} to={`/projects/${project.folder}`}>
            <img
              className={styles.projectImage}
              src={`/img/addons/${project.folder}/MCPEDL.png`}
              alt={`${project.title} addon artwork`}
              loading="lazy"
            />
            <div className={styles.cardShade} />
            <div className={styles.cardContent}>
              <span>{project.category}</span>
              <h3>{project.title}</h3>
              <i aria-hidden="true">↗</i>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
