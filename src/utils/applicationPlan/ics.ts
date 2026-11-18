import { sortDateEntries } from './sort.ts';
import type { PlanDateEntry, PlannedProgramme } from './types.ts';
import { formatUtcTimestamp, getProgrammeUrl, isValidIsoDate, nextCalendarDate, toCompactDate } from './validation.ts';

const utf8Encoder = new TextEncoder();

/** Escapes RFC 5545 TEXT property characters: backslash, semicolon, comma, and line breaks. */
export function escapeIcsText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll('\n', '\\n')
    .replace(/\p{Cc}/gu, (character) => (character === '\t' ? character : ''));
}

/** Folds an RFC 5545 content line so no physical line exceeds 75 UTF-8 octets, without splitting code points. */
export function foldIcsLine(line: string): string {
  if (utf8Encoder.encode(line).length <= 75) return line;
  const segments: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const char of line) {
    const charBytes = utf8Encoder.encode(char).length;
    if (currentBytes + charBytes > 75 && current.length > 0) {
      segments.push(current);
      current = ` ${char}`;
      currentBytes = 1 + charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }
  if (current.length > 0) segments.push(current);
  return segments.join('\r\n');
}

function hash32(input: string, seed: number): string {
  let hash = seed >>> 0;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Deterministic, stable UID for a programme date entry across repeated exports and reloads. */
export function deterministicEventUid(programme: PlannedProgramme, entry: PlanDateEntry): string {
  const canonical = JSON.stringify([programme.id, entry.id]);
  return `ap-${hash32(canonical, 0x811c9dc5)}${hash32(canonical, 0x9e3779b9)}@germandians`;
}

export interface BuildIcsOptions {
  now: Date;
  prodId?: string;
  formatSummary: (programme: PlannedProgramme, entry: PlanDateEntry) => string;
  formatDescription: (programme: PlannedProgramme, entry: PlanDateEntry) => string;
}

/** Builds an RFC 5545 `.ics` calendar string with CRLF line endings and all-day VEVENT entries. */
export function buildIcsCalendar(programmes: readonly PlannedProgramme[], options: BuildIcsOptions): string {
  const dtstamp = formatUtcTimestamp(options.now);
  const prodId = options.prodId ?? '-//Germandians//Application Plan//EN';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${escapeIcsText(prodId)}`,
    'CALSCALE:GREGORIAN',
  ];

  for (const programme of programmes) {
    const url = getProgrammeUrl(programme.url);
    const orderedDates = sortDateEntries(programme.dates);
    for (const entry of orderedDates) {
      if (!isValidIsoDate(entry.date)) continue;
      const uid = deterministicEventUid(programme, entry);
      const startDate = toCompactDate(entry.date);
      const endDate = toCompactDate(nextCalendarDate(entry.date));
      const summary = escapeIcsText(options.formatSummary(programme, entry));
      const description = escapeIcsText(options.formatDescription(programme, entry));

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;VALUE=DATE:${startDate}`);
      // A DATE event without DTEND lasts one day, including the last day of year 9999.
      if (endDate.length === 8) lines.push(`DTEND;VALUE=DATE:${endDate}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DESCRIPTION:${description}`);
      if (url) lines.push(`URL:${url}`);
      lines.push('END:VEVENT');
    }
  }

  lines.push('END:VCALENDAR');
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}
