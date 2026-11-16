import {
  NOT_SURE,
  REQUIREMENT_FOLLOW_UPS,
  REQUIREMENT_QUESTIONS,
  semestersWording,
  type AnswerId,
  type AnswerValue,
  type FollowUpId,
  type RequirementsAnswers,
} from './questions';
import type { RequirementTopicId } from './topics';

/**
 * The /requirements rules as pure functions: which follow-ups show, the dMAT outcome, the next steps,
 * the stamps and the summary. No copy lives here: step wording is `STEP_COPY` in
 * `src/pages/Requirements/NextSteps/data.ts`, keyed by step id, and label text is `STEP_LABEL_TEXT` there.
 *
 * Answers to a follow-up that `visibleFollowUps` does not return are ignored by every function, so a
 * stale answer can never influence a result.
 *
 * Stage 1 fixes the signatures and types; track C implements the bodies without changing them.
 */

/**
 * How a step reads at a glance, in the order the slip sorts by. A topic is stamped by any step whose
 * label is not `does-not-apply`.
 */
export const STEP_LABELS = ['do-next', 'check', 'find-out', 'does-not-apply'] as const;
export type StepLabel = (typeof STEP_LABELS)[number];

/** The eight dMAT outcomes, in the order the rule is read (scope section 7, "dMAT outcome"; the first match decides). */
export const DMAT_OUTCOME_IDS = [
  'aps-completed', // 1. APS certificate received → does-not-apply
  'other-field', // 2. Field is "Something else" → does-not-apply
  'transition', // 3. Follow-up B is "Yes" → does-not-apply
  'confirmed-programme', // 4. Follow-up C is "Yes" → check
  'early-semesters', // 5. Follow-up A is "Yes" → check
  'mixed-degree', // 6. Field is "A mix" → check
  'may-need', // 7. Field is on the list and nothing above matched → do-next
  'unknown', // 8. Field "Not sure", or field unanswered and APS answered → find-out
] as const;
export type DmatOutcomeId = (typeof DMAT_OUTCOME_IDS)[number];

/** The six areas a step can come from, in the order the slip lists them. At most one step per area. */
export const STEP_AREAS = ['aps', 'dmat', 'completion', 'recognition', 'language', 'shortlist'] as const;
export type StepArea = (typeof STEP_AREAS)[number];

/**
 * Every step the slip can show, grouped by area. Each id has its own wording in `STEP_COPY`.
 * `-not-sure` steps answer a "Not sure" (for language, "Not decided"); every answered degree length
 * gives the same recognition step, so no length is singled out.
 */
export const STEP_IDS = {
  aps: ['aps-not-started', 'aps-applied', 'aps-certificate', 'aps-not-sure'],
  dmat: DMAT_OUTCOME_IDS.map((outcome) => `dmat-${outcome}` as const),
  completion: ['completion-studying', 'completion-awaiting', 'completion-in-hand', 'completion-not-sure'],
  recognition: ['recognition-check', 'recognition-not-sure'],
  language: ['language-certificates', 'language-decide'],
  shortlist: ['shortlist-start', 'shortlist-deadlines', 'shortlist-track', 'shortlist-not-sure'],
} as const satisfies Record<StepArea, readonly string[]>;

export type StepIdIn<Area extends StepArea> = Area extends 'dmat'
  ? `dmat-${DmatOutcomeId}`
  : (typeof STEP_IDS)[Area][number];
export type StepId = StepIdIn<StepArea>;

/** One line on the slip: what it is, how it reads, and the guide topic it links to and stamps. */
export type NextStep = {
  [Area in StepArea]: { area: Area; id: StepIdIn<Area>; label: StepLabel; topic: RequirementTopicId };
}[StepArea];

// ---------------------------------------------------------------------------------------------------
// Follow-ups (plan 10.2)

/** The field is on the list, a mix or not sure: the dMAT rule is still open, so a follow-up can settle it. */
function fieldIsOpen(answers: RequirementsAnswers): boolean {
  return answers.field === 'dmat-field' || answers.field === 'mix' || answers.field === NOT_SURE;
}

const FOLLOW_UP_SHOWS: { readonly [Id in FollowUpId]: (answers: RequirementsAnswers) => boolean } = {
  // A: only a student still studying can be below the threshold, and the threshold needs a 3- or 4-year degree.
  semesters: (answers) =>
    answers.stage === 'still-studying' && fieldIsOpen(answers) && (answers.length === '3-year' || answers.length === '4-year'),
  // C: an unanswered APS question still shows it; only a reported certificate settles dMAT first.
  confirmedProgramme: (answers) => fieldIsOpen(answers) && answers.aps !== 'certificate',
  // B: only an application already made can predate the transition date.
  apsDate: (answers) => answers.aps === 'applied' && fieldIsOpen(answers),
};

