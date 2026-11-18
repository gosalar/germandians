import { SOURCES, UNI_ASSIST } from '@/utils/applicationFacts';
import type { ApplicationRoute, DocumentStatus, PlanDateEntry, PlannedProgramme } from '@/utils/applicationPlan';
import { NO_LOGIN_NEEDED } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';

export const APPLICATION_ROUTE_OPTIONS = [
  {
    value: 'direct',
    label: 'Direct to the university',
    guideHref: requirementsHref('applying'),
    guideLabel: REQUIREMENT_TOPIC_TITLES.applying,
  },
  {
    value: 'uni-assist',
    label: 'Through uni-assist',
    guideHref: requirementsHref('applying'),
    guideLabel: REQUIREMENT_TOPIC_TITLES.applying,
  },
  {
    value: 'vpd',
    label: 'A VPD (Vorprüfungsdokumentation, preliminary review documentation) from uni-assist, then the university',
    guideHref: requirementsHref('applying'),
    guideLabel: REQUIREMENT_TOPIC_TITLES.applying,
  },
] as const satisfies readonly {
  value: ApplicationRoute;
  label: string;
  guideHref: string;
  guideLabel: string;
}[];

export const ROUTE_LABELS: { readonly [Route in ApplicationRoute]: string } = {
  direct: APPLICATION_ROUTE_OPTIONS[0].label,
  'uni-assist': APPLICATION_ROUTE_OPTIONS[1].label,
  vpd: APPLICATION_ROUTE_OPTIONS[2].label,
};

export const DOCUMENT_STATUS_OPTIONS = [
  { value: 'missing', label: 'Missing' },
  { value: 'ready', label: 'Ready' },
] as const satisfies readonly { value: DocumentStatus; label: string }[];

export const DOCUMENT_STATUS_LABELS: { readonly [Status in DocumentStatus]: string } = {
  missing: 'Missing',
  ready: 'Ready',
};

