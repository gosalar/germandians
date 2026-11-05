import { useEffect, useReducer, type RefObject } from 'react';

import { TOTAL_MONTHS } from './data';

const STEP_MS = 1600;

interface PlayerState {
  month: number;
  playing: boolean;
  paused: boolean;
}

type PlayerAction =
  | { type: 'select'; month: number }
  | { type: 'scrub'; month: number }
  | { type: 'toggle' }
  | { type: 'pause' }
  | { type: 'tick' };

const clampMonth = (month: number) => Math.min(TOTAL_MONTHS, Math.max(1, month));

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'select':
      return { month: clampMonth(action.month), playing: false, paused: false };
    case 'scrub':
      return { ...state, month: clampMonth(action.month) };
    case 'toggle':
      if (state.playing) return { ...state, playing: false, paused: true };
      return { playing: true, paused: false, month: state.paused ? state.month : 1 };
    case 'pause':
      return state.playing ? { ...state, playing: false, paused: true } : state;
    case 'tick':
      // One extra tick on the last month before stopping, as in the design.
      if (state.month >= TOTAL_MONTHS) return { ...state, playing: false, paused: false };
      return { ...state, month: state.month + 1 };
  }
}

/** Selected month plus an autoplay that steps through all seven. */
export function useMonthPlayer(explorerRef: RefObject<HTMLDivElement | null>) {
  const [state, dispatch] = useReducer(reducer, { month: 1, playing: false, paused: false });

  useEffect(() => {
    const element = explorerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) dispatch({ type: 'pause' });
    });
    observer.observe(element);
    const onVisibility = () => {
      if (document.hidden) dispatch({ type: 'pause' });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [explorerRef]);

  useEffect(() => {
    if (!state.playing) return;
    const timer = setInterval(() => dispatch({ type: 'tick' }), STEP_MS);
    return () => clearInterval(timer);
  }, [state.playing]);

  return {
    ...state,
    /** Jump to a month and stop autoplay. */
    select: (month: number) => dispatch({ type: 'select', month }),
    /** Move while dragging the track (autoplay already stopped on pointer down). */
    scrub: (month: number) => dispatch({ type: 'scrub', month }),
    togglePlay: () => dispatch({ type: 'toggle' }),
  };
}
