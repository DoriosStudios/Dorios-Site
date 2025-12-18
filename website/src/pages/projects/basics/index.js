import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function DoriosBasicsPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/basics/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_634821d0-04bb-4c1b-a611-41e40fc68970.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1095313/description_95e18157-b7eb-4562-a5dd-910b873ca697.png" , blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1095313/description_90ed0758-3e5e-475c-a424-d042ecd6f7f8.png", blur: true }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Dorios Basics" description="Dorios Basics Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/basics/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Dorios Basics</h1>

        <p className={styles.heroSubtitle}>
          Lightweight utilities. Core improvements. Quality-of-life for every world.
        </p>
      </div>

      <div className={styles.pageWrapper}>
        <div className={styles.topSection}>

          {/* LEFT — GALLERY */}
          <div className={styles.galleryBox}>

            {/* MAIN PREVIEW 16:9 */}
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

          {/* RIGHT — INFO */}
          <div className={styles.infoBox}>
            <h2 className={styles.sectionTitle}>About the Project</h2>

            <p className={styles.description}>
              Dorios Basics is a lightweight addon providing essential blocks,
              tools, and utilities designed to improve survival gameplay without
              changing progression.
              <br /><br />
              From early-game convenience items to decoration blocks and small
              mechanic helpers, Basics acts as a soft foundation that complements
              other Dorios addons like UtilityCraft, Paxels & AIOTs, Bonsais, Crops
              and Excavation.
              <br /><br />
              Simple, efficient, compatible, and perfect for any world.
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

            {/* BUTTONS */}
            <div className={styles.buttonsRow}>

              <a className={styles.button}
                href="https://www.curseforge.com/minecraft-bedrock/addons/dorios-basics"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/dorios-basics/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/dorios-basics/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>

    </Layout>
  );
}
