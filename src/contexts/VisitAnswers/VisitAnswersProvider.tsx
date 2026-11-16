import { useState, type ReactNode } from 'react';

import { EMPTY_MARKS, type Marks } from '@/utils/gradeConversion';
import { withAnswer } from '@/utils/requirements/logic';
import type { RequirementsAnswers } from '@/utils/requirements/questions';

import { VisitAnswersActionsContext, VisitAnswersStateContext, type VisitAnswersActions, type VisitAnswersState } from './context';

/**
 * The visitor's answers for this visit, shared by /check and /requirements. It is mounted in the site
 * shell, which persists across client-side navigation, so answers survive moving between pages and
 * clear on a reload. Nothing is stored or put in the URL. The initial state is the same on the server
 * and in the browser, so prerendering stays clean. State and actions live in separate contexts so
 * components that only act never re-render when the answers change.
 */
export default function VisitAnswersProvider({ children }: { children: ReactNode }) {
  const [marks, setMarksState] = useState<Marks>(EMPTY_MARKS);
  const [requirements, setRequirements] = useState<RequirementsAnswers>({});

  const state: VisitAnswersState = { marks, requirements };

  const actions: VisitAnswersActions = {
    setMarks: (update) => setMarksState((previous) => ({ ...previous, ...update })),
    // `withAnswer` drops the answers of follow-ups that the change hides, so none comes back later.
    setAnswer: (id, value) => setRequirements((previous) => withAnswer(previous, id, value)),
    clearAnswer: (id) =>
      setRequirements((previous) => (id in previous ? withAnswer(previous, id, undefined) : previous)),
  };

  return (
    <VisitAnswersActionsContext value={actions}>
      <VisitAnswersStateContext value={state}>{children}</VisitAnswersStateContext>
    </VisitAnswersActionsContext>
  );
}
