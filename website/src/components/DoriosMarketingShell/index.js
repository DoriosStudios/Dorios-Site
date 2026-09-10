import React from "react";
import Link from "@docusaurus/Link";
import { useColorMode } from "@docusaurus/theme-common";
import { IconBrandDiscord } from "@tabler/icons-react";
import "@fontsource-variable/league-spartan";
import "@fontsource-variable/space-grotesk";
import styles from "./styles.module.css";

const THEME_COOKIE = "dorios-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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

function navigationFor(project) {
  return [
    { label: "Projects", to: "/projects", key: "projects" },
    project && { label: "Project", to: project.routes.project, key: "project" },
    { label: "Wiki", to: project?.routes.wiki ?? "/wiki", key: "wiki" },
    {
      label: "Documentation",
      to: "/documentation/dorios_core/",
      key: "documentation",
    },
    { label: "Studio", to: "/studio", key: "studio" },
    { label: "Support", to: "/support", key: "support" },
  ].filter(Boolean);
}

function ThemeToggle() {
  const { colorMode, setColorMode } = useColorMode();
  const restoredTheme = React.useRef(false);
  const isDarkTheme = colorMode === "dark";
  const nextTheme = isDarkTheme ? "light" : "dark";
  const nextThemeLabel = isDarkTheme ? "Light" : "Dark";

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
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
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

function DoriosMark({ footer = false }) {
  const { colorMode } = useColorMode();
  const logoSource =
    colorMode === "light" ? "/img/black_no_bg.png" : "/img/white_no_bg.png";
  const blazingSource =
    colorMode === "light"
      ? "/img/blazing_animated_transparent.gif"
      : "/img/blazing_animated_transparent.gif";

  return (
    <span
      className={`${styles.brandMarkWrap}${footer ? ` ${styles.footerMarkWrap}` : ""}`}
      aria-hidden="true"
    >
      <img src={logoSource} alt="" className={styles.brandMark} />
      <img src={blazingSource} alt="" className={styles.blazingMark} />
    </span>
  );
}

export function DoriosHeader({ activePage, project }) {
  const navigation = navigationFor(project);
  return (
    <header className={styles.siteHeader}>
      <Link className={styles.brand} to="/" aria-label="Dorios Studios home">
        <DoriosMark />
        <span className={styles.brandLabel}>
          Dorios <em>Studios</em>
        </span>
      </Link>

      <nav className={styles.primaryNav} aria-label="Primary navigation">
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
        <ThemeToggle />
        <a
          className={styles.discordLink}
          href="https://discord.gg/x36H3ZtmK5"
          target="_blank"
          rel="noreferrer"
        >
          <span>Join Discord</span>
          <span className={styles.actionSeparator} aria-hidden="true" />
          <span className={styles.actionIcon} aria-hidden="true">
            <IconBrandDiscord role="presentation" />
          </span>
        </a>
      </div>
    </header>
  );
}

export function DoriosFooter() {
  return (
    <footer className={styles.siteFooter}>
      <Link className={styles.footerBrand} to="/">
        <DoriosMark footer />
        <span>Dorios Studios</span>
      </Link>
      <p>Creating bigger worlds, one addon at a time.</p>
      <div className={styles.footerLinks}>
        <Link to="/projects">Projects</Link>
        <Link to="/studio">Studio</Link>
        <Link to="/support">Support</Link>
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
}) {
  return (
    <div className={`dorios-marketing-page ${styles.shell}`}>
      <DoriosHeader activePage={activePage} project={project} />
      {children}
      <DoriosFooter />
    </div>
  );
}
