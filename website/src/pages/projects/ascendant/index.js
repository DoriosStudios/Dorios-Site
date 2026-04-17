import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../project.module.css";

export default function AscendantTechnologyPage() {
  const media = [
    { type: "image", src: "/img/addons/ascendant/MCPEDL.jpg" },
    { type: "image", src: "/img/addons/ascendant/showcase/armors.png" },
    { type: "image", src: "/img/addons/ascendant/showcase/at_machines.png" },
    { type: "image", src: "/img/addons/ascendant/showcase/liquifier_processing_obsidian.png" },
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Ascendant Technology" description="Ascendant Technology Addon Page">
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/ascendant/MCPEDL.jpg')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Ascendant Technology</h1>

        <p className={styles.heroSubtitle}>
          End-game expansion. Advanced machines. Smarter factories.
        </p>
      </div>

      <div className={styles.pageWrapper}>
        <div className={styles.topSection}>
          <div className={styles.galleryBox}>
            <div className={styles.mainPreview}>
              {media[current].type === "image" && (
                <img
                  src={media[current].src}
                  className={styles.previewMedia}
                />
              )}
            </div>

            <div className={styles.thumbnailColumn}>
              {media.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.thumbnail} ${
                    i === current ? styles.activeThumbnail : ""
                  }`}
                  onClick={() => setCurrent(i)}
                >
                  {m.type === "image" && (
                    <img src={m.src} className={styles.thumbnailImage} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.infoBox}>
            <h2 className={styles.sectionTitle}>About the Project</h2>

            <p className={styles.description}>
              Ascendant Technology is the official end-game expansion for UtilityCraft.
              It pushes the add-on beyond basic automation into smarter factory building,
              advanced materials, fluid-based processing, diagnostics, and multi-step machine chains.
              <br /><br />
              Instead of rewarding giant, messy farms, Ascendant focuses on deliberate progression and infrastructure.
              Expect machines like the Catalyst Weaver, Cryo Chamber, Liquifier, and Singularity Fabricator,
              along with late-game resources such as Titanium and Aetherium.
              <br /><br />
              It is designed for players who already mastered UtilityCraft and want a deeper, more complex late-game layer.
            </p>

            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Status</span>
                <span className={styles.statValue}>Beta</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Requires</span>
                <span className={styles.statValue}>UtilityCraft</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Minecraft Version</span>
                <span className={styles.statValue}>1.21+</span>
              </div>
            </div>

            <div className={styles.buttonsRow}>
              <a
                className={styles.button}
                href="https://github.com/DoriosStudios/Ascendant-Technology/releases/tag/v0.8.0-beta"
                target="_blank"
              >
                GitHub Releases
              </a>

              <a
                className={styles.button}
                href="https://github.com/DoriosStudios/Ascendant-Technology"
                target="_blank"
              >
                GitHub Repo
              </a>

              <a
                className={styles.button}
                href="/docs/ascendant_technology/"
                target="_blank"
              >
                Wiki
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}