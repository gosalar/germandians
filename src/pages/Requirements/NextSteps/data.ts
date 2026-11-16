import { DMAT, DMAT_RULE_VALUES, SOURCES, type OfficialSource } from '@/utils/applicationFacts';
import type { StepId, StepLabel } from '@/utils/requirements/logic';

// This file imports nothing from the guide: a topic file may import `STEP_COPY`, and a cycle would
// leave it undefined at load time.

export const NEXT_STEPS_COPY = {
  /** German name of the paper, shown with `lang="de"`; the heading is its English meaning. */
  paperTitle: 'Laufzettel',
  heading: 'Your next steps',
  empty: 'Answer a question and your first step appears here.',
  /** When there are answers but none of them adds a step. Every main answer adds one today; this is the safety net. */
  noSteps: 'Your answers so far add no step. Answer another question and its step appears here.',
  copy: 'Copy my steps',
  copied: 'Copied. Your steps are on your clipboard as plain text.',
  copyUnavailable: 'Copying is not available in this browser. Select the steps and copy them instead.',
  copyEmpty: 'Answer a question first; there are no steps to copy yet.',
  copyNoSteps: 'Your answers so far add no step, so there is nothing to copy yet.',
  copyHeading: 'My next steps for a master’s in Germany',
} as const;

/** "Topic 5: APS and dMAT": a topic's number is its place in the guide. */
export const topicLinkText = (number: number, title: string) => `Topic ${number}: ${title}`;

/** The words for each step label. Meaning never depends on colour: every step shows its label in words. */
export const STEP_LABEL_TEXT: { readonly [Label in StepLabel]: string } = {
  'do-next': 'Do next',
  check: 'Check',
  'does-not-apply': 'Does not apply',
  'find-out': 'Find out',
};

/**
 * What a step says: one line on what to do, and the official page to check. `lead` opens the line on
 * the slip and in the copied steps only (it speaks to the visitor's answer); `text` is what the slip and
 * the guide share.
 */
export interface StepWording {
  lead?: string;
  text: string;
  source?: OfficialSource;
}

/** A step's line as the slip shows it: the lead-in, if any, then the shared text. */
export const stepLine = ({ lead, text }: StepWording) => (lead ? `${lead} ${text}` : text);

/** Degree length and credits, held once: the slip's credits step and the subject-credits topic read it. */
export const DEGREE_LENGTH_CREDITS = 'Your degree’s length does not set your credit total.';

const { earlierApplications } = DMAT;
const { semesterThresholds } = DMAT_RULE_VALUES;

/**
 * Step wording by step id; every id needs an entry, and each line stands on its own (the guide shows
 * the APS lines too). dMAT lines restate only what `DMAT` and `DMAT_RULE_VALUES` say, one row of the
 * outcome table each, and all at one level of certainty: if what you told us holds, this follows under
 * the current rules, and here is who confirms it. A held certificate is described as what you said; a
 * step about programme rules says to check each programme.
 */
