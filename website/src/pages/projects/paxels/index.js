import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function PaxelsAIOTsPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/paxels/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_8e0992f9-c6a4-487d-b729-1e21b1635eca.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_2c64634a-041a-4b66-b8b6-b35e72c5a3fe.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_72047ed5-cd0d-40a5-bca5-c8ba2e5c9765.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/null/description_ec7cc904-aba9-4b06-b982-1c7efcbdde11.png", blur: true }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Paxels & AIOTs" description="Paxels & AIOTs Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/paxels/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Paxels & AIOTs</h1>

        <p className={styles.heroSubtitle}>
          Multi-tools. Versatility. Ultimate mining efficiency.
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
              Paxels & AIOTs introduces powerful multi-tools that combine the
              functionality of pickaxes, axes, shovels, hoes, and more — all in a
              single item.
              <br /><br />
              Every tier follows a balanced progression from stone to netherite,
              with additional support for custom materials in modded experiences.
              <br /><br />
              Ideal for explorers, fast miners, speedrunners, and automation setups
              that require one tool to do everything without switching items.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/paxels-aiots"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/paxels-aiots/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/paxels-aiots/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
