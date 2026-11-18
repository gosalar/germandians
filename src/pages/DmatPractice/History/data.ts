export const HISTORY_COPY = {
  clearFailed: 'Your practice history could not be cleared from this browser. Please try again.',
  saveFailed: 'Your practice history could not be saved in this browser.',
  cleared: 'Your practice history has been cleared from this browser.',
  title: 'Past attempts',
  subtitle: 'Saved in this browser only as task counts.',
  untimed: 'Untimed practice',
  clear: 'Clear my practice history',
  count: (right: number, done: number) => `${right} right of ${done} done`,
  meta: (modeName: string, dateText: string) => `${modeName} · ${dateText}`,
} as const;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatAttemptDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? isoDate : dateFormatter.format(parsed);
}
