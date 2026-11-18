import { SOP_PART_IDS, type SopOutlineEntries, type SopPartId } from './types.ts';

/**
 * Browser-only storage for the five-part SOP outline. Every read, write and removal is wrapped in
 * try/catch because storage may be blocked, full or unavailable.
 */

export const STORAGE_KEY = 'germandians:sop-planner';
export const MAX_PART_LENGTH = 20_000;

export interface StoredSopOutline {
  readonly version: 1;
  readonly entries: SopOutlineEntries;
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

export function isOutlineEmpty(entries: SopOutlineEntries): boolean {
  return SOP_PART_IDS.every((id) => entries[id].length === 0);
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
