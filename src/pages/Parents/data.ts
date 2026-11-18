import {
  APS,
  DMAT,
  EXTERNAL_COSTS,
  GERMAN_MISSIONS,
  SOURCES,
  TUITION,
  UNI_ASSIST,
  type ExternalCost,
  type OfficialSource,
} from '@/utils/applicationFacts';
import {
  ADMISSION_DECISION,
  APPLICANT_CONTROL,
  ARRIVAL_SUPPORT,
  CONTACT,
  DESTINATIONS,
  EXTERNAL_COSTS_SEPARATE,
  FEE_POLICY,
  FEE_PROMISE,
  FUNDING_VISA_HELP,
  GERMAN_LESSONS,
  HOUSING_SUPPORT,
  MENTOR_BACKGROUND,
  MENTORING,
  NAV_CTA,
  NO_LOGIN_NEEDED,
  PAGE_LINKS,
  QUOTE_TOPICS,
  ROUTES,
  SECTIONS,
  STUDENTS_PER_MENTOR,
  UNIVERSITY_INDEPENDENCE,
  destinationHref,
  feeQuoteText,
  hashLink,
} from '@/utils/constants';
import { KEEP_DAYS } from '@/utils/dmat/storage';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';
import { INTAKE_READINESS, businessOperator, siteConfig } from '@/utils/siteConfig';

export interface SourcedNote {
  readonly heading?: string;
  readonly text: string;
  readonly source: OfficialSource;
}

export interface PlainNote {
  readonly heading: string;
  readonly text: string;
  readonly quote?: string;
}

export interface InternalPageLink {
  readonly label: string;
  readonly to: string;
}

export interface SectionJumpLink {
  readonly label: string;
  readonly href: string;
}

function getBlockedAccountItem(): ExternalCost & { readonly amount: string; readonly source: OfficialSource } {
  const group = EXTERNAL_COSTS.find((entry) => entry.group === 'Blocked-account deposit');
  const item = group?.items[0];
  if (!item?.amount || !item.source) {
    throw new Error('Missing official blocked-account figure in EXTERNAL_COSTS');
  }
  return { ...item, amount: item.amount, source: item.source };
}

const blockedAccountItem = getBlockedAccountItem();

const reviewBySheet = Boolean(siteConfig.profileReviewEndpoint);
const lessonsBySheet = Boolean(siteConfig.germanLessonsEndpoint);

const deliverySummary =
  reviewBySheet && lessonsBySheet
    ? 'Google receives the forms submitted on this site and keeps them in our Google Sheets so the Germandians team can review the enquiry and reply on WhatsApp.'
    : !reviewBySheet && !lessonsBySheet
      ? 'The enquiry forms on this site open an email draft addressed to us rather than sending details from the page. Nothing is sent until the student presses send in their email app, after which their email provider and our Gmail service handle the message.'
      : `Google receives the ${reviewBySheet ? 'profile-review' : 'German lessons'} form and keeps it in our Google Sheets, while the ${reviewBySheet ? 'German lessons' : 'profile-review'} form opens an email draft where nothing is sent until the student presses send in their email app.`;

export const PAGE_COPY = {
  title: 'For parents',
  introduction:
    'Plain answers for families helping an Indian student plan and fund a master’s degree in Germany: what public universities and official bodies charge, how a blocked account works, what Germandians helps with, when our service fee is due, and how your child’s details are handled.',
  metaNote:
    'Every official figure on this page links to the organisation that sets it, with the date that page was last reviewed.',
  printAction: 'Print or save as PDF',
  contentsLabel: 'On this page',
} as const;

export const COSTS_TABLE_LABELS = {
  item: 'Cost',
  amount: 'Amount',
  detail: 'Details',
  noAmount: 'Varies',
} as const;

export const COSTS_SECTION = {
  id: 'university-costs',
  title: 'What a master’s at a public German university costs',
  lead: 'Plan for university charges, payments to other organisations and living expenses alongside any service fee. Check the current amount and payment instructions with each provider.',
  notes: [
    {
      heading: 'Public university tuition and exceptions',
      text: `${TUITION.public} On the DAAD’s overview of study finances, public universities in the federal state of Baden-Württemberg charge non-EU citizens per-semester tuition fees, and public institutions in Bavaria — such as the Technical University of Munich (TUM), shown as an example in the table below — can also charge tuition fees to students from outside the EU/EEA. Certain continuing-education master’s programmes charge tuition too. ${TUITION.private} ${TUITION.check}`,
      source: SOURCES.daad,
    },
    {
      heading: 'Semester contribution',
      text: 'Every student at a German university pays a semester contribution (Semesterbeitrag) each semester, even where tuition is free. It funds student services and student government, and at many universities includes a local public transport ticket.',
      source: SOURCES.daad,
    },
    {
      heading: 'Document verification (APS)',
      text: `${APS.about} ${APS.need}`,
      source: SOURCES.apsFaqs,
    },
    {
      heading: 'Aptitude test (dMAT)',
      text: `${DMAT.about} ${DMAT.summary}`,
      source: SOURCES.dmat,
    },
    {
      heading: 'Application handling (uni-assist and VPD)',
      text: `${UNI_ASSIST.about} Where a university asks for a VPD (Vorprüfungsdokumentation, preliminary review document), uni-assist issues that document and the student applies directly to the university.`,
      source: SOURCES.vpd,
    },
  ] satisfies readonly SourcedNote[],
  groups: EXTERNAL_COSTS.filter((group) => group.group !== 'Blocked-account deposit'),
  guideLink: {
    label: `Read ${REQUIREMENT_TOPIC_TITLES.costs} in the requirements guide`,
    to: requirementsHref('costs'),
  } satisfies InternalPageLink,
} as const;

