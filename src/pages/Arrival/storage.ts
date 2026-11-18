/**
 * Browser storage for the arrival checklist (`germandians:arrival`).
 * Read only after mount; every storage access is wrapped in try/catch and
 * invalid shapes are discarded so a blocked or corrupted store never breaks the page.
 */

export const STORAGE_KEY = 'germandians:arrival';

export const ARRIVAL_ITEM_IDS = [
  'moving-in',
  'city-registration',
  'tax-id',
  'health-insurance-enrolment',
  'bank-accounts',
  'campus-setup',
  'broadcasting-fee',
  'residence-permit',
  'student-work-rules',
] as const;

export type ArrivalItemId = (typeof ARRIVAL_ITEM_IDS)[number];

interface StoredArrival {
  version: 1;
  ticked: ArrivalItemId[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isArrivalItemId = (value: unknown): value is ArrivalItemId =>
  typeof value === 'string' && (ARRIVAL_ITEM_IDS as readonly string[]).includes(value);

export function validStoredArrival(value: unknown): value is StoredArrival {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.ticked)) {
    return false;
  }
  if (!value.ticked.every(isArrivalItemId)) {
    return false;
  }
  return new Set(value.ticked).size === value.ticked.length;
}

export function orderTickedItems(ids: Iterable<ArrivalItemId>): ArrivalItemId[] {
  const active = new Set(ids);
  return ARRIVAL_ITEM_IDS.filter((id) => active.has(id));
}

export function readArrivalProgress(): { ticked: ArrivalItemId[]; failed: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return { ticked: [], failed: false };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    if (!validStoredArrival(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { ticked: [], failed: false };
    }
    return { ticked: orderTickedItems(parsed.ticked), failed: false };
  } catch {
    return { ticked: [], failed: true };
  }
}

export function writeArrivalProgress(ticked: readonly ArrivalItemId[]): boolean {
  const ordered = orderTickedItems(ticked);
  try {
    if (ordered.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      const payload: StoredArrival = { version: 1, ticked: ordered };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    return true;
  } catch {
    return false;
  }
}

export function clearArrivalProgress(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
