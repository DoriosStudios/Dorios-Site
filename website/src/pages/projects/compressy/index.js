import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function CompressyPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/compressy/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1387104/description_e5f242b8-1909-40b4-b12a-122c9cd435a5.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1387104/description_5f1705cd-3a27-4953-80df-f0058b905752.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1387104/description_4981194f-12f2-4805-9fe8-2deeebd7570d.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1387104/description_34b38282-b0d7-4eb7-8adc-bdb0cad53b4a.png", blur: true },
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Compressy" description="Compressy Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/compressy/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Compressy</h1>

        <p className={styles.heroSubtitle}>
          Storage compression. Bulk blocks. Efficient resource packing.
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
              Compressy allows players to compact resources into higher-density
              blocks, freeing inventory and storage space while enabling automated
              crafting chains.
              <br /><br />
              With multiple compression tiers and support for common materials
              like cobblestone, dirt, sand, gravel, ores, and more, Compressy is
              designed to pair perfectly with Cobblestone Generators, UtilityCraft
              machines, Bonsais, and automated sorting systems.
              <br /><br />
              Ideal for skyblock, automation setups, and players seeking
              ultra-efficient storage solutions.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/compressy"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/compressy/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/compressy/"
                target="_blank">Wiki</a>

            </div>

          </div>

        </div>
      </div>

    </Layout>
  );
}
