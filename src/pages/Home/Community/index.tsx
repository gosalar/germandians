import { COMMUNITY, CONTACT, SECTIONS } from '@/utils/constants';

import { COPY, PRINCIPLES } from './data';
import styles from './styles.module.scss';

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
