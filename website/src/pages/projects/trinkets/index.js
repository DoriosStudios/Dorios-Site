import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css"; // Ruta global correcta

export default function DoriosTrinketsPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/trinkets/MCPEDL.png", blur: true  },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1173489/description_207d1f1f-7f5b-4d21-abb7-9f7e0337943b.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1173489/description_3c70f3d0-f654-4ed0-8908-7125a53f8ea0.png", blur: true  },
    { type: "youtube", id: "efHNR7n-tpI" }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Dorios’ Trinkets" description="Dorios’ Trinkets Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/trinkets/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Dorios’ Trinkets</h1>

        <p className={styles.heroSubtitle}>
          Powerful accessories. Dynamic effects. Endless customization.
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
    /* MODE BLUR */
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
    /* MODE NORMAL */
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
              Dorios’ Trinkets introduces a deep accessory system that expands
              player progression and customization. Equip up to 12 different slots
              and combine effects from 50 unique trinkets ranging from mobility,
              combat enhancements, magic protection, regeneration, mana boosts,
              lifesteal and much more.
              <br /><br />
              The system is fully dynamic, compatible with other addons, and
              stable scripting and modular expansion.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/dorios-trinkets"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/dorios-trinkets/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/dorios-trinkets/"
                target="_blank">Wiki</a>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
