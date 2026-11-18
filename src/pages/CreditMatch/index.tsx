import { Badge, Button, Checkbox, TextInput } from '@mantine/core';
import { type FormEvent, useEffect, useId, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';
import { SECTIONS } from '@/utils/constants';
import {
  CREDIT_INPUT_LENGTHS,
  EMPTY_WORKSHEET,
  addCourse,
  addSubjectArea,
  buildCreditMatchCsv,
  clearWorksheet,
  creditMatchCsvFilename,
  formatCredits,
  isWorksheetEmpty,
  parseCreditNumber,
  readWorksheet,
  removeCourse,
  removeSubjectArea,
  safeExternalUrl,
  setContextField,
  setCourseAreaCredits,
  summariseWorksheet,
  toggleCourseArea,
  updateCourseField,
  updateSubjectArea,
  writeWorksheet,
  type CreditMatchWorksheet,
  type ProgrammeContext,
} from '@/utils/creditMatch';

import { CREDIT_MATCH_COPY, CREDIT_MATCH_CSV_COPY } from './data';
import styles from './styles.module.scss';

interface WorksheetState {
  needsSave: boolean;
  worksheet: CreditMatchWorksheet;
  storageFailed: boolean;
}

type WorksheetAction =
  | { type: 'load'; stored: CreditMatchWorksheet | null; failed: boolean }
  | { type: 'change'; apply: (current: CreditMatchWorksheet) => CreditMatchWorksheet }
  | { type: 'clear'; failed: boolean }
  | { type: 'saved'; failed: boolean };

const initialState: WorksheetState = {
  needsSave: false,
  worksheet: EMPTY_WORKSHEET,
  storageFailed: false,
};

function worksheetReducer(state: WorksheetState, action: WorksheetAction): WorksheetState {
  switch (action.type) {
    case 'load':
      return {
        needsSave: false,
        worksheet: action.stored ?? EMPTY_WORKSHEET,
        storageFailed: action.failed,
      };
    case 'change':
      return {
        ...state,
        worksheet: action.apply(state.worksheet),
        needsSave: true,
      };
    case 'clear':
      return {
        ...state,
        worksheet: EMPTY_WORKSHEET,
        needsSave: false,
        storageFailed: action.failed,
      };
    case 'saved':
      return { ...state, needsSave: false, storageFailed: action.failed };
  }
}

function ModuleReferenceDisplay({ raw }: { raw: string }) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const externalUrl = safeExternalUrl(trimmed);

  return (
    <span className={styles.moduleRefLine}>
      {CREDIT_MATCH_COPY.summary.moduleRefPrefix}{' '}
      {externalUrl ? (
        <a href={externalUrl} target="_blank" rel="noopener">
          {trimmed}
        </a>
      ) : (
        <span>{trimmed}</span>
      )}
    </span>
  );
}

function focusField(id: string) {
  requestAnimationFrame(() => {
    const field = document.getElementById(id);
    field?.focus({ preventScroll: true });
    field?.scrollIntoView({ block: 'nearest' });
  });
}

