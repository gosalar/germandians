import DmatNote from '@/components/DmatNote';
import { COMMUNITY, CONTACT, SECTIONS } from '@/utils/constants';
import { REVIEW_OUTCOME } from '@/utils/siteConfig';

import styles from './styles.module.scss';

const COPY = {
  kicker: 'Where we started',
  story: 'Germandians began as a page where we answered questions from Indian students who wanted to study in Germany. The consultancy grew out of what they kept asking us.',
  instagram: 'See the community on Instagram',
  motto: 'By the students, for the students',
} as const;

const PRINCIPLES = [
  {
    title: 'We start from scratch',
    color: '#1d7a3d',
    body: (
      <>
        {`You can come to us before you have APS or a shortlist. We start with your profile and take the steps in order from there. ${REVIEW_OUTCOME}`}
        <br />
        <DmatNote />
      </>
    ),
  },
  {
    title: 'We guide from experience',
    color: '#ef8a21',
    body: 'All six of us went through APS, university applications, the blocked account, the visa and Anmeldung ourselves. You get what we learned doing it, and what the questions from our community have taught us since.',
  },
];

export default function Community() {
  return (
    <section id={SECTIONS.community} data-screen-label="Community" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.story}>
          <h2 className={styles.kicker}>{COPY.kicker}</h2>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{COMMUNITY.size}</span>
            <span aria-hidden="true" className={styles.flagBar} />
            <span className={styles.statLabel}>{COMMUNITY.label}</span>
          </div>
          <p className={styles.body}>{COPY.story}</p>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className={styles.instagram}>
            {COPY.instagram}
          </a>
        </div>

        <div className={styles.principles}>
          <h3 className={styles.motto}>{COPY.motto}</h3>
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
