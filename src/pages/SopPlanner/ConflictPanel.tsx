import { Button } from '@mantine/core';

import type { ConflictResolutionChoice, PartConflict } from '@/utils/sopPlanner';

import { SOP_PLANNER_COPY, formatConflictHeading } from './data';
import styles from './styles.module.scss';

interface ConflictPanelProps {
  readonly partTitle: string;
  readonly conflict: PartConflict;
  readonly resolving: boolean;
  readonly onResolve: (choice: ConflictResolutionChoice) => void;
  readonly onFocusControl: (element: HTMLElement) => void;
}

export default function ConflictPanel({
  partTitle,
  conflict,
  resolving,
  onResolve,
  onFocusControl,
}: ConflictPanelProps) {
  const headingId = `sop-conflict-heading-${conflict.partId}`;
  const localId = `sop-conflict-local-${conflict.partId}`;
  const remoteId = `sop-conflict-remote-${conflict.partId}`;

  const headingKind = conflict.fromRecoveredTab
    ? 'recovered'
    : conflict.remoteCleared
      ? 'cleared'
      : 'changed';

  const introText = conflict.fromRecoveredTab
    ? SOP_PLANNER_COPY.conflictRecoveredIntro
    : conflict.remoteCleared
      ? SOP_PLANNER_COPY.conflictClearedIntro
      : SOP_PLANNER_COPY.conflictIntro;

  return (
    <section
      id={`conflict-${conflict.partId}`}
      aria-labelledby={headingId}
      className={styles.conflictPanel}
      data-testid={`conflict-${conflict.partId}`}
    >
      <div className={styles.conflictHead}>
        <h4 id={headingId} className={styles.conflictHeading}>
          {formatConflictHeading(partTitle, headingKind)}
        </h4>
        <p className={styles.conflictIntro}>{introText}</p>
      </div>

      {conflict.updatedAfterConflict ? (
        <p role="status" className={styles.conflictUpdated}>
          {SOP_PLANNER_COPY.conflictUpdatedNotice}
        </p>
      ) : null}

      <div className={styles.conflictVersions}>
        <div className={styles.conflictVersionCard}>
          {conflict.localText.length > 0 ? (
            <>
              <label htmlFor={localId} className={styles.conflictVersionLabel}>
                {SOP_PLANNER_COPY.conflictLocalLabel}
              </label>
              <textarea
                id={localId}
                readOnly
                rows={4}
                value={conflict.localText}
                onFocus={(event) => onFocusControl(event.currentTarget)}
                className={styles.conflictTextarea}
              />
            </>
          ) : (
            <>
              <span className={styles.conflictVersionLabel}>
                {SOP_PLANNER_COPY.conflictLocalLabel}
              </span>
              <p className={styles.conflictEmpty}>{SOP_PLANNER_COPY.conflictEmptyLocalText}</p>
            </>
          )}
        </div>

        <div className={styles.conflictVersionCard}>
          {conflict.remoteText.length > 0 ? (
            <>
              <label htmlFor={remoteId} className={styles.conflictVersionLabel}>
                {SOP_PLANNER_COPY.conflictRemoteLabel}
              </label>
              <textarea
                id={remoteId}
                readOnly
                rows={4}
                value={conflict.remoteText}
                onFocus={(event) => onFocusControl(event.currentTarget)}
                className={styles.conflictTextarea}
              />
            </>
          ) : (
            <>
              <span className={styles.conflictVersionLabel}>
                {SOP_PLANNER_COPY.conflictRemoteLabel}
              </span>
              <p className={styles.conflictEmpty}>{SOP_PLANNER_COPY.conflictEmptyRemoteText}</p>
            </>
          )}
        </div>
      </div>

      <div className={styles.conflictActions}>
        <Button
          type="button"
          variant="navy"
          size="md"
          disabled={resolving}
          onFocus={(event) => onFocusControl(event.currentTarget)}
          onClick={() => onResolve('local')}
        >
          {SOP_PLANNER_COPY.conflictUseLocalButton}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          disabled={resolving}
          onFocus={(event) => onFocusControl(event.currentTarget)}
          onClick={() => onResolve('remote')}
        >
          {SOP_PLANNER_COPY.conflictUseRemoteButton}
        </Button>
      </div>
    </section>
  );
}
