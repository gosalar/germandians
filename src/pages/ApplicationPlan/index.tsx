import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';
import {
  PLAN_INPUT_LENGTHS,
  buildIcsCalendar,
  buildPlanCsv,
  clearPlan,
  getProgrammeUrl,
  isValidIsoDate,
  isValidProgrammeUrl,
  nextUpcomingDate,
  readPlan,
  sortDateEntries,
  sortProgrammesByUpcomingDate,
  todayIsoLocal,
  writePlan,
  type ApplicationRoute,
  type DocumentStatus,
  type PlanDateEntry,
  type PlanDocumentItem,
  type PlannedProgramme,
} from '@/utils/applicationPlan';
import { SECTIONS } from '@/utils/constants';

import {
  APPLICATION_PLAN_COPY,
  APPLICATION_ROUTE_OPTIONS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_OPTIONS,
  ROUTE_LABELS,
} from './data';
import styles from './styles.module.scss';

interface ProgrammeDraftValues {
  name: string;
  university: string;
  url: string;
  route: ApplicationRoute;
}

interface DateDraftValues {
  date: string;
  label: string;
}

interface DocumentDraftValues {
  label: string;
  status: DocumentStatus;
}

const INITIAL_PROGRAMME_VALUES: ProgrammeDraftValues = {
  name: '',
  university: '',
  url: '',
  route: 'direct',
};

const PROGRAMME_VALIDATE = {
  name: (value: string) => (value.trim() ? null : APPLICATION_PLAN_COPY.form.nameError),
  university: (value: string) => (value.trim() ? null : APPLICATION_PLAN_COPY.form.universityError),
  url: (value: string) => (isValidProgrammeUrl(value) ? null : APPLICATION_PLAN_COPY.form.urlError),
};

const DATE_VALIDATE = {
  date: (value: string) => (isValidIsoDate(value) ? null : APPLICATION_PLAN_COPY.dates.dateError),
  label: (value: string) => (value.trim() ? null : APPLICATION_PLAN_COPY.dates.labelError),
};

const DOCUMENT_VALIDATE = {
  label: (value: string) => (value.trim() ? null : APPLICATION_PLAN_COPY.documents.itemError),
};

