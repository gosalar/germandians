import { createContext } from 'react';

export interface PageChromeState {
  menuOpen: boolean;
  heroCtaInView: boolean;
  formInView: boolean;
}

export interface PageChromeActions {
  toggleMenu: () => void;
  closeMenu: () => void;
  heroCtaRef: (el: HTMLElement | null) => void;
  formRef: (el: HTMLElement | null) => void;
}

export const PageChromeStateContext = createContext<PageChromeState | null>(null);
export const PageChromeActionsContext = createContext<PageChromeActions | null>(null);
