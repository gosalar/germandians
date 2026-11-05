import { SECTIONS } from '@/utils/constants';

import styles from './styles.module.scss';

const ROWS = [
  {
    topic: 'Tuition',
    public: 'No tuition fees in most German states. You still pay a semester contribution each term.',
    private: 'Tuition fees apply, and they vary widely between universities.',
  },
  {
    topic: 'Admissions',
    public: 'Strict. Your earlier credits have to match the course requirements, and incomplete documents get rejected.',
    private: 'Usually more flexible. Quality varies a lot, and some schools are predatory.',
  },
  {
    topic: 'Reputation',
    public: 'The benchmark for German education, with a strong international reputation.',
    private: 'Depends entirely on the institution. We only apply to accredited, reputable ones.',
  },
  {
    topic: 'What we check',
    public: "Your ECTS credits against each course's prerequisites, your APS certificate, and every document on the checklist.",
    private: 'Accreditation, genuine industry connections, and whether the total cost makes sense for your career.',
  },
];

/** Two-column table from 760px up. */
function ComparisonTable() {
  return (
    <div role="table" aria-label="Public and private universities compared" className={styles.table}>
      <div role="row" className={styles.row}>
        <div role="columnheader" className={styles.publicHeader}>
          <h3 className={styles.publicTitle}>Public universities</h3>
        </div>
        <div role="columnheader" className={styles.privateHeader}>
          <h3 className={styles.privateTitle}>Private universities</h3>
        </div>
      </div>
      {ROWS.map((row) => (
        <div key={row.topic} role="row" className={styles.row}>
          <div role="cell" className={styles.publicCell}>
            <div className={styles.cellInner}>
              <div className={styles.cellTopic}>{row.topic}</div>
              <div className={styles.cellText}>{row.public}</div>
            </div>
          </div>
          <div role="cell" className={styles.privateCell}>
            <div className={styles.cellInner}>
              <div className={styles.cellTopic}>{row.topic}</div>
              <div className={styles.cellText}>{row.private}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stacked cards below 760px. */
function ComparisonCards() {
  return (
    <div className={styles.cards}>
      {ROWS.map((row) => (
        <div key={row.topic} className={styles.cardGroup}>
          <h3 className={styles.cardTopic}>{row.topic}</h3>
          <div className={styles.publicCard}>
            <span className={styles.cardLabel}>Public</span>
            <span className={styles.cardText}>{row.public}</span>
          </div>
          <div className={styles.privateCard}>
            <span className={styles.cardLabel}>Private</span>
            <span className={styles.cardText}>{row.private}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Universities() {
  return (
    <section id={SECTIONS.universities} data-screen-label="Public vs Private" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>Public vs. private, without the sales pitch</h2>
          <p className={styles.lede}>The same four points for both, so you can compare them directly.</p>
        </div>
        <ComparisonTable />
        <ComparisonCards />
      </div>
    </section>
  );
}
