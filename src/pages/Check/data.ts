import { DMAT } from '@/utils/applicationFacts';
import { NAV_CTA } from '@/utils/constants';

export const DMAT_FIELDS = ['Affected field', 'Outside these fields', 'Not sure'] as const;
export type DmatField = (typeof DMAT_FIELDS)[number];
export const DMAT_CHECK_COPY = {
  label: 'Bachelor’s degree field for dMAT',
  heading: 'dMAT and APS',
  unknown: 'Check whether dMAT applies to your degree and applicant group.',
  affected: 'For a master’s application, you may need dMAT. Check the exemptions and transitional rules below.',
  other: 'You reported a degree outside the affected fields. This is exempt under the current dMAT procedure; confirm any mixed or borderline degree with APS.',
} as const;

/** How much of the dMAT rule follows the guidance sentence: nothing more, the one-line rule, or the full rule with dates and fee. */
export type DmatDetail = 'none' | 'summary' | 'full';

/** A completed APS procedure settles the question; otherwise the degree field decides what the visitor needs to read. */
function buildDmatGuidance(inputs: Pick<CheckInputs, 'aps' | 'dmatField'>): { text: string; detail: DmatDetail } {
  if (inputs.aps === 'APS certificate received') return { text: DMAT.completed, detail: 'none' };
  if (inputs.dmatField === 'Outside these fields') return { text: DMAT_CHECK_COPY.other, detail: 'none' };
  if (inputs.dmatField === 'Affected field') return { text: DMAT_CHECK_COPY.affected, detail: 'full' };
  return { text: DMAT_CHECK_COPY.unknown, detail: 'summary' };
}

/**
 * Input → conclusion: marks only set conversion and German classification;
 * active backlogs flag outstanding exams; cleared backlogs flag transcript review;
 * duration prompts programme-specific credit assessment; APS selects the next step.
 * No input establishes eligibility or predicts admission. Unanswered fields are
 * omitted from the enquiry; no example is sent as a visitor's profile.
 */
export const SCALE_PRESETS = [
  { id: 'cgpa-4', label: 'CGPA / 10 (Pass 4.0)', max: '10', min: '4' },
  { id: 'cgpa-5', label: 'CGPA / 10 (Pass 5.0)', max: '10', min: '5' },
  { id: 'pct-40', label: 'Percentage % (Pass 40)', max: '100', min: '40' },
] as const;

export const BACKLOG_OPTIONS = ['No', 'Yes'] as const;
export const BACKLOG_QUESTIONS = [
  { field: 'activeBacklogs', label: 'Any active backlogs?', group: 'Active backlogs' },
  { field: 'clearedBacklogs', label: 'Any cleared backlogs?', group: 'Cleared backlogs' },
] as const;
export type BacklogOption = (typeof BACKLOG_OPTIONS)[number];
export const DEGREE_OPTIONS = [
  { value: '4-year', label: '4-year' },
  { value: '3-year', label: '3-year' },
  { value: 'Other duration', label: 'Other duration' },
] as const;
export type DegreeOption = (typeof DEGREE_OPTIONS)[number]['value'];
export const APS_OPTIONS = [
  { value: 'APS certificate received', label: 'Have APS' },
  { value: 'APS applied, awaiting certificate', label: 'Applied, waiting' },
  { value: 'APS not started', label: 'Not started yet' },
] as const;
export type ApsOption = (typeof APS_OPTIONS)[number]['value'];

export interface CheckInputs {
  score: string;
  max: string;
  min: string;
  activeBacklogs: BacklogOption | null;
  clearedBacklogs: BacklogOption | null;
  degree: DegreeOption | null;
  aps: ApsOption | null;
  dmatField: DmatField | null;
}
export const DEFAULT_CHECK_INPUTS: CheckInputs = {
  score: '', max: '', min: '', activeBacklogs: null, clearedBacklogs: null, degree: null, aps: null, dmatField: null,
};

