import reichstag from '@/assets/images/reichstag.jpg';
import { siteConfig } from '@/utils/siteConfig';

import { COMPARISON, METHOD_POINTS, STATS } from './data';
import styles from './styles.module.scss';
import WorkloadDiagram from './WorkloadDiagram';

/** Three-column table from 760px up. */
function ComparisonTable() {
  return (
    <div role="table" className={styles.table}>
      <div role="row" className={styles.tableRow}>
        <div role="columnheader" className={styles.tableHeader} />
        <div role="columnheader" className={styles.tableHeader}>
          Many consultancies
        </div>
        <div role="columnheader" className={`${styles.tableHeader} ${styles.tableHeaderOurs}`}>
          Germandians
        </div>
      </div>
      {COMPARISON.map((row) => (
        <div key={row.topic} role="row" className={`${styles.tableRow} ${styles.tableBodyRow}`}>
          <div role="rowheader" className={styles.tableTopic}>
            {row.topic}
          </div>
          <div role="cell" className={styles.tableThem}>
            {row.them}
          </div>
          <div role="cell" className={styles.tableUs}>
            {row.us}
          </div>
        </div>
      ))}
    </div>
  );
}

/** One card per row below 760px. */
function ComparisonCards() {
  return (
    <div className={styles.compareCards}>
      {COMPARISON.map((row) => (
        <div key={row.topic} className={styles.compareCard}>
          <div className={styles.compareCardTopic}>{row.topic}</div>
          <div className={styles.compareCardThem}>
            <span className={styles.compareCardLabel}>Many consultancies</span>
            <span className={styles.compareCardThemText}>{row.them}</span>
          </div>
          <div className={styles.compareCardUs}>
            <span className={styles.compareCardLabel}>Germandians</span>
            <span className={styles.compareCardUsText}>{row.us}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Mentors() {
  return (
    <section id="why" data-screen-label="How we work" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <h2 className={styles.title}>How our mentors work</h2>
            <p className={styles.body}>
              Each of our six mentors works with up to five students at a time. That limit is what lets us write every
              SOP by hand and check every document before it goes out.
            </p>
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

        <div className={styles.stats}>
          {STATS.map((stat) => (
            <div key={stat.value} className={styles.stat} data-highlight={stat.highlight}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              {stat.highlight && siteConfig.showSeatCount ? (
                <div className={styles.seats}>{siteConfig.seatsLeft} places still open</div>
              ) : null}
            </div>
          ))}
        </div>

        <h3 className={styles.ratio}>
          <span className={styles.ratioOurs}>One mentor, up to five students.</span>
          <span className={styles.ratioTheirs}>Many agencies: one agent, 100 or more.</span>
        </h3>
        <WorkloadDiagram />
        <p className={styles.ratioNote}>
          A strong application takes about six months of work. With six mentors, capping {siteConfig.intake} at 30
          students keeps it to five per mentor.
        </p>

        <h3 className={styles.compareTitle}>Germandians vs. many consultancies</h3>
        <ComparisonTable />
        <ComparisonCards />
        <p className={styles.footnote}>
          The consultancy figures and descriptions reflect what students in our community commonly report. Individual
          agencies vary.
        </p>
      </div>
    </section>
  );
}
