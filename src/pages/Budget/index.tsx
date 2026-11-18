import { Badge, Button, TextInput } from '@mantine/core';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';
import {
  BLOCKED_ACCOUNT_REFERENCE,
  MAX_CUSTOM_ITEMS,
  MAX_FIELD_LENGTH,
  MAX_LABEL_LENGTH,
  MONTHLY_FIELD_IDS,
  OFFICIAL_FEES,
  ONE_OFF_FIELD_IDS,
  SEMESTER_CONTRIBUTION_REFERENCE,
  TUITION_PUBLIC_PRIVATE_REFERENCE,
  TUITION_TUM_EXAMPLE,
  calculateBudget,
  clearBudget,
  createEmptyBudgetState,
  formatEur,
  formatInr,
  readBudget,
  writeBudget,
  type BudgetState,
  type MonthlyFieldId,
  type OfficialFeeId,
  type OneOffFieldId,
} from '@/utils/budget';
import { DESTINATIONS, SECTIONS, destinationHref } from '@/utils/constants';

import {
  BUDGET_COPY,
  BUDGET_PERIOD_PRESETS,
  MONTHLY_FIELD_COPY,
  ONE_OFF_FIELD_COPY,
} from './data';
import styles from './styles.module.scss';

interface ReducerState {
  ready: boolean;
  budget: BudgetState;
  storageFailed: boolean;
  clearedAnnouncement: boolean;
  clearFailed: boolean;
}

type Action =
  | { type: 'load'; stored: BudgetState | null; failed: boolean }
  | { type: 'storage-failed' }
  | { type: 'set-months'; value: string }
  | { type: 'set-exchange-rate'; value: string }
  | { type: 'set-monthly'; field: MonthlyFieldId; value: string }
  | { type: 'set-one-off'; field: OneOffFieldId; value: string }
  | { type: 'add-custom'; id: string }
  | { type: 'update-custom'; id: string; key: 'label' | 'amount'; value: string }
  | { type: 'remove-custom'; id: string }
  | { type: 'toggle-official'; fee: OfficialFeeId }
  | { type: 'set-extra-courses'; value: string }
  | { type: 'clear'; failed: boolean };

function createInitialReducerState(): ReducerState {
  return {
    ready: false,
    budget: createEmptyBudgetState(),
    storageFailed: false,
    clearedAnnouncement: false,
    clearFailed: false,
  };
}

function reducer(state: ReducerState, action: Action): ReducerState {
  switch (action.type) {
    case 'load':
      return {
        ready: true,
        budget: action.stored ?? state.budget,
        storageFailed: state.storageFailed || action.failed,
        clearedAnnouncement: false,
        clearFailed: false,
      };
    case 'storage-failed':
      return state.storageFailed ? state : { ...state, storageFailed: true };
    case 'set-months':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: { ...state.budget, months: action.value },
      };
    case 'set-exchange-rate':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: { ...state.budget, exchangeRate: action.value },
      };
    case 'set-monthly':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: {
          ...state.budget,
          monthly: { ...state.budget.monthly, [action.field]: action.value },
        },
      };
    case 'set-one-off':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: {
          ...state.budget,
          oneOff: { ...state.budget.oneOff, [action.field]: action.value },
        },
      };
    case 'add-custom':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: {
          ...state.budget,
          customOneOffs: [
            ...state.budget.customOneOffs,
            { id: action.id, label: '', amount: '' },
          ],
        },
      };
    case 'update-custom':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: {
          ...state.budget,
          customOneOffs: state.budget.customOneOffs.map((item) =>
            item.id === action.id ? { ...item, [action.key]: action.value } : item,
          ),
        },
      };
    case 'remove-custom':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: {
          ...state.budget,
          customOneOffs: state.budget.customOneOffs.filter((item) => item.id !== action.id),
        },
      };
    case 'toggle-official': {
      const nextChecked = !state.budget.officialFees[action.fee];
      return {
        ...state,
        clearedAnnouncement: false,
        budget: {
          ...state.budget,
          officialFees: { ...state.budget.officialFees, [action.fee]: nextChecked },
          extraUniAssistCourses:
            action.fee === 'uniAssist' && !nextChecked ? '' : state.budget.extraUniAssistCourses,
        },
      };
    }
    case 'set-extra-courses':
      return {
        ...state,
        clearedAnnouncement: false,
        budget: { ...state.budget, extraUniAssistCourses: action.value },
      };
    case 'clear':
      return {
        ...state,
        storageFailed: state.storageFailed || action.failed,
        clearFailed: action.failed,
        clearedAnnouncement: true,
        budget: createEmptyBudgetState(),
      };
  }
}

