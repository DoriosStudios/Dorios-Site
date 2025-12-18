import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function CobblestoneGeneratorsPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/cobble_gens/MCPEDL.png", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1086676/description_3aaf29fb-f12c-4005-9d63-c82a2c224aee.png", blur: true },
    { type: "image", src: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjlqZXFwb3NianpwdTM5c3VpZmVyaG0wanNkcnA4eGd0cGp6ZTllNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8q4lUQHERAMbNFVW2e/giphy.gif", blur: true },
    { type: "image", src: "https://media.forgecdn.net/attachments/description/1086676/description_711454ae-fb73-496e-b58e-ff11dd9bfdb7.png", blur: true },
    { type: "youtube", id: "8pn38u3DIcc" } // cambia si tienes trailer real
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Cobblestone Generators" description="Cobblestone Generators Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/cobble_gens/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Cobblestone Generators</h1>

        <p className={styles.heroSubtitle}>
          Infinite cobble. Smooth automation. Simple progression.
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
              Cobblestone Generators offers an efficient, scalable, and lag-free
              solution for infinite cobble production. No more lava and water
              contraptions — just straightforward generators that fit perfectly in
              skyblock worlds, automation setups, and early-game progression.
              <br /><br />
              Upgrade through multiple tiers to increase production speed, reduce
              space usage, and integrate with your existing UtilityCraft machines
              and item transport systems.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/cobblestone-generators"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/cobblestone-generators/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/cobblestone-generators/"
                target="_blank">Wiki</a>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
