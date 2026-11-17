import { useId } from 'react';

import { LETTERS, type Answer, type LatinTask as Latin } from '@/utils/dmat/types';

import { TASK_COPY } from '../data';
import styles from './styles.module.scss';
import type { ViewMode } from './types';

export default function LatinTask({ task, answer, onAnswer, mode }: { task: Latin; answer: Answer | undefined; onAnswer?(answer: Answer): void; mode: ViewMode }) {
  const id = useId();
  const letter = answer?.kind === 'latin' ? answer.letter : null;
  return (
    <div className={styles.latin}>
      <table className={styles.square}>
        <caption>{TASK_COPY.square}</caption>
        <thead><tr><td />{LETTERS.map((_, index) => <th key={index} scope="col"><span className={styles.srOnly}>{TASK_COPY.column(index + 1)}</span><span aria-hidden="true">{index + 1}</span></th>)}</tr></thead>
        <tbody>{task.givens.map((row, rowIndex) => <tr key={rowIndex}>
          <th scope="row"><span className={styles.srOnly}>{TASK_COPY.row(rowIndex + 1)}</span><span aria-hidden="true">{rowIndex + 1}</span></th>
          {row.map((value, columnIndex) => {
            const target = rowIndex === task.target[0] && columnIndex === task.target[1];
            return <td key={columnIndex} data-target={target}>{target ? <><span className={styles.srOnly}>{TASK_COPY.target}: </span>?</> : value ?? <span className={styles.srOnly}>{TASK_COPY.empty}</span>}</td>;
          })}
        </tr>)}</tbody>
      </table>
      <fieldset role={mode === 'answer' ? 'radiogroup' : undefined} className={styles.latinOptions}>
        <legend>{TASK_COPY.latinQuestion}</legend>
        {mode === 'answer' ? <div className={styles.letters}>{LETTERS.map((choice) => <label key={choice} className={styles.letterOption}>
          <input type="radio" name={id} checked={letter === choice} onChange={() => onAnswer?.({ kind: 'latin', letter: choice })} /><span>{choice}</span>
        </label>)}</div> : <p className={styles.answerReview}>
          <strong>{letter === task.answer ? TASK_COPY.right : letter === null ? TASK_COPY.unanswered : TASK_COPY.wrong}</strong><br />
          {TASK_COPY.yourAnswer}: {letter ?? TASK_COPY.noAnswer}<br />{TASK_COPY.correctAnswer}: {task.answer}
        </p>}
      </fieldset>
    </div>
  );
}
