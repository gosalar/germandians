import { useRef, useState } from 'react';

import { useReplayOnFirstView } from '@/hooks/useReplayOnFirstView';

import { STAMP_COPY } from './data';
import styles from './styles.module.scss';

/**
 * "Für dich": the rubber stamp on a topic the visitor's answers point to. It lands once: straight
 * away when the card is on screen, otherwise the first time the card scrolls into view. Without
 * motion it simply appears.
 */
export default function Stamp() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [waiting, setWaiting] = useState(false);
  useReplayOnFirstView(ref, { onHide: () => setWaiting(true), onReveal: () => setWaiting(false) });

  return (
    <p ref={ref} className={styles.stamp} data-waiting={waiting || undefined}>
      <span lang="de" className={styles.stampWord}>
        {STAMP_COPY.word}
      </span>{' '}
      <span className={styles.stampNote}>{STAMP_COPY.note}</span>
    </p>
  );
}
