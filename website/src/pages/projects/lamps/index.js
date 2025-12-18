import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function RedstoneLampsPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/lamps/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_1f8cd601-65d4-4818-8785-ffff95fade32.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_2a4d9148-3720-4861-ae53-bff66180cecb.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_68132c7b-cbc5-4c3e-ae09-2ed9b10dba78.png", blur: true },
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Redstone Lamps" description="Redstone Lamps Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/lamps/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Redstone Lamps</h1>

        <p className={styles.heroSubtitle}>
          Enhanced lighting. Smooth activation. Decorative variants.
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
              Redstone Lamps enhances Minecraft lighting by adding multiple lamp
              designs, smoother activation states, and customizable decorative
              variants.  
              <br /><br />
              Whether you're building modern bases, magical academies, cities, or
              automation rooms, these lamps add aesthetic flair and better control
              over lighting setups.  
              <br /><br />
              Fully compatible with redstone systems, automation addons, and all
              Dorios blocks and decorative packs.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/redstone-lamps"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/redstone-lamps/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/redstone-lamps/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>

    </Layout>
  );
}
