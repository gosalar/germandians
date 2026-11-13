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
  reviewedLabel: 'Last reviewed',
  stepOne: 'Step 1',
  marksTitle: 'Your marks (Modified Bavarian formula)',
  presetsLabel: 'Indian grading scale presets',
  scoreFieldLabel: 'Your score',
  maxFieldLabel: 'Max possible',
  minFieldLabel: 'Min passing',
  mobileGradeLabel: 'German grade',
  emptyGrade: '—',
  exampleLead: 'Example, using a 10-point scale:',
  exampleBeforeFirst: ' A 7.4 CGPA converts to ',
  exampleFirst: '2.3',
  exampleBetween: ' when the minimum passing grade is 4.0, but ',
  exampleSecond: '2.5',
  exampleAfter: ' when the minimum passing grade is 5.0. Never enter 0.',
  stepTwo: 'Step 2',
  degreeLabel: 'Bachelor’s degree duration',
  degreeGroupLabel: "Bachelor's degree duration",
  apsLabel: 'APS status',
  dmatGroupLabel: 'dMAT degree field',
  resultGradeLabel: 'Your German grade',
  readinessLabel: 'readiness',
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

export const GRADE_BAND_LABELS = {
  sehrGut: 'Sehr gut (Very good)',
  gut: 'Gut (Good)',
  befriedigend: 'Befriedigend (Satisfactory)',
  ausreichend: 'Ausreichend (Sufficient pass)',
} as const;

export const APS_NOTES: Record<ApsOption, string> = {
  'APS certificate received': 'Keep the original digital certificate and check where each programme asks you to submit it. APS verification does not decide admission.',
  'APS applied, awaiting certificate': 'Check your application status in the APS student portal and respond if APS asks for information. Check each programme’s certificate deadline separately.',
  'APS not started': 'Use APS India’s requirements quiz to find the procedure that applies to you, then prepare your documents with the checklist for that procedure.',
};

export const DIAGNOSIS_COPY = {
  incompleteScores: 'Enter your score, the maximum possible score, and your university’s minimum passing score.',
  minNotPositive: 'Minimum passing score must be greater than 0 (typically 4.0 or 5.0 for CGPA, or 35–40 for percentage).',
  maxNotAboveMin: 'Maximum possible score must be greater than the minimum passing score.',
  scoreRange: (min: number, max: number) => `Enter a score between ${min} (minimum passing) and ${max} (maximum possible).`,
  activeYes: {
    title: 'Outstanding exams',
    body: 'You still have exams to clear. Check whether each programme accepts an unfinished degree and when it requires proof of completion.',
  },
  activeNo: {
    title: 'Active backlogs',
    body: 'You reported no active backlogs. Degree completion and all other requirements still need checking.',
  },
  clearedYes: {
    title: 'Cleared backlogs',
    body: 'Review the attempts and results shown on your transcripts against each programme’s admission rules. Cleared backlogs are not an admission rating.',
  },
  clearedNo: {
    title: 'Cleared backlogs',
    body: 'You reported no cleared backlogs. This does not establish eligibility.',
  },
  degreeTitle: (duration: string) => `Degree duration: ${duration}`,
  degreeBody: 'Duration alone does not establish a credit total. Total credits and subject matching are assessed against each programme’s requirements.',
  gradeLine: (grade: string, score: string, max: string, min: string) => `German grade ${grade} (${score} / ${max}, pass ${min})`,
  scoreEntered: (score: string) => `Score entered: ${score}`,
  maximumEntered: (max: string) => `Maximum entered: ${max}`,
  passMarkEntered: (min: string) => `Pass mark entered: ${min}`,
  conversionIncomplete: 'Conversion incomplete or invalid',
  activeBacklogs: (value: string) => `Active backlogs: ${value}`,
  clearedBacklogs: (value: string) => `Cleared backlogs: ${value}`,
  dmatField: (value: string) => `dMAT degree field: ${value}`,
  snapshotSeparator: ' · ',
  classification: (band: string) => `German grade · ${band}`,
  classificationEmpty: 'Enter your marks to see a conversion',
  headlineWithGrade: 'Your grade is one part of the requirements check.',
  headlineWithoutGrade: 'Start with your marks and your transcript’s grading scale.',
  formula: (max: number, score: number, min: number, grade: string) => `Modified Bavarian formula: 1 + 3 × (${max} − ${score}) / (${max} − ${min}) = ${grade}`,
  formulaEmpty: 'Formula: 1 + 3 × (Max − Your score) / (Max − Min passing)',
  scaleNote: 'German scale: 1.0 is best and 4.0 is the minimum pass. Universities may round or weight modules slightly differently; we check your transcript against each programme’s own rule.',
};
