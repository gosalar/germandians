import { useEffect, useReducer } from 'react';

import { TOTAL_MONTHS } from './data';

const STEP_MS = 1600;

interface PlayerState {
  month: number;
  playing: boolean;
}

type PlayerAction =
  | { type: 'select'; month: number }
  | { type: 'scrub'; month: number }
  | { type: 'toggle' }
  | { type: 'tick' };

const clampMonth = (month: number) => Math.min(TOTAL_MONTHS, Math.max(1, month));

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'select':
      return { month: clampMonth(action.month), playing: false };
    case 'scrub':
      return { ...state, month: clampMonth(action.month) };
    case 'toggle':
      if (state.playing) return { ...state, playing: false };
      return { playing: true, month: state.month >= TOTAL_MONTHS ? 1 : state.month };
    case 'tick':
      // One extra tick on the last month before stopping, as in the design.
      if (state.month >= TOTAL_MONTHS) return { ...state, playing: false };
      return { ...state, month: state.month + 1 };
  }
}

/** Selected month plus an autoplay that steps through all seven. */
export function useMonthPlayer() {
  const [state, dispatch] = useReducer(reducer, { month: 1, playing: false });

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
