import { SOP_PART_IDS, type SopOutlineEntries, type SopPartId } from './types.ts';

/**
 * Browser-only storage for the five-part SOP outline. Every read, write and removal is wrapped in
 * try/catch because storage may be blocked, full or unavailable. Multi-tab writes serialise through
 * a same-origin Web Lock plus a per-tab queue so edits to different sections merge cleanly and
 * same-section conflicts surface both versions for recovery.
 */

export const STORAGE_KEY = 'germandians:sop-planner';
export const RECOVERY_STORAGE_KEY = 'germandians:sop-planner-recovery';
export const TAB_ID_STORAGE_KEY = 'germandians:sop-planner-tab';
export const STORAGE_LOCK_NAME = 'germandians:sop-planner:lock';
export const BROADCAST_CHANNEL_NAME = 'germandians:sop-planner:sync';
export const MAX_PART_LENGTH = 20_000;

const TAB_PRESENCE_LOCK_PREFIX = 'germandians:sop-planner:tab:';
export const SYNC_DB_NAME = 'germandians:sop-planner-sync';
const SYNC_STORE_NAME = 'meta';
const SYNC_RECORD_KEY = 'outline';
const MAX_PREV_HASHES = 8;
const SYNC_WAIT_TIMEOUT_MS = 250;

export interface StoredSopOutline {
  readonly version: 1;
  readonly entries: SopOutlineEntries;
}

export interface StoredConflictItem {
  readonly tabId: string;
  readonly baseText: string;
  readonly localText: string;
  readonly seenRemoteText: string;
  readonly remoteCleared: boolean;
}

export interface StoredSopRecovery {
  readonly version: 1;
  readonly conflicts: Partial<Record<SopPartId, StoredConflictItem>>;
}

export interface PartConflict {
  readonly partId: SopPartId;
  readonly localText: string;
  readonly remoteText: string;
  readonly expectedPersistedText: string;
  readonly remoteCleared: boolean;
  readonly updatedAfterConflict: boolean;
  readonly fromRecoveredTab: boolean;
}

export type ConflictResolutionChoice = 'local' | 'remote';

export type PartPatchResult =
  | {
      readonly status: 'saved';
      readonly partId: SopPartId;
      readonly entries: SopOutlineEntries;
    }
  | {
      readonly status: 'conflict';
      readonly partId: SopPartId;
      readonly conflict: PartConflict;
      readonly entries: SopOutlineEntries;
      readonly recoveryFailed: boolean;
    }
  | {
      readonly status: 'error';
      readonly partId: SopPartId;
    }
  | {
      readonly status: 'cancelled';
      readonly partId: SopPartId;
    }
  | {
      readonly status: 'locking-unavailable';
      readonly partId: SopPartId;
    };

export type ResolveConflictResult =
  | {
      readonly status: 'resolved';
      readonly partId: SopPartId;
      readonly entries: SopOutlineEntries;
      readonly resolvedText: string;
    }
  | {
      readonly status: 'conflict';
      readonly partId: SopPartId;
      readonly conflict: PartConflict;
      readonly entries: SopOutlineEntries;
      readonly recoveryFailed: boolean;
    }
  | {
      readonly status: 'error';
      readonly partId: SopPartId;
    }
  | {
      readonly status: 'cancelled';
      readonly partId: SopPartId;
    };

export interface ClearOutlineResult {
  readonly failed: boolean;
}

export interface InitialLoadResult {
  readonly entries: SopOutlineEntries;
  readonly conflicts: Partial<Record<SopPartId, PartConflict>>;
  readonly failed: boolean;
  readonly lockingAvailable: boolean;
}

export interface MountReconcileResult {
  readonly persistedEntries: SopOutlineEntries;
  readonly orphanedConflicts: Partial<Record<SopPartId, PartConflict>>;
  readonly failed: boolean;
}

export interface RemoteStorageUpdate {
  readonly kind: 'entries' | 'clear';
  readonly entries: SopOutlineEntries;
  readonly failed: boolean;
}

export interface SopStorageSession {
  readonly tabId: string;
  readonly lockingAvailable: boolean;
  loadSync(): InitialLoadResult;
  init(): Promise<MountReconcileResult>;
  editPart(partId: SopPartId, typedText: string): Promise<PartPatchResult>;
  resolveConflict(
    conflict: PartConflict,
    choice: ConflictResolutionChoice,
  ): Promise<ResolveConflictResult>;
  clear(): Promise<ClearOutlineResult>;
  getBase(partId: SopPartId): string;
  acceptRemoteValue(partId: SopPartId, value: string): void;
  recordRemoteConflict(
    conflict: PartConflict,
    persistRecovery?: boolean,
  ): Promise<{ recoveryFailed: boolean }>;
  subscribe(onRemoteUpdate: (update: RemoteStorageUpdate) => void): () => void;
  dispose(): void;
}

