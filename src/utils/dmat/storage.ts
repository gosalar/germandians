import { ENDED_BY } from './session.ts';
import type { Session } from './session';
import { LETTERS, MODES, SECTION_IDS, TEXT_SIZES } from './types.ts';

/**
 * The one browser-storage entry the practice page keeps, so a reload does not lose a test. Every read and
 * write is wrapped: storage can be full, blocked or missing.
 */

export const STORAGE_KEY = 'germandians:dmat-practice';
export const KEEP_DAYS = 7;

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const nullableNumber = (value: unknown) => value === null || number(value);
const integer = (value: unknown): value is number => number(value) && Number.isSafeInteger(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
const oneOf = (value: unknown, options: readonly unknown[]) => options.includes(value);

function validAnswer(value: unknown): boolean {
  if (!object(value)) return false;
  switch (value.kind) {
    case 'figures': return Array.isArray(value.picks) && value.picks.length === 2 &&
      value.picks.every((pick) => pick === null || (integer(pick) && pick < 3));
    case 'equations': return object(value.values) && Object.values(value.values).every((entry) => entry === null ||
      (typeof entry === 'number' && Number.isFinite(entry)));
    case 'latin': return oneOf(value.letter, LETTERS);
    case 'question': return integer(value.option) && value.option < 4;
    default: return false;
  }
}

/** Validate the whole persisted shape before any consumer can use it as a Session. */
function validSession(value: unknown): value is Session {
  if (!object(value) || value.version !== 1 || !oneOf(value.mode, MODES) || !oneOf(value.textSize, TEXT_SIZES) ||
    !number(value.createdAt) || !nullableNumber(value.finishedAt) || !nullableNumber(value.breakStartedAt) ||
    !nullableNumber(value.shownAt) || typeof value.returning !== 'boolean' ||
    !(value.practiceTag === null || typeof value.practiceTag === 'string') ||
    !strings(value.marked) || !strings(value.checked) || !object(value.answers) ||
    !Object.values(value.answers).every(validAnswer) || !object(value.position) ||
    !Object.entries(value.position).every(([key, entry]) => oneOf(key, SECTION_IDS) && integer(entry)) ||
    !object(value.timeOn) || !Object.values(value.timeOn).every(number) || !Array.isArray(value.sections)) return false;

  const runs = value.sections;
  if (runs.length !== (value.mode === 'full' ? SECTION_IDS.length : 1)) return false;
  for (let index = 0; index < runs.length; index++) {
    const run: unknown = runs[index];
    if (!object(run) || !oneOf(run.id, SECTION_IDS) || typeof run.setId !== 'string' ||
      !nullableNumber(run.startedAt) || !nullableNumber(run.endedAt) ||
      !(run.endedBy === null || oneOf(run.endedBy, ENDED_BY))) return false;
    if (value.mode === 'full' && run.id !== SECTION_IDS[index]) return false;
    const setId = run.id === 'academic'
      ? value.mode === 'practice' ? /^p(?:1[0-7])$/.test(run.setId) : run.setId === 'mock'
      : run.setId === (value.mode === 'full' ? 'mock' : value.mode);
    if (!setId || (index === 0 && run.startedAt === null) ||
      (run.startedAt === null && run.endedAt !== null) || (run.endedAt === null) !== (run.endedBy === null) ||
      (number(run.startedAt) && run.startedAt < value.createdAt) ||
      (number(run.endedAt) && number(run.startedAt) && run.endedAt < run.startedAt)) return false;
    if (index > 0 && run.startedAt !== null &&
      (runs[index - 1].endedAt === null || run.startedAt < runs[index - 1].endedAt)) return false;
  }
  return true;
}

/** Drops any other shape, and an entry older than `KEEP_DAYS` (counted from `createdAt`). */
export function readSession(now: number): { session: Session | null; failed: boolean } {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return { session: null, failed: false };
    let parsed: unknown;
    try { parsed = JSON.parse(stored); } catch { parsed = null; }
    if (!validSession(parsed) || now - parsed.createdAt > KEEP_DAYS * 24 * 60 * 60 * 1000) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { session: null, failed: false };
    }
    return { session: parsed, failed: false };
  } catch {
    return { session: null, failed: true };
  }
}

/** `false` when storage throws. */
export function writeSession(session: Session): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* The in-memory test still works. */ }
}
