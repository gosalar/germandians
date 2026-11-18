import type { PlanDateEntry, PlannedProgramme } from './types.ts';

/** Sorts a programme's date entries chronologically, keeping entry order on equal dates. */
export function sortDateEntries(dates: readonly PlanDateEntry[]): PlanDateEntry[] {
  return dates
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => left.entry.date.localeCompare(right.entry.date) || left.index - right.index)
    .map(({ entry }) => entry);
}

/**
 * Finds the next upcoming date (`>= referenceDate`) on a programme.
 * When `referenceDate` is `null` (before client mount), returns the earliest date if any.
 */
export function nextUpcomingDate(programme: PlannedProgramme, referenceDate: string | null): PlanDateEntry | null {
  const ordered = sortDateEntries(programme.dates);
  if (ordered.length === 0) return null;
  if (referenceDate === null) return ordered[0];
  return ordered.find((entry) => entry.date >= referenceDate) ?? null;
}

/**
 * Sorts programmes by their next upcoming visitor-entered date (`>= referenceDate`).
 * Programmes with an upcoming date come first (earliest upcoming date first), followed by
 * programmes whose dates are all before `referenceDate` (earliest date first), followed by
 * programmes with no dates yet. Ties keep insertion order.
 */
export function sortProgrammesByUpcomingDate(
  programmes: readonly PlannedProgramme[],
  referenceDate: string | null,
): PlannedProgramme[] {
  return programmes
    .map((programme, index) => {
      const orderedDates = sortDateEntries(programme.dates);
      const upcoming = nextUpcomingDate(programme, referenceDate);
      const bucket = upcoming !== null ? 0 : orderedDates.length > 0 ? 1 : 2;
      const sortDate = upcoming?.date ?? orderedDates[0]?.date ?? '';
      return { programme, index, bucket, sortDate };
    })
    .sort((left, right) => {
      if (left.bucket !== right.bucket) return left.bucket - right.bucket;
      if (left.sortDate !== right.sortDate) return left.sortDate.localeCompare(right.sortDate);
      return left.index - right.index;
    })
    .map(({ programme }) => programme);
}
