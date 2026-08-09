import React from 'react';
import styles from './styles.module.css';

const faceNames = {
  top: 'top',
  left: 'west',
  right: 'north',
};

function CubeFace({position, face, label}) {
  const faceLabel = face.label ?? `${label} — ${faceNames[position]} face`;
  const image = <img src={face.src} alt={face.alt ?? ''} loading="lazy" />;
  const className = `${styles.face} ${styles[position]}`;

  if (face.href) {
    return (
      <a className={className} href={face.href} aria-label={faceLabel}>
        {image}
      </a>
    );
  }

  return <div className={className} aria-hidden={face.alt ? undefined : 'true'}>{image}</div>;
}

/**
 * Static isometric block render composed from top, west/left and north/right textures.
 */
export default function BlockCube({
  top,
  left,
  right,
  label = 'Block render',
  className = '',
  size,
}) {
  if (!top?.src || !left?.src || !right?.src) return null;

  return (
    <figure
      className={`${styles.cube} ${className}`}
      aria-label={label}
      style={size ? {'--cube-width': size} : undefined}
    >
      <div className={styles.cubeObject}>
        <CubeFace position="top" face={top} label={label} />
        <CubeFace position="left" face={left} label={label} />
        <CubeFace position="right" face={right} label={label} />
      </div>
    </figure>
  );
}
