import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function BountifulTreesPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/trees/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1310972/description_ab47f0ea-49d6-438e-98f8-b139fc1febae.png", blur: true }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Bountiful Trees" description="Bountiful Trees Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/trees/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Bountiful Trees</h1>

        <p className={styles.heroSubtitle}>
          More wood types. Custom leaves. Beautiful forestry expansion.
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

            {/* RIGHT — MINIATURES */}
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
              Bountiful Trees adds a large collection of new trees, leaves, wood
              variants, and naturally generating species to enrich Minecraft
              forests and landscapes.
              <br /><br />
              Each tree has its own color palette, canopy style, log texture and
              sapling behavior. This addon is perfect for builders, world creators,
              modpack authors, and anyone wanting a fresh forestry experience.
              <br /><br />
              Fully compatible with Bountiful Bonsais, allowing passive farming
              of new wood types through upgraded soils and bonsai containers.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/bountiful-trees"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/bountiful-trees/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/bountiful-trees/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
