import { Button } from '@mantine/core';
import { Link } from 'react-router';

import { GERMAN_LESSONS, PAGE_LINKS, SECTIONS, destinationHref } from '@/utils/constants';

import { LEARN_GERMAN_INTRO } from './data';
import styles from './styles.module.scss';

const NOTICE_ITEMS = [GERMAN_LESSONS.languages, GERMAN_LESSONS.charges, GERMAN_LESSONS.certificate];

/** A short pointer to the Learn German page, with the lesson terms in view. */
export default function LearnGermanIntro() {
  return (
    <section id={SECTIONS.learnGerman} data-screen-label="Learn German" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h2 className={styles.title}>{LEARN_GERMAN_INTRO.title}</h2>
          <p className={styles.body}>{LEARN_GERMAN_INTRO.body}</p>
        </div>

        <div className={styles.notice}>
          <p className={styles.noticeTitle}>
            <span lang="de">{LEARN_GERMAN_INTRO.noticeGerman}</span>{' '}
            <span className={styles.noticeEnglish}>{LEARN_GERMAN_INTRO.noticeEnglish}</span>
          </p>
          <div aria-hidden="true" className={styles.noticeRule} />
          <ul className={styles.noticeList}>
            {NOTICE_ITEMS.map((item) => (
              <li key={item}>
                <span aria-hidden="true" className={styles.noticeBullet} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          component={Link}
          to={destinationHref(PAGE_LINKS.learnGerman.destination)}
          variant="navy"
          size="lg"
          className={styles.link}
        >
          {LEARN_GERMAN_INTRO.link}
        </Button>
      </div>
    </section>
  );
}