export const STEP_COPY: { readonly [Id in StepId]: StepWording } = {
  'aps-not-started': {
    text: 'Use APS India’s requirements quiz to find which APS procedure applies to you, then prepare your documents with the checklist for that procedure.',
    source: SOURCES.apsQuiz,
  },
  'aps-applied': {
    text: 'Check your application status in the APS online student portal and respond if APS asks for information. Check each programme’s deadline for the APS certificate.',
    source: SOURCES.apsFaqs,
  },
  'aps-certificate': {
    lead: 'You said you have your APS certificate.',
    text: 'Keep the original PDF and check where each programme asks you to submit it. APS does not decide admission.',
    source: SOURCES.apsFaqs,
  },
  'aps-not-sure': {
    text: 'Find out whether you have registered with APS or sent it documents.',
  },
  // The APS step says "You said you have your APS certificate." for the same answer, so this line does not repeat it.
  'dmat-aps-completed': {
    text: `${earlierApplications.completed} ${earlierApplications.newApplications}`,
    source: SOURCES.dmat,
  },
  'dmat-other-field': {
    text: `If your degree is outside the ${DMAT.fieldsName}, dMAT does not apply under the current rules. If your degree is mixed or borderline, confirm with APS.`,
    source: SOURCES.dmat,
  },
  'dmat-transition': {
    text: `${earlierApplications.transition} ${earlierApplications.newApplications} Confirm your date with APS.`,
    source: SOURCES.dmat,
  },
  'dmat-confirmed-programme': {
    text: 'If you are taking part in an officially confirmed exchange, double-degree or university partnership programme, dMAT does not apply under the current rules. Confirm with APS that your programme counts.',
    source: SOURCES.dmat,
  },
  // The line is the same for every degree length, so it names both numbers.
  'dmat-early-semesters': {
    text: `If you have completed fewer than ${semesterThresholds['3-year']} semesters of a 3-year degree, or fewer than ${semesterThresholds['4-year']} of a 4-year degree, dMAT does not apply under the current rules. Count your semesters again before you apply to APS.`,
    source: SOURCES.dmat,
  },
  'dmat-mixed-degree': {
    text: `An integrated or dual degree counts for dMAT if a component or major is in one of the ${DMAT.fieldsName}. Confirm with APS whether yours does.`,
    source: SOURCES.dmat,
  },
  'dmat-may-need': {
    text: `If your degree is in one of the ${DMAT.fieldsName}, you may need dMAT. Check who is exempt and the rule for earlier APS applications, then register with g.a.s.t. for a test date.`,
    source: SOURCES.dmat,
  },
  // Shown for "Not sure" and when the question is unanswered, so it names the question rather than an answer.
  'dmat-unknown': {
    text: `Find out whether your degree is in one of the ${DMAT.fieldsName}, listed under “What did you study?”, to see whether dMAT may apply to you.`,
    source: SOURCES.dmat,
  },
  'completion-studying': {
    text: 'Your degree is not finished yet. Check whether each programme accepts an unfinished degree and when it wants proof that you have finished.',
  },
  'completion-awaiting': {
    text: 'Ask your university when it will issue your final documents, such as your degree certificate and last mark sheets, and whether it can give you a provisional degree certificate now.',
  },
  'completion-in-hand': {
    text: 'Gather your degree certificate, your transcripts and your university’s grading scale.',
  },
  'completion-not-sure': {
    text: 'Ask your university whether your degree counts as finished and whether it has issued your degree certificate and last mark sheets.',
  },
  'recognition-check': {
    text: `${DEGREE_LENGTH_CREDITS} Check each programme’s degree and credit rules.`,
  },
  'recognition-not-sure': {
    text: 'Find out how many years your degree officially runs for.',
  },
  'language-certificates': {
    text: 'Check the accepted certificates, scores and exemptions in each programme’s admission rules.',
  },
  'language-decide': {
    text: 'Decide which language you want to study in. It sets which language test you need.',
  },
  'shortlist-start': {
    text: 'Start a shortlist and save each programme’s admission rules.',
  },
  'shortlist-deadlines': {
    text: 'Check each programme’s application and document deadlines for your intake and for applicants from outside the EU.',
  },
  'shortlist-track': {
    text: 'Track each application and send anything a programme still asks you for.',
  },
  'shortlist-not-sure': {
    text: 'Write down the programmes you are considering, even if you have not chosen yet.',
  },
};

/** The steps as plain text for "Copy my steps": a heading, then one numbered line per step with its topic and source. */
export function stepsAsText(steps: readonly { label: StepLabel; id: StepId; topicText: string }[]): string {
  const lines = steps.map(({ label, id, topicText }, index) => {
    const wording = STEP_COPY[id];
    const where = wording.source ? ` Where to check: ${wording.source.label}, ${wording.source.url}` : '';
    return `${index + 1}. ${STEP_LABEL_TEXT[label]}: ${stepLine(wording)} (${topicText})${where}`;
  });
  return [NEXT_STEPS_COPY.copyHeading, '', ...lines].join('\n');
}
