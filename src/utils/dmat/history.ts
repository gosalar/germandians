import type { SectionResult } from './marking';
import type { Session } from './session';
import { MODES, SECTION_IDS, type Mode, type SectionId } from './types.ts';

/**
 * Past finished attempts kept in browser storage under `germandians:dmat-history`, separate from the
 * active session in `germandians:dmat-practice`. Stores task counts only — never scores or pass/fail.
 */

export const HISTORY_KEY = 'germandians:dmat-history';
export const MAX_HISTORY = 50;

export interface HistorySectionCount {
  section: SectionId;
  right: number;
  done: number;
}

export interface HistoryAttempt {
  id: string;
  mode: Mode;
  mock: number | null;
  /** Set when the attempt covered a single section; `null` for a full mock or multi-section run. */
  section: SectionId | null;
  /** ISO 8601 timestamp when the attempt finished. */
  date: string;
  right: number;
  done: number;
  sections: HistorySectionCount[];
}

const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Number.isSafeInteger(value) && value >= 0;
const oneOf = <T>(value: unknown, options: readonly T[]): value is T =>
  (options as readonly unknown[]).includes(value);

function validSectionCount(value: unknown): value is HistorySectionCount {
  return (
    object(value) &&
    oneOf(value.section, SECTION_IDS) &&
    integer(value.right) &&
    integer(value.done) &&
    value.right <= value.done
  );
}

function validAttempt(value: unknown, maxMock?: number): value is HistoryAttempt {
  if (!object(value)) return false;
  if (typeof value.id !== 'string' || value.id.length === 0) return false;
  if (!oneOf(value.mode, MODES)) return false;
  if (
    value.mock !== null &&
    !(integer(value.mock) && value.mock >= 1 && (maxMock === undefined || value.mock <= maxMock))
  ) {
    return false;
  }
  if (!(value.section === null || oneOf(value.section, SECTION_IDS))) return false;
  if (typeof value.date !== 'string' || Number.isNaN(Date.parse(value.date))) return false;
  if (!integer(value.right) || !integer(value.done) || value.right > value.done) return false;
  if (
    !Array.isArray(value.sections) ||
    value.sections.length < 1 ||
    value.sections.length > SECTION_IDS.length ||
    !value.sections.every(validSectionCount)
  ) {
    return false;
  }
  if (value.section !== null && (value.sections.length !== 1 || value.sections[0].section !== value.section)) {
    return false;
  }
  return true;
}

/** Builds one history entry from a finished session and its marked section results. */
export function buildHistoryAttempt(session: Session, results: readonly SectionResult[]): HistoryAttempt | null {
  if (session.finishedAt === null || results.length === 0) return null;
  const sections: HistorySectionCount[] = [];
  for (let index = 0; index < results.length; index++) {
    const run = session.sections[index];
    const result = results[index];
    if (!run || run.startedAt === null) continue;
    sections.push({
      section: result.section,
      right: result.right,
      done: result.right + result.wrong,
    });
  }
  if (sections.length === 0) return null;
  const right = sections.reduce((sum, item) => sum + item.right, 0);
  const done = sections.reduce((sum, item) => sum + item.done, 0);
  // An attempt with no task done says nothing and would only use up one of the 50 places.
  if (done === 0) return null;
  const singleSection = session.mode !== 'full' && sections.length === 1 ? sections[0].section : null;

  return {
    id: `${session.createdAt}:${session.finishedAt}`,
    mode: session.mode,
    mock: session.mock ?? null,
    section: singleSection,
    date: new Date(session.finishedAt).toISOString(),
    right,
    done,
    sections,
  };
}

/** Appends a finished attempt once (newest first), capped at `MAX_HISTORY`. */
export function appendHistoryAttempt(
  history: readonly HistoryAttempt[],
  attempt: HistoryAttempt,
): HistoryAttempt[] {
  if (history.some((entry) => entry.id === attempt.id)) return [...history];
  return [attempt, ...history].slice(0, MAX_HISTORY);
}

/** Reads and validates stored history; discards invalid data. Call only after mount. */
export function readHistory(maxMock?: number): HistoryAttempt[] {
  try {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (stored === null) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(stored);
    } catch {
      parsed = null;
    }
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(HISTORY_KEY);
      return [];
    }
    // Only the invalid entries go; the valid ones are kept and the cleaned list is saved.
    const valid = parsed.filter((item) => validAttempt(item, maxMock));
    if (valid.length !== parsed.length) {
      if (valid.length === 0) window.localStorage.removeItem(HISTORY_KEY);
      else window.localStorage.setItem(HISTORY_KEY, JSON.stringify(valid.slice(0, MAX_HISTORY)));
    }
    return valid.slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function writeHistory(history: readonly HistoryAttempt[]): boolean {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    return true;
  } catch {
    return false;
  }
}

export function clearHistory(): boolean {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}