function createItemId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${suffix}`;
}

function focusFieldById(id: string): void {
  requestAnimationFrame(() => {
    const element = document.getElementById(id);
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: 'nearest' });
  });
}

function downloadBrowserFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

interface RouteSelectorProps {
  namePrefix: string;
  value: ApplicationRoute;
  onChange: (next: ApplicationRoute) => void;
}

function RouteSelector({ namePrefix, value, onChange }: RouteSelectorProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{APPLICATION_PLAN_COPY.form.routeLegend}</legend>
      <p className={styles.fieldHint}>{APPLICATION_PLAN_COPY.form.routeHint}</p>
      <div className={styles.routeList}>
        {APPLICATION_ROUTE_OPTIONS.map((option) => {
          const inputId = `${namePrefix}-route-${option.value}`;
          const selected = value === option.value;
          return (
            <div key={option.value} className={styles.routeRow} data-selected={selected || undefined}>
              <label htmlFor={inputId} className={styles.routeLabel}>
                <input
                  id={inputId}
                  type="radio"
                  name={`${namePrefix}-route`}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className={styles.radioInput}
                />
                <span>{option.label}</span>
              </label>
              <Link to={option.guideHref} className={styles.routeGuideLink}>
                {option.guideLabel}
              </Link>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

interface ProgrammeCardProps {
  programme: PlannedProgramme;
  order: number;
  referenceDate: string | null;
  onUpdateDetails: (id: string, details: ProgrammeDraftValues) => void;
  onRemoveProgramme: (id: string) => void;
  onAddDate: (programmeId: string, entry: PlanDateEntry) => void;
  onRemoveDate: (programmeId: string, dateId: string) => void;
  onAddDocument: (programmeId: string, item: PlanDocumentItem) => void;
  onSetDocumentStatus: (programmeId: string, docId: string, status: DocumentStatus) => void;
  onRemoveDocument: (programmeId: string, docId: string) => void;
}

function ProgrammeCard({
  programme,
  order,
  referenceDate,
  onUpdateDetails,
  onRemoveProgramme,
  onAddDate,
  onRemoveDate,
  onAddDocument,
  onSetDocumentStatus,
  onRemoveDocument,
}: ProgrammeCardProps) {
  const baseId = useId();
  const [editing, setEditing] = useState(false);

  const editForm = useForm<ProgrammeDraftValues>({
    mode: 'controlled',
    initialValues: {
      name: programme.name,
      university: programme.university,
      url: programme.url,
      route: programme.route,
    },
    validate: PROGRAMME_VALIDATE,
  });

  const dateForm = useForm<DateDraftValues>({
    mode: 'controlled',
    initialValues: { date: '', label: '' },
    validate: DATE_VALIDATE,
  });

  const documentForm = useForm<DocumentDraftValues>({
    mode: 'controlled',
    initialValues: { label: '', status: 'missing' },
    validate: DOCUMENT_VALIDATE,
  });

  const orderedDates = sortDateEntries(programme.dates);
  const upcoming = nextUpcomingDate(programme, referenceDate);
  const readyCount = programme.documents.filter((doc) => doc.status === 'ready').length;
  const missingCount = programme.documents.length - readyCount;
  const programmeUrl = getProgrammeUrl(programme.url);

  const startEditing = () => {
    editForm.setValues({
      name: programme.name,
      university: programme.university,
      url: programme.url,
      route: programme.route,
    });
    editForm.clearErrors();
    setEditing(true);
    focusFieldById(openEditNameId);
  };

  const openEditNameId = `${baseId}-edit-name`;
  const openEditUnivId = `${baseId}-edit-university`;
  const openEditUrlId = `${baseId}-edit-url`;
  const dateInputId = `${baseId}-date-value`;
  const dateLabelId = `${baseId}-date-label`;
  const docLabelId = `${baseId}-doc-label`;
  const headingId = `${baseId}-programme-heading`;
  const editButtonId = `${baseId}-edit-button`;

  const closeEditor = () => {
    setEditing(false);
    focusFieldById(editButtonId);
  };

  return (
    <li className={styles.programmeItem}>
      <article aria-labelledby={headingId} className={styles.programmeCard} data-testid="programme-card">
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <div className={styles.cardTitleRow}>
              <span className={styles.orderBadge} aria-hidden="true">
                {order}
              </span>
              <h3 id={headingId} className={styles.programmeName} data-testid="programme-card-name">
                {programme.name}
              </h3>
            </div>
            <p className={styles.universityName}>{programme.university}</p>
          </div>

          {upcoming ? (
            <span className={styles.nextDatePill} data-tone="upcoming" data-testid="programme-next-date">
              {APPLICATION_PLAN_COPY.plan.nextDateBadge(upcoming.date, upcoming.label)}
            </span>
          ) : orderedDates.length > 0 ? (
            <span className={styles.nextDatePill} data-tone="past" data-testid="programme-next-date">
              {APPLICATION_PLAN_COPY.plan.pastDatesBadge}
            </span>
          ) : (
            <span className={styles.nextDatePill} data-tone="empty" data-testid="programme-next-date">
              {APPLICATION_PLAN_COPY.plan.noDatesBadge}
            </span>
          )}
        </div>

        <div className={styles.cardMeta}>
          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>{APPLICATION_PLAN_COPY.plan.routePrefix}</span>
            <span className={styles.metaValue}>{ROUTE_LABELS[programme.route]}</span>
            <Link to={APPLICATION_PLAN_COPY.guidance.applyingLinkHref} className={styles.inlineGuideLink}>
              {APPLICATION_PLAN_COPY.guidance.applyingLinkLabel}
            </Link>
          </p>

          {programmeUrl ? (
            <p className={styles.metaRow}>
              <a href={programmeUrl} target="_blank" rel="noopener" className={styles.externalLink}>
                {APPLICATION_PLAN_COPY.plan.openProgrammePage}
              </a>
              <span className={styles.printUrl}>{programme.url.trim()}</span>
            </p>
          ) : null}
        </div>

        {editing ? (
          <form
            className={styles.editBox}
            noValidate
            onSubmit={(event) =>
              editForm.onSubmit(
                (values) => {
                  onUpdateDetails(programme.id, {
                    name: values.name.trim(),
                    university: values.university.trim(),
                    url: values.url.trim(),
                    route: values.route,
                  });
                  closeEditor();
                },
                (errors) => {
                  if (errors.name) focusFieldById(openEditNameId);
                  else if (errors.university) focusFieldById(openEditUnivId);
                  else if (errors.url) focusFieldById(openEditUrlId);
                },
              )(event)
            }
          >
            <h4 className={styles.subSectionTitle}>{APPLICATION_PLAN_COPY.form.editHeading}</h4>
            <TextInput
              id={openEditNameId}
              maxLength={PLAN_INPUT_LENGTHS.name}
              label={APPLICATION_PLAN_COPY.form.nameLabel}
              placeholder={APPLICATION_PLAN_COPY.form.namePlaceholder}
              {...editForm.getInputProps('name')}
            />
            <TextInput
              id={openEditUnivId}
              maxLength={PLAN_INPUT_LENGTHS.university}
              label={APPLICATION_PLAN_COPY.form.universityLabel}
              placeholder={APPLICATION_PLAN_COPY.form.universityPlaceholder}
              {...editForm.getInputProps('university')}
            />
            <TextInput
              id={openEditUrlId}
              maxLength={PLAN_INPUT_LENGTHS.url}
              inputMode="url"
              label={APPLICATION_PLAN_COPY.form.urlLabel}
              placeholder={APPLICATION_PLAN_COPY.form.urlPlaceholder}
              {...editForm.getInputProps('url')}
            />
            <RouteSelector
              namePrefix={`${baseId}-edit`}
              value={editForm.values.route}
              onChange={(route) => editForm.setFieldValue('route', route)}
            />
            <div className={styles.editActions}>
              <Button type="submit" variant="navy" size="md">
                {APPLICATION_PLAN_COPY.form.saveEditLabel}
              </Button>
              <Button type="button" variant="outline" size="md" onClick={closeEditor}>
                {APPLICATION_PLAN_COPY.form.cancelEditLabel}
              </Button>
            </div>
          </form>
        ) : null}

        <div className={styles.subSection}>
          <div className={styles.subSectionHead}>
            <h4 className={styles.subSectionTitle}>{APPLICATION_PLAN_COPY.dates.heading}</h4>
          </div>

          {orderedDates.length > 0 ? (
            <ul className={styles.entryList}>
              {orderedDates.map((entry) => (
                <li key={entry.id} className={styles.entryRow}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateCode}>{entry.date}</span>
                    <span className={styles.dateText}>{entry.label}</span>
                  </div>
                  <div className={styles.entryControls}>
                    <Button
                      type="button"
                      variant="outline"
                      size="nav"
                      className={styles.compactButton}
                      aria-label={APPLICATION_PLAN_COPY.dates.removeAria(entry.date, entry.label, programme.name)}
                      onClick={() => {
                        onRemoveDate(programme.id, entry.id);
                        focusFieldById(dateInputId);
                      }}
                    >
                      {APPLICATION_PLAN_COPY.dates.removeButton}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.subEmpty}>{APPLICATION_PLAN_COPY.dates.empty}</p>
          )}

          <form
            className={styles.inlineForm}
            noValidate
            onSubmit={(event) =>
              dateForm.onSubmit(
                (values) => {
                  onAddDate(programme.id, {
                    id: createItemId('date'),
                    date: values.date.trim(),
                    label: values.label.trim(),
                  });
                  dateForm.reset();
                  focusFieldById(dateInputId);
                },
                (errors) => {
                  if (errors.date) focusFieldById(dateInputId);
                  else if (errors.label) focusFieldById(dateLabelId);
                },
              )(event)
            }
          >
            <TextInput
              id={dateInputId}
              label={APPLICATION_PLAN_COPY.dates.dateLabel}
              placeholder={APPLICATION_PLAN_COPY.dates.datePlaceholder}
              {...dateForm.getInputProps('date')}
            />
            <TextInput
              id={dateLabelId}
              maxLength={PLAN_INPUT_LENGTHS.dateLabel}
              label={APPLICATION_PLAN_COPY.dates.labelFieldLabel}
              placeholder={APPLICATION_PLAN_COPY.dates.labelPlaceholder}
              {...dateForm.getInputProps('label')}
            />
            <div className={styles.inlineFormFull}>
              <Button type="submit" variant="navy" size="md">
                {APPLICATION_PLAN_COPY.dates.addButton}
              </Button>
            </div>
          </form>
        </div>

        <div className={styles.subSection}>
          <div className={styles.subSectionHead}>
            <h4 className={styles.subSectionTitle}>{APPLICATION_PLAN_COPY.documents.heading}</h4>
            {programme.documents.length > 0 ? (
              <span className={styles.docSummary}>
                {APPLICATION_PLAN_COPY.documents.summary(readyCount, missingCount)}
              </span>
            ) : null}
          </div>

          {programme.documents.length > 0 ? (
            <ul className={styles.entryList}>
              {programme.documents.map((item) => (
                <li key={item.id} className={styles.entryRow}>
                  <div className={styles.docInfo}>
                    <span className={styles.docLabel}>{item.label}</span>
                    <span className={styles.docStatusBadge} data-status={item.status}>
                      {DOCUMENT_STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <div className={styles.entryControls}>
                    <div
                      role="group"
                      aria-label={APPLICATION_PLAN_COPY.documents.statusGroupAria(item.label, programme.name)}
                      className={styles.statusToggleGroup}
                    >
                      {DOCUMENT_STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={item.status === option.value}
                          className={styles.statusToggle}
                          onClick={() => onSetDocumentStatus(programme.id, item.id, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="nav"
                      className={styles.compactButton}
                      aria-label={APPLICATION_PLAN_COPY.documents.removeAria(item.label, programme.name)}
                      onClick={() => {
                        onRemoveDocument(programme.id, item.id);
                        focusFieldById(docLabelId);
                      }}
                    >
                      {APPLICATION_PLAN_COPY.documents.removeButton}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.subEmpty}>{APPLICATION_PLAN_COPY.documents.empty}</p>
          )}

          <form
            className={styles.inlineForm}
            noValidate
            onSubmit={(event) =>
              documentForm.onSubmit(
                (values) => {
                  onAddDocument(programme.id, {
                    id: createItemId('doc'),
                    label: values.label.trim(),
                    status: values.status,
                  });
                  documentForm.reset();
                  focusFieldById(docLabelId);
                },
                () => focusFieldById(docLabelId),
              )(event)
            }
          >
            <div className={styles.inlineFormFull}>
              <TextInput
                id={docLabelId}
                maxLength={PLAN_INPUT_LENGTHS.document}
                label={APPLICATION_PLAN_COPY.documents.itemLabel}
                placeholder={APPLICATION_PLAN_COPY.documents.itemPlaceholder}
                {...documentForm.getInputProps('label')}
              />
            </div>
            <fieldset className={`${styles.fieldset} ${styles.inlineFormFull}`}>
              <legend className={styles.legend}>{APPLICATION_PLAN_COPY.documents.initialStatusLegend}</legend>
              <div className={styles.docStatusRadios}>
                {DOCUMENT_STATUS_OPTIONS.map((option) => {
                  const statusInputId = `${baseId}-doc-init-${option.value}`;
                  const selected = documentForm.values.status === option.value;
                  return (
                    <label
                      key={option.value}
                      htmlFor={statusInputId}
                      className={styles.docRadioLabel}
                      data-selected={selected || undefined}
                    >
                      <input
                        id={statusInputId}
                        type="radio"
                        name={`${baseId}-doc-init-status`}
                        value={option.value}
                        checked={selected}
                        onChange={() => documentForm.setFieldValue('status', option.value)}
                        className={styles.radioInput}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className={styles.inlineFormFull}>
              <Button type="submit" variant="navy" size="md">
                {APPLICATION_PLAN_COPY.documents.addButton}
              </Button>
            </div>
          </form>
        </div>

        <div className={styles.cardActions}>
          {!editing ? (
            <Button
              id={editButtonId}
              type="button"
              variant="outline"
              size="nav"
              className={styles.compactButton}
              aria-label={APPLICATION_PLAN_COPY.plan.editProgrammeAria(programme.name, programme.university)}
              onClick={startEditing}
            >
              {APPLICATION_PLAN_COPY.plan.editProgramme}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ring"
            size="nav"
            className={styles.compactButton}
            aria-label={APPLICATION_PLAN_COPY.plan.removeProgrammeAria(programme.name, programme.university)}
            onClick={() => onRemoveProgramme(programme.id)}
          >
            {APPLICATION_PLAN_COPY.plan.removeProgramme}
          </Button>
        </div>
      </article>
    </li>
  );
}

interface PlanViewState {
  today: string | null;
  programmes: PlannedProgramme[];
  storageState: 'ok' | 'failed' | 'discarded';
  statusMessage: string;
}

type PlanViewAction =
  | {
      type: 'load';
      programmes: PlannedProgramme[];
      storageState: 'ok' | 'failed' | 'discarded';
    }
  | {
      type: 'commit';
      programmes: PlannedProgramme[];
      saved: boolean;
      statusMessage?: string;
    }
  | {
      type: 'clear';
      cleared: boolean;
      statusMessage: string;
    }
  | {
      type: 'status';
      statusMessage: string;
    }
  | { type: 'set-today'; today: string };

const INITIAL_PLAN_VIEW_STATE: PlanViewState = {
  today: null,
  programmes: [],
  storageState: 'ok',
  statusMessage: '',
};

function planViewReducer(state: PlanViewState, action: PlanViewAction): PlanViewState {
  switch (action.type) {
    case 'load':
      return {
        ...state,
        programmes: action.programmes,
        storageState: action.storageState,
      };
    case 'commit':
      return {
        ...state,
        programmes: action.programmes,
        storageState: action.saved ? 'ok' : 'failed',
        statusMessage: action.statusMessage ?? state.statusMessage,
      };
    case 'clear':
      return {
        ...state,
        programmes: [],
        storageState: action.cleared ? 'ok' : 'failed',
        statusMessage: action.statusMessage,
      };
    case 'status':
      return {
        ...state,
        statusMessage: action.statusMessage,
      };
    case 'set-today':
      return state.today === action.today ? state : { ...state, today: action.today };
  }
}

export default function ApplicationPlan() {
  useSettleHashScroll();

  const [state, dispatch] = useReducer(planViewReducer, INITIAL_PLAN_VIEW_STATE);
  const { today, programmes, storageState, statusMessage } = state;
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

  const addForm = useForm<ProgrammeDraftValues>({
    mode: 'controlled',
    initialValues: INITIAL_PROGRAMME_VALUES,
    validate: PROGRAMME_VALIDATE,
  });

  useEffect(() => {
    const loaded = readPlan();
    dispatch({
      type: 'load',
      programmes: loaded.programmes,
      storageState: loaded.failed ? 'failed' : loaded.discarded ? 'discarded' : 'ok',
    });

    let clockTimer: number | undefined;
    const updateToday = () => {
      window.clearTimeout(clockTimer);
      const now = new Date();
      dispatch({ type: 'set-today', today: todayIsoLocal(now) });
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      clockTimer = window.setTimeout(updateToday, midnight.getTime() - now.getTime());
    };
    updateToday();
    window.addEventListener('focus', updateToday);
    return () => {
      window.clearTimeout(clockTimer);
      window.removeEventListener('focus', updateToday);
    };
  }, []);

  const commitProgrammes = (next: PlannedProgramme[], nextMessage?: string) => {
    const saved = writePlan(next);
    dispatch({ type: 'commit', programmes: next, saved, statusMessage: nextMessage });
  };

  const sortedProgrammes = sortProgrammesByUpcomingDate(programmes, today);
  const totalDates = programmes.reduce((sum, programme) => sum + programme.dates.length, 0);

  const handleAddProgramme = (values: ProgrammeDraftValues) => {
    const created: PlannedProgramme = {
      id: createItemId('prog'),
      name: values.name.trim(),
      university: values.university.trim(),
      url: values.url.trim(),
      route: values.route,
      dates: [],
      documents: [],
    };
    commitProgrammes([...programmes, created], APPLICATION_PLAN_COPY.statusMessages.programmeAdded(created.name));
    addForm.reset();
    focusFieldById('plan-programme-name');
  };

  const handleUpdateDetails = (id: string, details: ProgrammeDraftValues) => {
    const next = programmes.map((programme) =>
      programme.id === id ? { ...programme, ...details } : programme,
    );
    commitProgrammes(next, APPLICATION_PLAN_COPY.statusMessages.programmeUpdated(details.name));
  };

  const handleRemoveProgramme = (id: string) => {
    const removed = programmes.find((programme) => programme.id === id);
    commitProgrammes(
      programmes.filter((programme) => programme.id !== id),
      removed ? APPLICATION_PLAN_COPY.statusMessages.programmeRemoved(removed.name) : undefined,
    );
    focusFieldById('plan-programme-name');
  };

  const handleAddDate = (programmeId: string, entry: PlanDateEntry) => {
    const next = programmes.map((programme) =>
      programme.id === programmeId ? { ...programme, dates: [...programme.dates, entry] } : programme,
    );
    commitProgrammes(next);
  };

  const handleRemoveDate = (programmeId: string, dateId: string) => {
    const next = programmes.map((programme) =>
      programme.id === programmeId
        ? { ...programme, dates: programme.dates.filter((entry) => entry.id !== dateId) }
        : programme,
    );
    commitProgrammes(next);
  };

  const handleAddDocument = (programmeId: string, item: PlanDocumentItem) => {
    const next = programmes.map((programme) =>
      programme.id === programmeId ? { ...programme, documents: [...programme.documents, item] } : programme,
    );
    commitProgrammes(next);
  };

  const handleSetDocumentStatus = (programmeId: string, docId: string, status: DocumentStatus) => {
    const next = programmes.map((programme) =>
      programme.id === programmeId
        ? {
            ...programme,
            documents: programme.documents.map((doc) => (doc.id === docId ? { ...doc, status } : doc)),
          }
        : programme,
    );
    commitProgrammes(next);
  };

  const handleRemoveDocument = (programmeId: string, docId: string) => {
    const next = programmes.map((programme) =>
      programme.id === programmeId
        ? { ...programme, documents: programme.documents.filter((doc) => doc.id !== docId) }
        : programme,
    );
    commitProgrammes(next);
  };

  const closeClearConfirm = () => {
    restoreClearFocus.current = true;
    setConfirmingClear(false);
  };

  const handleClearEntries = () => {
    closeClearConfirm();
    addForm.reset();
    const cleared = clearPlan();
    dispatch({
      type: 'clear',
      cleared,
      statusMessage: cleared
        ? APPLICATION_PLAN_COPY.statusMessages.cleared
        : APPLICATION_PLAN_COPY.statusMessages.clearFailed,
    });
  };

  const handleDownloadIcs = () => {
    if (totalDates === 0) {
      dispatch({ type: 'status', statusMessage: APPLICATION_PLAN_COPY.statusMessages.icsNoDates });
      return;
    }
    const calendar = buildIcsCalendar(sortedProgrammes, {
      now: new Date(),
      formatSummary: APPLICATION_PLAN_COPY.exports.icsSummary,
      formatDescription: APPLICATION_PLAN_COPY.exports.icsDescription,
    });
    downloadBrowserFile(
      APPLICATION_PLAN_COPY.toolbar.icsFilename,
      calendar,
      'text/calendar;charset=utf-8',
    );
    dispatch({ type: 'status', statusMessage: APPLICATION_PLAN_COPY.statusMessages.icsDownloaded });
  };

  const handleDownloadCsv = () => {
    if (sortedProgrammes.length === 0) {
      dispatch({ type: 'status', statusMessage: APPLICATION_PLAN_COPY.statusMessages.csvNoProgrammes });
      return;
    }
    const csv = buildPlanCsv(sortedProgrammes, {
      headers: APPLICATION_PLAN_COPY.exports.csvHeaders,
      routeLabels: ROUTE_LABELS,
      referenceDate: today,
      formatDatePair: APPLICATION_PLAN_COPY.exports.formatDatePair,
    });
    // The byte order mark makes Excel read umlauts and the euro sign as UTF-8.
    downloadBrowserFile(APPLICATION_PLAN_COPY.toolbar.csvFilename, `\uFEFF${csv}`, 'text/csv;charset=utf-8');
    dispatch({ type: 'status', statusMessage: APPLICATION_PLAN_COPY.statusMessages.csvDownloaded });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <section id={SECTIONS.top} className={styles.section}>
        <ContentContainer width="wide">
          <PageHeader
            title={APPLICATION_PLAN_COPY.title}
            introduction={APPLICATION_PLAN_COPY.lede}
            variant="compact"
            leading={
              <div className={styles.badges}>
                {APPLICATION_PLAN_COPY.badges.map((badge, index) => (
                  <span key={badge} className={styles.badge} data-tone={index === 0 ? 'green' : undefined}>
                    {badge}
                  </span>
                ))}
              </div>
            }
          />

          <details className={styles.guidanceCard}>
            <summary className={styles.guidanceSummary}>{APPLICATION_PLAN_COPY.guidance.summary}</summary>
            <div className={styles.guidanceBody}>
              <p className={styles.guidanceText}>
                {APPLICATION_PLAN_COPY.guidance.uniAssist}{' '}
                <SourceNote source={APPLICATION_PLAN_COPY.guidance.uniAssistSource} />
              </p>
              <p className={styles.guidanceText}>
                {APPLICATION_PLAN_COPY.guidance.vpd}{' '}
                <SourceNote source={APPLICATION_PLAN_COPY.guidance.vpdSource} />
              </p>
              <p className={styles.guidanceText}>{APPLICATION_PLAN_COPY.guidance.datesNote}</p>
              <p className={styles.guidanceLinks}>
                <span>{APPLICATION_PLAN_COPY.guidance.guideLinksPrefix}</span>
                <Link to={APPLICATION_PLAN_COPY.guidance.applyingLinkHref} className={styles.inlineGuideLink}>
                  {APPLICATION_PLAN_COPY.guidance.applyingLinkLabel}
                </Link>
                <Link to={APPLICATION_PLAN_COPY.guidance.deadlinesLinkHref} className={styles.inlineGuideLink}>
                  {APPLICATION_PLAN_COPY.guidance.deadlinesLinkLabel}
                </Link>
              </p>
            </div>
          </details>

          <div className={styles.toolbar}>
            <div className={styles.toolbarTop}>
              <div className={styles.storageNotes}>
                <p className={styles.storageNote}>{APPLICATION_PLAN_COPY.toolbar.storageNote}</p>
                {storageState === 'failed' ? (
                  <p role="alert" className={styles.storageWarning}>
                    {APPLICATION_PLAN_COPY.toolbar.storageFailedNote}
                  </p>
                ) : null}
                {storageState === 'discarded' ? (
                  <p role="status" className={styles.storageNote}>
                    {APPLICATION_PLAN_COPY.toolbar.storageDiscardedNote}
                  </p>
                ) : null}
              </div>

              <div className={styles.toolbarActions}>
                <Button type="button" variant="navy" size="md" onClick={handleDownloadIcs}>
                  {APPLICATION_PLAN_COPY.toolbar.downloadIcs}
                </Button>
                <Button type="button" variant="outline" size="md" onClick={handleDownloadCsv}>
                  {APPLICATION_PLAN_COPY.toolbar.downloadCsv}
                </Button>
                <Button type="button" variant="outline" size="md" onClick={handlePrint}>
                  {APPLICATION_PLAN_COPY.toolbar.printPlan}
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
                      {APPLICATION_PLAN_COPY.toolbar.clearConfirmPrompt}
                    </span>
                    <Button
                      ref={confirmClearRef}
                      type="button"
                      variant="navy"
                      size="md"
                      onClick={handleClearEntries}
                    >
                      {APPLICATION_PLAN_COPY.toolbar.clearConfirmYes}
                    </Button>
                    <Button type="button" variant="outline" size="md" onClick={closeClearConfirm}>
                      {APPLICATION_PLAN_COPY.toolbar.clearConfirmCancel}
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
                    {APPLICATION_PLAN_COPY.toolbar.clearEntries}
                  </Button>
                )}
              </div>
            </div>

            <p role="status" aria-live="polite" className={styles.liveStatus}>
              {statusMessage}
            </p>
          </div>

          <div className={styles.workbench}>
            <div className={styles.formPaper}>
              <div className={styles.paperHead}>
                <p className={styles.germanBanner}>
                  <span lang="de" className={styles.germanWord}>
                    {APPLICATION_PLAN_COPY.germanTerm}
                  </span>
                  <span className={styles.germanMeaning}>{APPLICATION_PLAN_COPY.germanMeaning}</span>
                </p>
                <h2 className={styles.sectionHeading}>{APPLICATION_PLAN_COPY.form.heading}</h2>
                <p className={styles.paperSub}>{APPLICATION_PLAN_COPY.form.subtitle}</p>
              </div>

              <form
                className={styles.programmeForm}
                noValidate
                onSubmit={(event) =>
                  addForm.onSubmit(handleAddProgramme, (errors) => {
                    if (errors.name) focusFieldById('plan-programme-name');
                    else if (errors.university) focusFieldById('plan-university');
                    else if (errors.url) focusFieldById('plan-programme-url');
                  })(event)
                }
              >
                <TextInput
                  id="plan-programme-name"
                  maxLength={PLAN_INPUT_LENGTHS.name}
                  label={APPLICATION_PLAN_COPY.form.nameLabel}
                  placeholder={APPLICATION_PLAN_COPY.form.namePlaceholder}
                  {...addForm.getInputProps('name')}
                />
                <TextInput
                  id="plan-university"
                  maxLength={PLAN_INPUT_LENGTHS.university}
                  label={APPLICATION_PLAN_COPY.form.universityLabel}
                  placeholder={APPLICATION_PLAN_COPY.form.universityPlaceholder}
                  {...addForm.getInputProps('university')}
                />
                <TextInput
                  id="plan-programme-url"
                  maxLength={PLAN_INPUT_LENGTHS.url}
                  inputMode="url"
                  label={APPLICATION_PLAN_COPY.form.urlLabel}
                  placeholder={APPLICATION_PLAN_COPY.form.urlPlaceholder}
                  {...addForm.getInputProps('url')}
                />

                <RouteSelector
                  namePrefix="plan-new"
                  value={addForm.values.route}
                  onChange={(route) => addForm.setFieldValue('route', route)}
                />

                <Button type="submit" variant="navy" size="submit">
                  {APPLICATION_PLAN_COPY.form.submitLabel}
                </Button>
              </form>
            </div>

            <div className={styles.planColumn}>
              <div className={styles.planHead}>
                <h2 className={styles.sectionHeading}>{APPLICATION_PLAN_COPY.plan.heading}</h2>
                <p className={styles.paperSub}>{APPLICATION_PLAN_COPY.plan.sortNote}</p>
                <p className={styles.printNote}>{APPLICATION_PLAN_COPY.plan.printNote}</p>
              </div>

              {sortedProgrammes.length > 0 ? (
                <ol className={styles.programmeList}>
                  {sortedProgrammes.map((programme, index) => (
                    <ProgrammeCard
                      key={programme.id}
                      programme={programme}
                      order={index + 1}
                      referenceDate={today}
                      onUpdateDetails={handleUpdateDetails}
                      onRemoveProgramme={handleRemoveProgramme}
                      onAddDate={handleAddDate}
                      onRemoveDate={handleRemoveDate}
                      onAddDocument={handleAddDocument}
                      onSetDocumentStatus={handleSetDocumentStatus}
                      onRemoveDocument={handleRemoveDocument}
                    />
                  ))}
                </ol>
              ) : (
                <div className={styles.emptyCard}>
                  <h3 className={styles.emptyTitle}>{APPLICATION_PLAN_COPY.plan.emptyTitle}</h3>
                  <p className={styles.emptyBody}>{APPLICATION_PLAN_COPY.plan.emptyBody}</p>
                </div>
              )}
            </div>
          </div>
        </ContentContainer>
      </section>
    </main>
  );
}
