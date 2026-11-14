import { INTAKE_SEATS, STUDENTS_PER_MENTOR } from '@/utils/constants';

import { WORKLOAD } from './data';
import styles from './styles.module.scss';

// Static and never changes, so built once at module load.
const studentDots = Array.from({ length: STUDENTS_PER_MENTOR.count }, (_, i) => (
  <span key={i} className={styles.studentDot} />
));
// One dot per place, not grouped by mentor.
const placeDots = Array.from({ length: INTAKE_SEATS }, (_, i) => <span key={i} className={styles.placeDot} />);

const arrow = (
  <div aria-hidden="true" className={styles.arrow}>
    ↓
  </div>
);

/** One mentor's students next to the intake places the per-mentor cap allows. */
export default function WorkloadDiagram() {
  const { mentor, intake } = WORKLOAD;

  return (
    <div className={styles.diagrams}>
      <div className={styles.diagram} data-tone="mentor">
        <div className={styles.diagramTitle}>{mentor.title}</div>
        <div className={styles.diagramBox}>{mentor.head}</div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramCrowd}`}>
          <div aria-hidden="true" className={styles.studentDots}>
            {studentDots}
          </div>
          <div className={styles.diagramStrong}>{mentor.crowd}</div>
        </div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramOutcome}`}>
          <div className={styles.diagramStrong}>{mentor.outcome}</div>
          <div className={styles.diagramNote}>{mentor.note}</div>
        </div>
      </div>

      <div className={styles.diagram} data-tone="intake">
        <div className={styles.diagramTitle}>{intake.title}</div>
        <div className={styles.diagramBox}>{intake.head}</div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramCrowd}`}>
          <div aria-hidden="true" className={styles.placeDots}>
            {placeDots}
          </div>
          <div className={styles.diagramStrong}>{intake.crowd}</div>
        </div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramOutcome}`}>
          <div className={styles.diagramStrong}>{intake.outcome}</div>
          <div className={styles.diagramNote}>{intake.note}</div>
        </div>
      </div>
    </div>
  );
}