export const CHECK_COPY = {
  title: 'German grade and requirements check',
  lede: 'Convert your marks with the Modified Bavarian formula, then check each programme’s admission requirements. This is a starting point, not an eligibility decision.',
  badges: ['No login or email needed', 'KMK-recommended Bavarian formula', 'Preliminary requirements check'],
  profileTitle: 'Details for your requirements review',
  profileNote: 'Optional. Choose only what you know. Select an answer again to clear it.',
  resultTitle: 'What still needs checking',
  explanation: 'The converted grade expresses your marks on the German scale. It does not establish eligibility. Each programme applies its own admission rules, and an SOP cannot replace an unmet formal requirement.',
  ctaLabel: NAV_CTA.label,
  sourceLabel: 'Examples of programme rules, not university recommendations',
  reviewed: '11 November 2026',
} as const;
export const REQUIREMENTS = [
  { title: 'Subject credits', body: 'Compare your total credits and subject content with the programme’s admission rules.' },
  { title: 'Recognised degree', body: 'Check whether your institution and qualification meet the programme’s recognition and entry requirements.' },
  { title: 'Language evidence', body: 'Check the accepted certificates, scores and exemptions in the programme’s admission rules.' },
  { title: 'Required tests', body: 'Check which tests and minimum results the programme requires for your applicant group.' },
  { title: 'Deadlines', body: 'Check the programme’s application and document deadlines for your intake and applicant group.' },
  { title: 'Documents', body: 'Check the programme’s document list, formats, translations and certification requirements.' },
] as const;
export const PROGRAMME_SOURCES = [
  { label: 'Software engineering admission rules (example)', url: 'https://sc.informatik.rwth-aachen.de/en/studium/master/sse/application-for-admission/' },
  { label: 'Informatics admission rules (example)', url: 'https://www.cit.tum.de/en/cit/studies/degree-programs/master-informatics/' },
] as const;
export const APS_SOURCE = { label: 'APS India procedure and status guidance', url: 'https://aps-india.de/faqs/' } as const;

export interface InvalidFields { score?: boolean; max?: boolean; min?: boolean }

/** Parses a numeric string, accepting either "." or "," as the decimal separator. */
export function parseScoreInput(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) return Number.NaN;
  return Number(normalized);
}

/** Modified Bavarian formula, truncated to one decimal with floating-point tolerance. */
export function calculateGermanGrade(score: number, max: number, min: number): number | null {
  if (!Number.isFinite(score) || !Number.isFinite(max) || !Number.isFinite(min)) return null;
  if (min <= 0 || max <= min || score < min || score > max) return null;
  const raw = 1 + (3 * (max - score)) / (max - min);
  const truncated = Math.floor(raw * 10 + 1e-9) / 10;
  return Math.max(1.0, Math.min(4.0, truncated));
}

function classifyGermanGrade(grade: number): string {
  if (grade <= 1.5) return 'Sehr gut (Very good)';
  if (grade <= 2.5) return 'Gut (Good)';
  if (grade <= 3.5) return 'Befriedigend (Satisfactory)';
  return 'Ausreichend (Sufficient pass)';
}

function validateInputs(score: number, max: number, min: number): { errorText: string | null; invalidFields: InvalidFields } {
  const invalidFields: InvalidFields = {};
  if (!Number.isFinite(score)) invalidFields.score = true;
  if (!Number.isFinite(max)) invalidFields.max = true;
  if (!Number.isFinite(min)) invalidFields.min = true;
  if (invalidFields.score || invalidFields.max || invalidFields.min) {
    return { errorText: 'Enter your score, the maximum possible score, and your university’s minimum passing score.', invalidFields };
  }
  if (min <= 0) {
    return {
      errorText: 'Minimum passing score must be greater than 0 (typically 4.0 or 5.0 for CGPA, or 35–40 for percentage).',
      invalidFields: { min: true },
    };
  }
  if (max <= min) {
    return { errorText: 'Maximum possible score must be greater than the minimum passing score.', invalidFields: { max: true, min: true } };
  }
  if (score < min || score > max) {
    return { errorText: `Enter a score between ${min} (minimum passing) and ${max} (maximum possible).`, invalidFields: { score: true } };
  }
  return { errorText: null, invalidFields: {} };
}

