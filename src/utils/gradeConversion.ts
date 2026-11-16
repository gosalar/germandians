/**
 * Converting Indian marks to the German scale with the Modified Bavarian formula, shared by /check
 * and /requirements. The marks are the visitor's text as typed: nothing here rounds or reformats it
 * except the conversion itself.
 */

/** The three numbers the formula needs, as typed. Empty strings mean "not entered". */
export interface Marks {
  score: string;
  max: string;
  min: string;
}

export const EMPTY_MARKS: Marks = { score: '', max: '', min: '' };

export interface InvalidFields { score?: boolean; max?: boolean; min?: boolean }

/** Validation messages and the summary's mark lines. */
export const GRADE_COPY = {
  incompleteScores: 'Enter your score, the maximum possible score, and your university’s minimum passing score.',
  minNotPositive: 'Minimum passing score must be greater than 0 (typically 4.0 or 5.0 for CGPA, or 35–40 for percentage).',
  maxNotAboveMin: 'Maximum possible score must be greater than the minimum passing score.',
  scoreRange: (min: number, max: number) => `Enter a score between ${min} (minimum passing) and ${max} (maximum possible).`,
  gradeLine: (grade: string, score: string, max: string, min: string) => `German grade ${grade} (${score} / ${max}, pass ${min})`,
  /** Who sets the formula out, as the KMK agreement (`SOURCES.gradeFormula`) states it. */
  formulaSource: 'The KMK, the conference of Germany’s state education ministers, sets the formula out in its agreement on overall grades for foreign university entrance qualifications.',
  /** What a conversion means, and what it does not. */
  meaning: 'Converting your marks shows them on the German scale. It does not tell you whether you meet a programme’s requirements.',
} as const;

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

/** Checks parsed marks; the message names what to fix and `invalidFields` marks the fields to flag. */
export function validateMarks(score: number, max: number, min: number): { errorText: string | null; invalidFields: InvalidFields } {
  const invalidFields: InvalidFields = {};
  if (!Number.isFinite(score)) invalidFields.score = true;
  if (!Number.isFinite(max)) invalidFields.max = true;
  if (!Number.isFinite(min)) invalidFields.min = true;
  if (invalidFields.score || invalidFields.max || invalidFields.min) {
    return { errorText: GRADE_COPY.incompleteScores, invalidFields };
  }
  if (min <= 0) {
    return { errorText: GRADE_COPY.minNotPositive, invalidFields: { min: true } };
  }
  if (max <= min) {
    return { errorText: GRADE_COPY.maxNotAboveMin, invalidFields: { max: true, min: true } };
  }
  if (score < min || score > max) {
    return { errorText: GRADE_COPY.scoreRange(min, max), invalidFields: { score: true } };
  }
  return { errorText: null, invalidFields: {} };
}

export interface MarksConversion {
  /** The parsed numbers; `NaN` where a field is empty or not a number. */
  score: number;
  max: number;
  min: number;
  grade: number | null;
  /** The grade to one decimal, as shown. */
  gradeFormatted: string | null;
  errorText: string | null;
  invalidFields: InvalidFields;
}

/** Parses, validates and converts typed marks. Nothing is flagged until a score is typed. */
export function convertMarks(marks: Marks): MarksConversion {
  const score = parseScoreInput(marks.score);
  const max = parseScoreInput(marks.max);
  const min = parseScoreInput(marks.min);
  // Choosing a scale is not an entry: nothing is flagged or attached until a score is typed.
  const hasScore = Boolean(marks.score.trim());
  const { errorText, invalidFields } = hasScore ? validateMarks(score, max, min) : { errorText: null, invalidFields: {} };
  const grade = errorText ? null : calculateGermanGrade(score, max, min);
  const gradeFormatted = grade !== null ? grade.toFixed(1) : null;
  return { score, max, min, grade, gradeFormatted, errorText, invalidFields };
}

/**
 * The marks as lines for an enquiry summary: the converted grade with the marks it came from. An
 * invalid or empty conversion gives no lines, so it attaches nothing.
 */
export function markLines(marks: Marks): string[] {
  const { gradeFormatted } = convertMarks(marks);
  if (!gradeFormatted) return [];
  return [GRADE_COPY.gradeLine(gradeFormatted, marks.score.trim(), marks.max.trim(), marks.min.trim())];
}
