import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function BountifulBonsaisPage() {
  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/bonsais/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1087426/description_b9f6df7e-0b03-47b8-bf71-cf4ffa1ced97.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1087426/description_4ca911bd-077b-4e9d-9778-6e6a81bcb15f.png" , blur: true },
    { type: "youtube", id: "eJBQ2STxnMM" }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Bountiful Bonsais" description="Bountiful Bonsais Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/bonsais/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Bountiful Bonsais</h1>

        <p className={styles.heroSubtitle}>
          Passive tree farming. Beautiful bonsais. Automated resource flow.
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
              Bountiful Bonsais brings peaceful, automated tree farming into your
              worlds. Fully passive growth, custom soils, loot multipliers, reduced
              growth times, and integration with UtilityCraft automation systems.
              <br /><br />
              Grow every Minecraft tree in compact, beautiful containers that
              generate logs, leaves, sticks, saplings and special loot — all
              without consuming space or requiring manual farming.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/bountiful-bonsais"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/bountiful-bonsais/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/bountiful-bonsais/"
                target="_blank">Wiki</a>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
