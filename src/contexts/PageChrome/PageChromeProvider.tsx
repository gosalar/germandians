import { useIntersection, useWindowEvent } from '@mantine/hooks';
import { useState, type ReactNode } from 'react';

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
  const heroCta = useIntersection<HTMLElement>(VISIBILITY);
  const form = useIntersection<HTMLElement>(VISIBILITY);

  useWindowEvent('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  const state: PageChromeState = {
    menuOpen,
    heroCtaInView: heroCta.entry ? heroCta.entry.isIntersecting : true,
    formInView: form.entry ? form.entry.isIntersecting : false,
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
