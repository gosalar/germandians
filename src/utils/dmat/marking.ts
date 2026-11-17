import type { SectionRun } from './session';
import type { Answer, CoreTask, PassageQuestion, SectionContent, SectionId } from './types';

/**
 * Marks answers against the bank. A task is right only when every part is right; a task with some parts
 * filled and some empty is wrong, not unanswered. Nothing here turns counts into a score.
 */

export const VERDICTS = ['right', 'wrong', 'unanswered'] as const;

/** `wrongParts`: 'fifth' and 'sixth' for a figure task, the letters for an equation task, empty otherwise. */
export interface TaskResult {
  id: string;
  verdict: (typeof VERDICTS)[number];
  wrongParts: string[];
}

export interface SectionResult {
  section: SectionId;
  total: number;
  right: number;
  wrong: number;
  unanswered: number;
  /** `endedAt − startedAt`, or `null` in practice or for a section that never ran. */
  msUsed: number | null;
  tasks: TaskResult[];
}

const FIGURE_PARTS = ['fifth', 'sixth'] as const;

const result = (id: string, verdict: TaskResult['verdict'], wrongParts: string[] = []): TaskResult => ({ id, verdict, wrongParts });

/** From the parts of one task: nothing filled is unanswered, every part right is right, anything else is wrong. */
function fromParts(id: string, parts: { name: string; filled: boolean; right: boolean }[]): TaskResult {
  if (parts.every((part) => !part.filled)) return result(id, 'unanswered');
  const wrong = parts.filter((part) => !part.right).map((part) => part.name);
  return result(id, wrong.length === 0 ? 'right' : 'wrong', wrong);
}

export function markTask(task: CoreTask | PassageQuestion, answer: Answer | undefined): TaskResult {
  if (!('kind' in task)) {
    if (answer?.kind !== 'question') return result(task.id, 'unanswered');
    return result(task.id, task.options[answer.option]?.correct === true ? 'right' : 'wrong');
  }
  switch (task.kind) {
    case 'figures': {
      if (answer?.kind !== 'figures') return result(task.id, 'unanswered');
      return fromParts(
        task.id,
        FIGURE_PARTS.map((name, index) => ({
          name,
          filled: answer.picks[index] !== null,
          right: answer.picks[index] === task.answer[index],
        })),
      );
    }
    case 'equations': {
      if (answer?.kind !== 'equations') return result(task.id, 'unanswered');
      return fromParts(
        task.id,
        Object.keys(task.solution).map((letter) => {
          const value = answer.values[letter] ?? null;
          return { name: letter, filled: value !== null, right: value === task.solution[letter] };
        }),
      );
    }
    case 'latin': {
      if (answer?.kind !== 'latin') return result(task.id, 'unanswered');
      return result(task.id, answer.letter === task.answer ? 'right' : 'wrong');
    }
  }
}

export function markSection(run: SectionRun, content: SectionContent, answers: Record<string, Answer>): SectionResult {
  const items: (CoreTask | PassageQuestion)[] =
    content.section === 'academic' ? content.passages.flatMap((passage) => passage.questions) : content.tasks;
  const tasks = items.map((item) => markTask(item, answers[item.id]));
  const count = (verdict: TaskResult['verdict']) => tasks.filter((task) => task.verdict === verdict).length;
  // Practice has no clock. Its set is 'practice' for a Core subtest and a passage id for the academic module.
  const practice = run.setId === 'practice' || (run.id === 'academic' && run.setId !== 'mock');
  const msUsed = !practice && run.startedAt !== null && run.endedAt !== null ? run.endedAt - run.startedAt : null;
  return {
    section: run.id,
    total: tasks.length,
    right: count('right'),
    wrong: count('wrong'),
    unanswered: count('unanswered'),
    msUsed,
    tasks,
  };
}
