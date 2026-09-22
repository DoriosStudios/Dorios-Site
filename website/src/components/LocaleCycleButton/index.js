import React from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

const localeLabels = {
  en: {flag: '🇺🇸', code: 'EN'},
  'pt-BR': {flag: '🇧🇷', code: 'PT'},
  'es-MX': {flag: '🇲🇽', code: 'ES'},
};

const changeLanguageLabels = {
  en: (language) => `Change language to ${language}`,
  'pt-BR': (language) => `Mudar idioma para ${language}`,
  'es-MX': (language) => `Cambiar idioma a ${language}`,
};

export default function LocaleCycleButton({className, mobile = false, onClick}) {
  const {i18n: {currentLocale, locales, localeConfigs}} = useDocusaurusContext();
  const {search, hash} = useLocation();
  const alternatePageUtils = useAlternatePageUtils();
  const currentIndex = Math.max(0, locales.indexOf(currentLocale));
  const nextLocale = locales[(currentIndex + 1) % locales.length];
  const current = localeLabels[currentLocale] ?? {flag: '🌐', code: currentLocale.slice(0, 2).toUpperCase()};
  const nextLabel = localeConfigs[nextLocale]?.label ?? nextLocale;
  const accessibleLabel = (changeLanguageLabels[currentLocale] ?? changeLanguageLabels.en)(nextLabel);

  const changeLocale = (event) => {
    onClick?.(event);
    const path = alternatePageUtils.createUrl({locale: nextLocale, fullyQualified: false});
    window.location.assign(`${path}${search}${hash}`);
  };

  return (
    <button
      type="button"
      className={clsx(styles.localeCycle, mobile && styles.mobile, className)}
      onClick={changeLocale}
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <span aria-hidden="true">{current.flag}</span>
      <strong>{current.code}</strong>
    </button>
  );
}
