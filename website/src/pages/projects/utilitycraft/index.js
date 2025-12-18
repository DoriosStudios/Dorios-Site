import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../project.module.css";

export default function UtilityCraftPage() {

  // GALERÍA: Soporta imágenes locales, URLs y videos YouTube
  const media = [
    { type: "image", src: "/img/addons/utilitycraft/MCPEDL.png" , blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/1417/282/image_2025-12-07_133649327-png.png", blur: true  },
    { type: "youtube", id: "2CbBLwLSy-w" },
    { type: "youtube", id: "RhNZhbuD1sg" },
    { type: "image", src: "https://media.forgecdn.net/attachments/1417/287/image_2025-12-07_134025771-png.png", blur: true  }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="UtilityCraft" description="UtilityCraft Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/utilitycraft/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>
        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>UtilityCraft</h1>
        <p className={styles.heroSubtitle}>
          Automation. Machines. Progression reinvented.
        </p>
      </div>

      <div className={styles.pageWrapper}>
        <div className={styles.topSection}>

          {/* LEFT — NEW GALLERY */}
          <div className={styles.galleryBox}>

            {/* MAIN PREVIEW */}
            <div className={styles.mainPreview}>
              {media[current].type === "image" && (
                <img
                  src={media[current].src}
                  className={styles.previewMedia}
                />
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

            {/* RIGHT THUMBNAILS */}
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
              UtilityCraft turns Bedrock Edition into a fully automated experience.
              Build machines, generators, fluid networks, spawners, crushers,
              bonsais and complete production lines that transform survival into
              efficiency. It keeps gameplay balanced while giving you tools to
              automate everything from early to late game.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/utilitycraft"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/utilitycraft/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/utilitycraft/"
                target="_blank">Wiki</a>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
