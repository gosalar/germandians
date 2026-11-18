import { DMAT_FORMAT } from '../applicationFacts.ts';
import { SECTION_IDS } from './types.ts';
import type { Answer, CoreSubtest, Mode, SectionId, StartChoice, TextSize } from './types';

/**
 * A practice test as plain data, and the pure functions that move it on. `now` is milliseconds since the
 * epoch, always passed in. The durations come from `DMAT_FORMAT`; this file holds no minutes of its own.
 */

/** Who ended a section: the visitor's own "End section", the clock, or "Leave test". */
export const ENDED_BY = ['visitor', 'time', 'stop'] as const;

export interface SectionRun {
  id: SectionId;
  /** Core: 'mock' | 'section' | 'practice'. Academic: 'mock' or a practice passage id. */
  setId: string;
  startedAt: number | null;
  endedAt: number | null;
  endedBy: (typeof ENDED_BY)[number] | null;
}

export interface Session {
  version: 1;
  mode: Mode;
  /** Full mock: four. One section: one. Practice: one, never timed. */
  sections: SectionRun[];
  /** Full mock only. */
  breakStartedAt: number | null;
  /** Practice only: show only Core tasks that carry this tag. */
  practiceTag: string | null;
  answers: Record<string, Answer>;
  marked: string[];
  /** Practice only: tasks whose explanation has been shown; their answers are locked. */
  checked: string[];
  /** Section id → index of the screen (task or passage). */
  position: Record<string, number>;
  /** Screen id (task or passage id) → milliseconds it has been on screen. */
  timeOn: Record<string, number>;
  /** When the screen now showing came up. */
  shownAt: number | null;
  textSize: TextSize;
  createdAt: number;
  finishedAt: number | null;
  /** A finished session was in storage when this one began. */
  returning: boolean;
}

export type Phase =
  /** `msLeft` is null in practice. */
  | { kind: 'section'; section: SectionId; msLeft: number | null }
  | { kind: 'pause'; next: CoreSubtest; msLeft: number }
  /** Stays at 0 until the visitor starts the academic module. */
  | { kind: 'break'; msLeft: number }
  | { kind: 'finished' };

const minute = 60_000;
const duration = (id: SectionId) => (id === 'academic' ? DMAT_FORMAT.academicMinutes : DMAT_FORMAT.subtestMinutes) * minute;
const activeRun = (session: Session) => session.sections.find((run) => run.startedAt !== null && run.endedAt === null);

/** The session knows screen positions, not bank IDs. See the Track B integration handover. */
function bookTime(session: Session, run: SectionRun, now: number): Session {
  if (session.shownAt === null) return session;
  const key = `${run.id}:${session.position[run.id] ?? 0}`;
  return {
    ...session,
    timeOn: { ...session.timeOn, [key]: (session.timeOn[key] ?? 0) + Math.max(0, now - session.shownAt) },
    shownAt: null,
  };
}

function finishRun(session: Session, run: SectionRun, now: number, endedBy: SectionRun['endedBy']): Session {
  const next = bookTime(session, run, now);
  const finished = session.mode !== 'full' || run.id === 'academic' || endedBy === 'stop';
  return {
    ...next,
    sections: next.sections.map((entry) => entry === run ? { ...entry, endedAt: now, endedBy } : entry),
    breakStartedAt: session.mode === 'full' && run.id === 'latin' && !finished ? now : session.breakStartedAt,
    finishedAt: finished ? now : session.finishedAt,
  };
}

function beginRun(session: Session, id: SectionId, now: number): Session {
  return {
    ...session,
    sections: session.sections.map((run) => run.id === id && run.startedAt === null ? { ...run, startedAt: now } : run),
    shownAt: now,
  };
}

/** The sections a test runs, in order: all four in a full mock, otherwise the one chosen. */
export const sectionIdsFor = (mode: Mode, choice: StartChoice): readonly SectionId[] =>
  mode === 'full' ? SECTION_IDS : [choice.section ?? 'figures'];

/** The set a section of this test draws from; see `SectionRun.setId`. */
export const setIdFor = (mode: Mode, section: SectionId, choice: StartChoice): string =>
  section === 'academic'
    ? mode === 'practice' ? choice.passage ?? 'p10' : 'mock'
    : mode === 'full' ? 'mock' : mode;

export function createSession(mode: Mode, choice: StartChoice, now: number, returning: boolean): Session {
  const ids = sectionIdsFor(mode, choice);
  return {
    version: 1,
    mode,
    sections: ids.map((id, index) => ({
      id,
      setId: setIdFor(mode, id, choice),
      startedAt: index === 0 ? now : null,
      endedAt: null,
      endedBy: null,
    })),
    breakStartedAt: null,
    practiceTag: mode === 'practice' && ids[0] !== 'academic' ? choice.tag ?? null : null,
    answers: {},
    marked: [],
    checked: [],
    position: {},
    timeOn: {},
    shownAt: now,
    textSize: 0,
    createdAt: now,
    finishedAt: null,
    returning,
  };
}

