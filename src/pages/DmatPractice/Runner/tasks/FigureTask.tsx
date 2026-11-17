import { useId } from 'react';

import type { Answer, FigureTask as Figure } from '@/utils/dmat/types';

import { describeMatrix, TASK_COPY } from '../data';
import Matrix from './Matrix';
import styles from './styles.module.scss';
import type { ViewMode } from './types';

export default function FigureTask({ task, answer, onAnswer, mode }: { task: Figure; answer: Answer | undefined; onAnswer?(answer: Answer): void; mode: ViewMode }) {
  const id = useId();
  const picks = answer?.kind === 'figures' ? answer.picks : [null, null];
  const columns = [
    { label: TASK_COPY.fifth, options: task.options5 },
    { label: TASK_COPY.sixth, options: task.options6 },
  ];
  return (
    <div className={styles.figures}>
      {task.shown.map((frame, index) => <Matrix key={index} frame={frame} shapes={task.shapes} label={TASK_COPY.matrix(index + 1)} />)}
      {columns.map((column) => <div key={column.label} className={styles.missingMatrix}><Matrix frame={null} shapes={task.shapes} label={column.label} /></div>)}
      {columns.map((column, part) => (
        <fieldset key={column.label} role={mode === 'answer' ? 'radiogroup' : undefined} className={styles.figureOptions}>
          <legend>{column.label}</legend>
          {mode === 'review' && (
            <p className={styles.partResult}>
              <strong>{picks[part] === task.answer[part] ? TASK_COPY.right : picks[part] === null ? TASK_COPY.unanswered : TASK_COPY.wrong}</strong><br />
              {TASK_COPY.yourAnswer}: {picks[part] === null ? TASK_COPY.noAnswer : TASK_COPY.option(picks[part]! + 1)}<br />
              {TASK_COPY.correctAnswer}: {TASK_COPY.option(task.answer[part] + 1)}
            </p>
          )}
          {column.options.map((option, index) => {
            const label = TASK_COPY.option(index + 1);
            const descriptionId = `${id}-${part}-${index}`;
            const selected = picks[part] === index;
            const correct = task.answer[part] === index;
            const matrix = <Matrix frame={option.frame} shapes={task.shapes} label={label} />;
            return mode === 'answer' ? (
              <label key={index} className={styles.figureOption} data-selected={selected}>
                <input
                  type="radio"
                  name={`${id}-${part}`}
                  checked={selected}
                  aria-label={label}
                  aria-describedby={descriptionId}
                  onChange={() => onAnswer?.({ kind: 'figures', picks: part === 0 ? [index, picks[1]] : [picks[0], index] })}
                />
                <span className={styles.optionNumber}>{label}</span>
                <span aria-hidden="true">{matrix}</span>
                <span id={descriptionId} hidden>{describeMatrix(option.frame, task.shapes)}</span>
              </label>
            ) : (
              <div key={index} className={styles.figureOption} data-selected={selected} data-correct={correct}>
                <span className={styles.optionNumber}>{label}</span>
                {matrix}
                {selected && <span className={styles.optionStatus}>{TASK_COPY.selected}</span>}
                {correct && <span className={styles.optionStatus}>{TASK_COPY.correctOption}</span>}
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}
