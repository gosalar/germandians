import { SOURCES } from '@/utils/applicationFacts';
import { FEE_PROMISE, NAV_CTA, NO_LOGIN_NEEDED } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';
import type { MonthlyFieldId, OneOffFieldId, PeriodPreset } from '@/utils/budget';

export const BUDGET_PERIOD_PRESETS: readonly { value: PeriodPreset; label: string }[] = [
  { value: '6', label: '6 months (1 semester)' },
  { value: '12', label: '12 months (1 year)' },
  { value: '24', label: '24 months (4 semesters)' },
] as const;

export const MONTHLY_FIELD_COPY: Record<
  MonthlyFieldId,
  { label: string; description?: string }
> = {
  rent: {
    label: 'Monthly rent and utilities (€)',
  },
  healthInsurance: {
    label: 'Monthly health insurance (€)',
  },
  otherMonthly: {
    label: 'Other monthly living costs (€)',
    description: 'Food, phone, study materials and everyday expenses.',
  },
};

export const ONE_OFF_FIELD_COPY: Record<OneOffFieldId, { label: string }> = {
  semesterContribution: {
    label: 'Semester contributions for the period (€)',
  },
  tuition: {
    label: 'Programme tuition for the period, if any (€)',
  },
  deposit: {
    label: 'Housing deposit and initial setup (€)',
  },
  flight: {
    label: 'Flights and travel (€)',
  },
};

