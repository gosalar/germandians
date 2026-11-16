import { use } from 'react';

import { VisitAnswersActionsContext, VisitAnswersStateContext } from './context';

/** The visitor's marks and /requirements answers for this visit. */
export function useVisitAnswers() {
  const ctx = use(VisitAnswersStateContext);
  if (!ctx) throw new Error('useVisitAnswers must be used inside <VisitAnswersProvider>');
  return ctx;
}

/** Setters for the visit's answers. Using only these does not re-render when the answers change. */
export function useVisitAnswersActions() {
  const ctx = use(VisitAnswersActionsContext);
  if (!ctx) throw new Error('useVisitAnswersActions must be used inside <VisitAnswersProvider>');
  return ctx;
}
