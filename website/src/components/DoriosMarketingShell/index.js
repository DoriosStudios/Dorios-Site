import React from "react";
import Link from "@docusaurus/Link";
import {useLocation} from '@docusaurus/router';
import { useColorMode } from "@docusaurus/theme-common";
import { IconBrandDiscord, IconMenu2, IconSearch, IconX } from "@tabler/icons-react";
import useOverlayPanel from '../useOverlayPanel';
import LocaleCycleButton from "../LocaleCycleButton";
import { useSiteI18n } from "../../i18n/site";
import "@fontsource-variable/league-spartan";
import "@fontsource-variable/space-grotesk";
import styles from "./styles.module.css";

const THEME_COOKIE = "dorios-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const GlobalSearch = React.lazy(() => import('./GlobalSearch'));

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

function writeCookie(name, value) {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${THEME_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
}

function navigationFor(project, t) {
  return [
    { label: t("projects"), to: "/projects", key: "projects" },
    { label: t("wiki"), to: project?.routes.wiki ?? "/wiki", key: "wiki" },
    {
      label: t("documentation"),
      to: "/documentation/dorios_core/",
      key: "documentation",
    },
    { label: t("studio"), to: "/studio", key: "studio" },
    { label: t("support"), to: "/support", key: "support" },
  ].filter(Boolean);
}

function ThemeToggle() {
  const { t } = useSiteI18n();
  const { colorMode, setColorMode } = useColorMode();
  const restoredTheme = React.useRef(false);
  const isDarkTheme = colorMode === "dark";
  const nextTheme = isDarkTheme ? "light" : "dark";
  const nextThemeLabel = isDarkTheme ? t("light") : t("dark");

  React.useEffect(() => {
    const savedTheme = readCookie(THEME_COOKIE);
    if (!restoredTheme.current) {
      restoredTheme.current = true;
      if ((savedTheme === "light" || savedTheme === "dark") && savedTheme !== colorMode) {
        setColorMode(savedTheme);
        return;
      }
    }
    writeCookie(THEME_COOKIE, colorMode);
  }, [colorMode, setColorMode]);

  const changeTheme = () => {
    writeCookie(THEME_COOKIE, nextTheme);
    setColorMode(nextTheme);
  };

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={changeTheme}
      aria-label={t("switchTheme", {theme: nextThemeLabel})}
      title={t("switchTheme", {theme: nextThemeLabel})}
    >
      <span className={styles.actionIcon} aria-hidden="true">
        {isDarkTheme ? (
          <svg viewBox="0 0 24 24" role="presentation">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="M20.25 15.25A8.5 8.5 0 0 1 8.75 3.75a8.5 8.5 0 1 0 11.5 11.5Z" />
          </svg>
        )}
      </span>
      <span className={styles.actionSeparator} aria-hidden="true" />
      <span className={styles.themeToggleLabel}>{nextThemeLabel}</span>
    </button>
  );
}

function BrandLink({footer = false, children, ...props}) {
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const allowsMotion = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return <Link {...props} onPointerEnter={() => setHovered(allowsMotion())} onPointerLeave={() => setHovered(false)}
    onFocus={() => setFocused(allowsMotion())} onBlur={() => setFocused(false)}>
    <DoriosMark footer={footer} active={hovered || focused}/>{children}
  </Link>;
}

function DoriosMark({ footer = false, active = false }) {
  const { colorMode } = useColorMode();
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => { if (!active) setReady(false); }, [active]);
  const logoSource =
    colorMode === "light" ? "/img/optimized/black_no_bg.webp" : "/img/optimized/white_no_bg.webp";

  return (
    <span
      className={`${styles.brandMarkWrap}${footer ? ` ${styles.footerMarkWrap}` : ""}${active && ready ? ` ${styles.animationReady}` : ""}`}
      aria-hidden="true"
    >
      <img src={logoSource} alt="" width={30} height={30} decoding="async" className={styles.brandMark} />
      {active && <img src="/img/optimized/blazing_animated_transparent.webp" alt="" width={30} height={30} decoding="async" onLoad={() => setReady(true)} onError={() => setReady(false)} className={styles.blazingMark} />}
    </span>
  );
}

