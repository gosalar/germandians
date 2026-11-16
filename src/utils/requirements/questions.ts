import { DMAT, DMAT_RULE_VALUES } from '@/utils/applicationFacts';

/**
 * The /requirements questions and their follow-ups. Values are stable ids: logic, the visit state and
 * tests use them, so never rename one. Text and labels are copy and may be reworded.
 *
 * Every question and follow-up has an explicit "not sure" value (`NOT_SURE`). Every question can be
 * skipped; an unanswered question is simply absent from `RequirementsAnswers`.
 */
export const NOT_SURE = 'not-sure';

export const REQUIREMENT_QUESTIONS = [
  {
    id: 'stage',
    text: 'Where are you in your bachelor’s?',
    summary: 'Bachelor’s',
    options: [
      { value: 'still-studying', label: 'Still studying or exams outstanding' },
      { value: 'awaiting-documents', label: 'Finished, waiting for final documents' },
      { value: 'documents-in-hand', label: 'Finished, documents in hand' },
      { value: NOT_SURE, label: 'Not sure' },
    ],
  },
  {
    id: 'length',
    text: 'How long is your degree?',
    summary: 'Degree length',
    options: [
      { value: '3-year', label: '3-year' },
      { value: '4-year', label: '4-year' },
      { value: 'other', label: 'Other or integrated' },
      { value: NOT_SURE, label: 'Not sure' },
    ],
  },
  {
    id: 'field',
    text: 'What did you study?',
    summary: 'Degree field',
    // Each label stands on its own, because the enquiry summary shows it without the field list.
    options: [
      { value: 'dmat-field', label: `One of the ${DMAT.fieldsName}` },
      { value: 'other-field', label: 'Something else' },
      { value: 'mix', label: 'Integrated or dual, partly a dMAT field' },
      { value: NOT_SURE, label: 'Not sure' },
    ],
  },
  {
    id: 'language',
    text: 'Which language will your master’s be taught in?',
    summary: 'Teaching language',
    options: [
      { value: 'english', label: 'English' },
      { value: 'german', label: 'German' },
      { value: 'both', label: 'Both' },
      // This question's "not sure" reads as "Not decided".
      { value: NOT_SURE, label: 'Not decided' },
    ],
  },
  {
    id: 'aps',
    text: 'Where are you with APS?',
    summary: 'APS',
    options: [
      { value: 'not-started', label: 'Not started' },
      { value: 'applied', label: 'Applied, waiting' },
      { value: 'certificate', label: 'Certificate received' },
      { value: NOT_SURE, label: 'Not sure' },
    ],
  },
  {
    id: 'shortlist',
    text: 'Do you have a shortlist of programmes?',
    summary: 'Shortlist',
    options: [
      { value: 'not-yet', label: 'Not yet' },
      { value: 'yes', label: 'Yes' },
      { value: 'applied', label: 'Already applied' },
      { value: NOT_SURE, label: 'Not sure' },
    ],
  },
] as const;

const FOLLOW_UP_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: NOT_SURE, label: 'Not sure' },
] as const;

/**
 * Follow-ups show under the question named by `after` (in this order when two share one), and only
 * when `visibleFollowUps` in `logic.ts` says so. An answer to a hidden follow-up is kept in the visit
 * state but ignored everywhere, so it cannot influence a result.
 */
export const REQUIREMENT_FOLLOW_UPS = [
  {
    /**
     * Follow-up A. It shows only for a 3- or 4-year degree, and its question names that length's number
     * of semesters (`semestersWording`); this `text` and `summary` are the fallback without a length.
     */
    id: 'semesters',
    after: 'field',
    text: 'Have you completed fewer semesters than the number for your degree length?',
    summary: 'Completed fewer semesters than the number for the degree length',
    options: FOLLOW_UP_OPTIONS,
  },
  {
    /** Follow-up C, in the APS dMAT page's words for the exemption ("applicants participating in …"). */
    id: 'confirmedProgramme',
    after: 'field',
    text: 'Are you taking part in an officially confirmed exchange, double-degree or university partnership programme?',
    summary: 'Taking part in an officially confirmed exchange, double-degree or university partnership programme',
    options: FOLLOW_UP_OPTIONS,
  },
  {
    /** Follow-up B. */
    id: 'apsDate',
    after: 'aps',
    text: `Did you register with APS, or send complete documents, before ${DMAT_RULE_VALUES.transitionDate}?`,
    summary: `APS registration or complete documents before ${DMAT_RULE_VALUES.transitionDate}`,
    options: FOLLOW_UP_OPTIONS,
  },
] as const;

/** A degree length with a semester number in the dMAT rule. */
export type ThresholdLength = keyof typeof DMAT_RULE_VALUES.semesterThresholds;

/** Follow-up A for a given degree length: the question and its enquiry-summary line both name the number. */
export function semestersWording(length: ThresholdLength) {
  const count = DMAT_RULE_VALUES.semesterThresholds[length];
  return {
    text: `Have you completed fewer than ${count} semesters?`,
    summary: `Completed fewer than ${count} semesters`,
  } as const;
}

export type RequirementQuestion = (typeof REQUIREMENT_QUESTIONS)[number];
export type RequirementFollowUp = (typeof REQUIREMENT_FOLLOW_UPS)[number];
/** A main question or a follow-up: both render the same way. */
export type AnyRequirementQuestion = RequirementQuestion | RequirementFollowUp;

export type QuestionId = RequirementQuestion['id'];
export type FollowUpId = RequirementFollowUp['id'];
export type AnswerId = QuestionId | FollowUpId;

/** Every question and follow-up id with the values it accepts. */
export type AnswerValues = { [Question in AnyRequirementQuestion as Question['id']]: Question['options'][number]['value'] };

/** The values one question or follow-up accepts, so `AnswerValue<'aps'>` is `'not-started' | 'applied' | 'certificate' | 'not-sure'`. */
export type AnswerValue<Id extends AnswerId> = AnswerValues[Id];

/** The visitor's answers: a partial record from question or follow-up id to one of that question's values. */
export type RequirementsAnswers = Partial<AnswerValues>;

/** All questions and follow-ups by id. */
export const QUESTION_BY_ID = Object.fromEntries(
  [...REQUIREMENT_QUESTIONS, ...REQUIREMENT_FOLLOW_UPS].map((question) => [question.id, question]),
) as { readonly [Id in AnswerId]: Extract<AnyRequirementQuestion, { id: Id }> };