export default function Budget() {
  useSettleHashScroll();
  const [state, dispatch] = useReducer(reducer, undefined, createInitialReducerState);
  const loadedFromStorage = useRef<BudgetState | null>(null);
  const nextCustomCounter = useRef(1);

  useEffect(() => {
    const result = readBudget();
    loadedFromStorage.current = result.state;
    if (result.state) {
      nextCustomCounter.current = result.state.customOneOffs.length + 1;
    }
    dispatch({ type: 'load', stored: result.state, failed: result.failed });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    if (loadedFromStorage.current === state.budget) {
      loadedFromStorage.current = null;
      return;
    }
    loadedFromStorage.current = null;
    if (!writeBudget(state.budget)) {
      dispatch({ type: 'storage-failed' });
    }
  }, [state.ready, state.budget]);

  const { budget } = state;
  const calc = calculateBudget(budget);

  const customLimitReached = budget.customOneOffs.length >= MAX_CUSTOM_ITEMS;

  const handleAddCustom = () => {
    if (customLimitReached) return;
    const existingIds = new Set(budget.customOneOffs.map((item) => item.id));
    let counter = nextCustomCounter.current;
    while (existingIds.has(`custom-${counter}`)) {
      counter += 1;
    }
    nextCustomCounter.current = counter + 1;
    dispatch({ type: 'add-custom', id: `custom-${counter}` });
  };

  const [confirmingClear, setConfirmingClear] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const confirmYesRef = useRef<HTMLButtonElement>(null);
  const returnFocusToClear = useRef(false);

  // Move focus into the question when it opens, and back to the Clear button when it closes.
  useEffect(() => {
    if (confirmingClear) {
      confirmYesRef.current?.focus();
    } else if (returnFocusToClear.current) {
      returnFocusToClear.current = false;
      clearButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  const handleClear = () => {
    setConfirmingClear(true);
  };

  const handleCancelClear = () => {
    returnFocusToClear.current = true;
    setConfirmingClear(false);
  };

  const handleConfirmClear = () => {
    const cleared = clearBudget();
    dispatch({ type: 'clear', failed: !cleared });
    returnFocusToClear.current = true;
    setConfirmingClear(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const periodEurDisplay =
    calc.periodTotalEur !== null ? formatEur(calc.periodTotalEur) : BUDGET_COPY.emptyValue;

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section id={SECTIONS.top} className={styles.section}>
        <ContentContainer width="wide">
          <PageHeader
            title={BUDGET_COPY.title}
            introduction={BUDGET_COPY.lede}
            variant="compact"
            leading={(
              <div className={styles.badges}>
                {BUDGET_COPY.badges.map((badge, index) => (
                  <Badge
                    key={badge}
                    className={styles.badge}
                    data-tone={index === 0 ? 'green' : undefined}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          />

          <div className={styles.workbench}>
            <div className={styles.worksheet}>
              <div className={styles.worksheetHead}>
                <div className={styles.worksheetTitleRow}>
                  <h2 className={styles.worksheetTitle}>
                    <span lang="de">{BUDGET_COPY.germanTitle.de}</span>{' '}
                    <span className={styles.worksheetSubtitle}>{BUDGET_COPY.germanTitle.en}</span>
                  </h2>
                  <div className={styles.toolbarActions}>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={handlePrint}
                    >
                      {BUDGET_COPY.printButton}
                    </Button>
                    <Button
                      ref={clearButtonRef}
                      type="button"
                      variant="ring"
                      size="md"
                      aria-expanded={confirmingClear}
                      aria-controls="budget-clear-confirm"
                      onClick={handleClear}
                    >
                      {BUDGET_COPY.clearButton}
                    </Button>
                  </div>
                </div>
                {confirmingClear ? (
                  <div
                    id="budget-clear-confirm"
                    role="group"
                    aria-labelledby="budget-clear-question"
                    className={styles.clearConfirm}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') handleCancelClear();
                    }}
                  >
                    <p id="budget-clear-question" className={styles.clearQuestion}>
                      {BUDGET_COPY.clearConfirmQuestion}
                    </p>
                    <div className={styles.clearConfirmActions}>
                      <Button
                        ref={confirmYesRef}
                        type="button"
                        variant="navy"
                        size="md"
                        onClick={handleConfirmClear}
                      >
                        {BUDGET_COPY.clearConfirmYes}
                      </Button>
                      <Button type="button" variant="outline" size="md" onClick={handleCancelClear}>
                        {BUDGET_COPY.clearConfirmCancel}
                      </Button>
                    </div>
                  </div>
                ) : null}
                <p className={styles.storageNote}>{BUDGET_COPY.storageNotice}</p>
                {state.storageFailed ? (
                  <p role="alert" className={styles.storageAlert}>
                    {BUDGET_COPY.storageBlocked}
                  </p>
                ) : null}
                <p role="status" aria-live="polite" className={styles.clearedStatus}>
                  {state.clearedAnnouncement
                    ? state.clearFailed ? BUDGET_COPY.clearFailedStatus : BUDGET_COPY.clearedStatus
                    : ''}
                </p>
              </div>

              {/* 1. Planning period and visitor's typed exchange rate */}
              <section aria-labelledby="budget-period-heading" className={styles.formGroup}>
                <h3 id="budget-period-heading" className={styles.groupTitle}>
                  {BUDGET_COPY.periodSectionTitle}
                </h3>

                <div
                  className={styles.presets}
                  role="group"
                  aria-label={BUDGET_COPY.presetsLabel}
                >
                  {BUDGET_PERIOD_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      aria-pressed={budget.months.trim() === preset.value}
                      onClick={() => dispatch({ type: 'set-months', value: preset.value })}
                      className={styles.presetButton}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.fieldCell}>
                    <TextInput
                      id="budget-months"
                      type="text"
                      maxLength={MAX_FIELD_LENGTH}
                      inputMode="numeric"
                      label={BUDGET_COPY.monthsLabel}
                      value={budget.months}
                      onChange={(event) =>
                        dispatch({ type: 'set-months', value: event.currentTarget.value })
                      }
                      error={calc.invalid.months ? BUDGET_COPY.monthsError : undefined}
                    />
                    <p className={styles.fieldHint}>{BUDGET_COPY.monthsHint}</p>
                  </div>

                  <div className={styles.fieldCell}>
                    <TextInput
                      id="budget-exchange-rate"
                      type="text"
                      maxLength={MAX_FIELD_LENGTH}
                      inputMode="decimal"
                      label={BUDGET_COPY.exchangeRateLabel}
                      value={budget.exchangeRate}
                      onChange={(event) =>
                        dispatch({ type: 'set-exchange-rate', value: event.currentTarget.value })
                      }
                      error={calc.invalid.exchangeRate ? BUDGET_COPY.exchangeRateError : undefined}
                    />
                    <p className={styles.fieldHint}>{BUDGET_COPY.exchangeRateHint}</p>
                  </div>
                </div>
              </section>

              {/* 2. Visitor's own monthly living costs */}
              <section aria-labelledby="budget-monthly-heading" className={styles.formGroup}>
                <div className={styles.groupHeader}>
                  <h3 id="budget-monthly-heading" className={styles.groupTitle}>
                    {BUDGET_COPY.monthlySectionTitle}
                  </h3>
                  <p className={styles.groupLead}>{BUDGET_COPY.monthlySectionLead}</p>
                </div>

                <div className={styles.fieldGrid}>
                  {MONTHLY_FIELD_IDS.map((fieldId) => {
                    const copy = MONTHLY_FIELD_COPY[fieldId];
                    return (
                      <div key={fieldId} className={styles.fieldCell}>
                        <TextInput
                          id={`budget-monthly-${fieldId}`}
                          type="text"
                          maxLength={MAX_FIELD_LENGTH}
                          inputMode="decimal"
                          label={copy.label}
                          value={budget.monthly[fieldId]}
                          onChange={(event) =>
                            dispatch({
                              type: 'set-monthly',
                              field: fieldId,
                              value: event.currentTarget.value,
                            })
                          }
                          error={calc.invalid.monthly[fieldId] ? BUDGET_COPY.amountError : undefined}
                        />
                        {copy.description ? (
                          <p className={styles.fieldHint}>{copy.description}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <ul className={styles.sourceFactList}>
                  {BUDGET_COPY.healthInsuranceFacts.map((fact) => (
                    <li key={fact.source.url} className={styles.inlineFact}>
                      <p className={styles.inlineFactText}>{fact.text}</p>
                      <SourceNote source={fact.source} />
                    </li>
                  ))}
                </ul>
              </section>

              {/* 3. Visitor's own one-off costs */}
              <section aria-labelledby="budget-oneoff-heading" className={styles.formGroup}>
                <div className={styles.groupHeader}>
                  <h3 id="budget-oneoff-heading" className={styles.groupTitle}>
                    {BUDGET_COPY.oneOffSectionTitle}
                  </h3>
                  <p className={styles.groupLead}>{BUDGET_COPY.oneOffSectionLead}</p>
                </div>

                <div className={styles.fieldGrid}>
                  {ONE_OFF_FIELD_IDS.map((fieldId) => (
                    <div key={fieldId} className={styles.fieldCell}>
                      <TextInput
                        id={`budget-oneoff-${fieldId}`}
                        type="text"
                        maxLength={MAX_FIELD_LENGTH}
                        inputMode="decimal"
                        label={ONE_OFF_FIELD_COPY[fieldId].label}
                        value={budget.oneOff[fieldId]}
                        onChange={(event) =>
                          dispatch({
                            type: 'set-one-off',
                            field: fieldId,
                            value: event.currentTarget.value,
                          })
                        }
                        error={calc.invalid.oneOff[fieldId] ? BUDGET_COPY.amountError : undefined}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.customSection}>
                  {budget.customOneOffs.length > 0 ? (
                    <>
                      <h4 className={styles.subGroupTitle}>{BUDGET_COPY.customItemsTitle}</h4>
                      <ul className={styles.customList}>
                        {budget.customOneOffs.map((item, index) => (
                          <li key={item.id} className={styles.customRow}>
                            <TextInput
                              id={`budget-custom-label-${item.id}`}
                              type="text"
                              maxLength={MAX_LABEL_LENGTH}
                              label={BUDGET_COPY.customLabelField(index + 1)}
                              value={item.label}
                              onChange={(event) =>
                                dispatch({
                                  type: 'update-custom',
                                  id: item.id,
                                  key: 'label',
                                  value: event.currentTarget.value,
                                })
                              }
                            />
                            <TextInput
                              id={`budget-custom-amount-${item.id}`}
                              type="text"
                              maxLength={MAX_FIELD_LENGTH}
                              inputMode="decimal"
                              label={BUDGET_COPY.customAmountField(index + 1)}
                              value={item.amount}
                              onChange={(event) =>
                                dispatch({
                                  type: 'update-custom',
                                  id: item.id,
                                  key: 'amount',
                                  value: event.currentTarget.value,
                                })
                              }
                              error={
                                calc.invalid.customAmounts[item.id]
                                  ? BUDGET_COPY.amountError
                                  : undefined
                              }
                            />
                            <Button
                              type="button"
                              variant="ring"
                              size="md"
                              aria-label={BUDGET_COPY.removeCustomLabel(index + 1, item.label)}
                              onClick={() => dispatch({ type: 'remove-custom', id: item.id })}
                              className={styles.removeButton}
                            >
                              {BUDGET_COPY.removeShort}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  <div className={styles.addCustomRow}>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={handleAddCustom}
                      aria-describedby={customLimitReached ? 'budget-custom-limit' : undefined}
                    >
                      {BUDGET_COPY.addCustomButton}
                    </Button>
                    {customLimitReached ? (
                      <p id="budget-custom-limit" className={styles.fieldHint}>
                        {BUDGET_COPY.customLimitNote(MAX_CUSTOM_ITEMS)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* 4. Optional official fixed fees from applicationFacts.ts */}
              <section aria-labelledby="budget-official-heading" className={styles.formGroup}>
                <div className={styles.groupHeader}>
                  <h3 id="budget-official-heading" className={styles.groupTitle}>
                    {BUDGET_COPY.officialSectionTitle}
                  </h3>
                  <p className={styles.groupLead}>{BUDGET_COPY.officialSectionLead}</p>
                </div>

                <ul className={styles.officialList}>
                  {OFFICIAL_FEES.map((fee) => {
                    const selected = budget.officialFees[fee.id];
                    return (
                      <li
                        key={fee.id}
                        className={styles.officialCard}
                        data-selected={selected || undefined}
                      >
                        <div className={styles.officialCardHead}>
                          <div className={styles.officialMeta}>
                            <span className={styles.officialName}>{fee.label}</span>
                            <span className={styles.officialAmount}>{fee.amountLabel}</span>
                          </div>
                          <button
                            type="button"
                            aria-pressed={selected}
                            aria-label={BUDGET_COPY.toggleFeeAria(fee.label, fee.amountLabel)}
                            onClick={() => dispatch({ type: 'toggle-official', fee: fee.id })}
                            className={styles.feeToggleButton}
                          >
                            {selected ? `✓ ${BUDGET_COPY.includedFee}` : BUDGET_COPY.includeFee}
                          </button>
                        </div>

                        <p className={styles.officialDetail}>{fee.detail}</p>
                        <SourceNote source={fee.source} />

                        {fee.id === 'uniAssist' && selected ? (
                          <div className={styles.extraCoursesField}>
                            <TextInput
                              id="budget-extra-uniassist"
                              type="text"
                              maxLength={MAX_FIELD_LENGTH}
                              inputMode="numeric"
                              label={BUDGET_COPY.extraUniAssistLabel}
                              value={budget.extraUniAssistCourses}
                              onChange={(event) =>
                                dispatch({
                                  type: 'set-extra-courses',
                                  value: event.currentTarget.value,
                                })
                              }
                              error={
                                calc.invalid.extraUniAssistCourses
                                  ? BUDGET_COPY.extraUniAssistError
                                  : undefined
                              }
                            />
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Official reference notes on semester contributions and tuition */}
              <section aria-labelledby="budget-university-notes-heading" className={styles.formGroup}>
                <h3 id="budget-university-notes-heading" className={styles.groupTitle}>
                  {BUDGET_COPY.referenceHeading}
                </h3>
                <ul className={styles.referenceList}>
                  <li className={styles.referenceItem}>
                    <div className={styles.referenceHead}>
                      <strong>{SEMESTER_CONTRIBUTION_REFERENCE.label}</strong>
                      {SEMESTER_CONTRIBUTION_REFERENCE.amount ? (
                        <span className={styles.referenceAmount}>
                          {SEMESTER_CONTRIBUTION_REFERENCE.amount}
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.referenceDetail}>{SEMESTER_CONTRIBUTION_REFERENCE.detail}</p>
                    {SEMESTER_CONTRIBUTION_REFERENCE.source ? (
                      <SourceNote source={SEMESTER_CONTRIBUTION_REFERENCE.source} />
                    ) : null}
                  </li>

                  <li className={styles.referenceItem}>
                    <div className={styles.referenceHead}>
                      <strong>{TUITION_PUBLIC_PRIVATE_REFERENCE.label}</strong>
                    </div>
                    <p className={styles.referenceDetail}>{TUITION_PUBLIC_PRIVATE_REFERENCE.detail}</p>
                    {TUITION_PUBLIC_PRIVATE_REFERENCE.source ? (
                      <SourceNote source={TUITION_PUBLIC_PRIVATE_REFERENCE.source} />
                    ) : null}
                  </li>

                  <li className={styles.referenceItem}>
                    <div className={styles.referenceHead}>
                      <strong>{TUITION_TUM_EXAMPLE.label}</strong>
                      {TUITION_TUM_EXAMPLE.amount ? (
                        <span className={styles.referenceAmount}>{TUITION_TUM_EXAMPLE.amount}</span>
                      ) : null}
                    </div>
                    <p className={styles.referenceDetail}>{TUITION_TUM_EXAMPLE.detail}</p>
                    {TUITION_TUM_EXAMPLE.source ? (
                      <SourceNote source={TUITION_TUM_EXAMPLE.source} />
                    ) : null}
                  </li>
                </ul>
              </section>

              {/* Compact totals strip below inputs on narrow viewports */}
              <div aria-hidden="true" className={styles.mobileTotalsBar}>
                <div className={styles.mobileTotalItem}>
                  <span className={styles.mobileTotalLabel}>{BUDGET_COPY.mobileMonthlyLabel}</span>
                  <span className={styles.mobileTotalEur}>{formatEur(calc.monthlyTotalEur)}</span>
                </div>
                <div className={styles.mobileTotalItem}>
                  <span className={styles.mobileTotalLabel}>{BUDGET_COPY.mobilePeriodLabel}</span>
                  <span className={styles.mobileTotalEur}>{periodEurDisplay}</span>
                  {calc.periodTotalEur !== null && calc.unconvertedInrFee > 0 ? (
                    <span>{BUDGET_COPY.plusInrFee(formatInr(calc.unconvertedInrFee))}</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Summary, breakdown and official blocked-account reference */}
            <div className={styles.summary}>
              <div
                aria-live="polite"
                aria-atomic="true"
                data-testid="budget-live-summary"
                className={styles.liveSummary}
              >
                <div className={styles.summaryHead}>
                  <span className={styles.summaryKicker}>{BUDGET_COPY.summaryKicker}</span>
                  <h2 className={styles.summaryTitle}>
                    {calc.months !== null
                      ? BUDGET_COPY.summaryHeadingWithPeriod(calc.months)
                      : BUDGET_COPY.summaryHeadingWithoutPeriod}
                  </h2>
                </div>

                {calc.invalid.hasAnyInvalid ? (
                  <p role="status" className={styles.validationBanner}>
                    {BUDGET_COPY.validationWarning}
                  </p>
                ) : null}

                <div className={styles.totalsGrid}>
                  <div className={styles.totalCard}>
                    <span className={styles.cardLabel}>{BUDGET_COPY.monthlyCardLabel}</span>
                    <div className={styles.cardEur} data-testid="budget-monthly-eur">
                      {formatEur(calc.monthlyTotalEur)}
                    </div>
                    <div className={styles.cardInr} data-testid="budget-monthly-inr">
                      {calc.monthlyTotalInr !== null
                        ? formatInr(calc.monthlyTotalInr)
                        : BUDGET_COPY.ratePrompt}
                    </div>
                  </div>

                  <div className={styles.totalCard}>
                    <span className={styles.cardLabel}>
                      {BUDGET_COPY.periodCardLabel(calc.months)}
                    </span>
                    <div className={styles.cardEur} data-testid="budget-period-eur">
                      {periodEurDisplay}
                    </div>
                    {calc.periodTotalEur !== null && calc.unconvertedInrFee > 0 ? (
                      <div className={styles.unconvertedNote}>
                        {BUDGET_COPY.plusInrFee(formatInr(calc.unconvertedInrFee))}
                      </div>
                    ) : null}
                    <div className={styles.cardInr} data-testid="budget-period-inr">
                      {calc.months === null
                        ? BUDGET_COPY.monthsPrompt
                        : calc.periodTotalInr !== null
                          ? formatInr(calc.periodTotalInr)
                          : BUDGET_COPY.ratePrompt}
                    </div>
                  </div>
                </div>

                {calc.exchangeRate !== null ? (
                  <p className={styles.rateNote}>{BUDGET_COPY.roundingNote(calc.exchangeRate)}</p>
                ) : null}
              </div>

              {/* Itemised breakdown */}
              <div className={styles.breakdownCard}>
                <h3 id="budget-breakdown-title" className={styles.breakdownTitle}>
                  {BUDGET_COPY.breakdownTitle}
                </h3>
                <table
                  className={styles.breakdownTable}
                  aria-labelledby="budget-breakdown-title"
                >
                  <thead className={styles.breakdownHead}>
                    <tr>
                      <th scope="col">{BUDGET_COPY.colItem}</th>
                      <th scope="col">{BUDGET_COPY.colEur}</th>
                      <th scope="col">{BUDGET_COPY.colInr}</th>
                    </tr>
                  </thead>
                  <tbody className={styles.breakdownBody}>
                    <tr className={styles.breakdownRow}>
                      <th scope="row">{BUDGET_COPY.rowMonthlyLiving}</th>
                      <td data-currency={BUDGET_COPY.colEur}>
                        {formatEur(calc.monthlyTotalEur)}
                      </td>
                      <td data-currency={BUDGET_COPY.colInr}>
                        {calc.monthlyTotalInr !== null
                          ? formatInr(calc.monthlyTotalInr)
                          : BUDGET_COPY.emptyValue}
                      </td>
                    </tr>
                    <tr className={styles.breakdownRow}>
                      <th scope="row">
                        {calc.months !== null
                          ? BUDGET_COPY.rowPeriodLiving(calc.months)
                          : BUDGET_COPY.rowPeriodLivingPending}
                      </th>
                      <td data-currency={BUDGET_COPY.colEur}>
                        {calc.livingPeriodEur !== null
                          ? formatEur(calc.livingPeriodEur)
                          : BUDGET_COPY.emptyValue}
                      </td>
                      <td data-currency={BUDGET_COPY.colInr}>
                        {calc.livingPeriodInr !== null
                          ? formatInr(calc.livingPeriodInr)
                          : BUDGET_COPY.emptyValue}
                      </td>
                    </tr>
                    <tr className={styles.breakdownRow}>
                      <th scope="row">{BUDGET_COPY.rowVisitorOneOff}</th>
                      <td data-currency={BUDGET_COPY.colEur}>
                        {formatEur(calc.visitorOneOffTotalEur)}
                      </td>
                      <td data-currency={BUDGET_COPY.colInr}>
                        {calc.exchangeRate !== null
                          ? formatInr(calc.visitorOneOffTotalEur * calc.exchangeRate)
                          : BUDGET_COPY.emptyValue}
                      </td>
                    </tr>
                    <tr className={styles.breakdownRow}>
                      <th scope="row">{BUDGET_COPY.rowOfficialEurFees}</th>
                      <td data-currency={BUDGET_COPY.colEur}>
                        {formatEur(calc.officialOneOffEur)}
                      </td>
                      <td data-currency={BUDGET_COPY.colInr}>
                        {calc.exchangeRate !== null
                          ? formatInr(calc.officialOneOffEur * calc.exchangeRate)
                          : BUDGET_COPY.emptyValue}
                      </td>
                    </tr>
                    {calc.officialOneOffInr > 0 ? (
                      <tr className={styles.breakdownRow}>
                        <th scope="row">{BUDGET_COPY.rowOfficialInrFees}</th>
                        <td data-currency={BUDGET_COPY.colEur}>
                          {calc.exchangeRate !== null
                            ? formatEur(calc.officialOneOffInr / calc.exchangeRate)
                            : BUDGET_COPY.emptyValue}
                        </td>
                        <td data-currency={BUDGET_COPY.colInr}>
                          {formatInr(calc.officialOneOffInr)}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                  <tfoot className={styles.breakdownFoot}>
                    <tr className={styles.breakdownRow}>
                      <th scope="row">{BUDGET_COPY.rowPeriodTotal}</th>
                      <td data-currency={BUDGET_COPY.colEur}>
                        {calc.periodTotalEur !== null
                          ? calc.unconvertedInrFee > 0
                            ? `${formatEur(calc.periodTotalEur)} + ${formatInr(calc.unconvertedInrFee)}`
                            : formatEur(calc.periodTotalEur)
                          : BUDGET_COPY.emptyValue}
                      </td>
                      <td data-currency={BUDGET_COPY.colInr}>
                        {calc.periodTotalInr !== null
                          ? formatInr(calc.periodTotalInr)
                          : BUDGET_COPY.emptyValue}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Official blocked-account reference, separated from personal living costs */}
              <section
                aria-labelledby="budget-blocked-heading"
                data-testid="budget-blocked-reference"
                className={styles.blockedCard}
              >
                <div className={styles.blockedHeader}>
                  <p className={styles.blockedGermanTag}>
                    <span lang="de">{BUDGET_COPY.blockedGerman.de}</span>
                    <span>{` · ${BUDGET_COPY.blockedGerman.en}`}</span>
                  </p>
                  <h3 id="budget-blocked-heading" className={styles.blockedTitle}>
                    {BUDGET_COPY.blockedHeading}
                  </h3>
                </div>

                <p className={styles.blockedDistinction}>{BUDGET_COPY.blockedDistinction}</p>

                <div className={styles.blockedFigures}>
                  <div className={styles.blockedFigureBox}>
                    <span className={styles.blockedFigureLabel}>
                      {BUDGET_COPY.blockedMonthlyLabel}
                    </span>
                    <strong className={styles.blockedFigureEur}>
                      {formatEur(calc.blockedAccount.monthlyEur)}
                    </strong>
                    {calc.blockedAccount.monthlyInr !== null ? (
                      <span className={styles.blockedFigureInr}>
                        {formatInr(calc.blockedAccount.monthlyInr)}
                      </span>
                    ) : null}
                  </div>

                  <div className={styles.blockedFigureBox}>
                    <span className={styles.blockedFigureLabel}>
                      {BUDGET_COPY.blockedAnnualLabel(calc.blockedAccount.months)}
                    </span>
                    <strong className={styles.blockedFigureEur}>
                      {formatEur(calc.blockedAccount.annualEur)}
                    </strong>
                    {calc.blockedAccount.annualInr !== null ? (
                      <span className={styles.blockedFigureInr}>
                        {formatInr(calc.blockedAccount.annualInr)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className={styles.blockedDetail}>{BLOCKED_ACCOUNT_REFERENCE.detail}</p>
                <SourceNote source={BLOCKED_ACCOUNT_REFERENCE.source} />
              </section>

              {/* Guide cross-links and profile review CTA */}
              <div className={styles.guidesCard}>
                <h3 className={styles.guidesHeading}>{BUDGET_COPY.guidesHeading}</h3>
                <p className={styles.guidesBody}>{BUDGET_COPY.guidesBody}</p>
                <div className={styles.guideLinks}>
                  <Link to={BUDGET_COPY.costsLink.href} className={styles.guideLink}>
                    {BUDGET_COPY.costsLink.label}
                  </Link>
                  <Link to={BUDGET_COPY.visaLink.href} className={styles.guideLink}>
                    {BUDGET_COPY.visaLink.label}
                  </Link>
                </div>

                <div className={styles.ctaRow}>
                  <Button
                    component={HomeSectionLink}
                    href={destinationHref(DESTINATIONS.profileReview)}
                    variant="yellow"
                    size="lg"
                  >
                    {BUDGET_COPY.ctaLabel}
                  </Button>
                  <div className={styles.zeroFeeCallout}>
                    <span className={styles.zeroFeeText}>{BUDGET_COPY.feePromise}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>
      </section>
    </main>
  );
}