const APS_NOTES: Record<ApsOption, string> = {
  'APS certificate received': 'Keep the original digital certificate and check where each programme asks you to submit it. APS verification does not decide admission.',
  'APS applied, awaiting certificate': 'Check your application status in the APS student portal and respond if APS asks for information. Check each programme’s certificate deadline separately.',
  'APS not started': 'Use APS India’s requirements quiz to find the procedure that applies to you, then prepare your documents with the checklist for that procedure.',
};

export function buildCheckDiagnosis(inputs: CheckInputs) {
  const score = parseScoreInput(inputs.score);
  const max = parseScoreInput(inputs.max);
  const min = parseScoreInput(inputs.min);
  // Choosing a scale is not an entry: nothing is flagged or attached until a score is typed.
  const hasScore = Boolean(inputs.score.trim());
  const { errorText, invalidFields } = hasScore ? validateInputs(score, max, min) : { errorText: null, invalidFields: {} };
  const grade = errorText ? null : calculateGermanGrade(score, max, min);
  const gradeFormatted = grade !== null ? grade.toFixed(1) : null;
  const bullets: { title: string; body: string }[] = [];
  if (inputs.activeBacklogs === 'Yes') bullets.push({ title: 'Outstanding exams', body: 'You still have exams to clear. Check whether each programme accepts an unfinished degree and when it requires proof of completion.' });
  if (inputs.activeBacklogs === 'No') bullets.push({ title: 'Active backlogs', body: 'You reported no active backlogs. Degree completion and all other requirements still need checking.' });
  if (inputs.clearedBacklogs === 'Yes') bullets.push({ title: 'Cleared backlogs', body: 'Review the attempts and results shown on your transcripts against each programme’s admission rules. Cleared backlogs are not an admission rating.' });
  if (inputs.clearedBacklogs === 'No') bullets.push({ title: 'Cleared backlogs', body: 'You reported no cleared backlogs. This does not establish eligibility.' });
  if (inputs.degree) bullets.push({ title: `Degree duration: ${inputs.degree}`, body: 'Duration alone does not establish a credit total. Total credits and subject matching are assessed against each programme’s requirements.' });
  if (inputs.aps) bullets.push({ title: inputs.aps, body: APS_NOTES[inputs.aps] });
  const marks = gradeFormatted
    ? [`German grade ${gradeFormatted} (${inputs.score.trim()} / ${inputs.max.trim()}, pass ${inputs.min.trim()})`]
    : hasScore
      ? [
          `Score entered: ${inputs.score.trim()}`,
          ...(inputs.max.trim() ? [`Maximum entered: ${inputs.max.trim()}`] : []),
          ...(inputs.min.trim() ? [`Pass mark entered: ${inputs.min.trim()}`] : []),
          'Conversion incomplete or invalid',
        ]
      : [];
  return {
    grade, gradeFormatted, errorText, invalidFields, bullets,
    dmat: buildDmatGuidance(inputs),
    classification: grade !== null ? `German grade · ${classifyGermanGrade(grade)}` : 'Enter your marks to see a conversion',
    headline: grade !== null ? 'Your grade is one part of the requirements check.' : 'Start with your marks and your transcript’s grading scale.',
    formulaText: grade !== null
      ? `Modified Bavarian formula: 1 + 3 × (${max} − ${score}) / (${max} − ${min}) = ${gradeFormatted}`
      : 'Formula: 1 + 3 × (Max − Your score) / (Max − Min passing)',
    scaleNote: 'German scale: 1.0 is best and 4.0 is the minimum pass. Universities may round or weight modules slightly differently; we check your transcript against each programme’s own rule.',
    snapshot: [
      ...marks,
      ...(inputs.activeBacklogs ? [`Active backlogs: ${inputs.activeBacklogs}`] : []),
      ...(inputs.clearedBacklogs ? [`Cleared backlogs: ${inputs.clearedBacklogs}`] : []),
      ...(inputs.degree ? [`Degree duration: ${inputs.degree}`] : []),
      ...(inputs.aps ? [inputs.aps] : []),
      ...(inputs.dmatField ? [`dMAT degree field: ${inputs.dmatField}`] : []),
    ].join(' · '),
  };
}
