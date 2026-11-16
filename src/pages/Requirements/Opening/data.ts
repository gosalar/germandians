import { NO_LOGIN_NEEDED } from '@/utils/constants';
import { REQUIREMENT_TOPIC_IDS } from '@/utils/requirements/topics';

export const OPENING_COPY = {
  /** The sticker above the title: who the page is for. */
  audience: 'For Indian master’s applicants',
  title: 'What you need for a master’s in Germany',
  /** The one sentence on what the page is for. */
  purpose: 'The steps to a German master’s in plain words, each with the official page to check.',
  /** The two ways in: the questions, then the guide. */
  questionsAction: 'Show what applies to me',
  guideAction: 'Read the guide',
  /** Under the two buttons, as on the grade check's badge. */
  noLogin: NO_LOGIN_NEEDED,
  routeTitle: 'The route',
  routeIntro: `${REQUIREMENT_TOPIC_IDS.length} topics, roughly in the order you will meet them.`,
} as const;