export const BLOCKED_ACCOUNT_SECTION = {
  id: 'blocked-account',
  title: 'What a blocked account (Sperrkonto) is',
  lead: 'A Sperrkonto (blocked account) is one way to show proof of living funds when applying for a German student visa. The deposit is living money, separate from university charges and the Germandians service fee. Check the visa checklist for accepted alternatives.',
  officialFigure: blockedAccountItem,
  notes: [
    {
      heading: 'How monthly withdrawals work',
      text: `When your child applies for a student visa, ${GERMAN_MISSIONS.about} ask for proof of secure livelihood. One accepted option on the student visa checklist is a blocked account in Germany covering the first year of studies, with a blocking confirmation stating that no more than ${blockedAccountItem.amount} can be withdrawn.`,
      source: SOURCES.visaChecklist,
    },
    {
      heading: 'Providers and education loans',
      text: 'The German Missions accept blocked accounts from several banks and have no preference between providers. An education loan is additional to the blocked account.',
      source: SOURCES.visa,
    },
    {
      heading: 'Visa proof of funds vs personal budget',
      text: 'The visa checklist gives several ways to show proof of funds. The blocked-account amount is not a fixed estimate of what your child will spend each month. Check the current checklist before opening an account or transferring funds.',
      source: SOURCES.visaChecklist,
    },
  ] satisfies readonly SourcedNote[],
  guideLinks: [
    {
      label: `Read ${REQUIREMENT_TOPIC_TITLES['visa-enrolment']} in the requirements guide`,
      to: requirementsHref('visa-enrolment'),
    },
    {
      label: `Read ${REQUIREMENT_TOPIC_TITLES.costs} in the requirements guide`,
      to: requirementsHref('costs'),
    },
  ] satisfies readonly InternalPageLink[],
} as const;

export const HELP_SECTION = {
  id: 'what-we-help-with',
  title: 'What Germandians helps with — and what it does not',
  lead: MENTOR_BACKGROUND,
  community: MENTORING.community,
  capacity: [
    {
      label: 'Per mentor',
      figure: `Up to ${STUDENTS_PER_MENTOR.count} students per mentor`,
      detail: `Each mentor works with up to ${STUDENTS_PER_MENTOR.word} students at a time.`,
    },
    {
      label: 'Current intake',
      figure: MENTORING.places(siteConfig.intake),
      detail: INTAKE_READINESS,
    },
  ] as const,
  helpsTitle: 'What our mentoring covers',
  helps: [
    {
      heading: 'Programme requirements, documents and SOP',
      text: `${MENTORING.mentoring} SOP means statement of purpose.`,
    },
    {
      heading: 'Loan, blocked account and visa preparation',
      text: FUNDING_VISA_HELP,
    },
    {
      heading: 'Housing search and settling in',
      text: `${HOUSING_SUPPORT.explore} ${HOUSING_SUPPORT.apply} ${HOUSING_SUPPORT.temporary} ${ARRIVAL_SUPPORT.availability} ${HOUSING_SUPPORT.costs} ${ARRIVAL_SUPPORT.settling} ${ARRIVAL_SUPPORT.complimentary} ${ARRIVAL_SUPPORT.quote}`,
    },
  ] satisfies readonly PlainNote[],
  doesNotTitle: 'What we do not do, and who decides',
  doesNot: [
    {
      heading: 'Admission and visa decisions',
      text: `${ADMISSION_DECISION} ${GERMAN_MISSIONS.about} decide every visa application. ${UNIVERSITY_INDEPENDENCE}`,
    },
    {
      heading: 'Document checks and application handling',
      text: `${APS.about} ${UNI_ASSIST.about}`,
    },
    {
      heading: 'Student control of accounts and submissions',
      text: 'Our commitment to every student is:',
      quote: APPLICANT_CONTROL,
    },
  ] satisfies readonly PlainNote[],
  germanLessons: {
    heading: 'German lessons (separate from admissions mentoring)',
    text: `${GERMAN_LESSONS.offer} ${GERMAN_LESSONS.separate} ${GERMAN_LESSONS.languages} ${GERMAN_LESSONS.charges} ${GERMAN_LESSONS.certificate}`,
    link: {
      label: PAGE_LINKS.learnGerman.label,
      to: ROUTES.learnGerman,
    } satisfies InternalPageLink,
  },
  homeLinks: [
    {
      label: 'How our mentors work on Home',
      href: hashLink(SECTIONS.mentors),
    },
    {
      label: 'Housing and settling in on Home',
      href: hashLink(SECTIONS.housing),
    },
  ] satisfies readonly SectionJumpLink[],
} as const;

