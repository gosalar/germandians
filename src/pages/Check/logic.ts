import type { EnquirySummary } from '@/services/profileReview';
import { convertMarks, markLines, type Marks } from '@/utils/gradeConversion';

import { DIAGNOSIS_COPY, GRADE_BAND_LABELS } from './data';

function classifyGermanGrade(grade: number): string {
  if (grade <= 1.5) return GRADE_BAND_LABELS.sehrGut;
  if (grade <= 2.5) return GRADE_BAND_LABELS.gut;
  if (grade <= 3.5) return GRADE_BAND_LABELS.befriedigend;
  return GRADE_BAND_LABELS.ausreichend;
}

/**
 * Marks → conversion: the German grade, its classification and the formula.
 * The conversion does not establish eligibility or predict admission. The enquiry
 * summary is offered only for a valid conversion (the grade with the marks it came
 * from); an invalid or empty conversion attaches nothing.
 */
export function buildCheckDiagnosis(marks: Marks) {
  const { score, max, min, grade, gradeFormatted, errorText, invalidFields } = convertMarks(marks);
  const lines = markLines(marks);
  const summary: EnquirySummary | undefined = lines.length > 0 ? { source: 'grade-check', lines } : undefined;
  return {
    gradeFormatted,
    errorText,
    invalidFields,
    classification: grade !== null ? DIAGNOSIS_COPY.classification(classifyGermanGrade(grade)) : DIAGNOSIS_COPY.classificationEmpty,
    headline: grade !== null ? DIAGNOSIS_COPY.headlineWithGrade : DIAGNOSIS_COPY.headlineWithoutGrade,
    formulaText: gradeFormatted !== null
      ? DIAGNOSIS_COPY.formula(max, score, min, gradeFormatted)
      : DIAGNOSIS_COPY.formulaEmpty,
    scaleNote: DIAGNOSIS_COPY.scaleNote,
    summary,
  };
}
