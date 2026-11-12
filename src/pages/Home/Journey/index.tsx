import SourceNote from '@/components/SourceNote';
import { HOUSING, SOURCES } from '@/utils/applicationFacts';
import { SECTIONS } from '@/utils/constants';

import { JOURNEY_COPY, STAGES, STAGE_SOURCES } from './data';
import MonthExplorer from './MonthExplorer';
import styles from './styles.module.scss';

export default function Journey() {
  return (
    <section id={SECTIONS.journey} data-screen-label="Journey" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>From first call to first week in Germany</h2>
          <p className={styles.lede}>{JOURNEY_COPY.lede}</p>
        </div>

        <ol className={styles.stages}>
          {STAGES.map(({ phase, when, tag, lang }) => (
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
              <p className={styles.stageBody}>{phase.desc}</p>
            </li>
          ))}
        </ol>

        <div className={styles.stageNotes}>
          <p className={styles.explorerBody}>
            {HOUSING.preparation}
            <SourceNote source={SOURCES.housing} />
          </p>
          <div>
            <div className={styles.sourcesLabel}>{JOURNEY_COPY.sources}</div>
            {STAGE_SOURCES.map((source) => (
              <SourceNote key={source.url} source={source} />
            ))}
          </div>
        </div>

        <MonthExplorer />
      </div>
    </section>
  );
}
