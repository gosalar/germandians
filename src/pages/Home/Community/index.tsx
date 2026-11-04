import { CONTACT, SECTIONS } from '@/utils/constants';

import styles from './styles.module.scss';

const PRINCIPLES = [
  {
    title: 'We start from scratch',
    color: '#1d7a3d',
    body: 'You can come to us with no APS, no shortlist and no idea where to begin. We start there and take you through every step in order, from the first document to your first week in Germany.',
  },
  {
    title: 'We guide from experience',
    color: '#ef8a21',
    body: "All six of us went through APS, university applications, the blocked account, the visa and Anmeldung ourselves. You get what we learned doing it, plus what we've seen across 22,000 members' applications and questions.",
  },
];

export default function Community() {
  return (
    <section id={SECTIONS.community} data-screen-label="Community" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.story}>
          <h2 className={styles.kicker}>Why we are different</h2>
          <div className={styles.stat}>
            <span className={styles.statNumber}>22,000+</span>
            <span aria-hidden="true" className={styles.flagBar} />
            <span className={styles.statLabel}>students in the Germandians community</span>
          </div>
          <p className={styles.body}>
            Germandians began as a page where we answered questions from Indian students who wanted to study in
            Germany. More than 22,000 have joined since, and the consultancy grew out of what they kept asking us.
          </p>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className={styles.instagram}>
            See the community on Instagram
          </a>
        </div>

        <div className={styles.principles}>
          <h3 className={styles.motto}>By the students, for the students</h3>
          {PRINCIPLES.map((item) => (
            <div key={item.title} className={styles.principle}>
              <h3 className={styles.principleTitle}>
                <span aria-hidden="true" className={styles.swatch} style={{ background: item.color }} />
                <span>{item.title}</span>
              </h3>
              <p className={styles.principleBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
