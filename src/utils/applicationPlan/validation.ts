const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getProgrammeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^https?:\/\/[^/\\]/i.test(trimmed) || /[\s\p{Cc}\\]/u.test(trimmed)) return null;
  try {
    return new URL(trimmed).href;
  } catch {
    return null;
  }
}

/** A programme link is optional. */
export function isValidProgrammeUrl(raw: string): boolean {
  return raw.trim() === '' || getProgrammeUrl(raw) !== null;
}

/** Validates a real Gregorian calendar date written as YYYY-MM-DD. */
export function isValidIsoDate(raw: string): boolean {
  const match = ISO_DATE_PATTERN.exec(raw.trim());
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const utc = new Date(0);
  utc.setUTCFullYear(year, month - 1, day);
  utc.setUTCHours(0, 0, 0, 0);
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}

/** Returns the next calendar day as YYYY-MM-DD for a valid YYYY-MM-DD input. */
export function nextCalendarDate(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate.trim());
  if (!match) throw new Error(`Invalid ISO date: ${isoDate}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(0);
  utc.setUTCFullYear(year, month - 1, day + 1);
  utc.setUTCHours(0, 0, 0, 0);
  const nextYear = String(utc.getUTCFullYear()).padStart(4, '0');
  const nextMonth = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(utc.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/** Converts YYYY-MM-DD into RFC 5545 compact YYYYMMDD format. */
export function toCompactDate(isoDate: string): string {
  return isoDate.trim().replaceAll('-', '');
}

/** Formats a client-supplied Date as local YYYY-MM-DD. Call only after mount. */
export function todayIsoLocal(now: Date): string {
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Formats a Date as RFC 5545 UTC timestamp YYYYMMDDTHHMMSSZ. */
export function formatUtcTimestamp(now: Date): string {
  const year = String(now.getUTCFullYear()).padStart(4, '0');
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}
