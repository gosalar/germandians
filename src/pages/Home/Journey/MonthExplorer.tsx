import { Button } from '@mantine/core';
import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

import { MONTHS, PHASES, TOTAL_MONTHS } from './data';
import styles from './styles.module.scss';
import { useMonthPlayer } from './useMonthPlayer';

export default function MonthExplorer() {
  const { month, playing, select, scrub, togglePlay } = useMonthPlayer();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const current = MONTHS[month - 1];
  const phase = PHASES[current.phase];

  const monthAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return Math.ceil(((clientX - rect.left) / rect.width) * TOTAL_MONTHS);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture can fail for synthetic pointers; dragging still works without it.
    }
    select(monthAt(event.clientX));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) scrub(monthAt(event.clientX));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: month + 1,
      ArrowUp: month + 1,
      ArrowLeft: month - 1,
      ArrowDown: month - 1,
      Home: 1,
      End: TOTAL_MONTHS,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(keys[event.key]);
  };

  const playLabel = playing ? 'Pause' : month >= TOTAL_MONTHS ? 'Replay' : `Play all ${TOTAL_MONTHS} months`;

  return (
    <>
      <div className={styles.explorerHead}>
        <div className={styles.explorerIntro}>
          <h3 className={styles.explorerTitle}>Month by month</h3>
          <p className={styles.explorerBody}>
            The same four stages, split into seven months. Pick a month to see what we work on with you.
          </p>
        </div>
        <Button type="button" onClick={togglePlay} aria-pressed={playing} variant="navy" size="md">
          {playLabel}
        </Button>
      </div>

      <div className={styles.explorer}>
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Journey month"
          aria-valuemin={1}
          aria-valuemax={TOTAL_MONTHS}
          aria-valuenow={month}
          aria-valuetext={`Month ${month} of ${TOTAL_MONTHS}, ${phase.name}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className={styles.track}
        >
          <div className={styles.handle} style={{ left: `${(((month - 0.5) / TOTAL_MONTHS) * 100).toFixed(3)}%` }}>
            <div className={styles.handleBadge}>{month}</div>
            <div className={styles.handlePoint} />
          </div>
          <div className={styles.segments}>
            {PHASES.map((p) => (
              <div
                key={p.n}
                className={styles.segment}
                data-active={p === phase}
                style={{ background: p.color, color: p.labelColor, borderRadius: p.radius }}
              >
                <span className={styles.segmentLabel}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.ticks}>
          {MONTHS.map(({ m }) => (
            <button
              key={m}
              type="button"
              onClick={() => select(m)}
              aria-label={`Month ${m}`}
              aria-current={m === month ? 'step' : undefined}
              className={styles.tick}
              style={m === month ? { background: phase.tint } : undefined}
            >
              M{m}
            </button>
          ))}
        </div>

        <div className={styles.legend}>
          {PHASES.map((p) => (
            <button
              key={p.n}
              type="button"
              onClick={() => select(p.start)}
              className={styles.legendItem}
              data-active={p === phase}
            >
              <span aria-hidden="true" className={styles.legendSwatch} style={{ background: p.color }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        <div className={styles.detail} style={{ background: phase.tint }}>
          <div className={styles.detailMonth}>
            <div className={styles.detailMonthLabel}>Month</div>
            <div className={styles.detailMonthNumber} style={{ color: phase.ink }}>
              {month}
              <span className={styles.detailMonthTotal}> of {TOTAL_MONTHS}</span>
            </div>
          </div>
          <div aria-live="polite" className={styles.detailBody}>
            <h4 className={styles.detailTitle} style={{ color: phase.ink }}>
              Phase {phase.n}: {phase.name}
            </h4>
            <p className={styles.detailDesc}>{phase.desc}</p>
            <div className={styles.tasksLabel}>Month {month} tasks</div>
            <ul className={styles.tasks}>
              {current.tasks.map((task) => (
                <li key={task}>
                  <span aria-hidden="true" className={styles.check} style={{ background: phase.color }}>
                    ✓
                  </span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.stepper}>
          <Button
            type="button"
            onClick={() => select(month - 1)}
            disabled={month <= 1}
            variant="outline" size="step"
          >
            <span className={styles.longLabel}>Previous month</span>
            <span className={styles.shortLabel}>Previous</span>
          </Button>
          <Button
            type="button"
            onClick={() => select(month + 1)}
            disabled={month >= TOTAL_MONTHS}
            variant="navy-step" size="step"
          >
            <span className={styles.longLabel}>Next month</span>
            <span className={styles.shortLabel}>Next</span>
          </Button>
        </div>
      </div>
    </>
  );
}
