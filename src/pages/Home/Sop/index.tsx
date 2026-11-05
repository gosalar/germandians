import { Button } from '@mantine/core';
import { SECTIONS, hashLink } from '@/utils/constants';

import StampedCards from './StampedCards';
import styles from './styles.module.scss';

const REWRITE_NOTES = [
  'States the reason for the backlogs once, plainly, where the draft hid it behind "personal reasons".',
  'Links the hard semester to a specific technical interest and the final-year project, which leads into the course being applied for.',
];

export default function Sop() {
  return (
    <section id="sop" data-screen-label="SOP" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <h2 className={styles.title}>How we write your SOP with you</h2>
          <div className={styles.introCopy}>
            <p className={styles.body}>
              Your Statement of Purpose is the one place in the application where you explain your record in your own
              words, including the semesters that went badly.
            </p>
            <p className={styles.body}>
              Many consultancies generate SOPs with AI or reuse templates. We write yours by hand with you, over several
              weeks. Nothing is submitted until you've approved the final version.
            </p>
          </div>
        </div>

        <div className={styles.rewriteHead}>
          <h3 className={styles.subTitle}>What a rewrite looks like</h3>
          <p className={styles.disclaimer}>Illustrative example. The student and details are invented.</p>
        </div>
        <div className={styles.drafts}>
          <div className={styles.genericDraft}>
            <div className={styles.draftLabel}>Generic draft</div>
            <p className={styles.draftText}>
              Since my childhood I have always been passionate about mechanical engineering. I am a hardworking,
              dedicated and sincere student. Due to some personal reasons I had backlogs, but I cleared them all and I
              am now fully ready for a master's degree in Germany.
            </p>
          </div>
          <div className={styles.rewrittenDraft}>
            <div className={styles.draftLabel}>Rewritten with the student</div>
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
          {REWRITE_NOTES.map((note, i) => (
            <li key={note}>
              <span className={styles.noteNumber}>{i + 1}</span>
              <span>{note}</span>
            </li>
          ))}
        </ol>

        <div className={styles.compare}>
          <div className={styles.compareCopy}>
            <h3 className={styles.subTitle}>Two applicants, one university</h3>
            <p className={styles.body}>Both applied to the same German technical university in the Winter 2025 cycle.</p>
            <p className={styles.body}>
              Each decision weighed the whole application: grades, course fit, documents and the SOP. The SOP is the
              part we write with you.
            </p>
            <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow-dark" size="lg" className={styles.cta}>
              Get my profile reviewed
            </Button>
          </div>
          <StampedCards />
        </div>
      </div>
    </section>
  );
}
