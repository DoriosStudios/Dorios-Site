import React from 'react';
import Layout from '@theme/Layout';
import styles from './home.module.css';

const addons = [
  {
    title: "UtilityCraft",
    folder: "utilitycraft",
  },
  {
    title: "Dorios' Trinkets",
    folder: "trinkets",
  },
  {
    title: "Better Smelters",
    folder: "smelters",
  },
  {
    title: "Bountiful Bonsais",
    folder: "bonsais",
  },
  {
    title: "Dorios' Atelier",
    folder: "atelier",
  },
  {
    title: "Cobblestone Generators",
    folder: "cobble_gens",
  },
  {
    title: "Bountiful Crops",
    folder: "crops",
  },
  {
    title: "Bountiful Trees",
    folder: "trees",
  },
  {
    title: "Paxels & AIOTs",
    folder: "paxels",
  },
  {
    title: "Effect Pillars",
    folder: "pillars",
  },
  {
    title: "Dorios' Basics",
    folder: "basics",
  },
  {
    title: "Compressy",
    folder: "compressy",
  },
  {
    title: "Redstone Lamps Plus",
    folder: "lamps",
  },
  {
    title: "Dorios' Excavate",
    folder: "excavate",
  },
  {
    title: "Training Dummy",
    folder: "dummy",
  },
];

export default function Home() {
  return (
    <Layout
      title="Dorios Studios"
      description="High-quality Minecraft Bedrock addons"
    >

      {/* HERO */}
      <header className={styles.heroSpotlight}>
        <div className={styles.heroGlow}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />

        <h1 className={styles.heroTitle}>Our Projects</h1>

        <p className={styles.heroSubtitle}>
          Dorios Studios is a creative group dedicated to crafting high-quality Minecraft Bedrock addons.  
          We focus on automation, magic systems, combat mechanics, farming expansions, utilities and unique gameplay experiences.
        </p>
      </header>

      {/* PROJECT GRID */}
      <main className={styles.projectsSection}>
        <div className={styles.gridContainer}>

          {addons.map((addon, i) => (
            <a key={i} href={`/projects/${addon.folder}`} className={styles.cardLink}>
              <div className={styles.card}>

                {/* Imagen completa */}
                <img
                  src={`/img/addons/${addon.folder}/MCPEDL.png`}
                  className={styles.cardImage}
                />

                {/* Botón visual */}
                <div className={styles.cardButtonOverlay}>
                  <div className={styles.viewButton}>
                    View <span className={styles.arrow}>›</span>
                  </div>
                </div>

              </div>
            </a>
          ))}

        </div>
      </main>

    </Layout>
  );
}