export const FEE_SECTION = {
  id: 'service-fee',
  title: 'When the service fee is due',
  promise: FEE_PROMISE,
  summaryRows: [
    {
      label: FEE_POLICY.receiptLabel,
      value: FEE_POLICY.amount,
    },
    {
      label: 'Service fee after admission',
      value: siteConfig.feeAfterAdmission || 'Written quote',
    },
    {
      label: 'Payment timing',
      value: FEE_POLICY.trigger,
    },
  ] as const,
  paragraphs: [
    `${FEE_POLICY.due} ${MENTORING.facts[0]}`,
    feeQuoteText(siteConfig.feeAfterAdmission),
    `${QUOTE_TOPICS.lead} ${QUOTE_TOPICS.items.join('; ')}.`,
    FEE_POLICY.exception,
    EXTERNAL_COSTS_SEPARATE,
  ] as const,
  homeLinks: [
    {
      label: 'See the Fees section on Home',
      href: destinationHref(DESTINATIONS.fees),
    },
    {
      label: 'Read the FAQ on Home',
      href: destinationHref(DESTINATIONS.faq),
    },
  ] satisfies readonly SectionJumpLink[],
} as const;

export const PRIVACY_SECTION = {
  id: 'student-details',
  title: 'What happens to the details a student sends',
  lead: 'This summary matches our full privacy note and explains what stays on your child’s device and what happens when they contact us.',
  operator: businessOperator ? `Germandians is operated by ${businessOperator}.` : '',
  points: [
    {
      heading: 'Reading and tools work without an account',
      text: `${NO_LOGIN_NEEDED} to read our guides, convert grades or answer the requirements questions. Using the grade check or the requirements page on its own sends nothing to us; a summary reaches us only if the student ticks the box to attach it and submits the form or sends the email draft. What the student enters in our planners and checklists stays in their browser on their device and is never sent to us. So does their dMAT practice: a saved test is removed when discarded or after ${KEEP_DAYS} days, and the practice history stays until they clear it.`,
    },
    {
      heading: 'What an enquiry includes and how we use it',
      text: 'When a student sends an enquiry, we receive their name, WhatsApp number, any email address they choose to provide, the time of the message or submission, their consent to be contacted, and any optional summary or German-lessons answers they choose to share. We use these details only to reply, carry out the profile review and answer questions about German lessons. We do not sell details, use them for advertising or add anyone to a mailing list.',
    },
    {
      heading: 'How forms and messages are handled',
      text: `${deliverySummary} Google provides our email (Gmail), and Meta runs WhatsApp and Instagram when someone messages us there.`,
    },
    {
      heading: 'No tracking or third-party analytics',
      text: 'This site uses no tracking or advertising cookies, loads no third-party analytics scripts and serves its fonts locally.',
    },
  ] satisfies readonly PlainNote[],
  rights: {
    beforeEmail:
      'A student can ask us to show, correct or delete the details we hold about them, or withdraw consent at any time, by emailing ',
    email: CONTACT.email,
    emailHref: `mailto:${CONTACT.email}`,
    afterEmail: '.',
  },
  privacyLink: {
    label: 'Read the full privacy note',
    to: ROUTES.privacy,
  } satisfies InternalPageLink,
} as const;

export const SECTION_NAV: readonly SectionJumpLink[] = [
  { label: COSTS_SECTION.title, href: `#${COSTS_SECTION.id}` },
  { label: BLOCKED_ACCOUNT_SECTION.title, href: `#${BLOCKED_ACCOUNT_SECTION.id}` },
  { label: HELP_SECTION.title, href: `#${HELP_SECTION.id}` },
  { label: FEE_SECTION.title, href: `#${FEE_SECTION.id}` },
  { label: PRIVACY_SECTION.title, href: `#${PRIVACY_SECTION.id}` },
];

export const NEXT_STEPS_COPY = {
  title: 'Next steps for you and your child',
  body: 'Your child can check their German grade conversion, read the master’s requirements guide, or send their details for a profile review when ready.',
  profileReview: {
    label: NAV_CTA.label,
    href: destinationHref(DESTINATIONS.profileReview),
  } satisfies SectionJumpLink,
  requirements: {
    label: 'Read the requirements guide',
    to: ROUTES.requirements,
  } satisfies InternalPageLink,
  gradeCheck: {
    label: PAGE_LINKS.gradeCheck.label,
    to: ROUTES.check,
  } satisfies InternalPageLink,
} as const;
