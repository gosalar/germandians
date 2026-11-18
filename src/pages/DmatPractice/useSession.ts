import { useDocumentVisibility } from '@mantine/hooks';
import { useEffect, useReducer, useRef } from 'react';

import * as sessionLogic from '@/utils/dmat/session';
import type { Phase, Session } from '@/utils/dmat/session';
import { clearSession, readSession, writeSession } from '@/utils/dmat/storage';
import type { Answer, Mode, StartChoice, TextSize } from '@/utils/dmat/types';

/** What the practice page reads and does. The page file and the screens never touch storage or the clock. */
export interface SessionApi {
  /** `false` while prerendering and until storage has been read after mount. */
  ready: boolean;
  /** The test on screen; `null` on the start page. */
  session: Session | null;
  /** `phaseAt(session, now)`; refreshed once a second while a timed phase shows. */
  phase: Phase | null;
  /** A stored test the start page offers to continue. */
  waiting: Session | null;
  /** Storage threw; said once on the page. */
  storageFailed: boolean;
  start(mode: Mode, choice: StartChoice): void;
  /** `waiting` becomes `session`. */
  resume(): void;
  /** Deletes the stored entry and returns to the start page. */
  discard(): void;
  /** The record steps aside without being deleted: `session` becomes `waiting` and the start page shows. */
  close(): void;
  answer(id: string, answer: Answer): void;
  check(id: string): void;
  mark(id: string): void;
  goTo(index: number): void;
  setTextSize(size: TextSize): void;
  endSection(): void;
  startNext(): void;
  stopEarly(): void;
}

interface State {
  ready: boolean;
  session: Session | null;
  waiting: Session | null;
  storageFailed: boolean;
  now: number;
  returning: boolean;
}

type Action =
  | { type: 'load'; stored: Session | null; failed: boolean; now: number }
  | { type: 'tick'; now: number }
  | { type: 'start'; mode: Mode; choice: StartChoice; now: number }
  | { type: 'resume'; now: number }
  | { type: 'discard'; failed: boolean }
  | { type: 'close' }
  | { type: 'storage-failed' }
  | { type: 'change'; now: number; apply(session: Session, now: number): Session; currentSectionOnly?: boolean };

const initialState: State = { ready: false, session: null, waiting: null, storageFailed: false, now: 0, returning: false };
const finished = (session: Session | null) => session !== null && session.finishedAt !== null;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load': {
      const stored = action.stored ? sessionLogic.reconcile(action.stored, action.now) : null;
      const phase = stored ? sessionLogic.phaseAt(stored, action.now) : null;
      // A running Core pause also keeps its clock: it must not wait for a Continue click.
      const running = phase?.kind === 'pause' || (phase?.kind === 'section' && phase.msLeft !== null);
      return { ...state, ready: true, now: action.now, session: running ? stored : null,
        waiting: running ? null : stored, storageFailed: state.storageFailed || action.failed };
    }
    case 'tick': {
      if (!state.session || state.session.mode === 'practice' || finished(state.session)) return state;
      const next = sessionLogic.reconcile(state.session, action.now);
      return next === state.session && state.now === action.now ? state : { ...state, now: action.now, session: next };
    }
    case 'start':
      return { ...state, now: action.now, waiting: null, returning: false,
        session: sessionLogic.createSession(action.mode, action.choice, action.now,
          state.returning || finished(state.session) || finished(state.waiting)) };
    case 'resume':
      return state.waiting ? { ...state, now: action.now, session: sessionLogic.reconcile(state.waiting, action.now), waiting: null } : state;
    case 'discard':
      return { ...state, session: null, waiting: null, storageFailed: state.storageFailed || action.failed,
        returning: state.returning || finished(state.session) || finished(state.waiting) };
    case 'close':
      return state.session ? { ...state, waiting: state.session, session: null } : state;
    case 'storage-failed':
      return state.storageFailed ? state : { ...state, storageFailed: true };
    case 'change': {
      if (!state.session) return state;
      const current = sessionLogic.reconcile(state.session, action.now);
      const before = state.session.sections.find((run) => run.startedAt !== null && run.endedAt === null);
      const after = current.sections.find((run) => run.startedAt !== null && run.endedAt === null);
      // A click queued before a deadline cannot answer or end the next section after catch-up.
      const stale = action.currentSectionOnly && (before !== after || current.finishedAt !== null);
      const next = stale ? current : action.apply(current, action.now);
      if (next === state.session && (state.session.mode === 'practice' || finished(state.session) || state.now === action.now)) {
        return state;
      }
      return { ...state, now: action.now, session: next };
    }
  }
}