export function DoriosHeader({ activePage, project, onSearch, onMenuOpen, searchOpen }) {
  const { t } = useSiteI18n();
  const navigation = navigationFor(project, t);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = React.useState(false);
  const menuRef = React.useRef(null), menuButtonRef = React.useRef(null);
  const searchPanelRef = React.useRef(null), searchButtonRef = React.useRef(null);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  const closeSearch = React.useCallback(() => setGlobalSearchOpen(false), []);
  useOverlayPanel(menuOpen, closeMenu, menuRef, menuButtonRef, {lockScroll: true});
  useOverlayPanel(globalSearchOpen, closeSearch, searchPanelRef, searchButtonRef, {lockScroll:true});
  React.useEffect(() => {closeMenu(); closeSearch();}, [location.pathname, closeMenu, closeSearch]);
  const activateSearch = React.useCallback(() => {closeMenu(); if (onSearch) onSearch(); else setGlobalSearchOpen(true);}, [closeMenu,onSearch]);
  React.useEffect(() => {
    const shortcut = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); event.stopImmediatePropagation(); activateSearch();
      }
    };
    document.addEventListener('keydown', shortcut, true);
    return () => document.removeEventListener('keydown', shortcut, true);
  }, [activateSearch]);
  React.useEffect(() => {
    const media = window.matchMedia('(min-width: 1051px)');
    const closeOnDesktop = () => { if (media.matches) closeMenu(); };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, [closeMenu]);
  return (
    <header className={styles.siteHeader}>
      <BrandLink className={styles.brand} to="/" aria-label={t("homeLabel")}>
        <span className={styles.brandLabel}>
          Dorios <em>Studios</em>
        </span>
      </BrandLink>

      <nav className={styles.primaryNav} aria-label={t("primaryNavigation")}>
        {navigation.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            aria-current={activePage === item.key ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.headerActions}>
        <div className={styles.desktopAction}><ThemeToggle /></div>
        <LocaleCycleButton className={styles.localeSwitcher} />
        <a
          className={`${styles.discordLink} ${styles.desktopAction}`}
          href="https://discord.gg/x36H3ZtmK5"
          target="_blank"
          rel="noreferrer"
        >
          <span>{t("joinDiscord")}</span>
          <span className={styles.actionSeparator} aria-hidden="true" />
          <span className={styles.actionIcon} aria-hidden="true">
            <IconBrandDiscord role="presentation" />
          </span>
        </a>
        <button type="button" className={styles.mobileAction} ref={searchButtonRef} onClick={activateSearch} aria-label={t('searchWiki')} aria-expanded={onSearch ? searchOpen : globalSearchOpen} aria-controls={onSearch ? 'wiki-search-panel' : 'dorios-global-search'}><IconSearch aria-hidden="true" size={21}/></button>
        <button type="button" className={styles.mobileAction} ref={menuButtonRef} onClick={() => {closeSearch(); if (!menuOpen) onMenuOpen?.(); setMenuOpen(open => !open);}}
          aria-expanded={menuOpen} aria-controls="dorios-main-menu" aria-label={t(menuOpen ? 'closeMenu' : 'openMenu')}>
          {menuOpen ? <IconX aria-hidden="true" size={23}/> : <IconMenu2 aria-hidden="true" size={23}/>}
        </button>
      </div>
      {menuOpen && <>
        <div className={styles.menuBackdrop} onClick={closeMenu} aria-hidden="true"/>
        <div id="dorios-main-menu" className={styles.mobileMenu} ref={menuRef} role="dialog" aria-modal="true" aria-label={t('primaryNavigation')}>
          <button type="button" className={styles.menuClose} onClick={closeMenu}><IconX size={20} aria-hidden="true"/>{t('closeMenu')}</button>
          <nav aria-label={t('primaryNavigation')}>{navigation.map(item => <Link key={item.key} to={item.to} onClick={closeMenu} aria-current={activePage === item.key ? 'page' : undefined}>{item.label}</Link>)}</nav>
          <div className={styles.menuActions}><ThemeToggle/><a className={styles.discordLink} href="https://discord.gg/x36H3ZtmK5" onClick={closeMenu} target="_blank" rel="noreferrer"><IconBrandDiscord size={21} aria-hidden="true"/>{t('joinDiscord')}</a></div>
        </div>
      </>}
      {globalSearchOpen && <>
        <div className={styles.menuBackdrop} onClick={closeSearch} aria-hidden="true"/>
        <div id="dorios-global-search" className={styles.globalSearchPanel} ref={searchPanelRef} role="dialog" aria-modal="true" aria-label={t('searchWiki')}>
          <button type="button" className={styles.menuClose} onClick={closeSearch}><IconX size={20} aria-hidden="true"/>{t('closeSearch')}</button>
          <React.Suspense fallback={<div className={styles.searchLoading} aria-hidden="true"/>}><GlobalSearch onNavigate={closeSearch}/></React.Suspense>
        </div>
      </>}
    </header>
  );
}

export function DoriosFooter() {
  const { t } = useSiteI18n();
  return (
    <footer className={styles.siteFooter}>
      <BrandLink className={styles.footerBrand} to="/" footer>
        <span>Dorios Studios</span>
      </BrandLink>
      <p>{t("footerTagline")}</p>
      <div className={styles.footerLinks}>
        <Link to="/projects">{t("projects")}</Link>
        <Link to="/studio">{t("studio")}</Link>
        <Link to="/support">{t("support")}</Link>
        <a
          href="https://github.com/DoriosStudios"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
      <small>© {new Date().getFullYear()} Dorios Studios</small>
    </footer>
  );
}

export default function DoriosMarketingShell({
  activePage,
  project,
  children,
  onSearch,
  onMenuOpen,
  searchOpen,
}) {
  return (
    <div className={`dorios-marketing-page ${styles.shell}`}>
      <DoriosHeader activePage={activePage} project={project} onSearch={onSearch} searchOpen={searchOpen} onMenuOpen={onMenuOpen} />
      {children}
      <DoriosFooter />
    </div>
  );
}
