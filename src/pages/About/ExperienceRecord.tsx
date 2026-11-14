import { useId } from 'react';

import { EXPERIENCE_RECORD } from './data';
import styles from './styles.module.scss';

const tick = (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.tick}>
    <path pathLength={1} d="M4.5 12.5l4.8 4.8L19.5 6.5" className={styles.tickMark} />
  </svg>
);

/**
 * The steps every mentor took themselves, filled in and stamped like a German form. The ticks and the
 * stamp are drawn in on load when motion is allowed; without motion, or before CSS animation runs, the
 * record shows finished.
 */
export default function ExperienceRecord() {
  const titleId = useId();
  const { title, stepColumn, doneColumn, steps, stamp } = EXPERIENCE_RECORD;

  return (
    <div className={styles.record}>
      <div className={styles.recordHead}>
        <div lang="de" className={styles.recordTitle}>
          {title.de}
        </div>
        <div id={titleId} className={styles.recordSubtitle}>
          {title.en}
        </div>
      </div>
      <div className={styles.recordRule} />
      <div aria-hidden="true" className={styles.recordColumns}>
        <span>
          <span lang="de">{stepColumn.de}</span> / {stepColumn.en}
        </span>
        <span>
          <span lang="de">{doneColumn.de}</span> / {doneColumn.en}
        </span>
      </div>
      <ol aria-labelledby={titleId} className={styles.recordSteps}>
        {steps.map((step, index) => (
          <li key={step.id} className={styles.recordStep}>
            <span aria-hidden="true" className={styles.stepNumber}>
              {index + 1}
            </span>
            <span className={styles.stepText}>
              <span lang="de" className={styles.stepTerm}>
                {step.de}
              </span>
              <span className={styles.stepTranslation}>{step.en}</span>
            </span>
            <span aria-hidden="true" className={styles.stepBox}>
              {tick}
            </span>
          </li>
        ))}
      </ol>
      <div aria-hidden="true" className={styles.recordFoot}>
        <div className={styles.stamp}>
          <div lang="de" className={styles.stampTitle}>
            {stamp.de}
          </div>
          <div className={styles.stampNote}>{stamp.en}</div>
        </div>
      </div>
    </div>
  );
}
