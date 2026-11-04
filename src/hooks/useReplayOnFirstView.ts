import { useEffect, useEffectEvent, type RefObject } from 'react';

import { prefersReducedMotion } from '@/utils/motion';

const VIEW_THRESHOLD = 0.3;
const BELOW_FOLD = 0.9;

interface ReplayHandlers {
  /** Element starts below the fold: put it in its "before" state. */
  onHide: () => void;
  /** 30% of it has scrolled into view: play the animation. */
  onReveal: () => void;
}

/**
 * Content renders in its finished state. If it sits below the fold when the
 * page loads, it is reset and its animation plays the first time it scrolls
 * into view. Skipped entirely for reduced motion.
 */
export function useReplayOnFirstView(ref: RefObject<Element | null>, handlers: ReplayHandlers) {
  const onHide = useEffectEvent(handlers.onHide);
  const onReveal = useEffectEvent(handlers.onReveal);

  useEffect(() => {
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) return;

    let observer: IntersectionObserver | undefined;
    // Measure after the first paint, as the design does.
    const frame = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el || el.getBoundingClientRect().top <= window.innerHeight * BELOW_FOLD) return;
      onHide();
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer?.disconnect();
          onReveal();
        },
        { threshold: VIEW_THRESHOLD },
      );
      observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [ref]);
}
