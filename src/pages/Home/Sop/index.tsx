import { Button } from '@mantine/core';
import { NAV_CTA, SECTIONS, hashLink } from '@/utils/constants';

import { REVISION_NOTES, SOP_COPY } from './data';
import StampedCards from './StampedCards';
import styles from './styles.module.scss';

export default function Sop() {
  return (
    <section id={SECTIONS.sop} data-screen-label="SOP" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <h2 className={styles.title}>{SOP_COPY.title}</h2>
          <div className={styles.introCopy}>
            {SOP_COPY.intro.map((paragraph) => (
              <p key={paragraph} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.rewriteHead}>
          <h3 className={styles.subTitle}>{SOP_COPY.exampleTitle}</h3>
          <p className={styles.disclaimer}>{SOP_COPY.exampleLabel}</p>
        </div>
        <div className={styles.drafts}>
          <div className={styles.genericDraft}>
            <div className={styles.draftLabel}>{SOP_COPY.genericLabel}</div>
            <p className={styles.draftText}>
              Since my childhood I have always been passionate about mechanical engineering. I am a hardworking,
              dedicated and sincere student. Due to some personal reasons I had backlogs, but I cleared them all and I
              am now fully ready for a master's degree in Germany.
            </p>
          </div>
          <div className={styles.rewrittenDraft}>
            <div className={styles.draftLabel}>{SOP_COPY.revisedLabel}</div>
            <p className={styles.draftText}>
              <mark className={styles.highlight}>
                In my fourth semester I failed six subjects while working evenings at my uncle's workshop after my
                father's surgery.
              </mark>
              <sup className={styles.noteRef}>1</sup> I cleared every one of them over the next two semesters, and{' '}
              <mark className={styles.highlight}>
                the workshop is where I learned to diagnose hydraulic faults, the problem my final-year project on pump
                efficiency set out to solve.
              </mark>
              <sup className={styles.noteRef}>2</sup>
            </p>
          </div>
        </div>
        <ol className={styles.notes}>
          {REVISION_NOTES.map((note, i) => (
            <li key={note}>
              <span className={styles.noteNumber}>{i + 1}</span>
              <span>{note}</span>
            </li>
          ))}
        </ol>

        <div className={styles.compare}>
          <div className={styles.compareCopy}>
            <p className={styles.disclaimer}>{SOP_COPY.caseLabel}</p>
            <h3 className={styles.subTitle}>{SOP_COPY.caseTitle}</h3>
            {SOP_COPY.caseBody.map((paragraph) => (
              <p key={paragraph} className={styles.body}>
                {paragraph}
              </p>
            ))}
            <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow-dark" size="lg" className={styles.cta}>
              {NAV_CTA.label}
            </Button>
          </div>
          <StampedCards />
        </div>
      </div>
    </section>
  );
}
