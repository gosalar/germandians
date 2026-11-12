import { Button } from '@mantine/core';
import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

import SourceNote from '@/components/SourceNote';

import { JOURNEY_COPY, MONTHS, PHASES, TOTAL_MONTHS } from './data';
import styles from './styles.module.scss';
import { useMonthPlayer } from './useMonthPlayer';

export default function MonthExplorer() {
  const explorerRef = useRef<HTMLDivElement>(null);
  const { month, playing, paused, select, scrub, togglePlay } = useMonthPlayer(explorerRef);
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

  const playLabel = playing ? 'Pause' : paused ? 'Resume' : month >= TOTAL_MONTHS ? 'Replay' : `Play all ${TOTAL_MONTHS} months`;

  return (
    <div ref={explorerRef}>
      <div className={styles.explorerHead}>
        <div className={styles.explorerIntro}>
          <h3 className={styles.explorerTitle}>Month by month</h3>
          <p className={styles.explorerBody}>
            {JOURNEY_COPY.explorer}
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
                <span className={styles.segmentNumber} aria-hidden="true">{p.n}</span>
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
              <span aria-hidden="true" className={styles.legendSwatch} style={{ background: p.color, color: p.labelColor }}>{p.n}</span>
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
          <div className={styles.detailBody}>
            {/* Only the heading and summary are announced; the task lists are too long to read out on every step. */}
            <div aria-live="polite" className={styles.detailLead}>
              <h4 className={styles.detailTitle} style={{ color: phase.ink }}>
                Main focus: {phase.name}
              </h4>
              <p className={styles.detailDesc}>{phase.desc}</p>
            </div>
            <div data-testid="month-tasks" className={styles.monthTasks}>
              <div className={styles.tasksLabel}>{JOURNEY_COPY.work}</div>
              <ul className={styles.tasks}>
                {current.tasks.map((task) => (
                  <li key={task.text}>
                    <span aria-hidden="true" className={styles.check} style={{ background: phase.color }}>
                      ✓
                    </span>
                    <span>
                      <strong>{task.strand}: </strong>
                      {task.text}
                      {task.source ? <SourceNote source={task.source} /> : null}
                    </span>
                  </li>
                ))}
              </ul>
              <div className={styles.waits}>
                <div className={styles.tasksLabel}>{JOURNEY_COPY.waiting}</div>
                <ul className={styles.tasks}>
                  {current.waits.map((task) => (
                    <li key={task.text}>
                      <span aria-hidden="true" className={styles.waitMark}>
                        …
                      </span>
                      <span>
                        <strong>{task.strand}: </strong>
                        {task.text}
                        {task.source ? <SourceNote source={task.source} /> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
    </div>
  );
}
