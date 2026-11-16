import { useId, type ReactNode, type Ref } from 'react';

import { NOT_SURE, type AnswerId } from '@/utils/requirements/questions';

import styles from './styles.module.scss';

export interface QuestionGroupProps {
  question: { id: AnswerId; text: string; options: readonly { value: string; label: string }[] };
  /** The main question's number; follow-ups have none. */
  number?: number;
  /** The chosen value, if any. */
  value: string | undefined;
  onChoose: (value: string) => void;
  onClear: () => void;
  /** Context shown between the question and its answers, and read as the group's description. */
  hint?: ReactNode;
  /** The phone flow focuses the group when the button that had focus is hidden. */
  groupRef?: Ref<HTMLFieldSetElement>;
  /** From tablet up, the hint and the answers sit side by side (for a question that spans the paper). */
  wide?: boolean;
}

/** One question: a labelled group of toggle buttons. Pressing the chosen answer again clears it. */
export default function QuestionGroup({ question, number, value, onChoose, onClear, hint, groupRef, wide }: QuestionGroupProps) {
  const hintId = useId();

  return (
    <fieldset
      ref={groupRef}
      tabIndex={-1}
      className={number === undefined ? styles.followUp : styles.question}
      aria-describedby={hint ? hintId : undefined}
      data-wide={wide || undefined}
    >
      <legend className={styles.legend}>
        {number === undefined ? null : (
          <>
            <span className={styles.number}>{number}</span>{' '}
          </>
        )}
        <span>{question.text}</span>
      </legend>
      <div className={styles.body}>
        {hint ? (
          <div id={hintId} className={styles.hint}>
            {hint}
          </div>
        ) : null}
        <div className={styles.pills}>
          {question.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.pill}
              aria-pressed={value === option.value}
              data-unsure={option.value === NOT_SURE || undefined}
              onClick={() => (value === option.value ? onClear() : onChoose(option.value))}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
