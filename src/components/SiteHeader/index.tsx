import { Button } from '@mantine/core';
import { useWindowEvent } from '@mantine/hooks';
import { useEffect, useRef, type FocusEvent } from 'react';
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
  const { menuOpen, immersive } = usePageChrome();
  const { toggleMenu, closeMenu } = usePageChromeActions();
  const nav = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const outsidePointer = useRef(false);
  const outsideTimer = useRef<number | null>(null);
  const pendingFocusReveal = useRef<HTMLElement | null>(null);

  const clearOutsideTimer = () => {
    if (outsideTimer.current !== null) {
      window.clearTimeout(outsideTimer.current);
      outsideTimer.current = null;
    }
  };

  useEffect(() => clearOutsideTimer, []);

  // Closing the in-flow phone menu shifts the document up; if focus just moved into the page,
  // bring that element back into the unobscured viewport below the sticky header.
  useEffect(() => {
    if (menuOpen) return;
    outsidePointer.current = false;
    clearOutsideTimer();
    const target = pendingFocusReveal.current;
    pendingFocusReveal.current = null;
    if (!target || document.activeElement !== target) return;
    if (getComputedStyle(target).position === 'fixed') return;
    const rect = target.getBoundingClientRect();
    const navBottom = nav.current?.getBoundingClientRect().bottom ?? 0;
    const cx = Math.max(0, Math.min(window.innerWidth - 1, rect.left + rect.width / 2));
    const cy = Math.max(0, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));
    const hit = document.elementFromPoint(cx, cy);
    const obscured =
      rect.top < navBottom ||
      rect.bottom > window.innerHeight ||
      !hit ||
      !(target.contains(hit) || hit.contains(target));
    if (obscured) {
      target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [menuOpen]);

  useWindowEvent('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      outsidePointer.current = false;
      clearOutsideTimer();
      pendingFocusReveal.current = null;
      closeMenu();
      trigger.current?.focus();
    }
  });

  // Track outside presses so collapsing the menu does not shift an outside target away before
  // mouseup/click activates it, while inside presses keep the panel open until a tap fires click.
  useWindowEvent('pointerdown', (event) => {
    if (!menuOpen) return;
    const target = event.target as Node | null;
    outsidePointer.current = !(target && nav.current?.contains(target));
    clearOutsideTimer();
  }, true);

  useWindowEvent('click', (event) => {
    if (!menuOpen) return;
    const target = event.target as Node | null;
    if (target && nav.current?.contains(target)) return;
    outsidePointer.current = false;
    clearOutsideTimer();
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body && !nav.current?.contains(active)) {
      pendingFocusReveal.current = active;
    }
    closeMenu();
  });

  useWindowEvent('pointerup', () => {
    if (!menuOpen || !outsidePointer.current) return;
    clearOutsideTimer();
    outsideTimer.current = window.setTimeout(() => {
      outsideTimer.current = null;
      if (!outsidePointer.current) return;
      outsidePointer.current = false;
      const active = document.activeElement;
      if (active instanceof HTMLElement && active !== document.body && !nav.current?.contains(active)) {
        pendingFocusReveal.current = active;
      }
      closeMenu();
    }, 0);
  }, true);

  useWindowEvent('pointercancel', () => {
    if (!outsidePointer.current) return;
    outsidePointer.current = false;
    clearOutsideTimer();
  }, true);

  useWindowEvent('focusin', (event) => {
    if (!menuOpen || outsidePointer.current) return;
    const target = event.target as Node | null;
    if (!target || nav.current?.contains(target)) return;
    if (target instanceof HTMLElement) pendingFocusReveal.current = target;
    closeMenu();
  });

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!menuOpen || outsidePointer.current) return;
    const next = event.relatedTarget as Node | null;
    // Ignore missing relatedTarget (menu scrollbar drags, non-focusable labels, or touch taps
    // before click) and internal focus moves within the nav boundary.
    if (!next || event.currentTarget.contains(next)) return;
    if (next instanceof HTMLElement) pendingFocusReveal.current = next;
    closeMenu();
  };

  // The brand goes to Home: scroll on Home, route there from every other page.
  const brandTo = pathname === ROUTES.home ? hashLink(SECTIONS.top) : `${ROUTES.home}#${SECTIONS.top}`;

  // A running test has the screen to itself.
  if (immersive) return null;

  return (
    <nav ref={nav} className={styles.nav} onBlur={handleBlur}>
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
