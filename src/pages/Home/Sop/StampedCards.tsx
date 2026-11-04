import { useEffect, useRef, useState } from 'react';

import { useReplayOnFirstView } from '@/hooks/useReplayOnFirstView';
import { prefersReducedMotion } from '@/utils/motion';

import styles from './styles.module.scss';

const RESTAMP_MS = 120;

const APPLICANTS = [
  {
    tab: 'Standard, non-personalised SOP',
    cgpa: '7.8 CGPA',
    backlogs: '0 backlogs',
    verdict: 'REJECTED',
    tone: 'rejected',
  },
  {
    tab: 'Germandians SOP, written with the student',
    cgpa: '7.1 CGPA',
    backlogs: '16 backlogs',
    verdict: 'ADMITTED',
    tone: 'admitted',
  },
] as const;

/** Two applicant cards whose verdict stamps thump down on first view, and again on click. */
export default function StampedCards() {
  const ref = useRef<HTMLDivElement>(null);
  const restamp = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [stamped, setStamped] = useState(true);

  useReplayOnFirstView(ref, { onHide: () => setStamped(false), onReveal: () => setStamped(true) });
  useEffect(() => () => clearTimeout(restamp.current), []);

  const replay = () => {
    if (prefersReducedMotion()) return;
    setStamped(false);
    clearTimeout(restamp.current);
    restamp.current = setTimeout(() => setStamped(true), RESTAMP_MS);
  };

  return (
    <div ref={ref} onClick={replay} className={styles.stampCards}>
      {APPLICANTS.map((applicant) => (
        <div key={applicant.tone} className={styles.applicant} data-tone={applicant.tone}>
          <div className={styles.applicantTab}>{applicant.tab}</div>
          <div className={styles.applicantCard}>
            <div className={styles.applicantStats}>
              <div className={styles.applicantCgpa}>{applicant.cgpa}</div>
              <div className={styles.applicantBacklogs}>{applicant.backlogs}</div>
              <div className={styles.applicantCycle}>Winter 2025 cycle</div>
            </div>
            <div className={styles.stamp} data-stamped={stamped}>
              {applicant.verdict}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
