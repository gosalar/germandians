import { Badge, Button, Textarea } from '@mantine/core';
import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import { DESTINATIONS, SECTIONS, destinationHref, hashLink } from '@/utils/constants';
import { requirementsHref } from '@/utils/requirements/topics';
import { siteConfig } from '@/utils/siteConfig';
import {
  EMPTY_ENTRIES,
  MAX_PART_LENGTH,
  SOP_PART_IDS,
  analyseOutline,
  clipPartText,
  createSopStorageSession,
  type ConflictResolutionChoice,
  type PartConflict,
  type RemoteStorageUpdate,
  type SopOutlineEntries,
  type SopPartId,
  type SopStorageSession,
} from '@/utils/sopPlanner';

import ConflictPanel from './ConflictPanel';
import {
  SOP_PARTS,
  SOP_PLANNER_COPY,
  STOCK_PHRASES,
  formatConflictDetectedAnnouncement,
  formatConflictResolvedAnnouncement,
  formatConflictSummaryCount,
  formatConflictUpdatedAnnouncement,
  formatFlaggedCount,
  formatMatchedHeading,
  formatPrintSummaryLine,
  formatWordCount,
  getStockSummaryText,
} from './data';
import styles from './styles.module.scss';

interface PlannerState {
  entries: SopOutlineEntries;
  conflicts: Partial<Record<SopPartId, PartConflict>>;
  storageFailed: boolean;
  lockingUnavailable: boolean;
  clearing: boolean;
  resolvingParts: Partial<Record<SopPartId, boolean>>;
  statusAnnouncement: string;
}

type PlannerAction =
  | {
      type: 'load-sync';
      entries: SopOutlineEntries;
      conflicts: Partial<Record<SopPartId, PartConflict>>;
      failed: boolean;
      lockingAvailable: boolean;
    }
  | {
      type: 'mount-reconcile';
      acceptedUntouched: Partial<Record<SopPartId, string>>;
      orphanedConflicts: Partial<Record<SopPartId, PartConflict>>;
      failed: boolean;
    }
  | { type: 'local-edit'; partId: SopPartId; value: string }
  | {
      type: 'edit-settled';
      partId: SopPartId;
      acceptedUntouched: Partial<Record<SopPartId, string>>;
      clearConflict: boolean;
    }
  | {
      type: 'edit-conflict';
      conflict: PartConflict;
      acceptedUntouched: Partial<Record<SopPartId, string>>;
      recoveryFailed: boolean;
      announcement: string;
    }
  | { type: 'resolve-start'; partId: SopPartId }
  | {
      type: 'resolve-done';
      partId: SopPartId;
      resolvedText: string;
      acceptedUntouched: Partial<Record<SopPartId, string>>;
      announcement: string;
    }
  | {
      type: 'resolve-conflict';
      conflict: PartConflict;
      acceptedUntouched: Partial<Record<SopPartId, string>>;
      recoveryFailed: boolean;
      announcement: string;
    }
  | { type: 'resolve-error'; partId: SopPartId }
  | { type: 'resolve-cancelled'; partId: SopPartId }
  | {
      type: 'remote-sync';
      acceptedUntouched: Partial<Record<SopPartId, string>>;
      newConflicts: readonly PartConflict[];
      clearedConflicts: readonly SopPartId[];
      announcement: string;
    }
  | { type: 'storage-error' }
  | { type: 'locking-unavailable' }
  | { type: 'clear-start' }
  | { type: 'clear-complete'; failed: boolean };

const INITIAL_STATE: PlannerState = {
  entries: EMPTY_ENTRIES,
  conflicts: {},
  storageFailed: false,
  lockingUnavailable: false,
  clearing: false,
  resolvingParts: {},
  statusAnnouncement: '',
};

function createZeroPartCounts(): Record<SopPartId, number> {
  return {
    'why-subject': 0,
    record: 0,
    beyond: 0,
    'why-programme': 0,
    next: 0,
  };
}

function getPartTitle(partId: SopPartId): string {
  return SOP_PARTS.find((part) => part.id === partId)?.title ?? partId;
}

function mergeUntouchedEntries(
  entries: SopOutlineEntries,
  acceptedUntouched: Partial<Record<SopPartId, string>>,
): SopOutlineEntries {
  const keys = Object.keys(acceptedUntouched) as SopPartId[];
  if (keys.length === 0) return entries;
  return { ...entries, ...acceptedUntouched };
}

function reducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'load-sync':
      return {
        ...state,
        entries: action.entries,
        conflicts: action.conflicts,
        storageFailed: state.storageFailed || action.failed,
        lockingUnavailable: !action.lockingAvailable,
        statusAnnouncement: '',
      };

    case 'mount-reconcile': {
      const nextEntries = mergeUntouchedEntries(state.entries, action.acceptedUntouched);
      const nextConflicts =
        Object.keys(action.orphanedConflicts).length > 0
          ? { ...state.conflicts, ...action.orphanedConflicts }
          : state.conflicts;
      return {
        ...state,
        entries: nextEntries,
        conflicts: nextConflicts,
        storageFailed: state.storageFailed || action.failed,
      };
    }

    case 'local-edit': {
      const nextEntries: SopOutlineEntries = {
        ...state.entries,
        [action.partId]: action.value,
      };
      const existingConflict = state.conflicts[action.partId];
      const nextConflicts = existingConflict
        ? {
            ...state.conflicts,
            [action.partId]: { ...existingConflict, localText: action.value },
          }
        : state.conflicts;
      return {
        ...state,
        entries: nextEntries,
        conflicts: nextConflicts,
        statusAnnouncement: '',
      };
    }

    case 'edit-settled': {
      const nextEntries = mergeUntouchedEntries(state.entries, action.acceptedUntouched);
      let nextConflicts = state.conflicts;
      if (action.clearConflict && state.conflicts[action.partId]) {
        nextConflicts = { ...state.conflicts };
        delete nextConflicts[action.partId];
      }
      return {
        ...state,
        entries: nextEntries,
        conflicts: nextConflicts,
      };
    }

    case 'edit-conflict': {
      const nextEntries = mergeUntouchedEntries(state.entries, action.acceptedUntouched);
      // Keep the newest visible text in this tab if the visitor typed further while the write settled.
      const latestLocal = state.entries[action.conflict.partId];
      const conflict: PartConflict =
        latestLocal !== action.conflict.localText
          ? { ...action.conflict, localText: latestLocal }
          : action.conflict;
      return {
        ...state,
        entries: nextEntries,
        conflicts: {
          ...state.conflicts,
          [conflict.partId]: conflict,
        },
        storageFailed: state.storageFailed || action.recoveryFailed,
        statusAnnouncement: action.announcement,
      };
    }

    case 'resolve-start':
      return {
        ...state,
        resolvingParts: { ...state.resolvingParts, [action.partId]: true },
      };

    case 'resolve-done': {
      const nextEntries: SopOutlineEntries = {
        ...mergeUntouchedEntries(state.entries, action.acceptedUntouched),
        [action.partId]: action.resolvedText,
      };
      const nextConflicts = { ...state.conflicts };
      delete nextConflicts[action.partId];
      const nextResolving = { ...state.resolvingParts };
      delete nextResolving[action.partId];
      return {
        ...state,
        entries: nextEntries,
        conflicts: nextConflicts,
        resolvingParts: nextResolving,
        statusAnnouncement: action.announcement,
      };
    }

    case 'resolve-conflict': {
      const nextEntries = mergeUntouchedEntries(state.entries, action.acceptedUntouched);
      const nextResolving = { ...state.resolvingParts };
      delete nextResolving[action.conflict.partId];
      return {
        ...state,
        entries: nextEntries,
        conflicts: {
          ...state.conflicts,
          [action.conflict.partId]: action.conflict,
        },
        resolvingParts: nextResolving,
        storageFailed: state.storageFailed || action.recoveryFailed,
        statusAnnouncement: action.announcement,
      };
    }

    case 'resolve-error': {
      const nextResolving = { ...state.resolvingParts };
      delete nextResolving[action.partId];
      return {
        ...state,
        resolvingParts: nextResolving,
        storageFailed: true,
      };
    }

    case 'resolve-cancelled': {
      const nextResolving = { ...state.resolvingParts };
      delete nextResolving[action.partId];
      return {
        ...state,
        resolvingParts: nextResolving,
      };
    }

    case 'remote-sync': {
      const nextEntries = mergeUntouchedEntries(state.entries, action.acceptedUntouched);
      let nextConflicts = state.conflicts;
      if (action.newConflicts.length > 0 || action.clearedConflicts.length > 0) {
        nextConflicts = { ...state.conflicts };
        for (const clearedId of action.clearedConflicts) {
          delete nextConflicts[clearedId];
        }
        for (const conflict of action.newConflicts) {
          nextConflicts[conflict.partId] = conflict;
        }
      }
      return {
        ...state,
        entries: nextEntries,
        conflicts: nextConflicts,
        statusAnnouncement: action.announcement || state.statusAnnouncement,
      };
    }

    case 'storage-error':
      return {
        ...state,
        storageFailed: true,
      };

    case 'locking-unavailable':
      return {
        ...state,
        lockingUnavailable: true,
      };

    case 'clear-start':
      return {
        ...state,
        clearing: true,
      };

    case 'clear-complete':
      return {
        ...state,
        entries: EMPTY_ENTRIES,
        conflicts: {},
        clearing: false,
        resolvingParts: {},
        storageFailed: state.storageFailed || action.failed,
        statusAnnouncement: action.failed
          ? SOP_PLANNER_COPY.clearFailedAnnouncement
          : SOP_PLANNER_COPY.clearedAnnouncement,
      };
  }
}