export default function CreditMatch() {
  useSettleHashScroll();

  const [state, dispatch] = useReducer(worksheetReducer, initialState);

  // Draft fields for adding a new subject area
  const [draftAreaName, setDraftAreaName] = useState('');
  const [draftAreaCredits, setDraftAreaCredits] = useState('');
  const [areaSubmitted, setAreaSubmitted] = useState(false);

  // Draft fields for adding a new course
  const [draftCourseTitle, setDraftCourseTitle] = useState('');
  const [draftCourseCredits, setDraftCourseCredits] = useState('');
  const [draftModuleRef, setDraftModuleRef] = useState('');
  const [draftCourseAreas, setDraftCourseAreas] = useState<string[]>([]);
  const [courseSubmitted, setCourseSubmitted] = useState(false);

  const [announcement, setAnnouncement] = useState('');

  const [confirmingClear, setConfirmingClear] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const confirmClearRef = useRef<HTMLButtonElement>(null);
  const restoreClearFocus = useRef(false);
  const clearPromptId = useId();

  // Focus moves to "Yes, clear" when the question opens and back to the first button when it closes.
  useEffect(() => {
    if (confirmingClear) {
      confirmClearRef.current?.focus();
    } else if (restoreClearFocus.current) {
      restoreClearFocus.current = false;
      clearButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  useEffect(() => {
    const result = readWorksheet();
    dispatch({ type: 'load', stored: result.worksheet, failed: result.failed });
  }, []);

  useEffect(() => {
    if (!state.needsSave) return;
    const ok = isWorksheetEmpty(state.worksheet) ? clearWorksheet() : writeWorksheet(state.worksheet);
    dispatch({ type: 'saved', failed: !ok });
  }, [state.needsSave, state.worksheet]);

  const { worksheet, storageFailed } = state;
  const summary = summariseWorksheet(worksheet);

  const parsedDraftAreaCredits = parseCreditNumber(draftAreaCredits);
  const areaNameError =
    areaSubmitted && draftAreaName.trim() === '' ? CREDIT_MATCH_COPY.areas.errors.missingName : null;
  const areaCreditsError =
    areaSubmitted && (parsedDraftAreaCredits === null || parsedDraftAreaCredits <= 0)
      ? CREDIT_MATCH_COPY.areas.errors.invalidCredits
      : null;

  const parsedDraftCourseCredits = parseCreditNumber(draftCourseCredits);
  const courseTitleError =
    courseSubmitted && draftCourseTitle.trim() === ''
      ? CREDIT_MATCH_COPY.courses.errors.missingTitle
      : null;
  const courseCreditsError =
    courseSubmitted && (parsedDraftCourseCredits === null || parsedDraftCourseCredits <= 0)
      ? CREDIT_MATCH_COPY.courses.errors.invalidCredits
      : null;

  const applyChange = (apply: (current: CreditMatchWorksheet) => CreditMatchWorksheet) => {
    setAnnouncement('');
    dispatch({ type: 'change', apply });
  };

  const handleContextChange = (field: keyof ProgrammeContext, value: string) => {
    applyChange((current) => setContextField(current, field, value));
  };

  const handleAddArea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      draftAreaName.trim() === '' ||
      parsedDraftAreaCredits === null ||
      parsedDraftAreaCredits <= 0
    ) {
      setAreaSubmitted(true);
      focusField(draftAreaName.trim() === '' ? 'cm-new-area-name' : 'cm-new-area-credits');
      return;
    }
    applyChange((current) => addSubjectArea(current, draftAreaName, draftAreaCredits));
    setDraftAreaName('');
    setDraftAreaCredits('');
    setAreaSubmitted(false);
    focusField('cm-new-area-name');
  };

  const handleRemoveArea = (areaId: string) => {
    setDraftCourseAreas((prev) => prev.filter((id) => id !== areaId));
    applyChange((current) => removeSubjectArea(current, areaId));
    focusField('cm-new-area-name');
  };

  const toggleDraftCourseArea = (areaId: string) => {
    setDraftCourseAreas((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId],
    );
  };

  const handleAddCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      draftCourseTitle.trim() === '' ||
      parsedDraftCourseCredits === null ||
      parsedDraftCourseCredits <= 0
    ) {
      setCourseSubmitted(true);
      focusField(draftCourseTitle.trim() === '' ? 'cm-new-course-title' : 'cm-new-course-credits');
      return;
    }
    applyChange((current) =>
      addCourse(current, {
        title: draftCourseTitle,
        credits: draftCourseCredits,
        moduleRef: draftModuleRef,
        areaIds: draftCourseAreas,
      }),
    );
    setDraftCourseTitle('');
    setDraftCourseCredits('');
    setDraftModuleRef('');
    setDraftCourseAreas([]);
    setCourseSubmitted(false);
    focusField('cm-new-course-title');
  };

  const closeClearConfirm = () => {
    restoreClearFocus.current = true;
    setConfirmingClear(false);
  };

  const handleClearEntries = () => {
    closeClearConfirm();
    const ok = clearWorksheet();
    setDraftAreaName('');
    setDraftAreaCredits('');
    setAreaSubmitted(false);
    setDraftCourseTitle('');
    setDraftCourseCredits('');
    setDraftModuleRef('');
    setDraftCourseAreas([]);
    setCourseSubmitted(false);
    dispatch({ type: 'clear', failed: !ok });
    setAnnouncement(
      ok ? CREDIT_MATCH_COPY.toolbar.clearedAnnouncement : CREDIT_MATCH_COPY.toolbar.clearFailedAnnouncement,
    );
  };

  const handleDownloadCsv = () => {
    const csvContent = buildCreditMatchCsv(worksheet, summary, CREDIT_MATCH_CSV_COPY);
    const filename = creditMatchCsvFilename(worksheet.context.programme);
    // The byte order mark makes Excel read umlauts and the euro sign as UTF-8.
    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setAnnouncement(CREDIT_MATCH_COPY.toolbar.downloadedAnnouncement(filename));
  };

  const handlePrint = () => {
    window.print();
  };

  const universityText = worksheet.context.university.trim();
  const programmeText = worksheet.context.programme.trim();
  const programmeUrlText = worksheet.context.programmeUrl.trim();
  const safeProgrammeUrl = safeExternalUrl(programmeUrlText);
  const hasContext = Boolean(universityText || programmeText || programmeUrlText);

  return (
    <main id="main-content" tabIndex={-1}>
      <section id={SECTIONS.top} className={styles.section}>
        <ContentContainer width="wide">
          <PageHeader
            title={CREDIT_MATCH_COPY.title}
            introduction={CREDIT_MATCH_COPY.lede}
            variant="compact"
            leading={
              <div className={styles.headerLead}>
                <p className={styles.word}>
                  <span lang="de" className={styles.wordGerman}>
                    {CREDIT_MATCH_COPY.german.word}
                  </span>
                  <span className={styles.wordMeaning}>{CREDIT_MATCH_COPY.german.meaning}</span>
                </p>
                <div className={styles.badges}>
                  {CREDIT_MATCH_COPY.badges.map((badge, index) => (
                    <Badge
                      key={badge}
                      className={styles.badge}
                      data-tone={index === 0 ? 'green' : undefined}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            }
          />

          <div className={styles.stack}>
            {/* Toolbar: CSV download, print, clear entries */}
            <div className={`${styles.toolbar} ${styles.noPrint}`}>
              <div className={styles.toolbarActions}>
                <Button type="button" variant="navy" size="md" onClick={handleDownloadCsv}>
                  {CREDIT_MATCH_COPY.toolbar.downloadCsv}
                </Button>
                <Button type="button" variant="outline" size="md" onClick={handlePrint}>
                  {CREDIT_MATCH_COPY.toolbar.printWorksheet}
                </Button>
                {confirmingClear ? (
                  <div
                    role="group"
                    aria-labelledby={clearPromptId}
                    className={styles.confirmClear}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') closeClearConfirm();
                    }}
                  >
                    <span id={clearPromptId} className={styles.confirmPrompt}>
                      {CREDIT_MATCH_COPY.toolbar.clearConfirmPrompt}
                    </span>
                    <Button
                      ref={confirmClearRef}
                      type="button"
                      variant="navy"
                      size="md"
                      onClick={handleClearEntries}
                    >
                      {CREDIT_MATCH_COPY.toolbar.clearConfirmYes}
                    </Button>
                    <Button type="button" variant="outline" size="md" onClick={closeClearConfirm}>
                      {CREDIT_MATCH_COPY.toolbar.clearConfirmCancel}
                    </Button>
                  </div>
                ) : (
                  <Button
                    ref={clearButtonRef}
                    type="button"
                    variant="ring"
                    size="md"
                    onClick={() => setConfirmingClear(true)}
                  >
                    {CREDIT_MATCH_COPY.toolbar.clearEntries}
                  </Button>
                )}
              </div>
              <div className={styles.toolbarMeta}>
                <p className={styles.storageNote}>{CREDIT_MATCH_COPY.toolbar.storageNote}</p>
                <p role="status" aria-live="polite" className={styles.liveAnnouncement}>
                  {announcement}
                </p>
              </div>
            </div>

            {storageFailed ? (
              <p role="alert" className={`${styles.storageAlert} ${styles.noPrint}`}>
                {CREDIT_MATCH_COPY.toolbar.storageUnavailable}
              </p>
            ) : null}

            {/* How mapped credits are summed */}
            <details className={`${styles.rulesCard} ${styles.noPrint}`}>
              <summary className={styles.rulesTitle}>{CREDIT_MATCH_COPY.rules.heading}</summary>
              <ul className={styles.rulesList}>
                {CREDIT_MATCH_COPY.rules.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>

            {/* Step 1: Programme context */}
            <section
              aria-labelledby="credit-match-context-heading"
              className={`${styles.panel} ${styles.noPrint}`}
            >
              <div className={styles.panelHead}>
                <h2 id="credit-match-context-heading" className={styles.panelTitle}>
                  {CREDIT_MATCH_COPY.context.heading}
                </h2>
                <p className={styles.panelDescription}>{CREDIT_MATCH_COPY.context.description}</p>
              </div>

              <div className={styles.contextGrid}>
                <TextInput
                  id="cm-university"
                  maxLength={CREDIT_INPUT_LENGTHS.text}
                  label={CREDIT_MATCH_COPY.context.universityLabel}
                  placeholder={CREDIT_MATCH_COPY.context.universityPlaceholder}
                  value={worksheet.context.university}
                  onChange={(event) => handleContextChange('university', event.currentTarget.value)}
                />
                <TextInput
                  id="cm-programme"
                  maxLength={CREDIT_INPUT_LENGTHS.text}
                  label={CREDIT_MATCH_COPY.context.programmeLabel}
                  placeholder={CREDIT_MATCH_COPY.context.programmePlaceholder}
                  value={worksheet.context.programme}
                  onChange={(event) => handleContextChange('programme', event.currentTarget.value)}
                />
                <TextInput
                  id="cm-programme-url"
                  maxLength={CREDIT_INPUT_LENGTHS.link}
                  type="url"
                  label={CREDIT_MATCH_COPY.context.programmeUrlLabel}
                  placeholder={CREDIT_MATCH_COPY.context.programmeUrlPlaceholder}
                  value={worksheet.context.programmeUrl}
                  onChange={(event) =>
                    handleContextChange('programmeUrl', event.currentTarget.value)
                  }
                />
              </div>
            </section>

            {/* Step 2: Required subject areas */}
            <section
              aria-labelledby="credit-match-areas-heading"
              className={`${styles.panel} ${styles.noPrint}`}
            >
              <div className={styles.panelHead}>
                <h2 id="credit-match-areas-heading" className={styles.panelTitle}>
                  {CREDIT_MATCH_COPY.areas.heading}
                </h2>
                <p className={styles.panelDescription}>{CREDIT_MATCH_COPY.areas.description}</p>
              </div>

              <form
                onSubmit={handleAddArea}
                noValidate
                aria-labelledby="add-area-form-heading"
                className={styles.addForm}
              >
                <h3 id="add-area-form-heading" className={styles.formHeading}>
                  {CREDIT_MATCH_COPY.areas.addLegend}
                </h3>
                <div className={styles.addAreaGrid}>
                  <TextInput
                    id="cm-new-area-name"
                    maxLength={CREDIT_INPUT_LENGTHS.text}
                    label={CREDIT_MATCH_COPY.areas.nameLabel}
                    placeholder={CREDIT_MATCH_COPY.areas.namePlaceholder}
                    value={draftAreaName}
                    onChange={(event) => setDraftAreaName(event.currentTarget.value)}
                    error={areaNameError}
                  />
                  <TextInput
                    id="cm-new-area-credits"
                    maxLength={CREDIT_INPUT_LENGTHS.credits}
                    type="text"
                    inputMode="decimal"
                    label={CREDIT_MATCH_COPY.areas.requiredCreditsLabel}
                    placeholder={CREDIT_MATCH_COPY.areas.requiredCreditsPlaceholder}
                    value={draftAreaCredits}
                    onChange={(event) => setDraftAreaCredits(event.currentTarget.value)}
                    error={areaCreditsError}
                  />
                  <div className={styles.addButtonWrap}>
                    <Button type="submit" variant="navy" size="md">
                      {CREDIT_MATCH_COPY.areas.addButton}
                    </Button>
                  </div>
                </div>
              </form>

              {summary.areas.length === 0 ? (
                <p className={styles.emptyHint}>{CREDIT_MATCH_COPY.areas.empty}</p>
              ) : (
                <ul aria-label={CREDIT_MATCH_COPY.areas.listLabel} className={styles.entryList}>
                  {summary.areas.map((areaItem, index) => (
                    <li key={areaItem.area.id} className={styles.areaItem}>
                      <TextInput
                        id={`cm-area-name-${areaItem.area.id}`}
                        maxLength={CREDIT_INPUT_LENGTHS.text}
                        label={CREDIT_MATCH_COPY.areas.editNameLabel(index + 1)}
                        value={areaItem.area.name}
                        onChange={(event) => {
                          const { value } = event.currentTarget;
                          applyChange((current) =>
                            updateSubjectArea(current, areaItem.area.id, {
                              name: value,
                            }),
                          );
                        }}
                        error={
                          areaItem.area.name.trim() === ''
                            ? CREDIT_MATCH_COPY.areas.errors.missingName
                            : null
                        }
                      />
                      <TextInput
                        id={`cm-area-credits-${areaItem.area.id}`}
                        maxLength={CREDIT_INPUT_LENGTHS.credits}
                        type="text"
                        inputMode="decimal"
                        label={CREDIT_MATCH_COPY.areas.editCreditsLabel(areaItem.area.name)}
                        value={areaItem.area.requiredCredits}
                        onChange={(event) => {
                          const { value } = event.currentTarget;
                          applyChange((current) =>
                            updateSubjectArea(current, areaItem.area.id, {
                              requiredCredits: value,
                            }),
                          );
                        }}
                        error={
                          areaItem.invalidRequiredCredits ||
                          areaItem.area.requiredCredits.trim() === ''
                            ? CREDIT_MATCH_COPY.areas.errors.invalidCredits
                            : null
                        }
                      />
                      <div className={styles.removeWrap}>
                        <Button
                          type="button"
                          variant="outline"
                          size="nav"
                          className={styles.removeButton}
                          aria-label={CREDIT_MATCH_COPY.areas.removeAriaLabel(areaItem.area.name)}
                          onClick={() => handleRemoveArea(areaItem.area.id)}
                        >
                          {CREDIT_MATCH_COPY.areas.removeButton}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Step 3: Completed courses */}
            <section
              aria-labelledby="credit-match-courses-heading"
              className={`${styles.panel} ${styles.noPrint}`}
            >
              <div className={styles.panelHead}>
                <h2 id="credit-match-courses-heading" className={styles.panelTitle}>
                  {CREDIT_MATCH_COPY.courses.heading}
                </h2>
                <p className={styles.panelDescription}>{CREDIT_MATCH_COPY.courses.description}</p>
              </div>

              <form
                onSubmit={handleAddCourse}
                noValidate
                aria-labelledby="add-course-form-heading"
                className={styles.addForm}
              >
                <h3 id="add-course-form-heading" className={styles.formHeading}>
                  {CREDIT_MATCH_COPY.courses.addLegend}
                </h3>
                <div className={styles.addCourseFields}>
                  <TextInput
                    id="cm-new-course-title"
                    maxLength={CREDIT_INPUT_LENGTHS.text}
                    label={CREDIT_MATCH_COPY.courses.titleLabel}
                    placeholder={CREDIT_MATCH_COPY.courses.titlePlaceholder}
                    value={draftCourseTitle}
                    onChange={(event) => setDraftCourseTitle(event.currentTarget.value)}
                    error={courseTitleError}
                  />
                  <TextInput
                    id="cm-new-course-credits"
                    maxLength={CREDIT_INPUT_LENGTHS.credits}
                    type="text"
                    inputMode="decimal"
                    label={CREDIT_MATCH_COPY.courses.creditsLabel}
                    placeholder={CREDIT_MATCH_COPY.courses.creditsPlaceholder}
                    value={draftCourseCredits}
                    onChange={(event) => setDraftCourseCredits(event.currentTarget.value)}
                    error={courseCreditsError}
                  />
                  <TextInput
                    id="cm-new-course-module-ref"
                    maxLength={CREDIT_INPUT_LENGTHS.link}
                    label={CREDIT_MATCH_COPY.courses.moduleRefLabel}
                    placeholder={CREDIT_MATCH_COPY.courses.moduleRefPlaceholder}
                    value={draftModuleRef}
                    onChange={(event) => setDraftModuleRef(event.currentTarget.value)}
                  />
                </div>

                <fieldset className={styles.mappingFieldset}>
                  <legend className={styles.mappingLegend}>
                    {CREDIT_MATCH_COPY.courses.draftAreasLegend}
                  </legend>
                  {worksheet.areas.length === 0 ? (
                    <p className={styles.emptyHint}>{CREDIT_MATCH_COPY.courses.noAreasHint}</p>
                  ) : (
                    <div className={styles.draftAreaChecks}>
                      {worksheet.areas.map((area, index) => (
                        <div key={area.id} className={styles.checkboxOption}>
                          <Checkbox
                            id={`cm-draft-map-${area.id}`}
                            label={area.name.trim() || CREDIT_MATCH_COPY.areas.unnamed(index + 1)}
                            checked={draftCourseAreas.includes(area.id)}
                            onChange={() => toggleDraftCourseArea(area.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>

                <div className={styles.formActions}>
                  <Button type="submit" variant="navy" size="md">
                    {CREDIT_MATCH_COPY.courses.addButton}
                  </Button>
                </div>
              </form>

              {summary.courses.length === 0 ? (
                <p className={styles.emptyHint}>{CREDIT_MATCH_COPY.courses.empty}</p>
              ) : (
                <ul aria-label={CREDIT_MATCH_COPY.courses.listLabel} className={styles.entryList}>
                  {summary.courses.map((courseItem, index) => {
                    const resolvedByAreaId = new Map(
                      courseItem.resolvedAllocations.map((item) => [item.areaId, item]),
                    );
                    const allocationByAreaId = new Map(
                      courseItem.course.allocations.map((item) => [item.areaId, item]),
                    );
                    const transcriptDisplay =
                      courseItem.parsedCredits !== null
                        ? formatCredits(courseItem.parsedCredits)
                        : '0';

                    return (
                      <li key={courseItem.course.id} className={styles.courseItem}>
                        <div className={styles.courseItemHead}>
                          <span className={styles.courseNumber} aria-hidden="true">
                            {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="nav"
                            className={styles.removeButton}
                            aria-label={CREDIT_MATCH_COPY.courses.removeAriaLabel(
                              courseItem.course.title,
                            )}
                            onClick={() => {
                              applyChange((current) => removeCourse(current, courseItem.course.id));
                              focusField('cm-new-course-title');
                            }}
                          >
                            {CREDIT_MATCH_COPY.courses.removeButton}
                          </Button>
                        </div>

                        <div className={styles.addCourseFields}>
                          <TextInput
                            id={`cm-course-title-${courseItem.course.id}`}
                            maxLength={CREDIT_INPUT_LENGTHS.text}
                            label={CREDIT_MATCH_COPY.courses.editTitleLabel(index + 1)}
                            value={courseItem.course.title}
                            onChange={(event) => {
                              const { value } = event.currentTarget;
                              applyChange((current) =>
                                updateCourseField(current, courseItem.course.id, 'title', value),
                              );
                            }}
                            error={
                              courseItem.course.title.trim() === ''
                                ? CREDIT_MATCH_COPY.courses.errors.missingTitle
                                : null
                            }
                          />
                          <TextInput
                            id={`cm-course-credits-${courseItem.course.id}`}
                            maxLength={CREDIT_INPUT_LENGTHS.credits}
                            type="text"
                            inputMode="decimal"
                            label={CREDIT_MATCH_COPY.courses.editCreditsLabel(
                              courseItem.course.title,
                            )}
                            value={courseItem.course.credits}
                            onChange={(event) => {
                              const { value } = event.currentTarget;
                              applyChange((current) =>
                                updateCourseField(current, courseItem.course.id, 'credits', value),
                              );
                            }}
                            error={
                              courseItem.invalidCredits || courseItem.course.credits.trim() === ''
                                ? CREDIT_MATCH_COPY.courses.errors.invalidCredits
                                : null
                            }
                          />
                          <TextInput
                            id={`cm-course-ref-${courseItem.course.id}`}
                            maxLength={CREDIT_INPUT_LENGTHS.link}
                            label={CREDIT_MATCH_COPY.courses.editModuleRefLabel(
                              courseItem.course.title,
                            )}
                            placeholder={CREDIT_MATCH_COPY.courses.moduleRefPlaceholder}
                            value={courseItem.course.moduleRef}
                            onChange={(event) => {
                              const { value } = event.currentTarget;
                              applyChange((current) =>
                                updateCourseField(
                                  current,
                                  courseItem.course.id,
                                  'moduleRef',
                                  value,
                                ),
                              );
                            }}
                          />
                        </div>

                        <fieldset className={styles.mappingFieldset}>
                          <legend className={styles.mappingLegend}>
                            {CREDIT_MATCH_COPY.courses.mappingLegend(courseItem.course.title)}
                          </legend>
                          {worksheet.areas.length === 0 ? (
                            <p className={styles.emptyHint}>
                              {CREDIT_MATCH_COPY.courses.noAreasHint}
                            </p>
                          ) : (
                            <div className={styles.allocationRows}>
                              {worksheet.areas.map((area, areaIndex) => {
                                const allocation = allocationByAreaId.get(area.id);
                                const resolved = resolvedByAreaId.get(area.id);
                                const isChecked = Boolean(allocation);
                                const areaName = area.name.trim() || CREDIT_MATCH_COPY.areas.unnamed(areaIndex + 1);

                                return (
                                  <div key={area.id} className={styles.allocationRow}>
                                    <div className={styles.checkboxOption}>
                                      <Checkbox
                                        id={`cm-map-${courseItem.course.id}-${area.id}`}
                                        label={areaName}
                                        checked={isChecked}
                                        onChange={() =>
                                          applyChange((current) =>
                                            toggleCourseArea(current, courseItem.course.id, area.id),
                                          )
                                        }
                                      />
                                    </div>
                                    {isChecked && allocation && resolved ? (
                                      <TextInput
                                        id={`cm-share-${courseItem.course.id}-${area.id}`}
                                        maxLength={CREDIT_INPUT_LENGTHS.credits}
                                        type="text"
                                        inputMode="decimal"
                                        className={styles.shareInput}
                                        label={CREDIT_MATCH_COPY.courses.shareLabel(areaName)}
                                        placeholder={CREDIT_MATCH_COPY.courses.sharePlaceholder(
                                          formatCredits(resolved.automaticShare),
                                        )}
                                        value={allocation.credits}
                                        error={resolved.invalidInput}
                                        onChange={(event) => {
                                          const { value } = event.currentTarget;
                                          applyChange((current) =>
                                            setCourseAreaCredits(
                                              current,
                                              courseItem.course.id,
                                              area.id,
                                              value,
                                            ),
                                          );
                                        }}
                                      />
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </fieldset>

                        <div className={styles.courseFoot}>
                          <p className={styles.courseMappedNote}>
                            {courseItem.resolvedAllocations.length > 0
                              ? CREDIT_MATCH_COPY.courses.mappedSummary(
                                  formatCredits(courseItem.mappedCredits),
                                  transcriptDisplay,
                                )
                              : CREDIT_MATCH_COPY.courses.unmappedSummary}
                          </p>
                          {courseItem.exceedsCourseCredits ? (
                            <p role="status" className={styles.warningNote}>
                              {CREDIT_MATCH_COPY.courses.exceedsWarning(
                                formatCredits(courseItem.allocatedTotal),
                                transcriptDisplay,
                              )}
                            </p>
                          ) : null}
                          {courseItem.hasInvalidAllocation ? (
                            <p role="status" className={styles.warningNote}>
                              {CREDIT_MATCH_COPY.courses.invalidShareWarning}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Worksheet Summary & Print View */}
            <section
              aria-labelledby="credit-match-summary-heading"
              className={styles.summaryPanel}
              data-testid="credit-match-summary"
            >
              <div className={styles.summaryHead}>
                <h2 id="credit-match-summary-heading" className={styles.panelTitle}>
                  {CREDIT_MATCH_COPY.summary.heading}
                </h2>
                <p className={styles.totalsLine}>
                  {CREDIT_MATCH_COPY.summary.totalsLine(
                    summary.areas.length,
                    summary.courses.length,
                    formatCredits(summary.totalMappedCredits),
                    formatCredits(summary.totalTranscriptCredits),
                  )}
                </p>
              </div>

              <p className={styles.disclaimer} data-testid="worksheet-disclaimer">
                {CREDIT_MATCH_COPY.summary.disclaimer}
              </p>

              {hasContext ? (
                <dl className={styles.contextSummary} data-testid="programme-context-summary">
                  {universityText ? (
                    <div className={styles.contextPair}>
                      <dt>{CREDIT_MATCH_COPY.summary.contextLabels.university}</dt>
                      <dd>{universityText}</dd>
                    </div>
                  ) : null}
                  {programmeText ? (
                    <div className={styles.contextPair}>
                      <dt>{CREDIT_MATCH_COPY.summary.contextLabels.programme}</dt>
                      <dd>{programmeText}</dd>
                    </div>
                  ) : null}
                  {programmeUrlText ? (
                    <div className={styles.contextPair}>
                      <dt>{CREDIT_MATCH_COPY.summary.contextLabels.programmeUrl}</dt>
                      <dd>
                        {safeProgrammeUrl ? (
                          <a href={safeProgrammeUrl} target="_blank" rel="noopener">
                            {programmeUrlText}
                          </a>
                        ) : (
                          programmeUrlText
                        )}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}

              {summary.areas.length === 0 ? (
                <p className={styles.emptyHint}>{CREDIT_MATCH_COPY.summary.emptyTable}</p>
              ) : (
                <table
                  className={styles.summaryTable}
                  aria-labelledby="credit-match-summary-heading"
                  data-testid="area-summary-table"
                >
                  <thead>
                    <tr>
                      <th scope="col">{CREDIT_MATCH_COPY.summary.tableColumns.area}</th>
                      <th scope="col">{CREDIT_MATCH_COPY.summary.tableColumns.required}</th>
                      <th scope="col">{CREDIT_MATCH_COPY.summary.tableColumns.mapped}</th>
                      <th scope="col">{CREDIT_MATCH_COPY.summary.tableColumns.courses}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.areas.map((areaItem) => {
                      const requiredDisplay =
                        areaItem.parsedRequiredCredits !== null
                          ? formatCredits(areaItem.parsedRequiredCredits)
                          : areaItem.area.requiredCredits.trim();

                      return (
                        <tr key={areaItem.area.id} className={styles.summaryRow}>
                          <th scope="row" className={styles.areaCell}>
                            {areaItem.area.name}
                          </th>
                          <td className={styles.numberCell}>
                            <span aria-hidden="true" className={styles.mobileCellLabel}>
                              {CREDIT_MATCH_COPY.summary.mobileLabels.required}
                            </span>
                            {requiredDisplay}
                          </td>
                          <td className={styles.numberCell}>
                            <span aria-hidden="true" className={styles.mobileCellLabel}>
                              {CREDIT_MATCH_COPY.summary.mobileLabels.mapped}
                            </span>
                            {formatCredits(areaItem.mappedCredits)}
                          </td>
                          <td className={styles.coursesCell}>
                            {areaItem.mappedCourses.length === 0 ? (
                              <span className={styles.unmappedNote}>
                                {CREDIT_MATCH_COPY.summary.noMappedCourses}
                              </span>
                            ) : (
                              <ul className={styles.mappedCourseList}>
                                {areaItem.mappedCourses.map((mapped) => {
                                  const totalStr =
                                    mapped.transcriptCredits !== null
                                      ? formatCredits(mapped.transcriptCredits)
                                      : null;
                                  return (
                                    <li key={mapped.courseId} className={styles.mappedCourseItem}>
                                      <div className={styles.mappedCourseLine}>
                                        <strong>{mapped.title}</strong>
                                        <span className={styles.courseSharePill}>
                                          {CREDIT_MATCH_COPY.summary.courseShareBadge(
                                            formatCredits(mapped.mappedCredits),
                                            totalStr,
                                            mapped.isPartialOrSplit,
                                          )}
                                        </span>
                                      </div>
                                      <ModuleReferenceDisplay raw={mapped.moduleRef} />
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              <div className={styles.unmappedGrid}>
                <section
                  aria-labelledby="unmapped-areas-heading"
                  className={styles.unmappedCard}
                  data-testid="unmapped-areas"
                >
                  <h3 id="unmapped-areas-heading" className={styles.unmappedHeading}>
                    {CREDIT_MATCH_COPY.summary.unmappedAreas.heading}
                  </h3>
                  <p className={styles.unmappedLead}>
                    {CREDIT_MATCH_COPY.summary.unmappedAreas.lead}
                  </p>
                  {summary.areas.length === 0 ? (
                    <p className={styles.emptyHint}>
                      {CREDIT_MATCH_COPY.summary.unmappedAreas.emptyNoAreas}
                    </p>
                  ) : summary.unmappedAreas.length === 0 ? (
                    <p className={styles.emptyHint}>
                      {CREDIT_MATCH_COPY.summary.unmappedAreas.none}
                    </p>
                  ) : (
                    <ul className={styles.unmappedList}>
                      {summary.unmappedAreas.map((item) => {
                        const reqStr =
                          item.parsedRequiredCredits !== null
                            ? formatCredits(item.parsedRequiredCredits)
                            : item.area.requiredCredits.trim();
                        return (
                          <li key={item.area.id}>
                            <strong>{item.area.name}</strong>{' '}
                            <span className={styles.unmappedCredits}>
                              ({CREDIT_MATCH_COPY.summary.unmappedAreas.itemCredits(reqStr)})
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section
                  aria-labelledby="unmapped-courses-heading"
                  className={styles.unmappedCard}
                  data-testid="unmapped-courses"
                >
                  <h3 id="unmapped-courses-heading" className={styles.unmappedHeading}>
                    {CREDIT_MATCH_COPY.summary.unmappedCourses.heading}
                  </h3>
                  <p className={styles.unmappedLead}>
                    {CREDIT_MATCH_COPY.summary.unmappedCourses.lead}
                  </p>
                  {summary.courses.length === 0 ? (
                    <p className={styles.emptyHint}>
                      {CREDIT_MATCH_COPY.summary.unmappedCourses.emptyNoCourses}
                    </p>
                  ) : summary.unmappedCourses.length === 0 ? (
                    <p className={styles.emptyHint}>
                      {CREDIT_MATCH_COPY.summary.unmappedCourses.none}
                    </p>
                  ) : (
                    <ul className={styles.unmappedList}>
                      {summary.unmappedCourses.map((item) => {
                        const credStr =
                          item.parsedCredits !== null
                            ? formatCredits(item.parsedCredits)
                            : item.course.credits.trim();
                        return (
                          <li key={item.course.id}>
                            <div>
                              <strong>{item.course.title}</strong>{' '}
                              <span className={styles.unmappedCredits}>
                                ({CREDIT_MATCH_COPY.summary.unmappedCourses.itemCredits(credStr)})
                              </span>
                            </div>
                            {item.mappingNeedsCorrection ? (
                              <span className={styles.unmappedCredits}>
                                {CREDIT_MATCH_COPY.summary.unmappedCourses.needsCorrection}
                              </span>
                            ) : null}
                            <ModuleReferenceDisplay raw={item.course.moduleRef} />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>
            </section>

            {/* Sources & Requirements Guide Link */}
            <section
              aria-labelledby="credit-match-sources-heading"
              className={`${styles.sourcesSection} ${styles.noPrint}`}
            >
              <div className={styles.panelHead}>
                <h2 id="credit-match-sources-heading" className={styles.panelTitle}>
                  {CREDIT_MATCH_COPY.sourcesSection.heading}
                </h2>
              </div>

              <div className={styles.examplesGrid}>
                <div className={styles.sourceCard}>
                  <h3>{CREDIT_MATCH_COPY.sourcesSection.ects.heading}</h3>
                  <p>{CREDIT_MATCH_COPY.sourcesSection.ects.body}</p>
                  <SourceNote source={CREDIT_MATCH_COPY.sourcesSection.ects.source} />
                </div>

                {CREDIT_MATCH_COPY.sourcesSection.examples.map((example) => (
                  <div key={example.id} className={styles.sourceCard}>
                    <h3>{example.heading}</h3>
                    <p>{example.body}</p>
                    <SourceNote source={example.source} />
                  </div>
                ))}
              </div>

              <div className={styles.guideCallout}>
                <div className={styles.guideCalloutCopy}>
                  <h3>{CREDIT_MATCH_COPY.sourcesSection.guideLink.heading}</h3>
                  <p>{CREDIT_MATCH_COPY.sourcesSection.guideLink.body}</p>
                </div>
                <Button
                  component={Link}
                  to={CREDIT_MATCH_COPY.sourcesSection.guideLink.href}
                  variant="navy"
                  size="lg"
                >
                  {CREDIT_MATCH_COPY.sourcesSection.guideLink.label}
                </Button>
              </div>
            </section>
          </div>
        </ContentContainer>
      </section>
    </main>
  );
}
