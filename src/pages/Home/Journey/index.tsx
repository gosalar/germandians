import { SECTIONS } from '@/utils/constants';

import { STAGES } from './data';
import MonthExplorer from './MonthExplorer';
import styles from './styles.module.scss';

export default function Journey() {
  return (
    <section id={SECTIONS.journey} data-screen-label="Journey" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>From first call to first week in Germany</h2>
          <p className={styles.lede}>The whole process takes 6–7 months, in four stages.</p>
        </div>

        <ol className={styles.stages}>
          {STAGES.map(({ phase, when, tag, lang, body }) => (
            <li key={phase.n} className={styles.stage}>
              <div aria-hidden="true" className={styles.stageBar} style={{ background: phase.color }} />
              <div className={styles.stageMeta}>
                <span className={styles.stageWhen}>{when}</span>
                {tag ? (
                  <span lang={lang} className={styles.stageTag} style={{ color: phase.ink }}>
                    {tag}
                  </span>
                ) : null}
              </div>
              <h3 className={styles.stageTitle}>{phase.name}</h3>
              <p className={styles.stageBody}>{body}</p>
            </li>
          ))}
        </ol>

        <MonthExplorer />
      </div>
    </section>
  );
}
