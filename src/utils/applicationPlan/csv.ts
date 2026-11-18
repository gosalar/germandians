import { nextUpcomingDate, sortDateEntries } from './sort.ts';
import type { ApplicationRoute, PlannedProgramme } from './types.ts';

/** Escapes a single CSV field according to RFC 4180 (commas, double quotes, CR and LF). */
export function escapeCsvField(value: string): string {
  const asText = /^[\t\r\n]|^[\s\p{Cc}]*[=+\-@＝＋－＠]/u.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(asText)) {
    return `"${asText.replaceAll('"', '""')}"`;
  }
  return asText;
}

export interface BuildPlanCsvOptions {
  headers: readonly [string, string, string, string, string, string, string, string];
  routeLabels: { readonly [Route in ApplicationRoute]: string };
  referenceDate: string | null;
  formatDatePair: (date: string, label: string) => string;
}

/** Builds an RFC 4180 CSV string with CRLF line endings for the given programmes. */
export function buildPlanCsv(programmes: readonly PlannedProgramme[], options: BuildPlanCsvOptions): string {
  const rows: string[][] = [[...options.headers]];

  for (const programme of programmes) {
    const upcoming = nextUpcomingDate(programme, options.referenceDate);
    const orderedDates = sortDateEntries(programme.dates);
    const allDates = orderedDates.map((entry) => options.formatDatePair(entry.date, entry.label)).join('; ');
    const readyDocs = programme.documents
      .filter((item) => item.status === 'ready')
      .map((item) => item.label)
      .join('; ');
    const missingDocs = programme.documents
      .filter((item) => item.status === 'missing')
      .map((item) => item.label)
      .join('; ');

    rows.push([
      programme.name,
      programme.university,
      programme.url,
      options.routeLabels[programme.route],
      upcoming ? options.formatDatePair(upcoming.date, upcoming.label) : '',
      allDates,
      readyDocs,
      missingDocs,
    ]);
  }

  return `${rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n')}\r\n`;
}
