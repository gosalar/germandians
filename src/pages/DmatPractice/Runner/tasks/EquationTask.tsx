import { useId, useState } from 'react';

import type { Answer, EquationTask as Equation } from '@/utils/dmat/types';

import { TASK_COPY } from '../data';
import styles from './styles.module.scss';
import type { ViewMode } from './types';

function LetterInput({ letter, value, onChange }: { letter: string; value: number | null; onChange(value: number | null): void }) {
  const [typed, setTyped] = useState(value === null ? '' : String(value));
  return (
    <label className={styles.letterInput}>
      <span>{TASK_COPY.letterLabel(letter)}</span>
      <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} autoComplete="off" value={typed} onChange={(event) => {
        const digits = event.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 2);
        setTyped(digits);
        onChange(digits === '' ? null : Number(digits));
      }} />
    </label>
  );
}

export default function EquationTask({ task, answer, onAnswer, mode }: { task: Equation; answer: Answer | undefined; onAnswer?(answer: Answer): void; mode: ViewMode }) {
  const id = useId();
  const values = answer?.kind === 'equations' ? answer.values : {};
  const letters = Object.keys(task.solution).sort();
  return (
    <div className={styles.equations}>
      <div><h3>{TASK_COPY.equations}</h3><ul className={styles.equationLines}>{task.equations.map((equation, index) => <li key={index}>{equation}</li>)}</ul></div>
      <div role="group" aria-labelledby={id}>
        <h3 id={id}>{TASK_COPY.yourAnswers}</h3>
        {letters.map((letter) => mode === 'answer' ? (
          <LetterInput key={`${task.id}-${letter}`} letter={letter} value={values[letter] ?? null} onChange={(value) => onAnswer?.({ kind: 'equations', values: Object.fromEntries(letters.map((key) => [key, key === letter ? value : values[key] ?? null])) })} />
        ) : (
          <p key={letter} className={styles.answerReview}>
            <strong>{TASK_COPY.letterLabel(letter)} {values[letter] ?? TASK_COPY.noAnswer}</strong> — {values[letter] === task.solution[letter] ? TASK_COPY.right : values[letter] == null ? TASK_COPY.unanswered : TASK_COPY.wrong}<br />
            {TASK_COPY.correctAnswer}: {task.solution[letter]}
          </p>
        ))}
      </div>
    </div>
  );
}
