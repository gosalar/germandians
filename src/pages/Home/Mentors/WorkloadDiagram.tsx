import { STUDENTS_PER_MENTOR, TEAM_SIZE } from '@/utils/constants';

import { WORKLOAD } from './data';
import styles from './styles.module.scss';

// Static and never changes, so built once at module load.
const studentDots = Array.from({ length: STUDENTS_PER_MENTOR.count }, (_, i) => (
  <span key={i} className={styles.studentDot} />
));
const teamGroups = Array.from({ length: TEAM_SIZE.count }, (_, group) => (
  <span key={group} className={styles.teamGroup}>
    {Array.from({ length: STUDENTS_PER_MENTOR.count }, (_, i) => (
      <span key={i} className={styles.teamDot} />
    ))}
  </span>
));

const arrow = (
  <div aria-hidden="true" className={styles.arrow}>
    ↓
  </div>
);

/** One mentor's students next to the whole team's places for the intake. */
export default function WorkloadDiagram() {
  const { mentor, team } = WORKLOAD;

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

      <div className={styles.diagram} data-tone="team">
        <div className={styles.diagramTitle}>{team.title}</div>
        <div className={styles.diagramBox}>{team.head}</div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramCrowd}`}>
          <div aria-hidden="true" className={styles.teamDots}>
            {teamGroups}
          </div>
          <div className={styles.diagramStrong}>{team.crowd}</div>
        </div>
        {arrow}
        <div className={`${styles.diagramBox} ${styles.diagramOutcome}`}>
          <div className={styles.diagramStrong}>{team.outcome}</div>
          <div className={styles.diagramNote}>{team.note}</div>
        </div>
      </div>
    </div>
  );
}
