import { Button } from '@mantine/core';
import { useWindowEvent } from '@mantine/hooks';
import { useRef } from 'react';
import BrandLink from '@/components/Brand';
import HomeSectionLink from '@/components/HomeSectionLink';
import { usePageChrome, usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { NAV_CTA, NAV_LINKS, SECTIONS, hashLink } from '@/utils/constants';

import styles from './styles.module.scss';

export default function SiteHeader() {
  const { menuOpen } = usePageChrome();
  const { toggleMenu, closeMenu } = usePageChromeActions();
  const trigger = useRef<HTMLButtonElement>(null);
  useWindowEvent('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu();
      trigger.current?.focus();
    }
  });

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <BrandLink to={hashLink(SECTIONS.top)} onClick={closeMenu} />

        <div className={styles.full}>
          <div className={styles.links}>
            {NAV_LINKS.map((link) => (
              <HomeSectionLink key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </HomeSectionLink>
            ))}
          </div>
          <Button component={HomeSectionLink} href={hashLink(NAV_CTA.id)} variant="navy" size="nav">
            {NAV_CTA.label}
          </Button>
        </div>

        <button
          ref={trigger}
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true" className={styles.burger} data-open={menuOpen}>
            <span />
            <span />
          </span>
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-menu" className={styles.menu}>
          {NAV_LINKS.map((link) => (
            <HomeSectionLink key={link.href} href={link.href} onClick={closeMenu} className={styles.menuLink}>
              {link.label}
            </HomeSectionLink>
          ))}
          <Button component={HomeSectionLink} href={hashLink(NAV_CTA.id)} onClick={closeMenu}
            variant="menu" size="menu" className={styles.menuCta}>
            {NAV_CTA.label}
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
