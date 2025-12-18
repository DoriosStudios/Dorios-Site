import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function BountifulCropsPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/crops/MCPEDL.png", blur: true },
    { type: "image", src: "https://api.mcpedl.com/storage/submissions/182896/images/utilitycraft-v19-tractor-and-more-crops_5.png", blur: true },
    { type: "image", src: "https://api.mcpedl.com/storage/submissions/182896/images/utilitycraft-v19-tractor-and-more-crops_6.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1097197/description_84168185-97ac-4a2b-8162-524ecdbd402c.png", blur: true }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Bountiful Crops" description="Bountiful Crops Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/crops/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Bountiful Crops</h1>

        <p className={styles.heroSubtitle}>
          Custom farming. Ore crops. Scalable agriculture for every stage.
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

            {/* RIGHT — THUMBNAILS */}
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
              Bountiful Crops redefines farming by adding dozens of custom crops,
              each with unique growth mechanics, special soils, and ore crops for
              renewable resource farming.  
              <br /><br />
              Grow iron, gold, diamonds, redstone, lapis, emeralds and more using
              balanced mid-late game progression.  
              <br /><br />
              Combine with UtilityCraft, Bonsais, and your automation setups to
              create fully automated production chains.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/bountiful-crops"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/bountiful-crops/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/bountiful-crops/"
                target="_blank">Wiki</a>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
