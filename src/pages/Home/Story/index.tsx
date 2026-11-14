import { Link } from 'react-router';

import { ORIGIN_STORY, PAGE_LINKS, SECTIONS, destinationHref } from '@/utils/constants';

import { COPY, PRINCIPLES } from './data';
import styles from './styles.module.scss';

/** Where Germandians came from and who is behind it. The audience figure belongs to the community intro. */
export default function Story() {
  return (
    <section id={SECTIONS.story} data-screen-label="Our story" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.story}>
          <h2 className={styles.kicker}>{COPY.kicker}</h2>
          <span aria-hidden="true" className={styles.flagBar} />
          <p className={styles.body}>{ORIGIN_STORY}</p>
          <Link to={destinationHref(PAGE_LINKS.about.destination)} className={styles.aboutLink}>
            {COPY.aboutLink}
          </Link>
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
