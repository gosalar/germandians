import { Button } from '@mantine/core';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import type { Answer, Passage, PassageBlock, PassageQuestion } from '@/utils/dmat/types';

import { RUNNER_COPY, TASK_COPY } from '../data';
import Explanation from './Explanation';
import styles from './styles.module.scss';
import type { ViewMode } from './types';

type FigureBlock = Extract<PassageBlock, { type: 'figure' }>;

function PassageFigure({ block }: { block: FigureBlock }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [enlarged, setEnlarged] = useState(false);
  const title = useId();
  // Only authored, build-checked SVG reaches this component. Text is always rendered as text.
  const graphic = <div className={styles.passageFigure} role="img" aria-label={block.alt} dangerouslySetInnerHTML={{ __html: block.svg }} />;
  return (
    <figure className={styles.figureBlock}>
      {graphic}
      <figcaption>{block.caption}</figcaption>
      <Button ref={opener} variant="ring" size="nav" onClick={() => {
        setEnlarged(true);
        dialog.current?.showModal();
      }}>{TASK_COPY.enlarge}</Button>
      <dialog
        ref={dialog}
        className={styles.figureDialog}
        aria-labelledby={title}
        onClose={() => {
          setEnlarged(false);
          opener.current?.focus();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
        }}
      >
        <div className={styles.figureDialogBar}><h3 id={title}>{TASK_COPY.enlarged(block.caption)}</h3><Button variant="navy" size="nav" onClick={() => dialog.current?.close()}>{TASK_COPY.close}</Button></div>
        {enlarged && graphic}
      </dialog>
    </figure>
  );
}

function Block({ block }: { block: PassageBlock }) {
  switch (block.type) {
    case 'p': return <p>{block.text}</p>;
    case 'formula': return <p className={styles.formula}>{block.text}</p>;
    case 'figure': return <PassageFigure block={block} />;
    case 'table': return <div className={styles.tableScroll} role="region" aria-label={block.caption} tabIndex={0}><table className={styles.passageTable}>
      <caption>{block.caption}</caption><thead><tr>{block.head.map((heading, index) => <th scope="col" key={index}>{heading}</th>)}</tr></thead>
      <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, column) => column === 0 ? <th scope="row" key={column}>{cell}</th> : <td key={column}>{cell}</td>)}</tr>)}</tbody>
    </table></div>;
  }
}

export interface PassageTaskProps {
  passage: Passage;
  answers: Record<string, Answer>;
  onAnswer?(questionId: string, answer: Answer): void;
  mode: ViewMode;
  reviewActions?(question: PassageQuestion): ReactNode;
  /** Internal practice support. */
  checked?: readonly string[];
  onCheck?(questionId: string): void;
  immersive?: boolean;
}

interface QuestionProps {
  question: PassageQuestion;
  number: number;
  answer: Answer | undefined;
  review: boolean;
  onAnswer?: PassageTaskProps['onAnswer'];
  onCheck?: PassageTaskProps['onCheck'];
  reviewActions?: ReactNode;
}

