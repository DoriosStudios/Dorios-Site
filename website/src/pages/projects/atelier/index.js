import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "../../projects/project.module.css";

export default function DoriosAtelierPage() {

  // GALERÍA PRINCIPAL
  const media = [
    { type: "image", src: "/img/addons/atelier/MCPEDL.png", blur: true },
    { type: "image", src: "https://github.com/DoriosStudios/Dorios-Atelier/blob/main/CurseForge/image.png?raw=true", blur: true },
    { type: "image", src: "https://github.com/DoriosStudios/Dorios-Atelier/blob/main/CurseForge/Chisels.png?raw=true" , blur: true},
    { type: "image", src: "https://github.com/DoriosStudios/Dorios-Atelier/blob/main/CurseForge/Gloves.png?raw=true" , blur: true}
  ];

  const [current, setCurrent] = useState(0);

  return (
    <Layout title="Dorios Atelier" description="Dorios Atelier Addon Page">

      {/* TOP BANNER */}
      <div
        className={styles.heroBanner}
        style={{
          backgroundImage: `url('/img/addons/atelier/MCPEDL.png')`
        }}
      >
        <div className={styles.heroOverlay}></div>

        <img src="/img/dorios_logo.png" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>Dorios’ Atelier</h1>

        <p className={styles.heroSubtitle}>
          Decorative mastery. Artisan blocks. Stylish interiors.
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
              Dorios’ Atelier is a decoration-focused addon designed to transform
              Minecraft interiors with high-quality furniture, artisan materials,
              detailed props, and elegant architectural elements.
              <br /><br />
              Whether you're building cozy homes, magical academies, modern cities
              or fantasy interiors, Atelier provides a wide palette of creative
              tools to push your builds to the next level.
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
                href="https://www.curseforge.com/minecraft-bedrock/addons/dorios-atelier"
                target="_blank">CurseForge</a>

              <a className={styles.button}
                href="https://mcpedl.com/dorios-atelier/"
                target="_blank">MCPEDL</a>

              <a className={styles.button}
                href="/docs/addons/dorios-atelier/"
                target="_blank">Wiki</a>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