export const APPLICATION_PLAN_COPY = {
  title: 'Application plan',
  germanTerm: 'Bewerbungsplan',
  germanMeaning: 'application plan',
  lede: 'Keep the programmes you are applying to, their application routes, the dates you read on each programme’s page, and your document checklists in one place. Every date comes from you, and nothing you enter here is sent to us.',
  badges: [NO_LOGIN_NEEDED, 'Saved in this browser only', 'Calendar, CSV and print'],
  guidance: {
    uniAssist: UNI_ASSIST.about,
    uniAssistSource: UNI_ASSIST.source,
    vpd: 'A VPD (Vorprüfungsdokumentation, preliminary review documentation) is a certificate from uni-assist stating how it evaluates your certificates and rates your grade in the German grading system.',
    vpdSource: SOURCES.vpd,
    datesNote: 'Read every intake, application route, date and required document directly on each programme’s admission page.',
    applyingLinkLabel: REQUIREMENT_TOPIC_TITLES.applying,
    applyingLinkHref: requirementsHref('applying'),
    deadlinesLinkLabel: REQUIREMENT_TOPIC_TITLES.deadlines,
    deadlinesLinkHref: requirementsHref('deadlines'),
    guideLinksPrefix: 'Requirements guide:',
    summary: 'How the three application routes work',
  },
  form: {
    heading: 'Add a programme',
    subtitle: 'Enter the details from the programme’s own admission page.',
    nameLabel: 'Programme name',
    namePlaceholder: 'Programme title',
    nameError: 'Enter the programme name.',
    universityLabel: 'University',
    universityPlaceholder: 'University name',
    universityError: 'Enter the university name.',
    urlLabel: 'Link to the programme’s own page (optional)',
    urlPlaceholder: 'https://...',
    urlError: 'Enter a full web link starting with https:// or http://, or leave this blank.',
    routeLegend: 'Application route',
    routeHint: 'Choose the route named on the programme’s page.',
    submitLabel: 'Add programme',
    saveEditLabel: 'Save changes',
    cancelEditLabel: 'Cancel',
    editHeading: 'Edit programme details',
  },
  toolbar: {
    storageNote: 'Your plan stays in local storage in this browser on this device. Clearing browser data removes it.',
    storageFailedNote: 'Browser storage is unavailable, so changes apply only until you close or reload this tab.',
    storageDiscardedNote: 'An unreadable saved entry was cleared from this browser.',
    downloadIcs: 'Download calendar (.ics)',
    downloadCsv: 'Download CSV',
    printPlan: 'Print plan',
    clearEntries: 'Clear my entries',
    clearConfirmPrompt: 'Clear all entries?',
    clearConfirmYes: 'Yes, clear',
    clearConfirmCancel: 'Cancel',
    icsFilename: 'application-plan.ics',
    csvFilename: 'application-plan.csv',
  },
  statusMessages: {
    programmeAdded: (name: string) => `Added ${name} to your application plan.`,
    programmeUpdated: (name: string) => `Saved changes to ${name}.`,
    programmeRemoved: (name: string) => `Removed ${name} from your application plan.`,
    cleared: 'Cleared all saved entries from this browser.',
    clearFailed: 'Cleared this plan on screen. Saved browser data could not be cleared.',
    icsDownloaded: 'Downloaded calendar file (.ics).',
    icsNoDates: 'Add at least one date to a programme before downloading a calendar file.',
    csvDownloaded: 'Downloaded CSV file.',
    csvNoProgrammes: 'Add at least one programme before downloading a CSV file.',
  },
  plan: {
    heading: 'Your programmes',
    sortNote: 'Ordered by the next upcoming date you entered. Programmes without upcoming dates appear afterwards.',
    emptyTitle: 'No programmes in your plan yet.',
    emptyBody: 'Add a programme to record its application route, your own dates from its website, and the documents you need to prepare.',
    printNote: 'Personal application worksheet created on Germandians. Check every route, date and document on the university’s official website before applying.',
    routePrefix: 'Application route:',
    openProgrammePage: 'Open programme page',
    editProgramme: 'Edit details',
    removeProgramme: 'Remove programme',
    removeProgrammeAria: (name: string, university: string) => `Remove ${name} at ${university}`,
    editProgrammeAria: (name: string, university: string) => `Edit details for ${name} at ${university}`,
    nextDateBadge: (date: string, label: string) => `Next date: ${date} · ${label}`,
    pastDatesBadge: 'Entered dates have passed',
    noDatesBadge: 'No dates entered yet',
  },
  dates: {
    heading: 'Dates from the programme page',
    empty: 'No dates added yet. Enter the dates published on this programme’s page.',
    dateLabel: 'Date (YYYY-MM-DD)',
    datePlaceholder: 'YYYY-MM-DD',
    dateError: 'Enter a real calendar date written as YYYY-MM-DD.',
    labelFieldLabel: 'Date label',
    labelPlaceholder: 'e.g. deadline',
    labelError: 'Enter a label for this date, such as application deadline.',
    addButton: 'Add date',
    removeButton: 'Remove',
    removeAria: (date: string, label: string, programme: string) => `Remove date ${date} (${label}) for ${programme}`,
  },
  documents: {
    heading: 'Document checklist',
    empty: 'No documents listed yet. Add each document this programme asks for.',
    summary: (ready: number, missing: number) => `${ready} ready · ${missing} missing`,
    itemLabel: 'Document',
    itemPlaceholder: 'e.g. transcript',
    itemError: 'Enter the document name.',
    initialStatusLegend: 'Status when adding',
    addButton: 'Add document',
    removeButton: 'Remove',
    statusGroupAria: (docLabel: string, programme: string) => `Status for ${docLabel} (${programme})`,
    removeAria: (docLabel: string, programme: string) => `Remove document ${docLabel} for ${programme}`,
  },
  exports: {
    csvHeaders: [
      'Programme',
      'University',
      'Programme link',
      'Application route',
      'Next upcoming date',
      'All dates',
      'Ready documents',
      'Missing documents',
    ] as const,
    formatDatePair: (date: string, label: string) => `${date} (${label})`,
    icsSummary: (programme: PlannedProgramme, entry: PlanDateEntry) =>
      `${programme.name} (${programme.university}) — ${entry.label}`,
    icsDescription: (programme: PlannedProgramme, entry: PlanDateEntry) => {
      const lines = [
        `Programme: ${programme.name}`,
        `University: ${programme.university}`,
        `Date label: ${entry.label}`,
        `Application route: ${ROUTE_LABELS[programme.route]}`,
      ];
      if (programme.url.trim() !== '') {
        lines.push(`Programme page: ${programme.url.trim()}`);
      }
      const ready = programme.documents.filter((doc) => doc.status === 'ready').map((doc) => doc.label);
      const missing = programme.documents.filter((doc) => doc.status === 'missing').map((doc) => doc.label);
      if (ready.length > 0) lines.push(`Ready documents: ${ready.join(', ')}`);
      if (missing.length > 0) lines.push(`Missing documents: ${missing.join(', ')}`);
      return lines.join('\n');
    },
  },
} as const;
