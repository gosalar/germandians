import { Button } from '@mantine/core';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import SourceNote from '@/components/SourceNote';
import { useVisitAnswers, useVisitAnswersActions } from '@/contexts/VisitAnswers/useVisitAnswers';
import { APS, DMAT, SOURCES } from '@/utils/applicationFacts';
import { visibleFollowUps, withAnswer } from '@/utils/requirements/logic';
import {
  REQUIREMENT_FOLLOW_UPS,
  REQUIREMENT_QUESTIONS,
  semestersWording,
  type AnswerId,
  type AnswerValue,
} from '@/utils/requirements/questions';
import { REQUIREMENTS_ANCHORS } from '@/utils/requirements/topics';

import { QUESTIONS_COPY } from './data';
import { QUESTION_COUNT, indexAfterAnswer } from './flow';
import QuestionGroup from './QuestionGroup';
import styles from './styles.module.scss';

export interface QuestionsProps {
  /** The next-steps slip (`<NextSteps />`), laid out beside the questions. */
  slip: ReactNode;
}

/**
 * The Fragebogen: six questions and their follow-ups, with the slip beside them. Answers are read and
 * written through the visit state. From tablet up every question shows; below `$bp-mobile` CSS shows
 * only the current one (`data-current`), with Back and Skip or Next.
 */
export default function Questions({ slip }: QuestionsProps) {
  const { requirements } = useVisitAnswers();
  const { setAnswer, clearAnswer } = useVisitAnswersActions();
  const [current, setCurrent] = useState(0);
  const groups = useRef<(HTMLFieldSetElement | null)[]>([]);
  const refocus = useRef(false);
  const keepInView = useRef(false);
  const headingId = useId();
  const shown = new Set(visibleFollowUps(requirements));
  const last = QUESTION_COUNT - 1;

  // After an answer moves the phone flow on, the pressed button is hidden: give focus to the new question.
  // After Back or Skip/Next the question above changes height, so keep the focused stepper button in view.
  useEffect(() => {
    const active = document.activeElement;
    if (keepInView.current) {
      keepInView.current = false;
      if (active instanceof HTMLElement) active.scrollIntoView({ block: 'nearest' });
    }
    if (!refocus.current) return;
    refocus.current = false;
    if (active instanceof HTMLElement && active !== document.body && active.checkVisibility()) return;
    groups.current[current]?.focus();
  }, [current]);

  const move = (index: number) => {
    keepInView.current = true;
    setCurrent(index);
  };

  const choose = (id: AnswerId, value: string) => {
    const answer = value as AnswerValue<AnswerId>;
    const after = withAnswer(requirements, id, answer);
    setAnswer(id, answer);
    const next = indexAfterAnswer(id, requirements, after);
    if (next !== null && next !== current) {
      refocus.current = true;
      setCurrent(next);
    }
  };

  const forward = () => {
    if (current < last) {
      move(current + 1);
      return;
    }
    document.getElementById(REQUIREMENTS_ANCHORS.nextSteps)?.focus();
  };

  const length = requirements.length;
  // Follow-up A shows only for a 3- or 4-year degree; its question names that length's number of semesters.
  const semesters = length === '3-year' || length === '4-year' ? semestersWording(length) : null;
  // What dMAT is comes before the word is used, then the list the answers refer to.
  const fieldList = (
    <>
      <p>{DMAT.about}</p>
      <p>
        <strong>{QUESTIONS_COPY.fieldListLabel}:</strong> {DMAT.fields}
      </p>
      <SourceNote source={SOURCES.dmat} />
    </>
  );
  const hints: Partial<Record<AnswerId, ReactNode>> = {
    field: fieldList,
    aps: <p>{APS.about}</p>,
    semesters: semesters ? <p>{QUESTIONS_COPY.semestersHint}</p> : undefined,
  };
  const currentAnswered = requirements[REQUIREMENT_QUESTIONS[current].id] !== undefined;

  return (
    <section id={REQUIREMENTS_ANCHORS.questions} className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id={headingId} className={styles.heading}>
            {QUESTIONS_COPY.heading}
          </h2>
          <p className={styles.lead}>{QUESTIONS_COPY.lead}</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.paper}>
            <h3 className={styles.paperTitle}>
              <span lang="de" className={styles.paperName}>
                {QUESTIONS_COPY.paperTitle}
              </span>{' '}
              <span className={styles.paperSubtitle}>{QUESTIONS_COPY.paperSubtitle}</span>
            </h3>
            <p className={styles.note}>{QUESTIONS_COPY.note}</p>

            <noscript>
              <p className={styles.noScript}>{QUESTIONS_COPY.noScript}</p>
            </noscript>

            <div className={styles.questions}>
              {REQUIREMENT_QUESTIONS.map((question, index) => {
                const followUps = REQUIREMENT_FOLLOW_UPS.filter(
                  (followUp) => followUp.after === question.id && shown.has(followUp.id),
                );
                // The degree-field question carries the dMAT field list, so it spans the paper. A half-width
                // question that can open a follow-up (APS) spans two rows, so the next question fills in
                // beside it rather than leaving a gap when the follow-up opens.
                const wide = question.id === 'field';
                const tall = !wide && REQUIREMENT_FOLLOW_UPS.some((followUp) => followUp.after === question.id);
                return (
                  <div
                    key={question.id}
                    className={styles.item}
                    data-current={index === current || undefined}
                    data-wide={wide || undefined}
                    data-tall={tall || undefined}
                  >
                    <QuestionGroup
                      question={question}
                      number={index + 1}
                      value={requirements[question.id]}
                      onChoose={(value) => choose(question.id, value)}
                      onClear={() => clearAnswer(question.id)}
                      hint={hints[question.id]}
                      wide={wide}
                      groupRef={(element) => {
                        groups.current[index] = element;
                      }}
                    />
                    {followUps.length > 0 ? (
                      <div className={styles.followUps}>
                        {followUps.map((followUp) => (
                          <QuestionGroup
                            key={followUp.id}
                            question={followUp.id === 'semesters' && semesters ? { ...followUp, text: semesters.text } : followUp}
                            value={requirements[followUp.id]}
                            onChoose={(value) => choose(followUp.id, value)}
                            onClear={() => clearAnswer(followUp.id)}
                            hint={hints[followUp.id]}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className={styles.stepper} role="group" aria-label={QUESTIONS_COPY.stepperLabel}>
              <Button
                type="button"
                variant="outline"
                size="md"
                className={styles.stepButton}
                aria-disabled={current === 0 || undefined}
                onClick={() => (current > 0 ? move(current - 1) : undefined)}
              >
                {QUESTIONS_COPY.back}
              </Button>
              <span className={styles.progress} aria-live="polite">
                {QUESTIONS_COPY.progress(current + 1, QUESTION_COUNT)}
              </span>
              <Button type="button" variant="navy" size="md" className={styles.stepButton} onClick={forward}>
                {current === last ? QUESTIONS_COPY.toSteps : currentAnswered ? QUESTIONS_COPY.next : QUESTIONS_COPY.skip}
              </Button>
            </div>
          </div>

          {slip}
        </div>
      </div>
    </section>
  );
}
