import type { Answer, CoreTask, PassageQuestion } from '@/utils/dmat/types';

import { TASK_COPY } from '../data';
import styles from './styles.module.scss';

export interface ExplanationProps {
  task: CoreTask | PassageQuestion;
  answer: Answer | undefined;
}

/** The worked solution and, where supplied, the misconception behind a wrong choice. */
export default function Explanation({ task, answer }: ExplanationProps) {
  const steps = 'kind' in task ? task.kind === 'figures' ? task.explanation : task.steps : [task.explanation];
  const mistakes: { label: string; text: string }[] = [];
  if ('kind' in task && task.kind === 'figures' && answer?.kind === 'figures') {
    [task.options5, task.options6].forEach((options, part) => {
      const pick = answer.picks[part];
      const mistake = pick === null ? null : options[pick]?.mistake;
      if (pick !== task.answer[part] && mistake) mistakes.push({ label: part === 0 ? TASK_COPY.fifth : TASK_COPY.sixth, text: mistake });
    });
  } else if (!('kind' in task) && answer?.kind === 'question') {
    const option = task.options[answer.option];
    if (option && !option.correct) mistakes.push({ label: TASK_COPY.option(answer.option + 1), text: option.why });
  }
  return (
    <section className={styles.explanation} aria-label={TASK_COPY.solution}>
      <h3>{TASK_COPY.solution}</h3>
      <ol>{steps.map((step, index) => <li key={index}>{step}</li>)}</ol>
      {mistakes.length > 0 && <><h4>{TASK_COPY.mistake}</h4>{mistakes.map((mistake) => <p key={mistake.label}><strong>{mistake.label}: </strong>{mistake.text}</p>)}</>}
    </section>
  );
}
