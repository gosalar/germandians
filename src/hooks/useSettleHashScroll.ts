import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Arriving at "/#contact-form" (from the privacy note or a shared link), the
 * router jumps to the target straight away, but web fonts that finish loading
 * afterwards shift the layout. Re-align once they're ready.
 */
export function useSettleHashScroll() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    });
    return () => {
      cancelled = true;
    };
    // Only on arrival; in-page anchor clicks are handled by the browser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