export const BUDGET_COPY = {
  title: 'Study budget planner',
  lede: 'Add up your own monthly living costs and one-off expenses in euros, then enter an exchange rate of your choice to see the totals in rupees. Every figure starts blank so the plan reflects your own numbers.',
  badges: [NO_LOGIN_NEEDED, 'Saved in your browser', 'Print-ready worksheet'],
  germanTitle: { de: 'Kostenplan', en: 'personal cost worksheet' },
  storageNotice:
    'Entries stay in this browser on your device so they survive a reload. Nothing you type here is sent anywhere.',
  storageBlocked:
    'Browser storage is unavailable right now. Your latest changes may not be saved.',
  clearedStatus: 'All budget entries cleared.',
  clearFailedStatus: 'The entries were cleared on screen, but saved budget entries could not be removed from this browser.',
  clearButton: 'Clear my entries',
  clearConfirmQuestion: 'Clear all entries?',
  clearConfirmYes: 'Yes, clear',
  clearConfirmCancel: 'Cancel',
  printButton: 'Print budget',

  periodSectionTitle: 'Planning period and exchange rate',
  presetsLabel: 'Planning period presets',
  monthsLabel: 'Number of months',
  monthsHint: 'Enter between 1 and 60 whole months, or choose a preset above.',
  monthsError: 'Enter a whole number of months from 1 to 60.',
  exchangeRateLabel: 'Exchange rate to plan with (₹ per €1)',
  exchangeRateHint:
    'Type the rupee rate you want to budget with. This page never fetches a live rate or assumes one.',
  exchangeRateError: 'Enter a number greater than 0 and up to 10,000 for ₹ per €1.',

  monthlySectionTitle: 'Your monthly living costs (€)',
  monthlySectionLead:
    'Enter your own figures from room listings, insurance quotes and personal spending. Living costs vary by city and lifestyle, so no default amounts are filled in.',
  healthInsuranceFacts: [
    {
      text: 'For the student visa, the German Missions’ checklist for studies asks for a certificate of health insurance valid from your intended date of arrival.',
      source: SOURCES.visaChecklist,
    },
    {
      text: 'When you enrol, your university asks for proof of health insurance. The DAAD explains statutory and private health insurance in Germany.',
      source: SOURCES.daadHealthInsurance,
    },
  ],
  amountError: 'Enter a non-negative amount up to 1,000,000 (up to two decimal places).',

  oneOffSectionTitle: 'Your one-off costs (€)',
  oneOffSectionLead:
    'Enter total one-off amounts for your chosen period, such as the semester contribution from your offer letter, any programme tuition, a housing deposit and travel.',
  customItemsTitle: 'Additional one-off items',
  addCustomButton: 'Add another one-off cost',
  customLimitNote: (max: number) =>
    `You can add up to ${max} extra items. Remove one to add another.`,
  customLabelField: (index: number) => `Item ${index} description`,
  customAmountField: (index: number) => `Item ${index} amount (€)`,
  removeCustomLabel: (index: number, label: string) =>
    label.trim() ? `Remove ${label.trim()}` : `Remove item ${index}`,
  removeShort: 'Remove',

  officialSectionTitle: 'Official application and visa fees',
  officialSectionLead:
    'Select any fixed fee below that applies to your application. Amounts and notes come from the official pages linked under each item.',
  includeFee: 'Include',
  includedFee: 'Included',
  toggleFeeAria: (label: string, amount: string) => `Include ${label} (${amount}) in one-off costs`,
  extraUniAssistLabel: 'Additional uni-assist courses in the same semester',
  extraUniAssistError: 'Enter a whole number of additional courses from 0 to 30.',

  referenceHeading: 'Official notes on university charges',

  mobileMonthlyLabel: 'Monthly living',
  mobilePeriodLabel: 'Period total',

  summaryKicker: 'Budget summary',
  summaryHeadingWithPeriod: (months: number) =>
    months === 1 ? 'Your 1-month budget' : `Your ${months}-month budget`,
  summaryHeadingWithoutPeriod: 'Enter your planning months to complete the period total',
  validationWarning:
    'Check the highlighted fields. Invalid entries are left out of the totals until corrected.',
  emptyValue: '—',
  monthlyCardLabel: 'Monthly living total',
  periodCardLabel: (months: number | null) =>
    months === null
      ? 'Total for chosen period'
      : months === 1
        ? 'Total for 1 month'
        : `Total for ${months} months`,
  ratePrompt: 'Enter your ₹ per €1 rate to see rupees',
  monthsPrompt: 'Enter the number of months to calculate the period total',
  plusInrFee: (inrFormatted: string) =>
    `+ ${inrFormatted} in rupee fees (enter an exchange rate to combine)`,
  roundingNote: (rate: number) =>
    `Converted at your typed rate of ₹${rate.toLocaleString('en-IN')} per €1. Rupee figures are rounded to the nearest rupee.`,

  breakdownTitle: 'Cost breakdown',
  colItem: 'Line item',
  colEur: 'Euros (€)',
  colInr: 'Rupees (₹)',
  rowMonthlyLiving: 'Monthly living costs (per month)',
  rowPeriodLiving: (months: number) =>
    months === 1 ? 'Living costs across 1 month' : `Living costs across ${months} months`,
  rowPeriodLivingPending: 'Living costs across chosen period',
  rowVisitorOneOff: 'Your one-off costs',
  rowOfficialEurFees: 'Selected official euro fees',
  rowOfficialInrFees: 'Selected official rupee fee (APS)',
  rowPeriodTotal: 'Total for the period',

  blockedGerman: { de: 'Sperrkonto', en: 'blocked account' },
  blockedHeading: 'Official visa proof-of-funds reference',
  blockedDistinction:
    'This is the German Missions’ proof-of-funds figure for a student visa, not an estimate of your personal spending. Your own monthly costs can be higher or lower.',
  blockedMonthlyLabel: 'Official monthly rate',
  blockedAnnualLabel: (months: number) => `${months}-month reference amount`,

  guidesHeading: 'Where these costs fit in your application',
  guidesBody:
    'Read the requirements guide for when each external fee is paid and how proof of funds and health insurance work for the student visa.',
  costsLink: {
    label: `Read the ${REQUIREMENT_TOPIC_TITLES.costs} guide`,
    href: requirementsHref('costs'),
  },
  visaLink: {
    label: `Read the ${REQUIREMENT_TOPIC_TITLES['visa-enrolment']} guide`,
    href: requirementsHref('visa-enrolment'),
  },
  ctaLabel: NAV_CTA.label,
  feePromise: FEE_PROMISE,
} as const;
