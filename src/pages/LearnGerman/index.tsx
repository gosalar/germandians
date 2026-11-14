import { Button } from '@mantine/core';

import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import { DESTINATIONS, GERMAN_LESSONS, NAV_CTA, SECTIONS, destinationHref } from '@/utils/constants';

import { ADMISSIONS, ASK, CHAT, GREETINGS, OFFER, PAGE_COPY, WHY } from './data';
import styles from './styles.module.scss';
import GermanLessonsForm from './GermanLessonsForm';
import WordDeck from './WordDeck';

/** Hello four ways, as speech bubbles above the title. */
function Greetings() {
  return (
    <figure className={styles.greetings}>
      <ul className={styles.greetingList}>
        {GREETINGS.items.map((greeting) => (
          <li key={greeting.id} className={styles.greeting} data-greeting={greeting.id}>
            <span lang="de" className={styles.greetingBubble}>
              {greeting.de}
            </span>
            <span className={styles.greetingWhere}>{greeting.en}</span>
          </li>
        ))}
      </ul>
      <figcaption className={styles.greetingCaption}>{GREETINGS.caption}</figcaption>
    </figure>
  );
}

/** A German question and an answer in the visitor's own language, as a two-line chat. */
function Chat() {
  return (
    <div aria-hidden="true" className={styles.chat}>
      <p className={styles.chatQuestion}>
        <span lang="de" className={styles.chatQuestionDe}>
          {CHAT.question.de}
        </span>
        <span className={styles.chatQuestionEn}>{CHAT.question.en}</span>
      </p>
      <p className={styles.chatAnswer}>{CHAT.answer}</p>
    </div>
  );
}

/** German lessons explained in the student's native language: what they are, the terms, and how to ask. */
export default function LearnGerman() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section id={SECTIONS.top} className={styles.top}>
        <div className={styles.topGrid}>
          <PageHeader
            variant="regular"
            title={PAGE_COPY.title}
            introduction={PAGE_COPY.introduction}
            leading={<Greetings />}
          />

          <div className={styles.offer}>
            <h2 className={styles.offerTitle}>{OFFER.title}</h2>
            {OFFER.body.map((paragraph) => (
              <p key={paragraph} className={styles.offerBody}>{paragraph}</p>
            ))}
            <p className={styles.limit}>
              <strong>{OFFER.languagesLead}</strong> {GERMAN_LESSONS.languages}
            </p>
            <ul className={styles.terms}>
              <li>
                <span aria-hidden="true" className={styles.termBullet} />
                <span>{GERMAN_LESSONS.charges}</span>
              </li>
              <li>
                <span aria-hidden="true" className={styles.termBullet} />
                <span>{GERMAN_LESSONS.certificate}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.why}>
        <div className={styles.whyGrid}>
          <div className={styles.whyHead}>
            <h2 className={styles.sectionTitle}>{WHY.title}</h2>
            <p className={styles.lede}>{WHY.lede}</p>
            <Chat />
          </div>
          <ul className={styles.points}>
            {WHY.points.map((point) => (
              <li key={point.title} className={styles.point}>
                <h3 className={styles.pointTitle}>{point.title}</h3>
                <p className={styles.pointBody}>{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WordDeck />

      <section className={styles.ask}>
        <div className={styles.askInner}>
          <div className={styles.askHead}>
            <h2 className={styles.sectionTitle}>{ASK.title}</h2>
            <p className={styles.lede}>{ASK.lede}</p>
          </div>

          <div className={styles.askGrid}>
            <div className={styles.details}>
              <h3 className={styles.detailsTitle}>
                <span lang="de">{ASK.stepsTitle.de}</span>{' '}
                <span className={styles.detailsTitleEn}>{ASK.stepsTitle.en}</span>
              </h3>
              <ol className={styles.detailList}>
                {ASK.steps.map((step, index) => (
                  <li key={step} className={styles.detail}>
                    <span aria-hidden="true" className={styles.detailNumber}>{index + 1}</span>
                    <span className={styles.detailText}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <GermanLessonsForm />
          </div>

          <div className={styles.admissions}>
            <div className={styles.admissionsCopy}>
              <h2 className={styles.admissionsTitle}>{ADMISSIONS.title}</h2>
              <p className={styles.admissionsBody}>{ADMISSIONS.body}</p>
            </div>
            <Button
              component={HomeSectionLink}
              href={destinationHref(DESTINATIONS.profileReview)}
              variant="yellow-dark"
              size="lg"
              className={styles.admissionsButton}
            >
              {NAV_CTA.label}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