export default function SopPlanner() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const {
    entries,
    conflicts,
    storageFailed,
    lockingUnavailable,
    clearing,
    resolvingParts,
    statusAnnouncement,
  } = state;
  const [confirmingClear, setConfirmingClear] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const confirmClearRef = useRef<HTMLButtonElement>(null);
  const restoreClearFocus = useRef(false);
  const clearPromptId = useId();

  const sessionRef = useRef<SopStorageSession | null>(null);
  const focusedPartRef = useRef<SopPartId | null>(null);
  const pendingWritesRef = useRef<Record<SopPartId, number>>(createZeroPartCounts());
  const localWriteSeqRef = useRef<Record<SopPartId, number>>(createZeroPartCounts());
  const latestEntriesRef = useRef<SopOutlineEntries>(EMPTY_ENTRIES);
  const latestConflictsRef = useRef<Partial<Record<SopPartId, PartConflict>>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    latestEntriesRef.current = entries;
    latestConflictsRef.current = conflicts;
  }, [entries, conflicts]);

  // Focus moves to "Yes, clear" when the question opens and back to the first button when it closes.
  useEffect(() => {
    if (confirmingClear) {
      confirmClearRef.current?.focus();
    } else if (restoreClearFocus.current) {
      restoreClearFocus.current = false;
      clearButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  const ensureVisibleOnFocus = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < 88 || rect.bottom > window.innerHeight - 104) {
      element.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  };

  const collectUntouchedUpdates = (
    skipPartId: SopPartId | null,
    persistedEntries: SopOutlineEntries,
    session: SopStorageSession,
    onlyUneditedSinceMount = false,
  ): Partial<Record<SopPartId, string>> => {
    const acceptedUntouched: Partial<Record<SopPartId, string>> = {};
    for (const otherId of SOP_PART_IDS) {
      if (otherId === skipPartId) continue;
      if (onlyUneditedSinceMount && localWriteSeqRef.current[otherId] > 0) continue;
      if (focusedPartRef.current === otherId) continue;
      if (pendingWritesRef.current[otherId] > 0) continue;
      if (latestConflictsRef.current[otherId]) continue;

      const visible = latestEntriesRef.current[otherId];
      if (visible !== session.getBase(otherId)) continue;
      if (persistedEntries[otherId] !== visible) {
        session.acceptRemoteValue(otherId, persistedEntries[otherId]);
        acceptedUntouched[otherId] = persistedEntries[otherId];
      }
    }
    if (Object.keys(acceptedUntouched).length > 0) {
      latestEntriesRef.current = { ...latestEntriesRef.current, ...acceptedUntouched };
    }
    return acceptedUntouched;
  };

  useEffect(() => {
    mountedRef.current = true;
    const session = createSopStorageSession();
    sessionRef.current = session;

    const initial = session.loadSync();
    latestEntriesRef.current = initial.entries;
    latestConflictsRef.current = initial.conflicts;
    dispatch({
      type: 'load-sync',
      entries: initial.entries,
      conflicts: initial.conflicts,
      failed: initial.failed,
      lockingAvailable: initial.lockingAvailable,
    });

    const handleRemoteUpdate = (update: RemoteStorageUpdate) => {
      if (!mountedRef.current) return;
      if (update.failed) {
        dispatch({ type: 'storage-error' });
        return;
      }

      const isRemoteClear = update.kind === 'clear';
      const acceptedUntouched: Partial<Record<SopPartId, string>> = {};
      const newConflicts: PartConflict[] = [];
      const clearedConflicts: SopPartId[] = [];

      for (const partId of SOP_PART_IDS) {
        const remoteValue = update.entries[partId];
        const visibleValue = latestEntriesRef.current[partId];
        const baseValue = session.getBase(partId);
        const existingConflict = latestConflictsRef.current[partId];
        const isFocused = focusedPartRef.current === partId;
        const hasPendingWrite = pendingWritesRef.current[partId] > 0;

        if (existingConflict) {
          if (remoteValue === visibleValue && !existingConflict.fromRecoveredTab) {
            session.acceptRemoteValue(partId, remoteValue);
            clearedConflicts.push(partId);
          }
          continue;
        }

        if (remoteValue === visibleValue) {
          if (!hasPendingWrite && baseValue !== remoteValue) {
            session.acceptRemoteValue(partId, remoteValue);
          }
          continue;
        }

        const isActivelyEdited = isFocused || hasPendingWrite || visibleValue !== baseValue;
        if (!isActivelyEdited) {
          session.acceptRemoteValue(partId, remoteValue);
          acceptedUntouched[partId] = remoteValue;
          continue;
        }

        if (hasPendingWrite) {
          continue;
        }

        const conflict: PartConflict = {
          partId,
          localText: visibleValue,
          remoteText: remoteValue,
          expectedPersistedText: remoteValue,
          remoteCleared: isRemoteClear,
          updatedAfterConflict: false,
          fromRecoveredTab: false,
        };
        newConflicts.push(conflict);
        // Only write recovery data when this tab has an unpersisted local edit (and never right
        // after a confirmed remote clear), so resolving a conflict in another tab cannot be
        // resurrected by an untouched background tab that still happened to have focus.
        const shouldPersistRecovery = !isRemoteClear && visibleValue !== baseValue;
        void session.recordRemoteConflict(conflict, shouldPersistRecovery).then(({ recoveryFailed }) => {
          if (mountedRef.current && recoveryFailed) {
            dispatch({ type: 'storage-error' });
          }
        });
      }

      if (Object.keys(acceptedUntouched).length > 0) {
        latestEntriesRef.current = { ...latestEntriesRef.current, ...acceptedUntouched };
      }
      if (newConflicts.length > 0 || clearedConflicts.length > 0) {
        const nextConflicts = { ...latestConflictsRef.current };
        for (const clearedId of clearedConflicts) {
          delete nextConflicts[clearedId];
        }
        for (const conflict of newConflicts) {
          nextConflicts[conflict.partId] = conflict;
        }
        latestConflictsRef.current = nextConflicts;
      }

      if (
        Object.keys(acceptedUntouched).length > 0 ||
        newConflicts.length > 0 ||
        clearedConflicts.length > 0
      ) {
        const firstConflict = newConflicts[0];
        const announcement = firstConflict
          ? formatConflictDetectedAnnouncement(
              getPartTitle(firstConflict.partId),
              firstConflict.remoteCleared,
            )
          : '';
        dispatch({
          type: 'remote-sync',
          acceptedUntouched,
          newConflicts,
          clearedConflicts,
          announcement,
        });
      }
    };

    const unsubscribe = session.subscribe(handleRemoteUpdate);

    void session.init().then((reconciled) => {
      if (!mountedRef.current) return;
      const acceptedUntouched = collectUntouchedUpdates(
        null,
        reconciled.persistedEntries,
        session,
        true,
      );
      const orphanedConflicts: Partial<Record<SopPartId, PartConflict>> = {};
      for (const partId of SOP_PART_IDS) {
        const candidate = reconciled.orphanedConflicts[partId];
        if (
          candidate &&
          localWriteSeqRef.current[partId] === 0 &&
          !latestConflictsRef.current[partId]
        ) {
          orphanedConflicts[partId] = candidate;
        }
      }
      if (
        Object.keys(acceptedUntouched).length > 0 ||
        Object.keys(orphanedConflicts).length > 0 ||
        reconciled.failed
      ) {
        dispatch({
          type: 'mount-reconcile',
          acceptedUntouched,
          orphanedConflicts,
          failed: reconciled.failed,
        });
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
      session.dispose();
      sessionRef.current = null;
    };
  }, []);

  const analysis = analyseOutline(entries, STOCK_PHRASES);
  const hasAnyText = SOP_PARTS.some((part) => entries[part.id].trim().length > 0);
  const conflictedParts = SOP_PARTS.filter((part) => Boolean(conflicts[part.id]));

  const updatePart = (id: SopPartId, value: string) => {
    const clipped = clipPartText(value);
    const writeSeq = localWriteSeqRef.current[id] + 1;
    localWriteSeqRef.current[id] = writeSeq;
    latestEntriesRef.current = { ...latestEntriesRef.current, [id]: clipped };
    dispatch({ type: 'local-edit', partId: id, value: clipped });

    const session = sessionRef.current;
    if (!session || !session.lockingAvailable) return;

    pendingWritesRef.current[id] += 1;
    void session.editPart(id, clipped).then((result) => {
      pendingWritesRef.current[id] = Math.max(0, pendingWritesRef.current[id] - 1);
      if (!mountedRef.current) return;

      if (result.status === 'cancelled') return;

      if (result.status === 'locking-unavailable') {
        dispatch({ type: 'locking-unavailable' });
        return;
      }

      if (result.status === 'error') {
        dispatch({ type: 'storage-error' });
        return;
      }

      const acceptedUntouched = collectUntouchedUpdates(id, result.entries, session);

      if (result.status === 'saved') {
        dispatch({
          type: 'edit-settled',
          partId: id,
          acceptedUntouched,
          clearConflict: writeSeq === localWriteSeqRef.current[id],
        });
        return;
      }

      const announcement = result.conflict.updatedAfterConflict
        ? formatConflictUpdatedAnnouncement(getPartTitle(id))
        : formatConflictDetectedAnnouncement(getPartTitle(id), result.conflict.remoteCleared);
      latestConflictsRef.current = {
        ...latestConflictsRef.current,
        [result.conflict.partId]: {
          ...result.conflict,
          localText: latestEntriesRef.current[result.conflict.partId],
        },
      };
      dispatch({
        type: 'edit-conflict',
        conflict: result.conflict,
        acceptedUntouched,
        recoveryFailed: result.recoveryFailed,
        announcement,
      });
    });
  };

  const handleResolveConflict = (partId: SopPartId, choice: ConflictResolutionChoice) => {
    const session = sessionRef.current;
    const conflict = conflicts[partId];
    if (!session || !conflict || resolvingParts[partId]) return;

    dispatch({ type: 'resolve-start', partId });
    void session.resolveConflict(conflict, choice).then((result) => {
      if (!mountedRef.current) return;

      if (result.status === 'cancelled') {
        dispatch({ type: 'resolve-cancelled', partId });
        return;
      }

      if (result.status === 'error') {
        dispatch({ type: 'resolve-error', partId });
        return;
      }

      const acceptedUntouched = collectUntouchedUpdates(partId, result.entries, session);

      if (result.status === 'conflict') {
        latestConflictsRef.current = {
          ...latestConflictsRef.current,
          [result.conflict.partId]: result.conflict,
        };
        dispatch({
          type: 'resolve-conflict',
          conflict: result.conflict,
          acceptedUntouched,
          recoveryFailed: result.recoveryFailed,
          announcement: formatConflictUpdatedAnnouncement(getPartTitle(partId)),
        });
        return;
      }

      latestEntriesRef.current = {
        ...latestEntriesRef.current,
        ...acceptedUntouched,
        [partId]: result.resolvedText,
      };
      const nextConflicts = { ...latestConflictsRef.current };
      delete nextConflicts[partId];
      latestConflictsRef.current = nextConflicts;

      dispatch({
        type: 'resolve-done',
        partId,
        resolvedText: result.resolvedText,
        acceptedUntouched,
        announcement: formatConflictResolvedAnnouncement(
          getPartTitle(partId),
          choice,
          result.resolvedText.length === 0,
        ),
      });

      requestAnimationFrame(() => {
        if (!mountedRef.current) return;
        const input = document.getElementById(`sop-input-${partId}`);
        if (input instanceof HTMLTextAreaElement) {
          input.focus({ preventScroll: true });
          ensureVisibleOnFocus(input);
        }
      });
    });
  };

  const closeClearConfirm = () => {
    restoreClearFocus.current = true;
    setConfirmingClear(false);
  };

  const handleClear = () => {
    const session = sessionRef.current;
    if (!session || clearing) return;
    dispatch({ type: 'clear-start' });
    void session.clear().then(({ failed }) => {
      if (!mountedRef.current) return;
      pendingWritesRef.current = createZeroPartCounts();
      latestEntriesRef.current = EMPTY_ENTRIES;
      latestConflictsRef.current = {};
      closeClearConfirm();
      dispatch({ type: 'clear-complete', failed });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const stockSummaryText = getStockSummaryText(hasAnyText, analysis.totalFlaggedPhrases);

  const mentoringFacts = [
    ...SOP_PLANNER_COPY.mentoring.facts,
    SOP_PLANNER_COPY.mentoring.places(siteConfig.intake),
  ];

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section id={SECTIONS.top} className={styles.topSection}>
        <ContentContainer width="wide">
          <PageHeader
            variant="compact"
            title={SOP_PLANNER_COPY.title}
            introduction={SOP_PLANNER_COPY.lede}
            leading={(
              <div className={styles.badges}>
                {SOP_PLANNER_COPY.badges.map((badge, index) => (
                  <span
                    key={badge}
                    className={styles.badge}
                    data-tone={index === 0 ? 'green' : undefined}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          />

          <div className={styles.contextBar}>
            <p className={styles.contextText}>{SOP_PLANNER_COPY.contextNote}</p>
            <div className={styles.contextLinks}>
              <HomeSectionLink href={hashLink(SECTIONS.sop)} className={styles.inlineLink}>
                <span>{SOP_PLANNER_COPY.homeSopLinkLabel}</span>
                <span aria-hidden="true">→</span>
              </HomeSectionLink>
              <Link to={requirementsHref('documents')} className={styles.inlineLink}>
                <span>{SOP_PLANNER_COPY.documentsLinkLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <p className={styles.printSummaryLine}>
            {formatPrintSummaryLine(analysis.totalWords)}
          </p>

          <div className={styles.workbench}>
            <div className={styles.outlineColumn}>
              <div className={styles.outlineHead}>
                <h2 className={styles.outlineHeading}>
                  <span lang="de" className={styles.kickerDe}>
                    {SOP_PLANNER_COPY.outlineKicker.de}
                  </span>{' '}
                  <span>{SOP_PLANNER_COPY.outlineKicker.en}</span>
                </h2>
              </div>

              <div className={styles.partsList}>
                {SOP_PARTS.map((part, index) => {
                  const partAnalysis = analysis.parts[part.id];
                  const partConflict = conflicts[part.id];
                  const sectionAnchorId = `part-${part.id}`;
                  const headingId = `sop-heading-${part.id}`;
                  const inputId = `sop-input-${part.id}`;
                  const guidanceId = `sop-guidance-${part.id}`;
                  const countId = `sop-count-${part.id}`;
                  const rawValue = entries[part.id];
                  const hasPrintText = rawValue.trim().length > 0;

                  return (
                    <div
                      key={part.id}
                      id={sectionAnchorId}
                      className={styles.partCard}
                    >
                      <div className={styles.partHead}>
                        <h3 id={headingId} className={styles.partTitle}>
                          <span aria-hidden="true" className={styles.partNumber}>
                            {index + 1}
                          </span>{' '}
                          <label htmlFor={inputId} className={styles.partLabel}>
                            {part.title}
                          </label>
                        </h3>

                        <div className={styles.partMeta}>
                          <span
                            id={countId}
                            data-testid={`word-count-${part.id}`}
                            className={styles.wordPill}
                          >
                            {formatWordCount(partAnalysis.wordCount)}
                          </span>
                          {partAnalysis.matches.length > 0 ? (
                            <Badge className={styles.flagBadge}>
                              {formatFlaggedCount(partAnalysis.matches.length)}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <p id={guidanceId} className={styles.guidance}>
                        {part.guidance}
                      </p>

                      <Textarea
                        id={inputId}
                        rows={5}
                        maxLength={MAX_PART_LENGTH}
                        value={rawValue}
                        onFocus={(event) => {
                          focusedPartRef.current = part.id;
                          ensureVisibleOnFocus(event.currentTarget);
                        }}
                        onBlur={() => {
                          if (focusedPartRef.current === part.id) {
                            focusedPartRef.current = null;
                          }
                        }}
                        onChange={(event) => updatePart(part.id, event.currentTarget.value)}
                        placeholder={part.placeholder}
                        aria-describedby={`${guidanceId} ${countId}`}
                        classNames={{
                          root: styles.fieldRoot,
                          input: styles.textarea,
                        }}
                      />

                      {partConflict ? (
                        <ConflictPanel
                          partTitle={part.title}
                          conflict={partConflict}
                          resolving={Boolean(resolvingParts[part.id])}
                          onResolve={(choice) => handleResolveConflict(part.id, choice)}
                          onFocusControl={ensureVisibleOnFocus}
                        />
                      ) : null}

                      {partAnalysis.matches.length > 0 ? (
                        <div
                          className={styles.flagsPanel}
                          data-testid={`stock-matches-${part.id}`}
                        >
                          <h4 className={styles.flagsTitle}>
                            {SOP_PLANNER_COPY.partFlagsHeading}
                          </h4>

                          <div className={styles.previewBox}>
                            <span className={styles.previewLabel}>
                              {SOP_PLANNER_COPY.annotatedPreviewLabel}
                            </span>
                            <p className={styles.annotatedPreview}>
                              {partAnalysis.segments.map((segment, segIndex) =>
                                segment.kind === 'match' ? (
                                  <mark
                                    key={`${segment.phraseId}-${segIndex}`}
                                    className={styles.matchedMark}
                                  >
                                    <span>{segment.text}</span>
                                    <span className={styles.matchedRef}>
                                      [{segment.noteNumber}]
                                    </span>
                                  </mark>
                                ) : (
                                  <span key={`text-${segIndex}`}>{segment.text}</span>
                                ),
                              )}
                            </p>
                          </div>

                          <ol className={styles.matchList}>
                            {partAnalysis.matches.map((match) => (
                              <li key={match.item.id} className={styles.matchItem}>
                                <div className={styles.matchHead}>
                                  <span aria-hidden="true" className={styles.matchNumber}>
                                    {match.noteNumber}
                                  </span>
                                  <span className={styles.matchPhrase}>
                                    {formatMatchedHeading(match.item.phrase, match.count)}
                                  </span>
                                  <span className={styles.matchTag}>
                                    {SOP_PLANNER_COPY.stockBadgeLabel}
                                  </span>
                                </div>
                                <p className={styles.matchDetail}>
                                  <strong>{SOP_PLANNER_COPY.whyHeading}</strong>{' '}
                                  {match.item.why}
                                </p>
                                <p className={styles.matchDetail}>
                                  <strong>{SOP_PLANNER_COPY.promptHeading}</strong>{' '}
                                  {match.item.prompt}
                                </p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}

                      <p
                        className={styles.printPartBody}
                        data-empty={!hasPrintText ? 'true' : undefined}
                      >
                        {hasPrintText ? rawValue : SOP_PLANNER_COPY.emptyPrintText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside aria-labelledby="sop-summary-title" className={styles.summaryCard}>
              <div className={styles.summaryHead}>
                <h2 id="sop-summary-title" className={styles.summaryTitle}>
                  {SOP_PLANNER_COPY.summaryTitle}
                </h2>
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="sop-total-live"
                  className={styles.totalsRow}
                >
                  <span className={styles.totalLabel}>{SOP_PLANNER_COPY.totalWordsLabel}</span>
                  <span className={styles.totalValue} data-testid="sop-total-words">
                    {formatWordCount(analysis.totalWords)}
                  </span>
                </div>
              </div>

              <div className={styles.stockSummaryBox} data-testid="sop-stock-summary">
                <span className={styles.stockSummaryLabel}>
                  {SOP_PLANNER_COPY.stockCheckTitle}
                </span>
                <p className={styles.stockSummaryText}>{stockSummaryText}</p>
              </div>

              {conflictedParts.length > 0 ? (
                <div className={styles.conflictSummaryBox} data-testid="sop-conflict-summary">
                  <span className={styles.conflictSummaryLabel}>
                    {SOP_PLANNER_COPY.conflictSummaryTitle}
                  </span>
                  <p className={styles.conflictSummaryText}>
                    {formatConflictSummaryCount(conflictedParts.length)}
                  </p>
                  <ul className={styles.conflictSummaryList}>
                    {conflictedParts.map((part) => (
                      <li key={part.id}>
                        <a
                          href={hashLink(`conflict-${part.id}`)}
                          className={styles.breakdownLink}
                        >
                          {part.shortTitle}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className={styles.breakdown}>
                <h3 className={styles.breakdownTitle}>{SOP_PLANNER_COPY.partBreakdownTitle}</h3>
                <ol className={styles.breakdownList}>
                  {SOP_PARTS.map((part, index) => (
                    <li key={part.id} className={styles.breakdownItem}>
                      <a href={hashLink(`part-${part.id}`)} className={styles.breakdownLink}>
                        {index + 1}. {part.shortTitle}
                      </a>
                      <span className={styles.breakdownCount}>
                        {formatWordCount(analysis.parts[part.id].wordCount)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className={styles.browserNote}>
                {lockingUnavailable
                  ? SOP_PLANNER_COPY.lockingUnavailableBrowserNote
                  : SOP_PLANNER_COPY.browserNote}
              </p>

              {lockingUnavailable ? (
                <p role="status" className={styles.storageWarning}>
                  {SOP_PLANNER_COPY.lockingUnavailableWarning}
                </p>
              ) : null}

              {storageFailed ? (
                <p role="status" className={styles.storageWarning}>
                  {SOP_PLANNER_COPY.storageWarning}
                </p>
              ) : null}

              <div className={styles.summaryActions}>
                <Button type="button" variant="yellow-dark" size="lg" onClick={handlePrint}>
                  {SOP_PLANNER_COPY.printButton}
                </Button>
                {confirmingClear ? (
                  <div
                    role="group"
                    aria-labelledby={clearPromptId}
                    className={styles.confirmClear}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape' && !clearing) closeClearConfirm();
                    }}
                  >
                    <span id={clearPromptId} className={styles.confirmPrompt}>
                      {SOP_PLANNER_COPY.clearConfirmPrompt}
                    </span>
                    <Button
                      ref={confirmClearRef}
                      type="button"
                      variant="yellow-dark"
                      size="md"
                      disabled={clearing}
                      onClick={handleClear}
                    >
                      {SOP_PLANNER_COPY.clearConfirmYes}
                    </Button>
                    <Button
                      type="button"
                      variant="ring-dark"
                      size="md"
                      disabled={clearing}
                      onClick={closeClearConfirm}
                    >
                      {SOP_PLANNER_COPY.clearConfirmCancel}
                    </Button>
                  </div>
                ) : (
                  <Button
                    ref={clearButtonRef}
                    type="button"
                    variant="ring-dark"
                    size="md"
                    onClick={() => setConfirmingClear(true)}
                  >
                    {SOP_PLANNER_COPY.clearButton}
                  </Button>
                )}
              </div>

              <div role="status" aria-live="polite" aria-atomic="true" className={styles.statusRegion}>
                {statusAnnouncement}
              </div>
            </aside>
          </div>
        </ContentContainer>
      </section>

      <section aria-labelledby="sop-mentoring-title" className={styles.mentoringSection}>
        <ContentContainer width="wide">
          <div className={styles.mentoringCard}>
            <div className={styles.mentoringCopy}>
              <p className={styles.mentoringKicker}>
                <span lang="de">{SOP_PLANNER_COPY.mentoring.kicker.de}</span>
                <span className={styles.mentoringKickerEn}>
                  {SOP_PLANNER_COPY.mentoring.kicker.en}
                </span>
              </p>
              <h2 id="sop-mentoring-title" className={styles.mentoringTitle}>
                {SOP_PLANNER_COPY.mentoring.title}
              </h2>
              <p className={styles.mentoringBody}>{SOP_PLANNER_COPY.mentoring.body}</p>
            </div>

            <div className={styles.mentoringDetails}>
              <ul className={styles.mentoringFacts}>
                {mentoringFacts.map((fact) => (
                  <li key={fact}>
                    <span aria-hidden="true" className={styles.factBullet} />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.mentoringActions}>
                <Button
                  component={HomeSectionLink}
                  href={destinationHref(DESTINATIONS.profileReview)}
                  variant="navy"
                  size="lg"
                >
                  {SOP_PLANNER_COPY.mentoring.reviewCta}
                </Button>
                <Button
                  component={HomeSectionLink}
                  href={hashLink(SECTIONS.sop)}
                  variant="ring"
                  size="lg"
                >
                  {SOP_PLANNER_COPY.mentoring.sopSectionCta}
                </Button>
              </div>
            </div>
          </div>
        </ContentContainer>
      </section>
    </main>
  );
}
