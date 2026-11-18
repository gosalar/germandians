import { Button } from '@mantine/core';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import { DESTINATIONS, SECTIONS, destinationHref, hashLink } from '@/utils/constants';

import { NEXT_COPY, PAGE_COPY, QUESTIONS, type AdviserQuestion } from './data';
import styles from './styles.module.scss';

function QuestionCard({ item }: { item: AdviserQuestion }) {
  const titleId = `${item.id}-title`;

  return (
    <section id={item.id} aria-labelledby={titleId} className={styles.card}>
      <header className={styles.cardHeader}>
        <span aria-hidden="true" className={styles.questionNumber}>
          {item.number}
        </span>
        <h2 id={titleId} className={styles.questionTitle}>
          {item.question}
        </h2>
      </header>

      <div className={styles.columns}>
        <div className={styles.checkPanel}>
          <h3 className={styles.panelHeading}>{PAGE_COPY.checkHeading}</h3>
          <ul className={styles.checkList}>
            {item.checks.map((point) => (
              <li key={point} className={styles.checkItem}>
                <span aria-hidden="true" className={styles.checkBox} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.answerPanel}>
          <h3 className={styles.panelHeading}>{PAGE_COPY.answerHeading}</h3>
          <div className={styles.answerBody}>
            {item.answer.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {item.answer.list ? (
              <>
                <p>{item.answer.list.lead}</p>
                <ul className={styles.topicList}>
                  {item.answer.list.items.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {item.answer.linkedParagraph ? (
              <p>
                {item.answer.linkedParagraph.before}{' '}
                <Link to={item.answer.linkedParagraph.linkHref} className={styles.inlineLink}>
                  {item.answer.linkedParagraph.linkLabel}
                </Link>
                . {item.answer.linkedParagraph.after}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Six questions a student can ask any admissions adviser before paying, with Germandians' own answers. */
export default function ChoosingHelp() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section id={SECTIONS.top} className={styles.opening}>
        <ContentContainer width="wide">
          <div className={styles.openingGrid}>
            <PageHeader
              variant="regular"
              title={PAGE_COPY.title}
              introduction={PAGE_COPY.introduction}
              meta={
                <div className={styles.openingActions}>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => window.print()}
                    className={styles.printButton}
                  >
                    {PAGE_COPY.printAction}
                  </Button>
                </div>
              }
            />
            <nav className={styles.indexCard} aria-label={PAGE_COPY.jumpNavLabel}>
              <p className={styles.indexTitle}>{PAGE_COPY.jumpNavLabel}</p>
              <ol className={styles.indexList}>
                {QUESTIONS.map((item) => (
                  <li key={item.id}>
                    <a href={hashLink(item.id)}>
                      <span aria-hidden="true" className={styles.indexNumber}>
                        {item.number}
                      </span>
                      <span>{item.question}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </ContentContainer>
      </section>

      <div className={styles.content}>
        <ContentContainer width="wide">
          <div className={styles.questions}>
            {QUESTIONS.map((item) => (
              <QuestionCard key={item.id} item={item} />
            ))}
          </div>

          <section aria-labelledby="choosing-help-next-title" className={styles.closing}>
            <div className={styles.closingText}>
              <h2 id="choosing-help-next-title" className={styles.closingTitle}>
                {NEXT_COPY.title}
              </h2>
              <p className={styles.closingBody}>{NEXT_COPY.body}</p>
            </div>
            <div className={styles.closingActions}>
              <Button
                component={HomeSectionLink}
                href={destinationHref(DESTINATIONS.profileReview)}
                variant="navy"
                size="lg"
              >
                {NEXT_COPY.profileReview}
              </Button>
              <Button component={Link} to={NEXT_COPY.requirementsHref} variant="ring" size="lg">
                {NEXT_COPY.requirements}
              </Button>
            </div>
          </section>
        </ContentContainer>
      </div>
    </main>
  );
}
