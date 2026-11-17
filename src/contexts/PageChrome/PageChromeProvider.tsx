import { useIntersection } from '@mantine/hooks';
import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { ROUTES } from '@/utils/constants';

import { PageChromeActionsContext, PageChromeStateContext, type PageChromeActions, type PageChromeState } from './context';

const VISIBILITY = { threshold: 0.05 };

/** Pages that prerender action buttons above the fold, so the phone action bar waits for them to scroll away. */
const ABOVE_FOLD_ACTIONS: readonly string[] = [ROUTES.home, ROUTES.requirements];

/** The prerender and static hosts report `/requirements/`; the routes are written without the slash. */
const withoutTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/**
 * Narrow UI state shared by the nav, hero, contact form and the mobile action
 * bar: whether the menu is open and whether the hero CTAs or the form are on
 * screen. State and actions live in separate contexts so components that only
 * act never re-render when the state changes.
 */
export default function PageChromeProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const [immersive, setImmersive] = useState(false);
  // A page that asked for the bare screen and was then left must not leave the next page without its header.
  const page = withoutTrailingSlash(pathname);
  const [immersivePage, setImmersivePage] = useState(page);
  if (immersivePage !== page) {
    setImmersivePage(page);
    setImmersive(false);
  }
  const heroCta = useIntersection<HTMLElement>(VISIBILITY);
  const form = useIntersection<HTMLElement>(VISIBILITY);

  const state: PageChromeState = {
    menuOpen,
    // Until the observer reports, assume the buttons are on screen on the pages
    // that open with them. Elsewhere the mobile action bar is available at once.
    heroCtaInView: heroCta.entry?.isIntersecting ?? ABOVE_FOLD_ACTIONS.includes(page),
    formInView: form.entry?.isIntersecting ?? false,
    immersive,
  };

  const actions: PageChromeActions = {
    toggleMenu: () => setMenuOpen((open) => !open),
    closeMenu: () => setMenuOpen(false),
    heroCtaRef: heroCta.ref,
    formRef: form.ref,
    setImmersive,
  };

  return (
    <PageChromeActionsContext value={actions}>
      <PageChromeStateContext value={state}>{children}</PageChromeStateContext>
    </PageChromeActionsContext>
  );
}
