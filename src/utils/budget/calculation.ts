import {
  BLOCKED_ACCOUNT_REFERENCE,
  MONTHLY_FIELD_IDS,
  OFFICIAL_FEES,
  ONE_OFF_FIELD_IDS,
  type BudgetState,
  type MonthlyFieldId,
  type OneOffFieldId,
} from './types';

export const MAX_MONTHS = 60;
export const MAX_AMOUNT_EUR = 1_000_000;
export const MAX_EXTRA_COURSES = 30;
export const MAX_EXCHANGE_RATE = 10_000;

const AMOUNT_PATTERN = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;
const RATE_PATTERN = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,4})?$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

interface ParsedField<Value> {
  status: 'empty' | 'valid' | 'invalid';
  value: Value;
}

export function parseMonthsInput(raw: string): ParsedField<number | null> {
  const trimmed = raw.trim();
  if (!trimmed) return { status: 'empty', value: null };
  if (!WHOLE_NUMBER_PATTERN.test(trimmed)) return { status: 'invalid', value: null };
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_MONTHS) {
    return { status: 'invalid', value: null };
  }
  return { status: 'valid', value: parsed };
}

export function parseAmountInput(raw: string): ParsedField<number> {
  const trimmed = raw.trim();
  if (!trimmed) return { status: 'empty', value: 0 };
  if (!AMOUNT_PATTERN.test(trimmed)) return { status: 'invalid', value: 0 };
  const parsed = Number(trimmed.replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_AMOUNT_EUR) {
    return { status: 'invalid', value: 0 };
  }
  return { status: 'valid', value: parsed };
}

export function parseExtraCoursesInput(raw: string): ParsedField<number> {
  const trimmed = raw.trim();
  if (!trimmed) return { status: 'empty', value: 0 };
  if (!WHOLE_NUMBER_PATTERN.test(trimmed)) return { status: 'invalid', value: 0 };
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > MAX_EXTRA_COURSES) {
    return { status: 'invalid', value: 0 };
  }
  return { status: 'valid', value: parsed };
}

export function parseExchangeRateInput(raw: string): ParsedField<number | null> {
  const trimmed = raw.trim();
  if (!trimmed) return { status: 'empty', value: null };
  if (!RATE_PATTERN.test(trimmed)) return { status: 'invalid', value: null };
  const parsed = Number(trimmed.replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_EXCHANGE_RATE) {
    return { status: 'invalid', value: null };
  }
  return { status: 'valid', value: parsed };
}