export const EMPTY_ENTRIES: SopOutlineEntries = {
  'why-subject': '',
  record: '',
  beyond: '',
  'why-programme': '',
  next: '',
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPartId = (key: string): key is SopPartId =>
  (SOP_PART_IDS as readonly string[]).includes(key);

export function clipPartText(value: string): string {
  return value.length > MAX_PART_LENGTH ? value.slice(0, MAX_PART_LENGTH) : value;
}

export function isOutlineEmpty(entries: SopOutlineEntries): boolean {
  return SOP_PART_IDS.every((id) => entries[id].length === 0);
}

export function isWebLocksAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.locks !== 'undefined' &&
    typeof navigator.locks?.request === 'function'
  );
}

/** Validates the persisted JSON shape before the page uses it. */
export function validStoredOutline(value: unknown): value is StoredSopOutline {
  if (!isPlainObject(value) || value.version !== 1 || !isPlainObject(value.entries)) {
    return false;
  }
  const topKeys = Object.keys(value);
  if (topKeys.length !== 2 || !topKeys.every((key) => key === 'version' || key === 'entries')) {
    return false;
  }
  const entryKeys = Object.keys(value.entries);
  if (entryKeys.length !== SOP_PART_IDS.length || !entryKeys.every(isPartId)) {
    return false;
  }
  for (const id of SOP_PART_IDS) {
    const entry = value.entries[id];
    if (typeof entry !== 'string' || entry.length > MAX_PART_LENGTH) {
      return false;
    }
  }
  return true;
}

function validStoredConflictItem(value: unknown): value is StoredConflictItem {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  if (
    keys.length !== 5 ||
    !keys.every(
      (key) =>
        key === 'tabId' ||
        key === 'baseText' ||
        key === 'localText' ||
        key === 'seenRemoteText' ||
        key === 'remoteCleared',
    )
  ) {
    return false;
  }
  return (
    typeof value.tabId === 'string' &&
    value.tabId.length > 0 &&
    value.tabId.length <= 128 &&
    typeof value.baseText === 'string' &&
    value.baseText.length <= MAX_PART_LENGTH &&
    typeof value.localText === 'string' &&
    value.localText.length <= MAX_PART_LENGTH &&
    typeof value.seenRemoteText === 'string' &&
    value.seenRemoteText.length <= MAX_PART_LENGTH &&
    typeof value.remoteCleared === 'boolean'
  );
}

/** Validates the persisted conflict recovery record before the page uses it. */
export function validStoredRecovery(value: unknown): value is StoredSopRecovery {
  if (!isPlainObject(value) || value.version !== 1 || !isPlainObject(value.conflicts)) {
    return false;
  }
  const topKeys = Object.keys(value);
  if (topKeys.length !== 2 || !topKeys.every((key) => key === 'version' || key === 'conflicts')) {
    return false;
  }
  for (const [key, item] of Object.entries(value.conflicts)) {
    if (!isPartId(key) || !validStoredConflictItem(item)) {
      return false;
    }
  }
  return true;
}

/** Reads saved entries after mount. Discards malformed or unexpected storage entries cleanly. */
export function readEntries(): { entries: SopOutlineEntries; failed: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { entries: EMPTY_ENTRIES, failed: false };
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    if (!validStoredOutline(parsed)) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore removal failure when storage is read-only.
      }
      return { entries: EMPTY_ENTRIES, failed: false };
    }
    return { entries: parsed.entries, failed: false };
  } catch {
    return { entries: EMPTY_ENTRIES, failed: true };
  }
}