function Question({ question, number, answer, review, onAnswer, onCheck, reviewActions }: QuestionProps) {
  const groupName = useId();
  const feedback = useRef<HTMLParagraphElement>(null);
  const requestedFeedback = useRef(false);
  const selected = answer?.kind === 'question' ? answer.option : null;
  const right = question.options.findIndex((option) => option.correct);

  useEffect(() => {
    if (review && requestedFeedback.current) {
      requestedFeedback.current = false;
      feedback.current?.focus();
    }
  }, [review]);

  return (
    <details className={styles.question}>
      <summary>
        {TASK_COPY.question(number)}
        {selected !== null && <span className={styles.answered}>{RUNNER_COPY.answered}</span>}
      </summary>
      <fieldset role={review ? undefined : 'radiogroup'} className={styles.questionOptions}>
        <legend>{question.stem}</legend>
        {question.options.map((option, index) => review ? (
          <p key={index} className={styles.questionOption} data-selected={selected === index} data-correct={index === right}>
            <span>
              {option.text}
              {selected === index && <span className={styles.optionStatus}>{TASK_COPY.selected}</span>}
              {index === right && <span className={styles.optionStatus}>{TASK_COPY.correctOption}</span>}
            </span>
          </p>
        ) : (
          <label key={index} className={styles.questionOption} data-selected={selected === index}>
            <input type="radio" name={groupName} checked={selected === index} onChange={() => onAnswer?.(question.id, { kind: 'question', option: index })} />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      {review && (
        <p ref={feedback} tabIndex={-1} className={styles.answerReview}>
          <strong>{selected === null ? TASK_COPY.unanswered : selected === right ? TASK_COPY.right : TASK_COPY.wrong}</strong><br />
          {TASK_COPY.yourAnswer}: {selected === null ? TASK_COPY.noAnswer : question.options[selected]?.text}<br />
          {TASK_COPY.correctAnswer}: {question.options[right]?.text}
        </p>
      )}
      {review && <Explanation task={question} answer={answer} />}
      {review && reviewActions}
      {onCheck && !review && <Button variant="navy" size="md" onClick={() => {
        requestedFeedback.current = true;
        onCheck(question.id);
      }}>{RUNNER_COPY.check}</Button>}
    </details>
  );
}

export default function PassageTask({ passage, answers, onAnswer, mode, reviewActions, checked, onCheck, immersive = false }: PassageTaskProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const passagePanel = useRef<HTMLElement>(null);
  const questionsPanel = useRef<HTMLElement>(null);
  const positions = useRef({ passage: 0, questions: 0 });
  const [showing, setShowing] = useState<'passage' | 'questions'>('passage');
  const checkedSet = checked ? new Set(checked) : null;

  const jump = () => {
    const scroller = viewport.current;
    const questions = questionsPanel.current;
    const text = passagePanel.current;
    if (!scroller || !questions || !text) return;
    const questionsTop = questions.offsetTop - text.offsetTop;
    const inQuestions = scroller.scrollTop >= questionsTop - 20;
    const destination = inQuestions ? 'passage' : 'questions';
    positions.current[inQuestions ? 'questions' : 'passage'] = scroller.scrollTop - (inQuestions ? questionsTop : 0);
    scroller.scrollTo({ top: (inQuestions ? 0 : questionsTop) + positions.current[destination], behavior: 'instant' });
    (inQuestions ? text : questions).focus({ preventScroll: true });
    setShowing(destination);
  };

  return (
    <div className={styles.academic} data-immersive={immersive}>
      <div ref={viewport} className={styles.academicScroll} onScroll={() => {
        const scroller = viewport.current;
        const questions = questionsPanel.current;
        const text = passagePanel.current;
        if (!scroller || !questions || !text) return;
        setShowing(scroller.scrollTop >= questions.offsetTop - text.offsetTop - 20 ? 'questions' : 'passage');
      }}>
        <article ref={passagePanel} className={styles.passage} aria-label={TASK_COPY.passage} tabIndex={-1}>
          <h2>{passage.title}</h2>
          {passage.blocks.map((block, index) => <Block key={index} block={block} />)}
        </article>
        <section ref={questionsPanel} className={styles.questions} aria-label={TASK_COPY.questions} tabIndex={-1}>
          <h2>{TASK_COPY.questions}</h2>
          {passage.questions.map((question, index) => (
            <Question
              key={question.id}
              question={question}
              number={index + 1}
              answer={answers[question.id]}
              review={mode === 'review' || checkedSet?.has(question.id) === true}
              onAnswer={onAnswer}
              onCheck={onCheck}
              reviewActions={mode === 'review' ? reviewActions?.(question) : undefined}
            />
          ))}
        </section>
      </div>
      {immersive && <div className={styles.jumpBar}><Button variant="ring" size="nav" onClick={jump}>{showing === 'passage' ? TASK_COPY.questions : TASK_COPY.passage}</Button></div>}
    </div>
  );
}
