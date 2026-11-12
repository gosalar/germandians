import reichstag from '@/assets/images/reichstag.jpg';
import { SECTIONS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import { COMMITMENTS, MENTOR_COPY, METHOD_POINTS } from './data';
import styles from './styles.module.scss';
import WorkloadDiagram from './WorkloadDiagram';

/** Two-column table from 760px up. */
function CommitmentsTable() {
  return (
    <div role="table" aria-label={MENTOR_COPY.commitmentsTitle} className={styles.table}>
      <div role="row" className={styles.tableRow}>
        <div role="columnheader" className={styles.tableHeader}>
          {MENTOR_COPY.topicHeader}
        </div>
        <div role="columnheader" className={`${styles.tableHeader} ${styles.tableHeaderOurs}`}>
          {MENTOR_COPY.commitmentHeader}
        </div>
      </div>
      {COMMITMENTS.map((row) => (
        <div key={row.topic} role="row" className={`${styles.tableRow} ${styles.tableBodyRow}`}>
          <div role="rowheader" className={styles.tableTopic}>
            {row.topic}
          </div>
          <div role="cell" className={styles.tableUs}>
            {row.commitment}
          </div>
        </div>
      ))}
    </div>
  );
}

/** One card per row below 760px. */
function CommitmentCards() {
  return (
    <div className={styles.compareCards}>
      {COMMITMENTS.map((row) => (
        <div key={row.topic} className={styles.compareCard}>
          <div className={styles.compareCardTopic}>{row.topic}</div>
          <div className={styles.compareCardUs}>{row.commitment}</div>
        </div>
      ))}
    </div>
  );
}

export default function Mentors() {
  return (
    <section id={SECTIONS.mentors} data-screen-label="How we work" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <h2 className={styles.title}>{MENTOR_COPY.title}</h2>
            <p className={styles.body}>{MENTOR_COPY.intro}</p>
            <ul className={styles.points}>
              {METHOD_POINTS.map((point) => (
                <li key={point.text}>
                  <span className={styles.pointBullet} style={{ background: point.color }} />
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.photo}>
            <img
              src={reichstag}
              alt="A student with a backpack looking at the Reichstag building in Berlin"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <h3 className={styles.ratio}>{MENTOR_COPY.ratio}</h3>
        <WorkloadDiagram />
        {siteConfig.showSeatCount ? <p className={styles.seats}>{siteConfig.seatsLeft} places still open</p> : null}

        <h3 className={styles.compareTitle}>{MENTOR_COPY.commitmentsTitle}</h3>
        <CommitmentsTable />
        <CommitmentCards />
      </div>
    </section>
  );
}
