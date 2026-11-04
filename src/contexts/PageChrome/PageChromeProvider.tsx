import { useIntersection, useWindowEvent } from '@mantine/hooks';
import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { ROUTES } from '@/utils/constants';

import { PageChromeActionsContext, PageChromeStateContext, type PageChromeActions, type PageChromeState } from './context';

const VISIBILITY = { threshold: 0.05 };

/**
 * Narrow UI state shared by the nav, hero, contact form and the mobile action
 * bar: whether the menu is open and whether the hero CTAs or the form are on
 * screen. State and actions live in separate contexts so components that only
 * act never re-render when the state changes.
 */
export default function PageChromeProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const heroCta = useIntersection<HTMLElement>(VISIBILITY);
  const form = useIntersection<HTMLElement>(VISIBILITY);

  useWindowEvent('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  const state: PageChromeState = {
    menuOpen,
    // Only home prerenders an above-the-fold hero. Unobserved sections on
    // other pages are off screen, so their mobile action bar is available.
    heroCtaInView: heroCta.entry?.isIntersecting ?? (pathname === ROUTES.home),
    formInView: form.entry?.isIntersecting ?? false,
  };

  const actions: PageChromeActions = {
    toggleMenu: () => setMenuOpen((open) => !open),
    closeMenu: () => setMenuOpen(false),
    heroCtaRef: heroCta.ref,
    formRef: form.ref,
  };

  return (
    <PageChromeActionsContext value={actions}>
      <PageChromeStateContext value={state}>{children}</PageChromeStateContext>
    </PageChromeActionsContext>
  );
}
