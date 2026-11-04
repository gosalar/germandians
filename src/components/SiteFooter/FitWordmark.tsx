import { useEffect, useRef } from 'react';

import styles from './styles.module.scss';

const PROBE_SIZE = 100;
const FILL = 0.985;

/** "Germandians" sized so it spans the full footer width at any viewport. */
export default function FitWordmark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    let lastWidth = -1;

    const fit = () => {
      const available = box.clientWidth;
      if (available === lastWidth) return;
      lastWidth = available;
      el.style.fontSize = `${PROBE_SIZE}px`;
      const natural = el.scrollWidth;
      if (natural && available) el.style.fontSize = `${(((PROBE_SIZE * available) / natural) * FILL).toFixed(2)}px`;
    };

    const observer = new ResizeObserver(fit);
    observer.observe(box);
    // Measure again once the display font has loaded; fallback metrics differ.
    document.fonts?.ready.then(() => {
      lastWidth = -1;
      fit();
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wordmarkBox}>
      <div ref={ref} aria-hidden="true" className={styles.wordmark}>
        Germandians
      </div>
    </div>
  );
}
