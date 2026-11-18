import { DMAT, EXTERNAL_COSTS, type ExternalCost, type OfficialSource } from '@/utils/applicationFacts';

/**
 * Input limits. The budget page sets them as `maxLength`, and stored data is validated against the
 * same numbers, so whatever a visitor can type is kept and oversized stored data is discarded.
 */
export const MAX_FIELD_LENGTH = 30;
export const MAX_LABEL_LENGTH = 120;
export const MAX_CUSTOM_ITEMS = 30;

export const PERIOD_PRESETS = ['6', '12', '24'] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

export const MONTHLY_FIELD_IDS = ['rent', 'healthInsurance', 'otherMonthly'] as const;
export type MonthlyFieldId = (typeof MONTHLY_FIELD_IDS)[number];

export const ONE_OFF_FIELD_IDS = ['semesterContribution', 'tuition', 'deposit', 'flight'] as const;
export type OneOffFieldId = (typeof ONE_OFF_FIELD_IDS)[number];

export const OFFICIAL_FEE_IDS = ['aps', 'dmat', 'uniAssist', 'visa'] as const;
export type OfficialFeeId = (typeof OFFICIAL_FEE_IDS)[number];

export interface CustomOneOffItem {
  id: string;
  label: string;
  amount: string;
}

export interface BudgetState {
  version: 1;
  months: string;
  monthly: Record<MonthlyFieldId, string>;
  oneOff: Record<OneOffFieldId, string>;
  customOneOffs: CustomOneOffItem[];
  officialFees: Record<OfficialFeeId, boolean>;
  extraUniAssistCourses: string;
  exchangeRate: string;
}

export function createEmptyBudgetState(): BudgetState {
  return {
    version: 1,
    months: '',
    monthly: {
      rent: '',
      healthInsurance: '',
      otherMonthly: '',
    },
    oneOff: {
      semesterContribution: '',
      tuition: '',
      deposit: '',
      flight: '',
    },
    customOneOffs: [],
    officialFees: {
      aps: false,
      dmat: false,
      uniAssist: false,
      visa: false,
    },
    extraUniAssistCourses: '',
    exchangeRate: '',
  };
}

export function isBudgetEmpty(state: BudgetState): boolean {
  if (state.months.trim() !== '' || state.exchangeRate.trim() !== '' || state.extraUniAssistCourses.trim() !== '') {
    return false;
  }
  if (MONTHLY_FIELD_IDS.some((id) => state.monthly[id].trim() !== '')) return false;
  if (ONE_OFF_FIELD_IDS.some((id) => state.oneOff[id].trim() !== '')) return false;
  if (state.customOneOffs.length > 0) return false;
  if (OFFICIAL_FEE_IDS.some((id) => state.officialFees[id])) return false;
  return true;
}

function findExternalCost(groupName: string, itemLabel: string): ExternalCost {
  const group = EXTERNAL_COSTS.find((entry) => entry.group === groupName);
  const item = group?.items.find((entry) => entry.label === itemLabel);
  if (!item) {
    throw new Error(`Missing official cost entry: ${groupName} / ${itemLabel}`);
  }
  return item;
}

function parseFirstAmount(text: string | undefined, symbol: '€' | '₹'): number {
  const match = text?.match(new RegExp(`${symbol}([\\d,]+)`));
  if (!match) {
    throw new Error(`Expected ${symbol} amount in "${text ?? ''}"`);
  }
  return Number(match[1].replace(/,/g, ''));
}

function parseUniAssistAmounts(text: string | undefined): { first: number; additional: number } {
  const match = text?.match(/€([\d,]+)\s*\/\s*€([\d,]+)/);
  if (!match) {
    throw new Error(`Expected uni-assist first / additional amounts in "${text ?? ''}"`);
  }
  return {
    first: Number(match[1].replace(/,/g, '')),
    additional: Number(match[2].replace(/,/g, '')),
  };
}

function parseBlockedAccountReference(item: ExternalCost): {
  monthlyEur: number;
  months: number;
  annualEur: number;
  amountLabel: string;
  detail: string;
  source: OfficialSource;
} {
  const monthlyEur = parseFirstAmount(item.amount, '€');
  const monthsMatch = item.detail.match(/(\d+)\s+months/);
  if (!monthsMatch || !item.source || !item.amount) {
    throw new Error('Blocked-account entry in EXTERNAL_COSTS is incomplete');
  }
  const months = Number(monthsMatch[1]);
  return {
    monthlyEur,
    months,
    annualEur: monthlyEur * months,
    amountLabel: item.amount,
    detail: item.detail,
    source: item.source,
  };
}

export interface OfficialFeeDefinition {
  id: OfficialFeeId;
  label: string;
  amountLabel: string;
  currency: 'EUR' | 'INR';
  amount: number;
  additionalCourseEur?: number;
  detail: string;
  source: OfficialSource;
}

const apsItem = findExternalCost('Provider charges', 'APS');
const dmatItem = findExternalCost('Provider charges', 'dMAT, where required');
const uniAssistItem = findExternalCost('Provider charges', 'uni-assist');
const visaItem = findExternalCost('Provider charges', 'National visa');
const uniAssistRates = parseUniAssistAmounts(uniAssistItem.amount);

/**
 * Official application and visa fees read directly from `EXTERNAL_COSTS` and `DMAT` in
 * `applicationFacts.ts`, so no figure is retyped in the budget tool.
 */
export const OFFICIAL_FEES: readonly OfficialFeeDefinition[] = [
  {
    id: 'aps',
    label: apsItem.label,
    amountLabel: apsItem.amount!,
    currency: 'INR',
    amount: parseFirstAmount(apsItem.amount, '₹'),
    detail: apsItem.detail,
    source: apsItem.source!,
  },
  {
    id: 'dmat',
    label: dmatItem.label,
    amountLabel: DMAT.fee,
    currency: 'EUR',
    amount: parseFirstAmount(DMAT.fee, '€'),
    detail: dmatItem.detail,
    source: dmatItem.source!,
  },
  {
    id: 'uniAssist',
    label: uniAssistItem.label,
    amountLabel: uniAssistItem.amount!,
    currency: 'EUR',
    amount: uniAssistRates.first,
    additionalCourseEur: uniAssistRates.additional,
    detail: uniAssistItem.detail,
    source: uniAssistItem.source!,
  },
  {
    id: 'visa',
    label: visaItem.label,
    amountLabel: visaItem.amount!,
    currency: 'EUR',
    amount: parseFirstAmount(visaItem.amount, '€'),
    detail: visaItem.detail,
    source: visaItem.source!,
  },
] as const;

export const BLOCKED_ACCOUNT_REFERENCE = parseBlockedAccountReference(
  findExternalCost('Blocked-account deposit', 'Your own living money'),
);

export const SEMESTER_CONTRIBUTION_REFERENCE = findExternalCost(
  'Semester contributions',
  'Contribution per semester',
);

export const TUITION_PUBLIC_PRIVATE_REFERENCE = findExternalCost(
  'Tuition',
  'Public and private programmes',
);

export const TUITION_TUM_EXAMPLE = findExternalCost('Tuition', 'TUM example');

export const PROVIDER_PRICES_NOTE = findExternalCost(
  'Provider charges',
  'IELTS, health insurance and flights',
);
