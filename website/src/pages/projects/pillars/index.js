import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function EffectPillarsPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/pillars/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_c5f02ffd-a1b8-4a27-8c8b-d10009d5a7f0.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1089788/description_7281f696-357e-4fc0-8831-bbe489bde69f.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1089788/description_cfeb01a2-eded-46c1-b1d9-17569102bb17.png" },
    { type: "youtube", id: "sYMPPDE2VX4" }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Effect Pillars" description="Effect Pillars Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/pillars/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Effect Pillars</h1>

        <p className={styles.heroSubtitle}>
          Area boosts. Status auras. Strategic support structures.
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
              Effect Pillars introduces a set of magical totem-like structures
              that emit powerful area effects to nearby players.
              <br /><br />
              Place a pillar and it will continuously apply buffs such as speed,
              regeneration, resistance, night vision, haste, and many more — perfect
              for bases, farms, mob grinders, or cooperative gameplay setups.
              <br /><br />
              Each pillar can be upgraded, expanded, or combined with other addons
              like UtilityCraft, Bountiful Crops, and endless RPG-style builds.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/effect-pillars"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/effect-pillars/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/effect-pillars/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