/** Brings a session up to `now`: ends sections whose time is over and starts those that begin by themselves. */
export function reconcile(session: Session, now: number): Session {
  if (session.finishedAt !== null || session.mode === 'practice') return session;
  let current = session;
  // Each pass either finishes a run or begins the following one; a break never advances itself.
  while (current.finishedAt === null) {
    const run = activeRun(current);
    if (run && run.startedAt !== null) {
      const deadline = run.startedAt + duration(run.id);
      if (now < deadline) break;
      current = finishRun(current, run, deadline, 'time');
      continue;
    }
    const nextIndex = current.sections.findIndex((entry) => entry.startedAt === null);
    const next = current.sections[nextIndex];
    const previous = current.sections[nextIndex - 1];
    if (!next || next.id === 'academic' || previous?.endedAt == null) break;
    const beginsAt = previous.endedAt + DMAT_FORMAT.pauseMinutes * minute;
    if (now < beginsAt) break;
    current = beginRun(current, next.id, beginsAt);
  }
  return current;
}

export function phaseAt(session: Session, now: number): Phase {
  const current = reconcile(session, now);
  if (current.finishedAt !== null) return { kind: 'finished' };
  const run = activeRun(current);
  if (run && run.startedAt !== null) {
    return {
      kind: 'section', section: run.id,
      msLeft: current.mode === 'practice' ? null : Math.max(0, run.startedAt + duration(run.id) - now),
    };
  }
  if (current.breakStartedAt !== null) {
    return { kind: 'break', msLeft: Math.max(0, current.breakStartedAt + DMAT_FORMAT.breakMinutes * minute - now) };
  }
  const nextIndex = current.sections.findIndex((entry) => entry.startedAt === null);
  const next = current.sections[nextIndex];
  const previous = current.sections[nextIndex - 1];
  if (next && next.id !== 'academic' && previous?.endedAt != null) {
    return { kind: 'pause', next: next.id, msLeft: Math.max(0, previous.endedAt + DMAT_FORMAT.pauseMinutes * minute - now) };
  }
  return { kind: 'finished' };
}

function equalAnswer(prev: Answer | undefined, next: Answer): boolean {
  if (!prev || prev.kind !== next.kind) return false;
  switch (next.kind) {
    case 'figures':
      return prev.kind === 'figures' && prev.picks[0] === next.picks[0] && prev.picks[1] === next.picks[1];
    case 'equations': {
      if (prev.kind !== 'equations') return false;
      const prevKeys = Object.keys(prev.values);
      const nextKeys = Object.keys(next.values);
      return prevKeys.length === nextKeys.length &&
        nextKeys.every((key) => Object.hasOwn(prev.values, key) && prev.values[key] === next.values[key]);
    }
    case 'latin':
      return prev.kind === 'latin' && prev.letter === next.letter;
    case 'question':
      return prev.kind === 'question' && prev.option === next.option;
  }
}

/** Ignored for an id in `checked` or when the answer is unchanged. */
export function setAnswer(session: Session, id: string, answer: Answer): Session {
  if (session.finishedAt !== null || !activeRun(session) || session.checked.includes(id)) return session;
  if (equalAnswer(session.answers[id], answer)) return session;
  return { ...session, answers: { ...session.answers, [id]: answer } };
}

/** Practice only. */
export function checkAnswer(session: Session, id: string): Session {
  if (session.mode !== 'practice' || session.finishedAt !== null || session.checked.includes(id)) return session;
  return { ...session, checked: [...session.checked, id] };
}

export function toggleMark(session: Session, id: string): Session {
  if (session.finishedAt !== null || !activeRun(session)) return session;
  return { ...session, marked: session.marked.includes(id) ? session.marked.filter((mark) => mark !== id) : [...session.marked, id] };
}

/** Within the section on screen; books the time on the screen left. */
export function goTo(session: Session, index: number, now: number): Session {
  const current = reconcile(session, now);
  const run = activeRun(current);
  if (current.finishedAt !== null || !run || run !== activeRun(session) || !Number.isSafeInteger(index) || index < 0) return current;
  if ((current.position[run.id] ?? 0) === index) return current;
  return { ...bookTime(current, run, now), position: { ...current.position, [run.id]: index }, shownAt: now };
}

export function setTextSize(session: Session, size: TextSize): Session {
  return session.textSize === size ? session : { ...session, textSize: size };
}

/** The visitor's own "End section". */
export function endSection(session: Session, now: number): Session {
  const current = reconcile(session, now);
  const run = activeRun(current);
  if (current.mode === 'practice' || current.finishedAt !== null || !run || run !== activeRun(session)) return current;
  return finishRun(current, run, now, 'visitor');
}

/** Skips a pause, or starts the academic module from the break. */
export function startNext(session: Session, now: number): Session {
  const current = reconcile(session, now);
  const phase = phaseAt(current, now);
  if (phase.kind === 'pause') return beginRun(current, phase.next, now);
  if (phase.kind === 'break') return beginRun(current, 'academic', now);
  return current;
}

/** "Leave test": straight to the record. */
export function stopEarly(session: Session, now: number): Session {
  const current = reconcile(session, now);
  if (current.finishedAt !== null) return current;
  const run = activeRun(current);
  return run ? finishRun(current, run, now, 'stop') : { ...current, finishedAt: now, shownAt: null };
}
