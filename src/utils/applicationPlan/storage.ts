import {
  APPLICATION_ROUTES,
  DOCUMENT_STATUSES,
  type ApplicationPlanState,
  type PlanDateEntry,
  type PlanDocumentItem,
  type PlannedProgramme,
} from './types.ts';
import { isValidIsoDate, isValidProgrammeUrl } from './validation.ts';

export const STORAGE_KEY = 'germandians:application-plan';
export const PLAN_INPUT_LENGTHS = { name: 300, university: 300, url: 2000, dateLabel: 200, document: 240 } as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;

const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === 'string' && (options as readonly string[]).includes(value);

function isEntryList<T extends { id: string }>(
  value: unknown,
  validEntry: (entry: unknown) => entry is T,
): value is T[] {
  return Array.isArray(value) && value.every(validEntry) &&
    new Set(value.map(({ id }) => id)).size === value.length;
}

function isValidDateEntry(value: unknown): value is PlanDateEntry {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id, 120) &&
    typeof value.date === 'string' &&
    value.date === value.date.trim() &&
    isValidIsoDate(value.date) &&
    isNonEmptyString(value.label, PLAN_INPUT_LENGTHS.dateLabel)
  );
}

function isValidDocumentItem(value: unknown): value is PlanDocumentItem {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id, 120) &&
    isNonEmptyString(value.label, PLAN_INPUT_LENGTHS.document) &&
    isOneOf(value.status, DOCUMENT_STATUSES)
  );
}

function isValidProgramme(value: unknown): value is PlannedProgramme {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id, 120) &&
    isNonEmptyString(value.name, PLAN_INPUT_LENGTHS.name) &&
    isNonEmptyString(value.university, PLAN_INPUT_LENGTHS.university) &&
    typeof value.url === 'string' &&
    value.url.length <= PLAN_INPUT_LENGTHS.url &&
    isValidProgrammeUrl(value.url) &&
    isOneOf(value.route, APPLICATION_ROUTES) &&
    isEntryList(value.dates, isValidDateEntry) &&
    isEntryList(value.documents, isValidDocumentItem)
  );
}

export function isValidPlanState(value: unknown): value is ApplicationPlanState {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isEntryList(value.programmes, isValidProgramme)
  );
}

export interface ReadPlanResult {
  programmes: PlannedProgramme[];
  discarded: boolean;
  failed: boolean;
}

/** Reads and validates the saved application plan from localStorage. Call only after mount. */
export function readPlan(): ReadPlanResult {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { programmes: [], discarded: false, failed: false };
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    if (!isValidPlanState(parsed)) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        return { programmes: [], discarded: true, failed: true };
      }
      return { programmes: [], discarded: true, failed: false };
    }
    return { programmes: parsed.programmes, discarded: false, failed: false };
  } catch {
    return { programmes: [], discarded: false, failed: true };
  }
}

/** Writes the application plan to localStorage. Returns false when storage throws. */
export function writePlan(programmes: readonly PlannedProgramme[]): boolean {
  try {
    const payload: ApplicationPlanState = { version: 1, programmes: [...programmes] };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/** Removes the saved application plan from localStorage. */
export function clearPlan(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
