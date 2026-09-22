import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const SITE_URL = 'https://doriosstudios.com';

function absoluteUrl(value) {
  if (!value) return null;
  try {
    return new URL(value, SITE_URL).href;
  } catch {
    return null;
  }
}

function concise(value, limit = 220) {
  if (!value) return '';
  const normalized = String(value).replace(/\s+/g, ' ').trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1).trimEnd()}…` : normalized;
}

function localePath(value, baseUrl) {
  if (!value || /^https?:\/\//i.test(value)) return value;
  const suffix = value.replace(/^\/+/, '');
  return `${baseUrl}${suffix}`;
}

const OPEN_GRAPH_LOCALES = {
  en: 'en_US',
  'pt-BR': 'pt_BR',
  'es-MX': 'es_MX',
};

export default function SocialMetadata({
  title,
  parent,
  type,
  description,
  path,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  largeImage = false,
}) {
  const {i18n: {currentLocale, localeConfigs}} = useDocusaurusContext();
  const canonicalUrl = absoluteUrl(localePath(path, localeConfigs[currentLocale].baseUrl));
  const imageUrl = absoluteUrl(image);
  const context = [parent, type].filter(Boolean).join(' · ');
  const summary = [context, concise(description)].filter(Boolean).join('\n');

  return (
    <Head>
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Dorios Studios" />
      <meta property="og:locale" content={OPEN_GRAPH_LOCALES[currentLocale] ?? OPEN_GRAPH_LOCALES.en} />
      {Object.entries(OPEN_GRAPH_LOCALES)
        .filter(([locale]) => locale !== currentLocale)
        .map(([locale, value]) => <meta key={locale} property="og:locale:alternate" content={value} />)}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={summary} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:alt" content={imageAlt ?? `${title} preview`} />}
      {imageUrl && imageWidth && <meta property="og:image:width" content={String(imageWidth)} />}
      {imageUrl && imageHeight && <meta property="og:image:height" content={String(imageHeight)} />}
      {imageUrl && <meta property="og:image:type" content="image/png" />}
      <meta name="twitter:card" content={largeImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={summary} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {imageUrl && <meta name="twitter:image:alt" content={imageAlt ?? `${title} preview`} />}
    </Head>
  );
}
