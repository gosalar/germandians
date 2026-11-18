import {
  MAX_CUSTOM_ITEMS,
  MAX_FIELD_LENGTH,
  MAX_LABEL_LENGTH,
  MONTHLY_FIELD_IDS,
  OFFICIAL_FEE_IDS,
  ONE_OFF_FIELD_IDS,
  isBudgetEmpty,
  type BudgetState,
  type CustomOneOffItem,
  type MonthlyFieldId,
  type OfficialFeeId,
  type OneOffFieldId,
} from './types';

/**
 * Browser storage for the budget planner (`germandians:budget`).
 * Read only after mount, with every read, write and removal wrapped in try/catch.
 * Invalid stored shapes are discarded immediately. Nothing stored leaves the browser.
 */
export const STORAGE_KEY = 'germandians:budget';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const MAX_ID_LENGTH = 60;

const isShortString = (value: unknown, max = MAX_FIELD_LENGTH): value is string =>
  typeof value === 'string' && value.length <= max;

function validCustomItem(value: unknown): value is CustomOneOffItem {
  return (
    isRecord(value) &&
    isShortString(value.id, MAX_ID_LENGTH) &&
    value.id.trim().length > 0 &&
    isShortString(value.label, MAX_LABEL_LENGTH) &&
    isShortString(value.amount)
  );
}

export function validBudgetState(value: unknown): value is BudgetState {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isShortString(value.months) ||
    !isShortString(value.extraUniAssistCourses) ||
    !isShortString(value.exchangeRate) ||
    !isRecord(value.monthly) ||
    !isRecord(value.oneOff) ||
    !isRecord(value.officialFees) ||
    !Array.isArray(value.customOneOffs) ||
    value.customOneOffs.length > MAX_CUSTOM_ITEMS
  ) {
    return false;
  }

  for (const id of MONTHLY_FIELD_IDS) {
    if (!isShortString(value.monthly[id])) return false;
  }
  for (const id of ONE_OFF_FIELD_IDS) {
    if (!isShortString(value.oneOff[id])) return false;
  }
  for (const id of OFFICIAL_FEE_IDS) {
    if (typeof value.officialFees[id] !== 'boolean') return false;
  }

  const seenIds = new Set<string>();
  for (const item of value.customOneOffs) {
    if (!validCustomItem(item) || seenIds.has(item.id)) return false;
    seenIds.add(item.id);
  }

  return true;
}

function normaliseBudgetState(state: BudgetState): BudgetState {
  const monthly = {} as Record<MonthlyFieldId, string>;
  for (const id of MONTHLY_FIELD_IDS) monthly[id] = state.monthly[id];

  const oneOff = {} as Record<OneOffFieldId, string>;
  for (const id of ONE_OFF_FIELD_IDS) oneOff[id] = state.oneOff[id];

  const officialFees = {} as Record<OfficialFeeId, boolean>;
  for (const id of OFFICIAL_FEE_IDS) officialFees[id] = state.officialFees[id];

  return {
    version: 1,
    months: state.months,
    monthly,
    oneOff,
    customOneOffs: state.customOneOffs.map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
    })),
    officialFees,
    extraUniAssistCourses: state.extraUniAssistCourses,
    exchangeRate: state.exchangeRate,
  };
}

export function readBudget(): { state: BudgetState | null; failed: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { state: null, failed: false };
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    if (!validBudgetState(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { state: null, failed: false };
    }
    return { state: normaliseBudgetState(parsed), failed: false };
  } catch {
    return { state: null, failed: true };
  }
}

export function writeBudget(state: BudgetState): boolean {
  try {
    if (isBudgetEmpty(state)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normaliseBudgetState(state)));
    return true;
  } catch {
    return false;
  }
}

export function clearBudget(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
