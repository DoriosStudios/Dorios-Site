import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function DoriosExcavatePage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/excavate/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1360468/description_b38eac9b-5836-480b-a5a0-528353cb9438.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1360468/description_c0aa66cb-e785-4d6d-b0f3-d1a81b38ffd3.png", blur: true  },
    { type: "youtube", id: "c-IrGsnSO04" },
    { type: "youtube", id: "qK0y5zG9wWQ" },
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Dorios' Excavation" description="Dorios' Excavation Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/excavate/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Dorios' Excavation</h1>

        <p className={styles.heroSubtitle}>
          Vein mining. Instant excavation. Speed meets convenience.
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

            {/* RIGHT — MINI THUMBNAILS */}
            <div className={styles.thumbnailColumn}>
              {media.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.thumbnail} ${i === current ? styles.activeThumbnail : ""}`}
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
              Dorios' Excavation brings vein mining and instant excavation
              abilities to Minecraft Bedrock using a balanced and flexible system.
              <br /><br />
              Mine entire ore veins, chop connected logs, break dirt clusters and
              excavate large patches at once without breaking tool progression.
              <br /><br />
              Fully configurable, survival-friendly, and compatible with UtilityCraft,
              Paxels & AIOTs, and any other tool-based addons.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/dorios-excavate"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/dorios-excavate/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/dorios-excavate/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
