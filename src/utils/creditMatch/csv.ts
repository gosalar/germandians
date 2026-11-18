import { formatCredits } from './logic.ts';
import type { CreditMatchWorksheet, CsvCopy, WorksheetSummary } from './types.ts';

/** Escapes commas, quotes and line breaks according to RFC 4180. */
export function escapeCsvCell(value: string): string {
  const asText = /^[\t\r\n]|^[\s\p{Cc}]*[=+\-@＝＋－＠]/u.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(asText)) {
    return `"${asText.replaceAll('"', '""')}"`;
  }
  return asText;
}

function formatCsvRow(cells: readonly string[]): string {
  return cells.map(escapeCsvCell).join(',');
}

export function buildCreditMatchCsv(
  worksheet: CreditMatchWorksheet,
  summary: WorksheetSummary,
  copy: CsvCopy,
): string {
  const lines: string[] = [];

  lines.push(formatCsvRow(copy.worksheetHeading));
  lines.push(formatCsvRow([copy.noteHeading, copy.noteBody]));

  const university = worksheet.context.university.trim();
  const programme = worksheet.context.programme.trim();
  const programmeUrl = worksheet.context.programmeUrl.trim();

  if (university) lines.push(formatCsvRow([copy.universityHeading, university]));
  if (programme) lines.push(formatCsvRow([copy.programmeHeading, programme]));
  if (programmeUrl) lines.push(formatCsvRow([copy.programmeUrlHeading, programmeUrl]));

  lines.push('');
  lines.push(formatCsvRow(copy.areaTableHeaders));

  for (const areaSummary of summary.areas) {
    const requiredText =
      areaSummary.parsedRequiredCredits !== null
        ? formatCredits(areaSummary.parsedRequiredCredits)
        : areaSummary.area.requiredCredits.trim();
    const mappedCoursesText =
      areaSummary.mappedCourses.length > 0
        ? areaSummary.mappedCourses
            .map((item) => copy.mappedCourseItem(item.title, formatCredits(item.mappedCredits)))
            .join('; ')
        : copy.unmappedAreaCell;

    lines.push(
      formatCsvRow([
        areaSummary.area.name,
        requiredText,
        formatCredits(areaSummary.mappedCredits),
        mappedCoursesText,
      ]),
    );
  }

  lines.push('');
  lines.push(formatCsvRow(copy.courseTableHeaders));

  for (const courseSummary of summary.courses) {
    const transcriptCreditsText =
      courseSummary.parsedCredits !== null
        ? formatCredits(courseSummary.parsedCredits)
        : courseSummary.course.credits.trim();

    if (courseSummary.mappedCredits === 0) {
      lines.push(
        formatCsvRow([
          courseSummary.course.title,
          transcriptCreditsText,
          courseSummary.mappingNeedsCorrection ? copy.needsCorrection : copy.unmappedCourseArea,
          '0',
          courseSummary.course.moduleRef,
        ]),
      );
      continue;
    }

    for (const allocation of courseSummary.resolvedAllocations) {
      if (allocation.credits === 0) continue;
      lines.push(
        formatCsvRow([
          courseSummary.course.title,
          transcriptCreditsText,
          allocation.areaName,
          formatCredits(allocation.credits),
          courseSummary.course.moduleRef,
        ]),
      );
    }
  }

  return `${lines.join('\r\n')}\r\n`;
}

export function creditMatchCsvFilename(programme: string): string {
  const slug = programme
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return slug ? `credit-match-${slug}.csv` : 'credit-match-worksheet.csv';
}
