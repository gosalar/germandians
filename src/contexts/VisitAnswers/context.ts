import { createContext } from 'react';

import type { Marks } from '@/utils/gradeConversion';
import type { AnswerId, AnswerValue, RequirementsAnswers } from '@/utils/requirements/questions';

/** What the visitor has entered during this visit. Kept in memory only: no storage, no URL. */
export interface VisitAnswersState {
  /** The marks typed on /check, as typed. */
  marks: Marks;
  /** The answers given on /requirements. */
  requirements: RequirementsAnswers;
}

export interface VisitAnswersActions {
  /** Merges the given fields into the marks; fields not named keep their value. */
  setMarks: (marks: Partial<Marks>) => void;
  /**
   * Sets one question's or follow-up's answer. Only that question's values type-check. Follow-ups the
   * change hides lose their answers (`withAnswer` in `@/utils/requirements/logic`).
   */
  setAnswer: <Id extends AnswerId>(id: Id, value: AnswerValue<Id>) => void;
  /** Removes one answer, so the question reads as unanswered; hidden follow-ups lose theirs too. */
  clearAnswer: (id: AnswerId) => void;
}

export const VisitAnswersStateContext = createContext<VisitAnswersState | null>(null);
export const VisitAnswersActionsContext = createContext<VisitAnswersActions | null>(null);
