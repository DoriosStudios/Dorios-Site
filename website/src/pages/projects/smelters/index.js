import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function BetterSmeltersPage() {
  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/smelters/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1241687/description_e84ce74f-ae79-4fc3-b737-a66a91744f2b.png", blur: true  },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1241687/description_1528e797-3aeb-455b-a28a-03ce582e4935.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1241687/description_06dbf43b-cacc-448c-bdc3-fef25b019406.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1241687/description_53ba5d87-6029-4efa-8b09-92e602435f3f.png", blur: true }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Better Smelters" description="Better Smelters Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/smelters/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Better Smelters</h1>

        <p className={styles.heroSubtitle}>
          Faster furnaces. Alloy creation. Smelting reimagined.
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
                    m.blur ? (
                      <div className={styles.thumbnailVideoBox}>
                        <img src={m.src} className={styles.thumbnailImage} />
                      </div>
                    ) : (
                      <img src={m.src} className={styles.thumbnailImage} />
                    )
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
              Better Smelters expands the vanilla furnace system with new
              multi-tier smelters, alloy creation mechanics, improved fuel
              handling, and higher efficiency.  
              <br /><br />
              From early-game compact smelters to industrial-grade super
              forges, Better Smelters modernizes resource processing while keeping
              gameplay balanced and progression-oriented.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/better-smelters"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/better-smelters/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/better-smelters/"
                target="_blank">Wiki</a>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
