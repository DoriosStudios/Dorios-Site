import React from 'react';
import clsx from 'clsx';
import {useThemeConfig, ErrorCauseBoundary, ThemeClassNames} from '@docusaurus/theme-common';
import {splitNavbarItems, useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import styles from './styles.module.css';

function NavbarItems({items}) {
  return items.map((item, index) => (
    <ErrorCauseBoundary
      key={index}
      onError={(error) => new Error(`A theme navbar item failed to render: ${JSON.stringify(item)}`, {cause: error})}
    >
      <NavbarItem {...item} />
    </ErrorCauseBoundary>
  ));
}

function NavbarContentLayout({left, right}) {
  return (
    <div className="navbar__inner">
      <div className={clsx(ThemeClassNames.layout.navbar.containerLeft, 'navbar__items')}>{left}</div>
      <div className={clsx(ThemeClassNames.layout.navbar.containerRight, 'navbar__items navbar__items--right')}>{right}</div>
    </div>
  );
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useThemeConfig().navbar.items;
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === 'search');
  const localeItems = rightItems.filter((item) => item.type === 'custom-localeCycle');
  const standardRightItems = rightItems.filter((item) => item.type !== 'custom-localeCycle');

  return (
    <NavbarContentLayout
      left={<>{!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}<NavbarLogo /><NavbarItems items={leftItems} /></>}
      right={<><NavbarItems items={standardRightItems} /><NavbarColorModeToggle className={styles.colorModeToggle} /><NavbarItems items={localeItems} />{!searchBarItem && <NavbarSearch><SearchBar /></NavbarSearch>}</>}
    />
  );
}
