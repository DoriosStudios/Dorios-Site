import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function TrainingDummyPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/dummy/MCPEDL.png", blur: true }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Training Dummy" description="Training Dummy Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/dummy/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Training Dummy</h1>

        <p className={styles.heroSubtitle}>
          Damage testing. DPS tracking. Combat practice made simple.
        </p>
      </div>

      <div className={styles.pageWrapper}>
        <div className={styles.topSection}>

          {/* LEFT — GALLERY */}
          <div className={styles.galleryBox}>

            {/* MAIN PREVIEW */}
            <div className={styles.mainPreview}>

              {media[current].type === "image" && (
                media[current].blur ? (
                  <div className={styles.previewWrapper}>
                    <div
                      className={styles.previewBlurBg}
                      style={{ backgroundImage: `url(${media[current].src})` }}
                    />
                    <img
                      src={media[current].src}
                      className={styles.previewActual}
                    />
                  </div>
                ) : (
                  <img
                    src={media[current].src}
                    className={styles.previewMedia}
                  />
                )
              )}

              {media[current].type === "youtube" && (
                <iframe
                  className={styles.previewMedia}
                  src={`https://www.youtube.com/embed/${media[current].id}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* THUMBNAILS */}
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
                  
                  {m.type === "youtube" && (
                    <div className={styles.thumbnailVideoBox}>
                      <img
                        src={`https://img.youtube.com/vi/${m.id}/mqdefault.jpg`}
                        className={styles.thumbnailImage}
                      />
                      <div className={styles.thumbnailPlayIcon}>▶</div>
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>

          {/* RIGHT — INFO SECTION */}
          <div className={styles.infoBox}>
            <h2 className={styles.sectionTitle}>About the Project</h2>

            <p className={styles.description}>
              Training Dummy adds a reliable way to test damage, abilities, builds,
              enchantments, trinkets, and weapon effects.  
              <br /><br />
              Each dummy tracks total damage received, DPS, critical hits, and
              supports both melee and ranged testing.  
              <br /><br />
              Perfect for creators, RPG combat balancing, addon testing, and PvP
              practice. Fully compatible with your combat systems, Dorios API,
              magic effects, and RPG mechanics.
            </p>

            <div className={styles.statsRow}>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Status</span>
                <span className={styles.statValue}>Released</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Minecraft Version</span>
                <span className={styles.statValue}>1.21+</span>
              </div>

            </div>

            <div className={styles.buttonsRow}>

              <a className={styles.button}
                href="https://www.curseforge.com/minecraft-bedrock/addons/training-dummy"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/training-dummy/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/training-dummy/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>

    </Layout>
  );
}
