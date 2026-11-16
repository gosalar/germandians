import { DMAT } from '@/utils/applicationFacts';

import { NEXT_STEPS_COPY } from '../NextSteps/data';

/** The section's own copy. The questions, their options and the follow-ups are in `@/utils/requirements/questions`. */
export const QUESTIONS_COPY = {
  heading: 'Show what applies to me',
  lead: `Answer what you know. Your steps build up under “${NEXT_STEPS_COPY.heading}” as you go, each with a link to its part of the guide.`,
  /** German name of the paper, shown with `lang="de"`; the subtitle is its English meaning. */
  paperTitle: 'Fragebogen',
  paperSubtitle: 'Questionnaire: six questions',
  note: 'Skip anything you like and change an answer at any time; press a chosen answer again to clear it. Your answers stay in this tab and clear when you refresh.',
  /** Shown only when scripts are off: the answer buttons need JavaScript, the guide does not. */
  noScript: 'The questions need JavaScript to show your steps. The guide below covers every topic without it.',
  /** Above the field list: the list's one name, the same everywhere on the page. */
  fieldListLabel: `The ${DMAT.fieldsName}`,
  /** Under follow-up A, whose question names the number: why it is asked. */
  semestersHint: 'Below this number, dMAT does not apply under the current rules.',
  progress: (current: number, total: number) => `Question ${current} of ${total}`,
  stepperLabel: 'Move between questions',
  back: 'Back',
  skip: 'Skip',
  next: 'Next',
  toSteps: 'See my steps',
} as const;
