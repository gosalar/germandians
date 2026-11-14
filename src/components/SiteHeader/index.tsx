import { Button } from '@mantine/core';
import { useWindowEvent } from '@mantine/hooks';
import { useRef } from 'react';
import { useLocation } from 'react-router';
import BrandLink from '@/components/Brand';
import HomeSectionLink from '@/components/HomeSectionLink';
import { usePageChrome, usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { DESTINATIONS, NAV_CTA, NAV_MENU, ROUTES, SECTIONS, destinationHref, hashLink } from '@/utils/constants';

import { HEADER_COPY } from './data';
import NavGroup from './NavGroup';
import styles from './styles.module.scss';

export default function SiteHeader() {
  const { pathname } = useLocation();
  const { menuOpen } = usePageChrome();
  const { toggleMenu, closeMenu } = usePageChromeActions();
  const trigger = useRef<HTMLButtonElement>(null);
  useWindowEvent('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu();
      trigger.current?.focus();
    }
  });
  // The brand goes to Home: scroll on Home, route there from every other page.
  const brandTo = pathname === ROUTES.home ? hashLink(SECTIONS.top) : `${ROUTES.home}#${SECTIONS.top}`;

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <BrandLink to={brandTo} onClick={closeMenu} />

        <div className={styles.full}>
          <div className={styles.links}>
            {NAV_MENU.map((entry) =>
              entry.kind === 'group' ? (
                <NavGroup key={entry.id} group={entry} />
              ) : (
                <HomeSectionLink key={entry.href} href={entry.href} className={styles.link}>
                  {entry.label}
                </HomeSectionLink>
              ),
            )}
          </div>
          <Button component={HomeSectionLink} href={destinationHref(DESTINATIONS.profileReview)} variant="navy" size="nav">
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
          <span>{menuOpen ? HEADER_COPY.close : HEADER_COPY.menu}</span>
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-menu" className={styles.menu}>
          {NAV_MENU.map((entry) =>
            entry.kind === 'group' ? (
              <div key={entry.id} role="group" aria-labelledby={`${entry.id}-label`} className={styles.menuGroup}>
                <p id={`${entry.id}-label`} className={styles.menuGroupLabel}>{entry.label}</p>
                {entry.links.map((link) => (
                  <HomeSectionLink key={link.href} href={link.href} onClick={closeMenu} className={styles.menuLink}>
                    {link.label}
                  </HomeSectionLink>
                ))}
              </div>
            ) : (
              <HomeSectionLink key={entry.href} href={entry.href} onClick={closeMenu} className={styles.menuLink}>
                {entry.label}
              </HomeSectionLink>
            ),
          )}
          <Button component={HomeSectionLink} href={destinationHref(DESTINATIONS.profileReview)} onClick={closeMenu}
            variant="menu" size="menu" className={styles.menuCta}>
            {NAV_CTA.label}
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
