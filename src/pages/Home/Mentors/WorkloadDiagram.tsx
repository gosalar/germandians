import styles from './styles.module.scss';

// Static and never changes, so built once at module load.
const studentDots = Array.from({ length: 5 }, (_, i) => <span key={i} className={styles.studentDot} />);
const agencyDots = Array.from({ length: 100 }, (_, i) => <span key={i} className={styles.agencyDot} />);

const arrow = (
  <div aria-hidden="true" className={styles.arrow}>
    ↓
  </div>
);

/** One mentor with five students next to one agent with a hundred. */
export default function WorkloadDiagram() {
  return (
    <div className={styles.diagrams}>
      <div className={styles.diagram} data-tone="ours">
        <div className={styles.diagramTitle}>Germandians</div>
        <div className={styles.diagramBox}>1 mentor</div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramCrowd}`}>
          <div aria-hidden="true" className={styles.studentDots}>
            {studentDots}
          </div>
          <div className={styles.diagramStrong}>Up to 5 students</div>
        </div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramOutcome}`}>
          <div className={styles.diagramStrong}>A shortlist for each student</div>
          <div className={styles.diagramNote}>Every application written for that one student</div>
        </div>
      </div>

      <div className={styles.diagram} data-tone="theirs">
        <div className={styles.diagramHead}>
          <div className={styles.diagramTitle}>Many agencies</div>
          <div className={styles.diagramSource}>As students in our community describe them</div>
        </div>
        <div className={styles.diagramBox}>1 agent</div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramCrowd}`}>
          <div aria-hidden="true" className={styles.agencyDots}>
            {agencyDots}
          </div>
          <div className={styles.diagramStrong}>100+ students</div>
        </div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramOutcome}`}>
          <div className={styles.diagramStrong}>1,000+ applications</div>
          <div className={styles.diagramNote}>About 10 each, so SOPs often get templated or reused</div>
        </div>
      </div>
    </div>
  );
}
