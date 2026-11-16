import { NAV_CTA, NO_LOGIN_NEEDED } from '@/utils/constants';
import { GRADE_COPY } from '@/utils/gradeConversion';

export const SCALE_PRESETS = [
  { id: 'cgpa-4', label: 'CGPA / 10 (Pass 4.0)', max: '10', min: '4' },
  { id: 'cgpa-5', label: 'CGPA / 10 (Pass 5.0)', max: '10', min: '5' },
  { id: 'pct-40', label: 'Percentage % (Pass 40)', max: '100', min: '40' },
] as const;

export const CHECK_COPY = {
  title: 'German grade check',
  lede: 'Convert your marks to the German grading scale with the Modified Bavarian formula. A conversion is a starting point, not an eligibility decision.',
  badges: [NO_LOGIN_NEEDED, 'Modified Bavarian formula', 'For CGPA and percentage marks'],
  explanation: `${GRADE_COPY.meaning} Each programme applies its own admission rules, and an SOP cannot replace an unmet formal requirement.`,
  ctaLabel: NAV_CTA.label,
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
  resultGradeLabel: 'Your German grade',
  /** Shown under the formula with `SOURCES.gradeFormula`. */
  formulaSource: GRADE_COPY.formulaSource,
} as const;

/** The one link from the grade check to the requirements page. */
export const REQUIREMENTS_LINK_COPY = {
  heading: 'Beyond your grade',
  body: 'Programmes also look at your degree, subject credits, language evidence, tests and documents, and each sets its own deadlines.',
  label: 'See what else programmes check',
} as const;

export const GRADE_BAND_LABELS = {
  sehrGut: 'Sehr gut (Very good)',
  gut: 'Gut (Good)',
  befriedigend: 'Befriedigend (Satisfactory)',
  ausreichend: 'Ausreichend (Sufficient pass)',
} as const;

/** /check's own result copy. Validation messages and the mark lines are `GRADE_COPY` in `@/utils/gradeConversion`. */
export const DIAGNOSIS_COPY = {
  classification: (band: string) => `German grade · ${band}`,
  classificationEmpty: 'Enter your marks to see a conversion',
  headlineWithGrade: 'Your grade is one part of your application.',
  headlineWithoutGrade: 'Start with your marks and your transcript’s grading scale.',
  formula: (max: number, score: number, min: number, grade: string) => `Modified Bavarian formula: 1 + 3 × (${max} − ${score}) / (${max} − ${min}) = ${grade}`,
  formulaEmpty: 'Formula: 1 + 3 × (Max − Your score) / (Max − Min passing)',
  scaleNote: 'German scale: 1.0 is best and 4.0 is the minimum pass. Universities may round or weight modules slightly differently; we check your transcript against each programme’s own rule.',
};