export function useSession(): SessionApi {
  const [state, dispatch] = useReducer(reducer, initialState);
  const visibility = useDocumentVisibility();
  const loadedFromStorage = useRef<Session | null>(null);
  const prevVisibility = useRef(visibility);

  useEffect(() => {
    const now = Date.now();
    const stored = readSession(now);
    loadedFromStorage.current = stored.session;
    dispatch({ type: 'load', stored: stored.session, failed: stored.failed, now });
  }, []);

  const stored = state.session ?? state.waiting;
  useEffect(() => {
    if (!stored) return;
    if (loadedFromStorage.current === stored) {
      loadedFromStorage.current = null;
      return;
    }
    loadedFromStorage.current = null;
    if (!writeSession(stored)) dispatch({ type: 'storage-failed' });
  }, [stored]);

  const phase = state.session ? sessionLogic.phaseAt(state.session, state.now) : null;
  // When the phase on screen next changes; nothing counts down in practice, once finished or at a break's zero.
  const deadline = phase && phase.kind !== 'finished' && phase.msLeft ? state.now + phase.msLeft : null;
  useEffect(() => {
    if (deadline === null) return;
    let timer: number | undefined;
    const schedule = () => {
      const left = deadline - Date.now();
      const delay = left > 0 ? (left % 1000) || 1000 : 0;
      timer = window.setTimeout(() => {
        const currentNow = Date.now();
        dispatch({ type: 'tick', now: currentNow });
        if (currentNow < deadline) schedule();
      }, delay);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [deadline]);

  useEffect(() => {
    const becameVisible = prevVisibility.current !== visibility && visibility === 'visible';
    prevVisibility.current = visibility;
    if (becameVisible) dispatch({ type: 'tick', now: Date.now() });
  }, [visibility]);

  const change = (apply: Extract<Action, { type: 'change' }>['apply'], currentSectionOnly = false) => {
    dispatch({ type: 'change', now: Date.now(), apply, currentSectionOnly });
  };

  return {
    ready: state.ready,
    session: state.session,
    phase,
    waiting: state.waiting,
    storageFailed: state.storageFailed,
    start: (mode, choice) => {
      clearSession();
      dispatch({ type: 'start', mode, choice, now: Date.now() });
    },
    resume: () => dispatch({ type: 'resume', now: Date.now() }),
    discard: () => {
      clearSession();
      const remaining = readSession(Date.now());
      dispatch({ type: 'discard', failed: remaining.failed || remaining.session !== null });
    },
    close: () => dispatch({ type: 'close' }),
    answer: (id, answer) => change((session) => sessionLogic.setAnswer(session, id, answer), true),
    check: (id) => change((session) => sessionLogic.checkAnswer(session, id), true),
    mark: (id) => change((session) => sessionLogic.toggleMark(session, id), true),
    goTo: (index) => change((session, now) => sessionLogic.goTo(session, index, now), true),
    setTextSize: (size) => change((session) => sessionLogic.setTextSize(session, size)),
    endSection: () => change(sessionLogic.endSection, true),
    startNext: () => change(sessionLogic.startNext),
    stopEarly: () => change(sessionLogic.stopEarly),
  };
}
