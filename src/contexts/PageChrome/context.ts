import { createContext } from 'react';

export interface PageChromeState {
  menuOpen: boolean;
  heroCtaInView: boolean;
  formInView: boolean;
  /** A test is on screen: the header, the footer and the phone action bar are not rendered. */
  immersive: boolean;
}

export interface PageChromeActions {
  toggleMenu: () => void;
  closeMenu: () => void;
  heroCtaRef: (el: HTMLElement | null) => void;
  formRef: (el: HTMLElement | null) => void;
  setImmersive: (on: boolean) => void;
}

export const PageChromeStateContext = createContext<PageChromeState | null>(null);
export const PageChromeActionsContext = createContext<PageChromeActions | null>(null);
