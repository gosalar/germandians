import { ROUTES } from '@/utils/constants';

/**
 * The ten guide topics on /requirements, in reading order. Each id is also the topic card's anchor.
 * German words and copy live in `src/pages/Requirements/Guide/topics/`; this module holds only what
 * other modules link to or type against, including each topic's title (link texts on other pages name it).
 *
 * Topic anchors are deliberately not in `SECTIONS`: Home's registry entry lists every section id.
 * Do not import this module from `constants.ts`, `pageRegistry.ts` or `publicPages.ts` (they load in plain Node).
 */
export const REQUIREMENT_TOPIC_IDS = [
  'degree',
  'subject-credits',
  'grades',
  'language',
  'aps-dmat',
  'documents',
  'applying',
  'deadlines',
  'costs',
  'visa-enrolment',
] as const;

export type RequirementTopicId = (typeof REQUIREMENT_TOPIC_IDS)[number];

/** Each topic's title, read by its topic file and by links that name the topic. */
export const REQUIREMENT_TOPIC_TITLES: { readonly [Id in RequirementTopicId]: string } = {
  degree: 'Your degree',
  'subject-credits': 'Subject match and credits',
  grades: 'Grades',
  language: 'Language',
  'aps-dmat': 'APS and dMAT',
  documents: 'Documents',
  applying: 'How to apply',
  deadlines: 'Deadlines and timeline',
  costs: 'Costs',
  'visa-enrolment': 'Visa and enrolment',
};

/** The page's other anchors. `SECTIONS.top` (the opening) and `SECTIONS.contact` come from `constants.ts`. */
export const REQUIREMENTS_ANCHORS = {
  /** The route card in the opening: the ten topics, also the target of each card's "All topics" link. */
  route: 'route',
  /** The questions (Fragebogen), with the next-steps slip beside them. */
  questions: 'questions',
  /** The next-steps slip (Laufzettel). */
  nextSteps: 'next-steps',
  guide: 'guide',
  commonQuestions: 'common-questions',
  otherApplicants: 'other-applicants',
} as const;

export type RequirementsAnchorId = (typeof REQUIREMENTS_ANCHORS)[keyof typeof REQUIREMENTS_ANCHORS];

/**
 * A link to a topic or anchor on /requirements from another page, for React Router's `Link`.
 * On /requirements itself, link to its own anchors with a plain `<a href="#…">`: `HomeSectionLink`
 * sends any hash the page's registry entry does not list to Home.
 */
export function requirementsHref(id: RequirementTopicId | RequirementsAnchorId): string {
  return `${ROUTES.requirements}#${id}`;
}
