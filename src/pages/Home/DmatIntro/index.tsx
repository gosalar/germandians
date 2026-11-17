import { Button } from '@mantine/core';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import SourceNote from '@/components/SourceNote';
import { PAGE_LINKS, SECTIONS, destinationHref } from '@/utils/constants';

import { DMAT_INTRO_COPY as COPY, FORMAT_PARTS, LONGEST_PART, minutesLabel } from './data';
import styles from './styles.module.scss';

/** A bar drawn to scale: its width is the part's share of the longest part. */
function Bar({ minutes }: { minutes: number }) {
  return <span aria-hidden="true" className={styles.bar} style={{ '--share': minutes / LONGEST_PART } as CSSProperties} />;
}

/** A short lead-in to the dMAT guide and dMAT practice, with the test's running order drawn to scale. */
export default function DmatIntro() {
  return (
    <section id={SECTIONS.dmat} data-screen-label="dMAT" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h2 className={styles.title}>{COPY.title}</h2>
          <p className={styles.body}>{COPY.about}</p>
          <p className={styles.rule}>
            {COPY.rule}
            <SourceNote source={COPY.ruleSource} />
          </p>
        </div>

        <div className={styles.format}>
          <h3 className={styles.formatTitle}>
            <span lang="de">{COPY.format.de}</span> <span className={styles.formatEnglish}>{COPY.format.en}</span>
          </h3>
          <div aria-hidden="true" className={styles.formatRule} />
          <ol className={styles.parts}>
            {FORMAT_PARTS.map((part) => (
              <li key={part.name} data-tone={part.tone} className={styles.part}>
                <p className={styles.partHead}>
                  <span className={styles.partName}>{part.name}</span>
                  {part.minutes !== undefined && <span className={styles.time}>{minutesLabel(part.minutes)}</span>}
                  {part.note && <span className={styles.partNote}>{part.note}</span>}
                </p>
                {part.minutes !== undefined && <Bar minutes={part.minutes} />}
                {part.subtests && (
                  <ol className={styles.subtests}>
                    {part.subtests.map((subtest) => (
                      <li key={subtest.name} className={styles.subtest}>
                        <span className={styles.subtestName}>{subtest.name}</span>
                        <span className={styles.time}>{minutesLabel(subtest.minutes)}</span>
                        <Bar minutes={subtest.minutes} />
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
          <SourceNote source={COPY.format.source} />
        </div>

        <div className={styles.actions}>
          <p className={styles.practice}>{COPY.practice}</p>
          <div className={styles.buttons}>
            <Button component={Link} to={destinationHref(PAGE_LINKS.dmatPractice.destination)} variant="yellow-dark" size="lg">
              {COPY.practiceLink}
            </Button>
            <Button component={Link} to={destinationHref(PAGE_LINKS.dmat.destination)} variant="ring-dark" size="lg">
              {COPY.guideLink}
            </Button>
          </div>
          <p className={styles.independence}>{COPY.independence}</p>
        </div>
      </div>
    </section>
  );
}
