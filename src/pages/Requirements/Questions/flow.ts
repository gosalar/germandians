import { visibleFollowUps } from '@/utils/requirements/logic';
import { QUESTION_BY_ID, REQUIREMENT_QUESTIONS, type AnswerId, type RequirementsAnswers } from '@/utils/requirements/questions';

/** The phone flow shows one main question at a time; follow-ups show with their question. */
export const QUESTION_COUNT = REQUIREMENT_QUESTIONS.length;

/**
 * Where the phone flow goes after `id` is given an answer: the next main question, or `null` to stay.
 *
 * It stays while a follow-up under the same main question waits: one this answer opened, or one still
 * unanswered. (A follow-up loses its answer when it is hidden, so one that opens is always unanswered;
 * the first check is kept so the flow never depends on that.) Answering the last waiting follow-up
 * moves on. The last question never advances.
 */
export function indexAfterAnswer(id: AnswerId, before: RequirementsAnswers, after: RequirementsAnswers): number | null {
  const question = QUESTION_BY_ID[id];
  const isFollowUp = 'after' in question;
  const parentId = isFollowUp ? question.after : question.id;
  const shownBefore = new Set(visibleFollowUps(before));
  const waiting = visibleFollowUps(after)
    .filter((followUp) => QUESTION_BY_ID[followUp].after === parentId)
    .some((followUp) => after[followUp] === undefined || (!isFollowUp && !shownBefore.has(followUp)));
  if (waiting) return null;
  const index = REQUIREMENT_QUESTIONS.findIndex((main) => main.id === parentId);
  return index < QUESTION_COUNT - 1 ? index + 1 : null;
}
