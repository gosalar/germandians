import { Button } from '@mantine/core';
import { useEffect, useId, useRef, useState } from 'react';

import type { HistoryAttempt } from '@/utils/dmat/history';
import { SECTION_IDS, type Mode, type SectionId } from '@/utils/dmat/types';

import { mockName, MODE_LABELS, SECTION_LABELS } from '../data';
import { formatAttemptDate, HISTORY_COPY } from './data';
import styles from './styles.module.scss';

export interface PracticeHistoryProps {
  history: readonly HistoryAttempt[];
  onClear(): boolean;
  /** The latest attempt could not be written to browser storage. */
  saveFailed?: boolean;
  className?: string;
}

interface SectionRow {
  key: string;
  mode: Mode;
  date: string;
  right: number;
  done: number;
}

interface SectionBucket {
  section: SectionId;
  rows: SectionRow[];
}

interface MockBucket {
  key: string;
  label: string;
  sections: SectionBucket[];
}

function groupHistory(history: readonly HistoryAttempt[]): MockBucket[] {
  const mockNumbers = [...new Set(history.map((item) => item.mock).filter((mock): mock is number => mock !== null))].sort(
    (a, b) => a - b,
  );
  const targets: (number | null)[] = [...mockNumbers];
  if (history.some((item) => item.mock === null)) targets.push(null);

  return targets
    .map((targetMock): MockBucket => {
      const inBucket = history.filter((item) => item.mock === targetMock);
      const sections: SectionBucket[] = SECTION_IDS.map((sectionId) => {
        const rows: SectionRow[] = [];
        for (const attempt of inBucket) {
          const entry = attempt.sections.find((part) => part.section === sectionId);
          if (!entry) continue;
          rows.push({
            key: `${attempt.id}:${sectionId}`,
            mode: attempt.mode,
            date: attempt.date,
            right: entry.right,
            done: entry.done,
          });
        }
        return { section: sectionId, rows };
      }).filter((group) => group.rows.length > 0);

      return {
        key: targetMock === null ? 'practice' : `mock-${targetMock}`,
        label: targetMock === null ? HISTORY_COPY.untimed : mockName(targetMock),
        sections,
      };
    })
    .filter((bucket) => bucket.sections.length > 0);
}

export default function PracticeHistory({ history, onClear, saveFailed = false, className }: PracticeHistoryProps) {
  const headingId = useId();
  const [clearFailed, setClearFailed] = useState(false);
  const [cleared, setCleared] = useState(false);
  const clearedNote = useRef<HTMLParagraphElement>(null);
  const buckets = groupHistory(history);
  const showCleared = cleared && buckets.length === 0;

  // The button that cleared the list leaves with it; focus moves to the confirmation.
  useEffect(() => {
    if (showCleared) clearedNote.current?.focus();
  }, [showCleared]);

  if (showCleared) {
    return <p ref={clearedNote} tabIndex={-1} role="status" className={[styles.cleared, className].filter(Boolean).join(' ')}>{HISTORY_COPY.cleared}</p>;
  }
  if (buckets.length === 0) return null;

  return (
    <section className={[styles.history, className].filter(Boolean).join(' ')} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h2 id={headingId}>{HISTORY_COPY.title}</h2>
        <Button type="button" variant="ring" size="md" onClick={() => {
            const done = onClear();
            setClearFailed(!done);
            if (done) setCleared(true);
          }}>
          {HISTORY_COPY.clear}
        </Button>
      </div>
      {clearFailed && <p role="alert">{HISTORY_COPY.clearFailed}</p>}
      {saveFailed && <p role="alert">{HISTORY_COPY.saveFailed}</p>}
      <p className={styles.subtitle}>{HISTORY_COPY.subtitle}</p>
      <div className={styles.buckets}>
        {buckets.map((bucket) => (
          <div key={bucket.key} className={styles.bucket}>
            <h3>{bucket.label}</h3>
            {bucket.sections.map(({ section, rows }) => (
              <div key={section} className={styles.sectionGroup}>
                <h4>{SECTION_LABELS[section].name}</h4>
                <ul>
                  {rows.map((row) => (
                    <li key={row.key}>
                      <span className={styles.meta}>
                        {HISTORY_COPY.meta(MODE_LABELS[row.mode].name, formatAttemptDate(row.date))}
                      </span>
                      <strong>{HISTORY_COPY.count(row.right, row.done)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
