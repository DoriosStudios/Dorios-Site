import React from 'react';
import Layout from '@theme/Layout';
import '@fontsource-variable/space-grotesk';
import DoriosMarketingShell from '../components/DoriosMarketingShell';
import styles from './support.module.css';

const communityLinks = [
  {
    id: 'discord',
    eyebrow: 'Community',
    title: 'Join our Discord',
    action: 'Meet the community',
    href: 'https://discord.gg/x36H3ZtmK5',
  },
  {
    id: 'youtube',
    eyebrow: 'Updates',
    title: 'Watch on YouTube',
    action: 'Watch the latest',
    href: 'https://www.youtube.com/@doriosstudios',
  },
  {
    id: 'github',
    eyebrow: 'Open work',
    title: 'Visit GitHub',
    action: 'Explore repositories',
    href: 'https://github.com/DoriosStudios',
  },
];

function BrandIcon({brand}) {
  if (brand === 'discord') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19.4 5.3A16.3 16.3 0 0 0 15.6 4l-.5 1a13.6 13.6 0 0 0-6.2 0l-.5-1a16.6 16.6 0 0 0-3.8 1.3C2.2 9 1.5 12.5 1.8 16a15.6 15.6 0 0 0 4.7 2.4l1.1-1.5a10 10 0 0 1-1.7-.9l.4-.3a11.6 11.6 0 0 0 11.4 0l.4.3a11 11 0 0 1-1.7.9l1.1 1.5a15.7 15.7 0 0 0 4.7-2.4c.4-4.1-.7-7.6-2.8-10.7ZM8.4 14.2c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
      </svg>
    );
  }

  if (brand === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" d="M12 .7a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.2.8-.5v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.5.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.8 5.4-5.5 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.6.8.5A11.5 11.5 0 0 0 12 .7Z" clipRule="evenodd" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function PatreonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 3h3.7v18H4zM15.2 3a6.2 6.2 0 1 1 0 12.4 6.2 6.2 0 0 1 0-12.4Z" />
    </svg>
  );
}

export default function SupportPage() {
  return (
    <Layout title="Support Dorios" description="Join and support the Dorios Studios community." noFooter>
      <DoriosMarketingShell activePage="support">
        <main className={styles.page}>
          <section className={styles.hero}>
            <p className={styles.kicker}>Community & support</p>
            <h1>The best worlds are <span>shared.</span></h1>
            <p className={styles.lead}>Follow the work, meet other players, and help keep Dorios addons free for everyone who wants to play.</p>
          </section>

          <section className={styles.communityCards} aria-label="Community links">
            {communityLinks.map((link) => (
              <a
                className={styles.communityCard}
                data-platform={link.id}
                href={link.href}
                key={link.id}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.title} (opens in a new tab)`}
              >
                <div className={styles.cardTopline}>
                  <span className={styles.brandIcon}><BrandIcon brand={link.id} /></span>
                  <span className={styles.externalIcon}><ExternalIcon /></span>
                </div>
                <div className={styles.communityCopy}>
                  <span>{link.eyebrow}</span>
                  <h2>{link.title}</h2>
                </div>
                <strong className={styles.cardAction}>
                  {link.action}
                  <ExternalIcon />
                </strong>
              </a>
            ))}
          </section>

          <section className={styles.callout} aria-labelledby="patreon-title">
            <div className={styles.calloutCopy}>
              <p className={styles.calloutKicker}>Keep it free</p>
              <h2 id="patreon-title">Help make the next world possible.</h2>
              <p>Direct support gives the studio more room to create, test, and improve the addons the community plays with.</p>
            </div>
            <a
              className={styles.patronPanel}
              href="https://www.patreon.com/DoriosStudios"
              target="_blank"
              rel="noreferrer"
              aria-label="Become a Patron (opens in a new tab)"
            >
              <span className={styles.patreonIcon}><PatreonIcon /></span>
              <span>Support Dorios</span>
              <strong>Become a Patron</strong>
              <i><ExternalIcon /></i>
            </a>
          </section>
        </main>
      </DoriosMarketingShell>
    </Layout>
  );
}