export function formatEur(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) {
    return `€${rounded.toLocaleString('en-GB')}`;
  }
  return `€${rounded.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInr(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

export interface BudgetValidation {
  months: boolean;
  monthly: Record<MonthlyFieldId, boolean>;
  oneOff: Record<OneOffFieldId, boolean>;
  customAmounts: Record<string, boolean>;
  extraUniAssistCourses: boolean;
  exchangeRate: boolean;
  hasAnyInvalid: boolean;
}

export interface BudgetCalculation {
  invalid: BudgetValidation;
  months: number | null;
  exchangeRate: number | null;
  hasMonthlyEntry: boolean;
  hasOneOffEntry: boolean;
  monthlyItemsEur: Record<MonthlyFieldId, number>;
  monthlyTotalEur: number;
  monthlyTotalInr: number | null;
  livingPeriodEur: number | null;
  livingPeriodInr: number | null;
  visitorOneOffItemsEur: Record<OneOffFieldId, number>;
  customOneOffTotalEur: number;
  visitorOneOffTotalEur: number;
  extraUniAssistCount: number;
  officialOneOffEur: number;
  officialOneOffInr: number;
  oneOffEurBeforeInrFee: number;
  oneOffTotalEur: number;
  oneOffTotalInr: number | null;
  unconvertedInrFee: number;
  periodTotalEur: number | null;
  periodTotalInr: number | null;
  blockedAccount: {
    monthlyEur: number;
    months: number;
    annualEur: number;
    monthlyInr: number | null;
    annualInr: number | null;
  };
}

export function calculateBudget(state: BudgetState): BudgetCalculation {
  const monthsParsed = parseMonthsInput(state.months);
  const rateParsed = parseExchangeRateInput(state.exchangeRate);
  const extraCoursesParsed = state.officialFees.uniAssist
    ? parseExtraCoursesInput(state.extraUniAssistCourses)
    : { status: 'empty' as const, value: 0 };

  const monthlyInvalid = {} as Record<MonthlyFieldId, boolean>;
  const monthlyItemsEur = {} as Record<MonthlyFieldId, number>;
  let hasMonthlyEntry = false;
  let monthlyTotalEur = 0;

  for (const id of MONTHLY_FIELD_IDS) {
    const parsed = parseAmountInput(state.monthly[id]);
    monthlyInvalid[id] = parsed.status === 'invalid';
    monthlyItemsEur[id] = parsed.value;
    if (parsed.status === 'valid') hasMonthlyEntry = true;
    monthlyTotalEur += parsed.value;
  }

  const oneOffInvalid = {} as Record<OneOffFieldId, boolean>;
  const visitorOneOffItemsEur = {} as Record<OneOffFieldId, number>;
  let hasOneOffEntry = false;
  let visitorOneOffTotalEur = 0;

  for (const id of ONE_OFF_FIELD_IDS) {
    const parsed = parseAmountInput(state.oneOff[id]);
    oneOffInvalid[id] = parsed.status === 'invalid';
    visitorOneOffItemsEur[id] = parsed.value;
    if (parsed.status === 'valid') hasOneOffEntry = true;
    visitorOneOffTotalEur += parsed.value;
  }

  const customAmountsInvalid: Record<string, boolean> = {};
  let customOneOffTotalEur = 0;
  for (const item of state.customOneOffs) {
    const parsed = parseAmountInput(item.amount);
    customAmountsInvalid[item.id] = parsed.status === 'invalid';
    if (parsed.status === 'valid') hasOneOffEntry = true;
    customOneOffTotalEur += parsed.value;
  }
  visitorOneOffTotalEur += customOneOffTotalEur;

  let officialOneOffEur = 0;
  let officialOneOffInr = 0;
  for (const fee of OFFICIAL_FEES) {
    if (!state.officialFees[fee.id]) continue;
    hasOneOffEntry = true;
    if (fee.currency === 'INR') {
      officialOneOffInr += fee.amount;
    } else if (fee.id === 'uniAssist') {
      officialOneOffEur += fee.amount + extraCoursesParsed.value * (fee.additionalCourseEur ?? 0);
    } else {
      officialOneOffEur += fee.amount;
    }
  }

  const months = monthsParsed.value;
  const exchangeRate = rateParsed.value;

  const monthlyTotalInr = exchangeRate !== null ? monthlyTotalEur * exchangeRate : null;
  const livingPeriodEur = months !== null ? monthlyTotalEur * months : null;
  const livingPeriodInr =
    livingPeriodEur !== null && exchangeRate !== null ? livingPeriodEur * exchangeRate : null;

  const oneOffEurBeforeInrFee = visitorOneOffTotalEur + officialOneOffEur;
  const oneOffTotalEur =
    exchangeRate !== null
      ? oneOffEurBeforeInrFee + officialOneOffInr / exchangeRate
      : oneOffEurBeforeInrFee;
  const oneOffTotalInr =
    exchangeRate !== null ? oneOffEurBeforeInrFee * exchangeRate + officialOneOffInr : null;
  const unconvertedInrFee = exchangeRate === null ? officialOneOffInr : 0;

  const periodTotalEur = livingPeriodEur !== null ? livingPeriodEur + oneOffTotalEur : null;
  const periodTotalInr =
    livingPeriodEur !== null && exchangeRate !== null
      ? (livingPeriodEur + oneOffEurBeforeInrFee) * exchangeRate + officialOneOffInr
      : null;

  const hasAnyInvalid =
    monthsParsed.status === 'invalid' ||
    rateParsed.status === 'invalid' ||
    extraCoursesParsed.status === 'invalid' ||
    Object.values(monthlyInvalid).some(Boolean) ||
    Object.values(oneOffInvalid).some(Boolean) ||
    Object.values(customAmountsInvalid).some(Boolean);

  return {
    invalid: {
      months: monthsParsed.status === 'invalid',
      monthly: monthlyInvalid,
      oneOff: oneOffInvalid,
      customAmounts: customAmountsInvalid,
      extraUniAssistCourses: extraCoursesParsed.status === 'invalid',
      exchangeRate: rateParsed.status === 'invalid',
      hasAnyInvalid,
    },
    months,
    exchangeRate,
    hasMonthlyEntry,
    hasOneOffEntry,
    monthlyItemsEur,
    monthlyTotalEur,
    monthlyTotalInr,
    livingPeriodEur,
    livingPeriodInr,
    visitorOneOffItemsEur,
    customOneOffTotalEur,
    visitorOneOffTotalEur,
    extraUniAssistCount: extraCoursesParsed.value,
    officialOneOffEur,
    officialOneOffInr,
    oneOffEurBeforeInrFee,
    oneOffTotalEur,
    oneOffTotalInr,
    unconvertedInrFee,
    periodTotalEur,
    periodTotalInr,
    blockedAccount: {
      monthlyEur: BLOCKED_ACCOUNT_REFERENCE.monthlyEur,
      months: BLOCKED_ACCOUNT_REFERENCE.months,
      annualEur: BLOCKED_ACCOUNT_REFERENCE.annualEur,
      monthlyInr:
        exchangeRate !== null ? BLOCKED_ACCOUNT_REFERENCE.monthlyEur * exchangeRate : null,
      annualInr:
        exchangeRate !== null ? BLOCKED_ACCOUNT_REFERENCE.annualEur * exchangeRate : null,
    },
  };
}
