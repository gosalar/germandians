import { DMAT } from '@/utils/applicationFacts';

import {
  APS_NOTES,
  DIAGNOSIS_COPY,
  DMAT_CHECK_COPY,
  GRADE_BAND_LABELS,
  type CheckInputs,
} from './data';

/** How much of the dMAT rule follows the guidance sentence: nothing more, the one-line rule, or the full rule with dates and fee. */
export type DmatDetail = 'none' | 'summary' | 'full';

/** A completed APS procedure settles the question; otherwise the degree field decides what the visitor needs to read. */
function buildDmatGuidance(inputs: Pick<CheckInputs, 'aps' | 'dmatField'>): { text: string; detail: DmatDetail } {
  if (inputs.aps === 'APS certificate received') return { text: DMAT.completed, detail: 'none' };
  if (inputs.dmatField === 'Outside these fields') return { text: DMAT_CHECK_COPY.other, detail: 'none' };
  if (inputs.dmatField === 'Affected field') return { text: DMAT_CHECK_COPY.affected, detail: 'full' };
  return { text: DMAT_CHECK_COPY.unknown, detail: 'summary' };
}

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
  if (grade <= 1.5) return GRADE_BAND_LABELS.sehrGut;
  if (grade <= 2.5) return GRADE_BAND_LABELS.gut;
  if (grade <= 3.5) return GRADE_BAND_LABELS.befriedigend;
  return GRADE_BAND_LABELS.ausreichend;
}

function validateInputs(score: number, max: number, min: number): { errorText: string | null; invalidFields: InvalidFields } {
  const invalidFields: InvalidFields = {};
  if (!Number.isFinite(score)) invalidFields.score = true;
  if (!Number.isFinite(max)) invalidFields.max = true;
  if (!Number.isFinite(min)) invalidFields.min = true;
  if (invalidFields.score || invalidFields.max || invalidFields.min) {
    return { errorText: DIAGNOSIS_COPY.incompleteScores, invalidFields };
  }
  if (min <= 0) {
    return { errorText: DIAGNOSIS_COPY.minNotPositive, invalidFields: { min: true } };
  }
  if (max <= min) {
    return { errorText: DIAGNOSIS_COPY.maxNotAboveMin, invalidFields: { max: true, min: true } };
  }
  if (score < min || score > max) {
    return { errorText: DIAGNOSIS_COPY.scoreRange(min, max), invalidFields: { score: true } };
  }
  return { errorText: null, invalidFields: {} };
}

/**
 * Input → conclusion: marks only set conversion and German classification;
 * active backlogs flag outstanding exams; cleared backlogs flag transcript review;
 * duration prompts programme-specific credit assessment; APS selects the next step.
 * No input establishes eligibility or predicts admission. Unanswered fields are
 * omitted from the enquiry; no example is sent as a visitor's profile.
 */
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
  if (inputs.activeBacklogs === 'Yes') bullets.push(DIAGNOSIS_COPY.activeYes);
  if (inputs.activeBacklogs === 'No') bullets.push(DIAGNOSIS_COPY.activeNo);
  if (inputs.clearedBacklogs === 'Yes') bullets.push(DIAGNOSIS_COPY.clearedYes);
  if (inputs.clearedBacklogs === 'No') bullets.push(DIAGNOSIS_COPY.clearedNo);
  if (inputs.degree) bullets.push({ title: DIAGNOSIS_COPY.degreeTitle(inputs.degree), body: DIAGNOSIS_COPY.degreeBody });
  if (inputs.aps) bullets.push({ title: inputs.aps, body: APS_NOTES[inputs.aps] });
  const marks = gradeFormatted
    ? [DIAGNOSIS_COPY.gradeLine(gradeFormatted, inputs.score.trim(), inputs.max.trim(), inputs.min.trim())]
    : hasScore
      ? [
          DIAGNOSIS_COPY.scoreEntered(inputs.score.trim()),
          ...(inputs.max.trim() ? [DIAGNOSIS_COPY.maximumEntered(inputs.max.trim())] : []),
          ...(inputs.min.trim() ? [DIAGNOSIS_COPY.passMarkEntered(inputs.min.trim())] : []),
          DIAGNOSIS_COPY.conversionIncomplete,
        ]
      : [];
  return {
    grade,
    gradeFormatted,
    errorText,
    invalidFields,
    bullets,
    dmat: buildDmatGuidance(inputs),
    classification: grade !== null ? DIAGNOSIS_COPY.classification(classifyGermanGrade(grade)) : DIAGNOSIS_COPY.classificationEmpty,
    headline: grade !== null ? DIAGNOSIS_COPY.headlineWithGrade : DIAGNOSIS_COPY.headlineWithoutGrade,
    formulaText: gradeFormatted !== null
      ? DIAGNOSIS_COPY.formula(max, score, min, gradeFormatted)
      : DIAGNOSIS_COPY.formulaEmpty,
    scaleNote: DIAGNOSIS_COPY.scaleNote,
    snapshot: [
      ...marks,
      ...(inputs.activeBacklogs ? [DIAGNOSIS_COPY.activeBacklogs(inputs.activeBacklogs)] : []),
      ...(inputs.clearedBacklogs ? [DIAGNOSIS_COPY.clearedBacklogs(inputs.clearedBacklogs)] : []),
      ...(inputs.degree ? [DIAGNOSIS_COPY.degreeTitle(inputs.degree)] : []),
      ...(inputs.aps ? [inputs.aps] : []),
      ...(inputs.dmatField ? [DIAGNOSIS_COPY.dmatField(inputs.dmatField)] : []),
    ].join(DIAGNOSIS_COPY.snapshotSeparator),
  };
}
