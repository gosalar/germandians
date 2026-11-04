import { useReducedMotion } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';

import { useReplayOnFirstView } from '@/hooks/useReplayOnFirstView';
import { prefersReducedMotion } from '@/utils/motion';

import { RECEIPT_ITEMS } from './data';
import styles from './styles.module.scss';

const PRINT_RESTART_MS = 80;

/** Till receipt that "prints" out of a slot when it first scrolls into view. */
export default function Receipt({ feeShort }: { feeShort: string }) {
  const clipRef = useRef<HTMLDivElement>(null);
  const restart = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [printed, setPrinted] = useState(true);
  const reducedMotion = useReducedMotion();

  const print = () => {
    if (prefersReducedMotion()) {
      setPrinted(true);
      return;
    }
    setPrinted(false);
    clearTimeout(restart.current);
    restart.current = setTimeout(() => setPrinted(true), PRINT_RESTART_MS);
  };

  useReplayOnFirstView(clipRef, { onHide: () => setPrinted(false), onReveal: print });
  useEffect(() => () => clearTimeout(restart.current), []);

  return (
    <div className={styles.printer}>
      <div className={styles.printerBody}>
        <div className={styles.slot} />
        <div ref={clipRef} className={styles.clip}>
          <div className={styles.paperRoll} data-printed={printed} data-animate={printed && !reducedMotion}>
            <div className={styles.paper}>
              <div className={styles.receiptTitle}>GERMANDIANS</div>
              <div className={styles.receiptSubtitle}>Studienberatung, Winter 2026 intake</div>
              <div className={styles.rule} />
              {RECEIPT_ITEMS.map((item) => (
                <div key={item} className={styles.line}>
                  <span>{item}</span>
                  <span>inkl.</span>
                </div>
              ))}
              <div className={styles.rule} />
              <div className={styles.total}>
                <span className={styles.totalLabel}>Due now</span>
                <span className={styles.totalAmount}>0,00 €</span>
              </div>
              <div className={styles.rule} />
              <div className={styles.line}>
                <span>Due after admission</span>
                <span className={styles.lineValue}>{feeShort}</span>
              </div>
              <div className={styles.line}>
                <span>Triggered by</span>
                <span className={styles.lineValue}>Your admission letter</span>
              </div>
              <div className={styles.rule} />
              <div className={styles.promise}>No admission, no service fee.</div>
              <div className={styles.barcode} />
              <div className={styles.thanks}>DANKE</div>
            </div>
            <div className={styles.tearEdge} />
          </div>
        </div>
      </div>
      <button type="button" onClick={print} className={styles.replay}>
        Replay receipt animation
      </button>
    </div>
  );
}