/** Persists current entries, or removes the key when all five parts are empty. */
export function writeEntries(entries: SopOutlineEntries): boolean {
  if (isOutlineEmpty(entries)) {
    return clearEntries();
  }
  try {
    const payload: StoredSopOutline = { version: 1, entries };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearEntries(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function readRecovery(): {
  conflicts: Partial<Record<SopPartId, StoredConflictItem>>;
  failed: boolean;
} {
  try {
    const raw = window.localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (raw === null) return { conflicts: {}, failed: false };
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    if (!validStoredRecovery(parsed)) {
      try {
        window.localStorage.removeItem(RECOVERY_STORAGE_KEY);
      } catch {
        // Ignore removal failure when storage is read-only.
      }
      return { conflicts: {}, failed: false };
    }
    return { conflicts: parsed.conflicts, failed: false };
  } catch {
    return { conflicts: {}, failed: true };
  }
}

function writeRecovery(conflicts: Partial<Record<SopPartId, StoredConflictItem>>): boolean {
  const keys = Object.keys(conflicts);
  if (keys.length === 0) {
    return clearRecovery();
  }
  try {
    const payload: StoredSopRecovery = { version: 1, conflicts };
    window.localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function clearRecovery(): boolean {
  try {
    window.localStorage.removeItem(RECOVERY_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function writeRecoveryForPart(partId: SopPartId, item: StoredConflictItem): boolean {
  const existing = readRecovery();
  if (existing.failed) return false;
  return writeRecovery({ ...existing.conflicts, [partId]: item });
}

function removeRecoveryForPart(partId: SopPartId, onlyIfTabId?: string): boolean {
  const existing = readRecovery();
  if (existing.failed) return false;
  const current = existing.conflicts[partId];
  if (!current) return true;
  if (onlyIfTabId !== undefined && current.tabId !== onlyIfTabId) return true;
  const next: Partial<Record<SopPartId, StoredConflictItem>> = { ...existing.conflicts };
  delete next[partId];
  return writeRecovery(next);
}

let documentTabId: string | null = null;

/**
 * One ID per tab, kept across reloads. While the page is open the ID lives in memory only and is
 * written to sessionStorage just as the page is left (pagehide), so a reload reads it back. "Duplicate
 * tab" and links opened with an opener copy sessionStorage, so taking the ID out while the page is open
 * keeps a copied tab from claiming this tab's ID and its recovery copies.
 */
function createTabId(): string {
  if (documentTabId) return documentTabId;
  const generate = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  let existing: string | null;
  try {
    existing = window.sessionStorage.getItem(TAB_ID_STORAGE_KEY);
    window.sessionStorage.removeItem(TAB_ID_STORAGE_KEY);
  } catch {
    existing = null;
  }
  const tabId = existing && existing.length > 0 && existing.length <= 128 ? existing : generate();
  documentTabId = tabId;

  window.addEventListener('pagehide', () => {
    try {
      window.sessionStorage.setItem(TAB_ID_STORAGE_KEY, tabId);
    } catch {
      // Without sessionStorage the next load starts with a new ID.
    }
  });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    try {
      window.sessionStorage.removeItem(TAB_ID_STORAGE_KEY);
    } catch {
      // Ignore when storage is unavailable.
    }
  });
  return tabId;
}

async function withStorageLock<T>(
  task: () => Promise<T> | T,
): Promise<{ ok: true; value: T } | { ok: false }> {
  if (!isWebLocksAvailable()) {
    return { ok: false };
  }
  try {
    const value = await navigator.locks.request(STORAGE_LOCK_NAME, async () => await task());
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}

interface SyncJournalRecord {
  readonly nextHash: string;
  readonly prevHashes: readonly string[];
}

function hashStorageValue(raw: string | null): string {
  if (raw === null) return 'null';
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + ((i + 1) & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return `${raw.length}:${(h1 >>> 0).toString(16)}:${(h2 >>> 0).toString(16)}`;
}

function safeGetRawOutline(): { ok: true; raw: string | null } | { ok: false } {
  try {
    return { ok: true, raw: window.localStorage.getItem(STORAGE_KEY) };
  } catch {
    return { ok: false };
  }
}

let cachedSyncDbPromise: Promise<IDBDatabase | null> | null = null;

function openSyncDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (cachedSyncDbPromise) {
    return cachedSyncDbPromise;
  }
  cachedSyncDbPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      const request = indexedDB.open(SYNC_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
          db.createObjectStore(SYNC_STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onclose = () => {
          cachedSyncDbPromise = null;
        };
        db.onversionchange = () => {
          db.close();
          cachedSyncDbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        cachedSyncDbPromise = null;
        resolve(null);
      };
      request.onblocked = () => {
        cachedSyncDbPromise = null;
        resolve(null);
      };
    } catch {
      cachedSyncDbPromise = null;
      resolve(null);
    }
  });
  return cachedSyncDbPromise;
}

function isSyncJournalRecord(value: unknown): value is SyncJournalRecord {
  return (
    isPlainObject(value) &&
    typeof value.nextHash === 'string' &&
    Array.isArray(value.prevHashes) &&
    value.prevHashes.every((item) => typeof item === 'string')
  );
}

async function readSyncJournal(): Promise<SyncJournalRecord | null> {
  const db = await openSyncDb();
  if (!db) return null;
  return new Promise<SyncJournalRecord | null>((resolve) => {
    try {
      const tx = db.transaction(SYNC_STORE_NAME, 'readonly');
      const req = tx.objectStore(SYNC_STORE_NAME).get(SYNC_RECORD_KEY);
      req.onsuccess = () => {
        resolve(isSyncJournalRecord(req.result) ? req.result : null);
      };
      req.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeSyncJournal(prevHash: string, nextHash: string): Promise<void> {
  if (prevHash === nextHash) return;
  const db = await openSyncDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SYNC_STORE_NAME);
      const getReq = store.get(SYNC_RECORD_KEY);
      getReq.onsuccess = () => {
        const existing = isSyncJournalRecord(getReq.result) ? getReq.result : null;
        const history = existing ? existing.prevHashes.filter((h) => h !== nextHash && h !== prevHash) : [];
        const nextRecord: SyncJournalRecord = {
          nextHash,
          prevHashes: [...history, prevHash].slice(-MAX_PREV_HASHES),
        };
        store.put(nextRecord, SYNC_RECORD_KEY);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Chromium caches localStorage per renderer process and propagates writes asynchronously on a
 * separate IPC channel from Web Locks. Before reading localStorage inside the lock, compare its
 * hash with the linearizable IndexedDB hash journal and wait briefly if this tab's cache is still
 * catching up to an already-committed cross-tab write.
 */
async function awaitLocalStorageFresh(): Promise<void> {
  const journal = await readSyncJournal();
  if (!journal) return;
  const initial = safeGetRawOutline();
  if (!initial.ok) return;
  const initialHash = hashStorageValue(initial.raw);
  if (initialHash === journal.nextHash || !journal.prevHashes.includes(initialHash)) {
    return;
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('storage', check);
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const check = () => {
      const latest = safeGetRawOutline();
      if (!latest.ok) {
        finish();
        return;
      }
      const latestHash = hashStorageValue(latest.raw);
      if (latestHash === journal.nextHash || !journal.prevHashes.includes(latestHash)) {
        finish();
      }
    };
    window.addEventListener('storage', check);
    const intervalId = window.setInterval(check, 2);
    const timeoutId = window.setTimeout(finish, SYNC_WAIT_TIMEOUT_MS);
    check();
  });
}

async function isTabAlive(tabId: string): Promise<boolean> {
  if (!isWebLocksAvailable()) {
    return false;
  }
  try {
    return await navigator.locks.request(
      `${TAB_PRESENCE_LOCK_PREFIX}${tabId}`,
      { ifAvailable: true },
      (lock) => lock === null,
    );
  } catch {
    return false;
  }
}

interface BroadcastPayload {
  readonly type: 'update' | 'clear';
  readonly tabId: string;
}

function isBroadcastPayload(value: unknown): value is BroadcastPayload {
  return (
    isPlainObject(value) &&
    (value.type === 'update' || value.type === 'clear') &&
    typeof value.tabId === 'string'
  );
}

function patchPartLocked(
  partId: SopPartId,
  editingBase: string,
  typedText: string,
  tabId: string,
  existingConflict: PartConflict | undefined,
): PartPatchResult {
  const clipped = clipPartText(typedText);
  const read = readEntries();
  if (read.failed) {
    return { status: 'error', partId };
  }

  const current = read.entries;
  const currentPart = current[partId];

  // If no conflict is open, accept when storage still matches this editor's base or already holds
  // the exact typed text. While a conflict is open, only exact convergence resolves automatically;
  // otherwise keep both versions until the visitor makes an explicit choice.
  const canPersist = existingConflict
    ? currentPart === clipped
    : currentPart === editingBase || currentPart === clipped;

  if (canPersist) {
    const nextEntries: SopOutlineEntries =
      currentPart === clipped ? current : { ...current, [partId]: clipped };
    if (currentPart !== clipped) {
      const saved = writeEntries(nextEntries);
      if (!saved) {
        return { status: 'error', partId };
      }
    }
    removeRecoveryForPart(partId, tabId);
    return { status: 'saved', partId, entries: nextEntries };
  }

  const remoteCleared = isOutlineEmpty(current);
  const updatedAfterConflict = Boolean(
    existingConflict &&
      (existingConflict.updatedAfterConflict ||
        currentPart !== existingConflict.expectedPersistedText),
  );
  const conflict: PartConflict = {
    partId,
    localText: clipped,
    remoteText: currentPart,
    expectedPersistedText: currentPart,
    remoteCleared,
    updatedAfterConflict,
    fromRecoveredTab: false,
  };
  const recoverySaved = writeRecoveryForPart(partId, {
    tabId,
    baseText: editingBase,
    localText: clipped,
    seenRemoteText: currentPart,
    remoteCleared,
  });

  return {
    status: 'conflict',
    partId,
    conflict,
    entries: current,
    recoveryFailed: !recoverySaved,
  };
}

function resolveConflictLocked(
  conflict: PartConflict,
  choice: ConflictResolutionChoice,
  editingBase: string,
  tabId: string,
): ResolveConflictResult {
  const read = readEntries();
  if (read.failed) {
    return { status: 'error', partId: conflict.partId };
  }

  const current = read.entries;
  const currentPart = current[conflict.partId];
  const desiredText = clipPartText(choice === 'local' ? conflict.localText : conflict.remoteText);

  if (currentPart !== conflict.expectedPersistedText && currentPart !== desiredText) {
    const preservedLocalText =
      conflict.fromRecoveredTab && choice === 'remote' ? desiredText : conflict.localText;
    const remoteCleared = isOutlineEmpty(current);
    const refreshedConflict: PartConflict = {
      partId: conflict.partId,
      localText: preservedLocalText,
      remoteText: currentPart,
      expectedPersistedText: currentPart,
      remoteCleared,
      updatedAfterConflict: true,
      fromRecoveredTab: false,
    };
    const recoverySaved = writeRecoveryForPart(conflict.partId, {
      tabId,
      baseText: editingBase,
      localText: preservedLocalText,
      seenRemoteText: currentPart,
      remoteCleared,
    });
    return {
      status: 'conflict',
      partId: conflict.partId,
      conflict: refreshedConflict,
      entries: current,
      recoveryFailed: !recoverySaved,
    };
  }

  const nextEntries: SopOutlineEntries =
    currentPart === desiredText ? current : { ...current, [conflict.partId]: desiredText };
  if (currentPart !== desiredText) {
    const saved = writeEntries(nextEntries);
    if (!saved) {
      return { status: 'error', partId: conflict.partId };
    }
  }

  removeRecoveryForPart(conflict.partId);
  return {
    status: 'resolved',
    partId: conflict.partId,
    entries: nextEntries,
    resolvedText: desiredText,
  };
}

type QueuedOp =
  | {
      kind: 'init';
      resolve: (result: MountReconcileResult) => void;
    }
  | {
      kind: 'edit';
      partId: SopPartId;
      typedText: string;
      epoch: number;
      resolve: (result: PartPatchResult) => void;
    }
  | {
      kind: 'resolve';
      conflict: PartConflict;
      choice: ConflictResolutionChoice;
      epoch: number;
      resolve: (result: ResolveConflictResult) => void;
    }
  | {
      kind: 'record-recovery';
      conflict: PartConflict;
      epoch: number;
      resolve: (result: { recoveryFailed: boolean }) => void;
    }
  | {
      kind: 'clear';
      epoch: number;
      resolve: (result: ClearOutlineResult) => void;
    };

/**
 * Creates a per-tab coordinator that serialises reads, edits, conflict resolutions and clears
 * through a per-tab FIFO queue and the shared Web Lock.
 */
export function createSopStorageSession(): SopStorageSession {
  const tabId = createTabId();
  const lockingAvailable = isWebLocksAvailable();
  let bases: Record<SopPartId, string> = { ...EMPTY_ENTRIES };
  let activeConflicts: Partial<Record<SopPartId, PartConflict>> = {};
  let clearEpoch = 0;
  let disposed = false;
  let draining = false;
  const pendingOps: QueuedOp[] = [];
  let releasePresenceLock: (() => void) | null = null;
  let channel: BroadcastChannel | null = null;

  const ensureChannel = (): BroadcastChannel | null => {
    if (channel || disposed || typeof BroadcastChannel === 'undefined') {
      return channel;
    }
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {
      channel = null;
    }
    return channel;
  };

  const broadcast = (type: 'update' | 'clear'): void => {
    const activeChannel = ensureChannel();
    if (!activeChannel) return;
    try {
      const message: BroadcastPayload = { type, tabId };
      activeChannel.postMessage(message);
    } catch {
      // Ignore broadcast errors on closing channels.
    }
  };

  const acquirePresence = (): void => {
    if (!lockingAvailable || releasePresenceLock || disposed) return;
    navigator.locks
      .request(
        `${TAB_PRESENCE_LOCK_PREFIX}${tabId}`,
        () =>
          new Promise<void>((resolve) => {
            if (disposed) {
              resolve();
              return;
            }
            releasePresenceLock = resolve;
          }),
      )
      .catch(() => {
        // Ignore presence lock errors if browser restricts locks in this environment.
      });
  };

  const runInitOp = async (): Promise<MountReconcileResult> => {
    const initialRecovery = readRecovery();
    if (!lockingAvailable || Object.keys(initialRecovery.conflicts).length === 0) {
      const read = readEntries();
      return {
        persistedEntries: read.entries,
        orphanedConflicts: {},
        failed: read.failed || initialRecovery.failed,
      };
    }

    const locked = await withStorageLock(async () => {
      await awaitLocalStorageFresh();
      const persisted = readEntries();
      const recovery = readRecovery();
      const orphanedConflicts: Partial<Record<SopPartId, PartConflict>> = {};

      if (persisted.failed) {
        return { persistedEntries: persisted.entries, orphanedConflicts, failed: true };
      }

      let recoveryChanged = false;
      const nextRecovery: Partial<Record<SopPartId, StoredConflictItem>> = {
        ...recovery.conflicts,
      };

      for (const partId of SOP_PART_IDS) {
        const item = recovery.conflicts[partId];
        if (!item) continue;

        if (item.tabId === tabId) {
          if (item.localText === persisted.entries[partId]) {
            delete nextRecovery[partId];
            delete activeConflicts[partId];
            recoveryChanged = true;
          }
          continue;
        }

        const alive = await isTabAlive(item.tabId);
        if (alive) continue;

        if (item.localText === persisted.entries[partId]) {
          delete nextRecovery[partId];
          recoveryChanged = true;
          continue;
        }

        const conflict: PartConflict = {
          partId,
          localText: persisted.entries[partId],
          remoteText: item.localText,
          expectedPersistedText: persisted.entries[partId],
          remoteCleared: false,
          updatedAfterConflict: false,
          fromRecoveredTab: true,
        };
        orphanedConflicts[partId] = conflict;
        activeConflicts[partId] = conflict;
      }

      if (recoveryChanged) {
        writeRecovery(nextRecovery);
      }

      return {
        persistedEntries: persisted.entries,
        orphanedConflicts,
        failed: recovery.failed,
      };
    });

    if (!locked.ok) {
      const read = readEntries();
      return { persistedEntries: read.entries, orphanedConflicts: {}, failed: read.failed };
    }
    return locked.value;
  };

  const runEditOp = async (op: Extract<QueuedOp, { kind: 'edit' }>): Promise<PartPatchResult> => {
    if (disposed || op.epoch !== clearEpoch) {
      return { status: 'cancelled', partId: op.partId };
    }
    if (!lockingAvailable) {
      return { status: 'locking-unavailable', partId: op.partId };
    }

    const locked = await withStorageLock(async () => {
      if (disposed || op.epoch !== clearEpoch) {
        return { status: 'cancelled', partId: op.partId } as const;
      }
      await awaitLocalStorageFresh();
      const beforeRaw = safeGetRawOutline();
      const result = patchPartLocked(
        op.partId,
        bases[op.partId],
        op.typedText,
        tabId,
        activeConflicts[op.partId],
      );
      if (result.status === 'saved') {
        bases[op.partId] = result.entries[op.partId];
        delete activeConflicts[op.partId];
        if (beforeRaw.ok) {
          const afterRaw = safeGetRawOutline();
          if (afterRaw.ok) {
            await writeSyncJournal(hashStorageValue(beforeRaw.raw), hashStorageValue(afterRaw.raw));
          }
        }
      } else if (result.status === 'conflict') {
        activeConflicts[op.partId] = result.conflict;
      }
      return result;
    });

    if (!locked.ok) {
      return { status: 'locking-unavailable', partId: op.partId };
    }
    return locked.value;
  };

  const runResolveOp = async (
    op: Extract<QueuedOp, { kind: 'resolve' }>,
  ): Promise<ResolveConflictResult> => {
    if (disposed || op.epoch !== clearEpoch) {
      return { status: 'cancelled', partId: op.conflict.partId };
    }
    if (!lockingAvailable) {
      const desiredText = clipPartText(
        op.choice === 'local' ? op.conflict.localText : op.conflict.remoteText,
      );
      bases[op.conflict.partId] = desiredText;
      delete activeConflicts[op.conflict.partId];
      return {
        status: 'resolved',
        partId: op.conflict.partId,
        entries: { ...bases },
        resolvedText: desiredText,
      };
    }

    const locked = await withStorageLock(async () => {
      if (disposed || op.epoch !== clearEpoch) {
        return { status: 'cancelled', partId: op.conflict.partId } as const;
      }
      await awaitLocalStorageFresh();
      const beforeRaw = safeGetRawOutline();
      const result = resolveConflictLocked(
        op.conflict,
        op.choice,
        bases[op.conflict.partId],
        tabId,
      );
      if (result.status === 'resolved') {
        bases[op.conflict.partId] = result.resolvedText;
        delete activeConflicts[op.conflict.partId];
        if (beforeRaw.ok) {
          const afterRaw = safeGetRawOutline();
          if (afterRaw.ok) {
            await writeSyncJournal(hashStorageValue(beforeRaw.raw), hashStorageValue(afterRaw.raw));
          }
        }
      } else if (result.status === 'conflict') {
        activeConflicts[op.conflict.partId] = result.conflict;
      }
      return result;
    });

    if (!locked.ok) {
      return { status: 'error', partId: op.conflict.partId };
    }
    return locked.value;
  };

  const runRecordRecoveryOp = async (
    op: Extract<QueuedOp, { kind: 'record-recovery' }>,
  ): Promise<{ recoveryFailed: boolean }> => {
    if (disposed || op.epoch !== clearEpoch || !lockingAvailable) {
      return { recoveryFailed: false };
    }

    const locked = await withStorageLock(() => {
      if (disposed || op.epoch !== clearEpoch || !activeConflicts[op.conflict.partId]) {
        return { recoveryFailed: false };
      }
      const saved = writeRecoveryForPart(op.conflict.partId, {
        tabId,
        baseText: bases[op.conflict.partId],
        localText: op.conflict.localText,
        seenRemoteText: op.conflict.remoteText,
        remoteCleared: op.conflict.remoteCleared,
      });
      return { recoveryFailed: !saved };
    });

    return locked.ok ? locked.value : { recoveryFailed: false };
  };

  const performClearUnlocked = (): ClearOutlineResult => {
    const clearedMain = clearEntries();
    const clearedRecovery = clearRecovery();
    bases = { ...EMPTY_ENTRIES };
    activeConflicts = {};
    broadcast('clear');
    return { failed: !clearedMain || !clearedRecovery };
  };

  const runClearOp = async (): Promise<ClearOutlineResult> => {
    if (!lockingAvailable) {
      return performClearUnlocked();
    }
    const locked = await withStorageLock(async () => {
      await awaitLocalStorageFresh();
      const beforeRaw = safeGetRawOutline();
      const result = performClearUnlocked();
      if (!result.failed && beforeRaw.ok) {
        await writeSyncJournal(hashStorageValue(beforeRaw.raw), hashStorageValue(null));
      }
      return result;
    });
    if (!locked.ok) {
      return performClearUnlocked();
    }
    return locked.value;
  };

  const drain = async (): Promise<void> => {
    if (draining) return;
    draining = true;
    try {
      while (pendingOps.length > 0) {
        const next = pendingOps.shift()!;
        switch (next.kind) {
          case 'init':
            next.resolve(await runInitOp());
            break;
          case 'edit':
            next.resolve(await runEditOp(next));
            break;
          case 'resolve':
            next.resolve(await runResolveOp(next));
            break;
          case 'record-recovery':
            next.resolve(await runRecordRecoveryOp(next));
            break;
          case 'clear':
            next.resolve(await runClearOp());
            break;
        }
      }
    } finally {
      draining = false;
      if (pendingOps.length > 0) {
        void drain();
      }
    }
  };

  return {
    tabId,
    lockingAvailable,

    loadSync(): InitialLoadResult {
      const persisted = readEntries();
      const recovery = readRecovery();
      const entries: Record<SopPartId, string> = { ...persisted.entries };
      const nextBases: Record<SopPartId, string> = { ...persisted.entries };
      const conflicts: Partial<Record<SopPartId, PartConflict>> = {};

      for (const partId of SOP_PART_IDS) {
        const item = recovery.conflicts[partId];
        if (!item || item.tabId !== tabId) continue;
        if (item.localText === persisted.entries[partId]) continue;

        entries[partId] = item.localText;
        nextBases[partId] = item.baseText;
        const conflict: PartConflict = {
          partId,
          localText: item.localText,
          remoteText: persisted.entries[partId],
          expectedPersistedText: persisted.entries[partId],
          remoteCleared: isOutlineEmpty(persisted.entries),
          updatedAfterConflict: false,
          fromRecoveredTab: false,
        };
        conflicts[partId] = conflict;
      }

      bases = nextBases;
      activeConflicts = { ...conflicts };

      return {
        entries,
        conflicts,
        failed: persisted.failed || recovery.failed,
        lockingAvailable,
      };
    },

    init(): Promise<MountReconcileResult> {
      acquirePresence();
      return new Promise<MountReconcileResult>((resolve) => {
        pendingOps.push({ kind: 'init', resolve });
        void drain();
      });
    },

    editPart(partId: SopPartId, typedText: string): Promise<PartPatchResult> {
      if (!lockingAvailable) {
        return Promise.resolve({ status: 'locking-unavailable', partId });
      }
      const clipped = clipPartText(typedText);
      const epoch = clearEpoch;

      return new Promise<PartPatchResult>((resolve) => {
        // Coalesce pending unstarted edits for the same section after the last clear or resolution
        // so rapid typing preserves final order without piling up redundant lock acquisitions.
        for (let i = pendingOps.length - 1; i >= 0; i -= 1) {
          const op = pendingOps[i];
          if (op.kind === 'clear') break;
          if (op.kind === 'resolve' && op.conflict.partId === partId) break;
          if (op.kind === 'edit' && op.partId === partId && op.epoch === epoch) {
            op.resolve({ status: 'cancelled', partId });
            op.typedText = clipped;
            op.resolve = resolve;
            void drain();
            return;
          }
        }

        pendingOps.push({ kind: 'edit', partId, typedText: clipped, epoch, resolve });
        void drain();
      });
    },

    resolveConflict(
      conflict: PartConflict,
      choice: ConflictResolutionChoice,
    ): Promise<ResolveConflictResult> {
      const epoch = clearEpoch;
      return new Promise<ResolveConflictResult>((resolve) => {
        // Cancel any superseded unstarted edits for this same section before applying the choice.
        for (let i = pendingOps.length - 1; i >= 0; i -= 1) {
          const op = pendingOps[i];
          if (op.kind === 'clear') break;
          if (op.kind === 'edit' && op.partId === conflict.partId && op.epoch === epoch) {
            op.resolve({ status: 'cancelled', partId: conflict.partId });
            pendingOps.splice(i, 1);
          }
        }
        pendingOps.push({ kind: 'resolve', conflict, choice, epoch, resolve });
        void drain();
      });
    },

    clear(): Promise<ClearOutlineResult> {
      clearEpoch += 1;
      const epoch = clearEpoch;

      // Cancel every queued pre-clear write, resolution or recovery save before queuing the clear.
      for (let i = pendingOps.length - 1; i >= 0; i -= 1) {
        const op = pendingOps[i];
        if (op.kind === 'edit') {
          op.resolve({ status: 'cancelled', partId: op.partId });
          pendingOps.splice(i, 1);
        } else if (op.kind === 'resolve') {
          op.resolve({ status: 'cancelled', partId: op.conflict.partId });
          pendingOps.splice(i, 1);
        } else if (op.kind === 'record-recovery') {
          op.resolve({ recoveryFailed: false });
          pendingOps.splice(i, 1);
        }
      }

      return new Promise<ClearOutlineResult>((resolve) => {
        pendingOps.push({ kind: 'clear', epoch, resolve });
        void drain();
      });
    },

    getBase(partId: SopPartId): string {
      return bases[partId];
    },

    acceptRemoteValue(partId: SopPartId, value: string): void {
      bases[partId] = value;
      delete activeConflicts[partId];
    },

    recordRemoteConflict(
      conflict: PartConflict,
      persistRecovery = true,
    ): Promise<{ recoveryFailed: boolean }> {
      activeConflicts[conflict.partId] = conflict;
      if (!persistRecovery || !lockingAvailable) {
        return Promise.resolve({ recoveryFailed: false });
      }
      const epoch = clearEpoch;
      return new Promise<{ recoveryFailed: boolean }>((resolve) => {
        for (let i = pendingOps.length - 1; i >= 0; i -= 1) {
          const op = pendingOps[i];
          if (op.kind === 'clear') break;
          if (
            op.kind === 'record-recovery' &&
            op.conflict.partId === conflict.partId &&
            op.epoch === epoch
          ) {
            op.resolve({ recoveryFailed: false });
            op.conflict = conflict;
            op.resolve = resolve;
            void drain();
            return;
          }
        }
        pendingOps.push({ kind: 'record-recovery', conflict, epoch, resolve });
        void drain();
      });
    },

    subscribe(onRemoteUpdate: (update: RemoteStorageUpdate) => void): () => void {
      const emitLatest = (hintClear: boolean) => {
        const read = readEntries();
        const kind = hintClear && !read.failed && isOutlineEmpty(read.entries) ? 'clear' : 'entries';
        onRemoteUpdate({ kind, entries: read.entries, failed: read.failed });
      };

      const handleStorage = (event: StorageEvent) => {
        if (event.storageArea !== window.localStorage) return;
        if (event.key !== STORAGE_KEY && event.key !== null) return;
        emitLatest(event.newValue === null);
      };

      const handleMessage = (event: MessageEvent) => {
        if (!isBroadcastPayload(event.data) || event.data.tabId === tabId) return;
        emitLatest(event.data.type === 'clear');
      };

      window.addEventListener('storage', handleStorage);
      const activeChannel = ensureChannel();
      activeChannel?.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('storage', handleStorage);
        activeChannel?.removeEventListener('message', handleMessage);
      };
    },

    dispose(): void {
      disposed = true;
      if (releasePresenceLock) {
        releasePresenceLock();
        releasePresenceLock = null;
      }
      if (channel) {
        channel.close();
        channel = null;
      }
    },
  };
}