/** Which follow-ups show, in display order (the order of `REQUIREMENT_FOLLOW_UPS`). */
export function visibleFollowUps(answers: RequirementsAnswers): readonly FollowUpId[] {
  return REQUIREMENT_FOLLOW_UPS.map((followUp) => followUp.id).filter((id) => FOLLOW_UP_SHOWS[id](answers));
}

/**
 * The answers with every hidden follow-up removed. Visibility depends only on the six main questions,
 * so this is a single pass. Every function below reads answers through it.
 */
function visibleAnswers(answers: RequirementsAnswers): RequirementsAnswers {
  const shown = new Set(visibleFollowUps(answers));
  const result = { ...answers };
  for (const followUp of REQUIREMENT_FOLLOW_UPS) {
    if (!shown.has(followUp.id)) delete result[followUp.id];
  }
  return result;
}

/**
 * The answers after one answer is set (or cleared, with `undefined`). Nothing from an old answer
 * lingers: every follow-up that is hidden afterwards loses its answer, so it starts unanswered when it
 * shows again, and follow-up A (`semesters`) loses its answer whenever the degree length changes,
 * because its threshold depends on the length.
 */
export function withAnswer<Id extends AnswerId>(
  answers: RequirementsAnswers,
  id: Id,
  value: AnswerValue<Id> | undefined,
): RequirementsAnswers {
  const next: RequirementsAnswers = { ...answers };
  if (value === undefined) delete next[id];
  else next[id] = value;
  if (id === 'length' && answers.length !== value) delete next.semesters;
  return visibleAnswers(next);
}

// ---------------------------------------------------------------------------------------------------
// dMAT outcome (plan 10.3, scope section 7). First match wins; only an explicit "yes" on a follow-up
// matches rows 3 to 5, so "not sure", "no" or no answer falls through.

/** The label each dMAT outcome gives its step. */
const DMAT_OUTCOME_LABEL: { readonly [Id in DmatOutcomeId]: StepLabel } = {
  'aps-completed': 'does-not-apply',
  'other-field': 'does-not-apply',
  transition: 'does-not-apply',
  'confirmed-programme': 'check',
  'early-semesters': 'check',
  'mixed-degree': 'check',
  'may-need': 'do-next',
  unknown: 'find-out',
};

/** The dMAT outcome, or `null` when neither the field nor APS is answered. */
export function dmatOutcome(answers: RequirementsAnswers): DmatOutcomeId | null {
  const given = visibleAnswers(answers);
  if (given.aps === 'certificate') return 'aps-completed';
  if (given.field === 'other-field') return 'other-field';
  if (given.apsDate === 'yes') return 'transition';
  if (given.confirmedProgramme === 'yes') return 'confirmed-programme';
  if (given.semesters === 'yes') return 'early-semesters';
  if (given.field === 'mix') return 'mixed-degree';
  if (given.field === 'dmat-field') return 'may-need';
  if (given.field === NOT_SURE) return 'unknown';
  if (given.field === undefined && given.aps !== undefined) return 'unknown';
  return null;
}

// ---------------------------------------------------------------------------------------------------
// Next steps (plan 10.4). One step per area; the label and topic for each answer are fixed by the plan.

interface StepRule<Area extends StepArea> {
  readonly id: StepIdIn<Area>;
  readonly label: StepLabel;
  readonly topic: RequirementTopicId;
}

type StepRules<Id extends AnswerId, Area extends StepArea> = { readonly [Value in AnswerValue<Id>]: StepRule<Area> | null };

const APS_STEPS: StepRules<'aps', 'aps'> = {
  'not-started': { id: 'aps-not-started', label: 'do-next', topic: 'aps-dmat' },
  applied: { id: 'aps-applied', label: 'do-next', topic: 'aps-dmat' },
  certificate: { id: 'aps-certificate', label: 'do-next', topic: 'aps-dmat' },
  [NOT_SURE]: { id: 'aps-not-sure', label: 'find-out', topic: 'aps-dmat' },
};

const COMPLETION_STEPS: StepRules<'stage', 'completion'> = {
  'still-studying': { id: 'completion-studying', label: 'check', topic: 'degree' },
  // Your degree holds the provisional certificate rules, which is what this step is about.
  'awaiting-documents': { id: 'completion-awaiting', label: 'do-next', topic: 'degree' },
  'documents-in-hand': { id: 'completion-in-hand', label: 'do-next', topic: 'documents' },
  [NOT_SURE]: { id: 'completion-not-sure', label: 'find-out', topic: 'degree' },
};

