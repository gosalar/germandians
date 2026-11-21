import { ENDED_BY } from './session.ts';
import type { Session } from './session';
import { FIGURE_BANK_REVISIONS, LEGACY_FIGURE_BANK_REVISION, LETTERS, MODES, SECTION_IDS, TEXT_SIZES } from './types.ts';

/**
 * The browser-storage entry the practice page keeps for a running or waiting test, so a reload does not
 * lose it. Every read and write is wrapped: storage can be full, blocked or missing.
 */

export const STORAGE_KEY = 'germandians:dmat-practice';
export const KEEP_DAYS = 7;

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const nullableNumber = (value: unknown) => value === null || number(value);
const integer = (value: unknown): value is number => number(value) && Number.isSafeInteger(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
const oneOf = (value: unknown, options: readonly unknown[]) => options.includes(value);
const validMock = (value: unknown, maxMock?: number): value is number =>
  integer(value) && value >= 1 && (maxMock === undefined || value <= maxMock);

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
function validSession(value: unknown, maxMock?: number): value is Session {
  if (!object(value) || value.version !== 1 ||
    !(value.figureRevision === undefined || oneOf(value.figureRevision, FIGURE_BANK_REVISIONS)) ||
    !oneOf(value.mode, MODES) || !oneOf(value.textSize, TEXT_SIZES) ||
    !number(value.createdAt) || !nullableNumber(value.finishedAt) || !nullableNumber(value.breakStartedAt) ||
    !(value.historyCleared === undefined || typeof value.historyCleared === 'boolean') ||
    !nullableNumber(value.shownAt) || typeof value.returning !== 'boolean' ||
    !(value.practiceTag === null || typeof value.practiceTag === 'string') ||
    !(value.practiceIds === undefined || value.practiceIds === null || (strings(value.practiceIds) && value.practiceIds.length > 0)) ||
    !strings(value.marked) || !strings(value.checked) || !object(value.answers) ||
    !Object.values(value.answers).every(validAnswer) || !object(value.position) ||
    !Object.entries(value.position).every(([key, entry]) => oneOf(key, SECTION_IDS) && integer(entry)) ||
    !object(value.timeOn) || !Object.values(value.timeOn).every(number) || !Array.isArray(value.sections)) return false;

  const isPractice = value.mode === 'practice';
  const isMistakes = Array.isArray(value.practiceIds);
  if (!isPractice && isMistakes) return false;
  if (isPractice && !isMistakes && value.mock !== undefined) return false;
  const expectedMock = isPractice ? value.mock : value.mock ?? 1;
  if (expectedMock !== undefined && !validMock(expectedMock, maxMock)) return false;

  const runs = value.sections;
  if (isMistakes) {
    if (runs.length < 1 || runs.length > SECTION_IDS.length) return false;
  } else if (runs.length !== (value.mode === 'full' ? SECTION_IDS.length : 1)) {
    return false;
  }

  for (let index = 0; index < runs.length; index++) {
    const run: unknown = runs[index];
    if (!object(run) || !oneOf(run.id, SECTION_IDS) || typeof run.setId !== 'string' ||
      !nullableNumber(run.startedAt) || !nullableNumber(run.endedAt) ||
      !(run.endedBy === null || oneOf(run.endedBy, ENDED_BY))) return false;
    if (value.mode === 'full' && run.id !== SECTION_IDS[index]) return false;

    let setId: boolean;
    if (isMistakes) {
      if (run.mock !== undefined && !validMock(run.mock, maxMock)) return false;
      setId = run.setId === 'mock'
        ? validMock(run.mock ?? expectedMock ?? 1, maxMock)
        : run.id === 'academic'
          ? /^p(?:1[0-7])$/.test(run.setId)
          : run.setId === 'practice' || run.setId === 'section';
    } else if (isPractice) {
      if (run.mock !== undefined) return false;
      setId = run.id === 'academic' ? /^p(?:1[0-7])$/.test(run.setId) : run.setId === 'practice';
    } else {
      if (run.mock !== undefined && run.mock !== expectedMock) return false;
      setId = value.mode === 'full'
        ? run.setId === 'mock'
        : run.setId === 'mock' || (expectedMock === 1 && run.id !== 'academic' && run.setId === 'section');
    }

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
export function readSession(now: number, maxMock?: number): { session: Session | null; failed: boolean } {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return { session: null, failed: false };
    let parsed: unknown;
    try { parsed = JSON.parse(stored); } catch { parsed = null; }
    if (!validSession(parsed, maxMock) || now - parsed.createdAt > KEEP_DAYS * 24 * 60 * 60 * 1000) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { session: null, failed: false };
    }
    const mock = parsed.mode === 'practice' ? parsed.mock : parsed.mock ?? 1;
    const needsMock = parsed.mode !== 'practice' && mock !== undefined &&
      (parsed.mock === undefined || parsed.sections.some((run) => run.mock === undefined));
    const needsFigureRevision = parsed.figureRevision === undefined;
    const session: Session = needsMock || needsFigureRevision
      ? {
          ...parsed,
          ...(needsMock
            ? {
                mock,
                sections: parsed.sections.map((run) => (run.mock === undefined ? { ...run, mock } : run)),
              }
            : {}),
          ...(needsFigureRevision ? { figureRevision: LEGACY_FIGURE_BANK_REVISION } : {}),
        }
      : parsed;
    return { session, failed: false };
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
