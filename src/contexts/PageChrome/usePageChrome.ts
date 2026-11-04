import { use } from 'react';

import { PageChromeActionsContext, PageChromeStateContext } from './context';

export function usePageChrome() {
  const ctx = use(PageChromeStateContext);
  if (!ctx) throw new Error('usePageChrome must be used inside <PageChromeProvider>');
  return ctx;
}

export function usePageChromeActions() {
  const ctx = use(PageChromeActionsContext);
  if (!ctx) throw new Error('usePageChromeActions must be used inside <PageChromeProvider>');
  return ctx;
}