const RECOGNITION_STEPS: StepRules<'length', 'recognition'> = {
  // Every answered length gets the same credits step: the length does not set the credit total.
  '3-year': { id: 'recognition-check', label: 'check', topic: 'subject-credits' },
  '4-year': { id: 'recognition-check', label: 'check', topic: 'subject-credits' },
  other: { id: 'recognition-check', label: 'check', topic: 'subject-credits' },
  [NOT_SURE]: { id: 'recognition-not-sure', label: 'find-out', topic: 'degree' },
};

const LANGUAGE_STEPS: StepRules<'language', 'language'> = {
  english: { id: 'language-certificates', label: 'check', topic: 'language' },
  german: { id: 'language-certificates', label: 'check', topic: 'language' },
  both: { id: 'language-certificates', label: 'check', topic: 'language' },
  [NOT_SURE]: { id: 'language-decide', label: 'find-out', topic: 'language' },
};

const SHORTLIST_STEPS: StepRules<'shortlist', 'shortlist'> = {
  'not-yet': { id: 'shortlist-start', label: 'do-next', topic: 'subject-credits' },
  yes: { id: 'shortlist-deadlines', label: 'check', topic: 'deadlines' },
  applied: { id: 'shortlist-track', label: 'do-next', topic: 'applying' },
  [NOT_SURE]: { id: 'shortlist-not-sure', label: 'find-out', topic: 'subject-credits' },
};

/** Sort key: label first (`STEP_LABELS` order), then area (`STEP_AREAS` order). */
function stepRank(step: NextStep): number {
  return STEP_LABELS.indexOf(step.label) * STEP_AREAS.length + STEP_AREAS.indexOf(step.area);
}

/**
 * The visitor's next steps, at most one per area, sorted by label (Do next, Check, Find out,
 * Does not apply) and then by `STEP_AREAS` order. Empty with no answers.
 */
export function nextSteps(answers: RequirementsAnswers): readonly NextStep[] {
  const given = visibleAnswers(answers);
  const steps: NextStep[] = [];

  const aps = given.aps === undefined ? null : APS_STEPS[given.aps];
  if (aps) steps.push({ area: 'aps', ...aps });

  const outcome = dmatOutcome(given);
  if (outcome) {
    steps.push({ area: 'dmat', id: `dmat-${outcome}` as const, label: DMAT_OUTCOME_LABEL[outcome], topic: 'aps-dmat' });
  }

  const completion = given.stage === undefined ? null : COMPLETION_STEPS[given.stage];
  if (completion) steps.push({ area: 'completion', ...completion });

  const recognition = given.length === undefined ? null : RECOGNITION_STEPS[given.length];
  if (recognition) steps.push({ area: 'recognition', ...recognition });

  const language = given.language === undefined ? null : LANGUAGE_STEPS[given.language];
  if (language) steps.push({ area: 'language', ...language });

  const shortlist = given.shortlist === undefined ? null : SHORTLIST_STEPS[given.shortlist];
  if (shortlist) steps.push({ area: 'shortlist', ...shortlist });

  return steps.sort((first, second) => stepRank(first) - stepRank(second));
}

/** The topics to stamp: those of steps whose label is not `does-not-apply`. */
export function stampedTopics(steps: readonly NextStep[]): ReadonlySet<RequirementTopicId> {
  return new Set(steps.filter((step) => step.label !== 'does-not-apply').map((step) => step.topic));
}

// ---------------------------------------------------------------------------------------------------
// Summary

interface SummaryEntry {
  readonly id: AnswerId;
  readonly summary: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
}

/** Main questions in order, each followed by its follow-ups in their array order: the order they show. */
const SUMMARY_ORDER: readonly SummaryEntry[] = REQUIREMENT_QUESTIONS.flatMap((question) => [
  question,
  ...REQUIREMENT_FOLLOW_UPS.filter((followUp) => followUp.after === question.id),
]);

/** One line per answered, visible question, for the enquiry summary: the question's `summary` and the answer's label. */
export function summaryLines(answers: RequirementsAnswers): readonly string[] {
  const visible = visibleAnswers(answers);
  const given: Partial<Record<AnswerId, string>> = visible;
  return SUMMARY_ORDER.flatMap((question) => {
    const option = question.options.find((candidate) => candidate.value === given[question.id]);
    if (!option) return [];
    // Follow-up A shows only for a 3- or 4-year degree, and its line names that length's number, as its question does.
    const summary =
      question.id === 'semesters' && (visible.length === '3-year' || visible.length === '4-year')
        ? semestersWording(visible.length).summary
        : question.summary;
    return [`${summary}: ${option.label}`];
  });
}
