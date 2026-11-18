import { SOURCES, type OfficialSource } from '@/utils/applicationFacts';
import {
  ARRIVAL_SUPPORT,
  DESTINATIONS,
  NAV_CTA,
  NO_LOGIN_NEEDED,
  SECTIONS,
  destinationHref,
  hashLink,
} from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';

import type { ArrivalItemId } from './storage';

export interface ArrivalItem {
  id: ArrivalItemId;
  title: string;
  shortTitle: string;
  german: {
    word: string;
    meaning: string;
  };
  whatItIs: readonly string[];
  whatToBring: readonly string[];
  whereDone: readonly string[];
  guideLink?: {
    label: string;
    to: string;
  };
  sources: readonly OfficialSource[];
  /** Exact owner-approved sentences from `ARRIVAL_SUPPORT`, shown only on steps Germandians helps with. */
  support?: readonly string[];
}

export const PAGE_COPY = {
  title: 'Arrival checklist',
  germanWord: 'Ankommen',
  germanMeaning: 'arriving and settling in Germany',
  introduction:
    'Nine steps for settling in Germany for your master’s, with what to bring, where to go and which official page to check. Check your enrolment deadline before you travel.',
  badges: [NO_LOGIN_NEEDED, 'Saved in your browser', 'Print-ready checklist'] as const,
  scopeNote:
    'Check your own city’s and university’s official pages for forms, appointments and deadlines. The city and university examples below show how the steps can work locally.',
  jumpNavLabel: 'Steps on this checklist',
  jumpNavHeading: 'On this checklist',
  housingSupportLink: 'Read about housing and settling-in help',
  housingSupportHref: hashLink(SECTIONS.housing),
} as const;

export const PROGRESS_COPY = {
  paperTitle: 'Laufzettel',
  heading: 'your arrival progress',
  storageNote:
    'Ticked steps stay in this browser on your device so they survive a reload. Nothing you tick here is sent anywhere.',
  storageUnavailable:
    'Browser storage is unavailable right now. Your ticks still work on screen until you close or reload the page.',
  clearedStatus: 'All checklist entries cleared.',
  clearAction: 'Clear my entries',
  clearConfirmQuestion: 'Clear all entries?',
  clearConfirmYes: 'Yes, clear',
  clearConfirmCancel: 'Cancel',
  printAction: 'Print checklist',
  tickLabel: 'Mark as done',
  tickAriaLabel: (title: string) => `Mark as done: ${title}`,
  tickedBadge: 'Ticked',
  doneMark: '✓',
  summaryLine: (done: number, total: number, remaining: number) =>
    done === total ? `All ${total} steps ticked` : `${done} of ${total} steps ticked · ${remaining} left`,
  fractionLabel: (done: number, total: number) => `${done}/${total}`,
} as const;

export const ITEM_SECTION_HEADINGS = {
  whatItIs: 'What it is',
  whatToBring: 'What to bring',
  whereDone: 'Where it is done',
  sources: 'Official sources',
  germandiansHelp: 'How Germandians helps',
} as const;

export const CLOSING_COPY = {
  title: 'Preparing your visa and enrolment before you travel',
  body: 'See how your student visa, health insurance and university enrolment fit together before you travel, or ask for a profile review if you are planning an upcoming intake.',
  guideLabel: `${REQUIREMENT_TOPIC_TITLES['visa-enrolment']} in the requirements guide`,
  guideHref: requirementsHref('visa-enrolment'),
  ctaLabel: NAV_CTA.label,
  ctaHref: destinationHref(DESTINATIONS.profileReview),
} as const;

export const ARRIVAL_ITEMS: readonly ArrivalItem[] = [
  {
    id: 'moving-in',
    title: 'Moving in and landlord confirmation',
    shortTitle: 'Landlord confirmation',
    german: {
      word: 'Wohnungsgeberbestätigung',
      meaning: 'landlord confirmation of move-in',
    },
    whatItIs: [
      'When you move in, you register your address (see the next step). Under section 19 of the Federal Registration Act, your housing provider or a person they authorise confirms your move-in in writing, or electronically to the registration office. This is the Wohnungsgeberbestätigung (landlord confirmation of move-in). Berlin states that a tenancy agreement does not replace it.',
      'In Munich, Studierendenwerk München Oberbayern (student services) allocates free rooms in the order applications arrive. Its housing FAQs say an application does not entitle you to a room.',
    ],
    whatToBring: [
      'The names of everyone moving in who must register, so your housing provider can fill in the confirmation.',
      'Berlin publishes a sample of the confirmation (Muster) on its registration page. Other cities may have their own form.',
      'Check that the confirmation records your housing provider’s name and address, the owner’s name if different, your move-in date, the address and the names of everyone who must register.',
    ],
    whereDone: [
      'Ask your housing provider for it when you move in. If they refuse, or you do not receive it in time, the law says to tell your local Meldebehörde (registration office) promptly.',
    ],
    sources: [SOURCES.bmgLandlord, SOURCES.berlinAnmeldung, SOURCES.housing],
    support: [ARRIVAL_SUPPORT.availability, ARRIVAL_SUPPORT.complimentary, ARRIVAL_SUPPORT.quote],
  },
  {
    id: 'city-registration',
    title: 'City registration',
    shortTitle: 'City registration',
    german: {
      word: 'Anmeldung',
      meaning: 'registering your residential address',
    },
    whatItIs: [
      'Section 17 of the Federal Registration Act says that anyone who moves into a home must register with the registration office within two weeks of moving in. Section 27 sets out limited exceptions, for example for some short stays. The office confirms your address with a Meldebestätigung (registration certificate). The DAAD says you need it for things such as opening a bank account, and it lists it among the documents for a residence permit.',
    ],
    whatToBring: [
      'Your passport, with a visa if one is required.',
      'Your Wohnungsgeberbestätigung (landlord confirmation of move-in), or the assignment code your housing provider received if they confirmed your move-in electronically.',
      'The completed registration form, signed by you, if the office asks for one. In Berlin you must sign it yourself.',
      'Any extra documents on your city’s checklist. Berlin, for example, says you may need a birth or marriage certificate for a first registration there. The DAAD says some offices also ask for your certificate of matriculation.',
    ],
    whereDone: [
      'At your local Einwohnermeldeamt (residents’ registration office) or Bürgeramt (citizens’ office). In Berlin, foreign nationals register in person, because the online service needs German or EU citizenship, and you book an appointment at a Bürgeramt. Berlin’s page also explains how another person can register for you with a written power of attorney.',
    ],
    sources: [SOURCES.bmgLandlord, SOURCES.bmgRegistrationExceptions, SOURCES.berlinAnmeldung, SOURCES.daadRegistering],
    support: [ARRIVAL_SUPPORT.settling, ARRIVAL_SUPPORT.quote],
  },
  {
    id: 'tax-id',
    title: 'Tax identification number',
    shortTitle: 'Tax ID number',
    german: {
      word: 'Steueridentifikationsnummer',
      meaning: 'eleven-digit tax identification number',
    },
    whatItIs: [
      'The Bundeszentralamt für Steuern (BZSt, Federal Central Tax Office) gives each person a permanent eleven-digit tax identification number. It stays valid for life and does not change after a move, a name change or a change in marital status.',
    ],
    whatToBring: [
      'Nothing to bring. The BZSt sends the number by post, so keep the letter safe when it arrives.',
      'If you registered in Germany for the first time within the last three months and the letter has not reached you, the BZSt online portal has a form to request the number again.',
      'If you already received a number and cannot find it: it usually appears on an income tax assessment (Einkommensteuerbescheid) or a wage tax certificate (Lohnsteuerbescheinigung). Otherwise ask the BZSt for it again, online or by letter.',
      'To have a repeat letter sent to an address other than your registered one, the BZSt asks for a written power of attorney and a copy of your ID.',
    ],
    whereDone: [
      'With the BZSt, online or by letter. For data protection reasons the BZSt cannot give the number by phone or email.',
    ],
    sources: [SOURCES.bzstTaxIdFirstRegistration, SOURCES.bzstTaxId],
  },
  {
    id: 'health-insurance-enrolment',
    title: 'Health insurance confirmation and university enrolment',
    shortTitle: 'Health insurance and enrolment',
    german: {
      word: 'Immatrikulation',
      meaning: 'enrolling as a student at your university',
    },
    whatItIs: [
      'The DAAD says everyone in Germany must have health insurance that meets German standards, and you show this by the time you register at your university. Enrolling is what lets you attend courses, take exams and use university facilities. Afterwards you receive a certificate of matriculation (Immatrikulationsbescheinigung).',
      'Each university sets how it wants proof of insurance. At the Technical University of Munich (TUM), you contact a German statutory insurer, which sends a digital notification to TUM confirming that you are insured or exempt. TUM says it cannot enrol you without that notification.',
    ],
    whatToBring: [
      'Your passport with your visa or residence permit, as the DAAD lists. Your International Office confirms the exact documents.',
      'Your letter of acceptance from your university.',
      'Proof of health insurance, in the form your university asks for.',
      'The other documents in your university portal. At TUM these include a signed application for enrolment and, if you applied for a preliminary documentation (VPD) through uni-assist, the documents you submitted to it.',
    ],
    whereDone: [
      'Through your university’s portal or International Office. TUM does enrolment and document uploads only in TUMonline, and its enrolment page gives the recipient number the insurer needs. Check your own university’s procedure and deadline as soon as you have an offer.',
    ],
    guideLink: {
      label: `${REQUIREMENT_TOPIC_TITLES['visa-enrolment']} in the requirements guide`,
      to: requirementsHref('visa-enrolment'),
    },
    sources: [SOURCES.daadEnrolling, SOURCES.daadHealthInsurance, SOURCES.tumEnrolment],
  },
  {
    id: 'bank-accounts',
    title: 'Current bank account and blocked account',
    shortTitle: 'Bank accounts',
    german: {
      word: 'Girokonto und Sperrkonto',
      meaning: 'everyday current account and blocked account',
    },
    whatItIs: [
      'A Girokonto (current account) is for regular payments such as rent, health insurance and semester fees. The DAAD says you generally cannot open one until you have registered your address.',
      'If you used a Sperrkonto (blocked account) as proof of funds for your visa, the Federal Foreign Office explains that only a certain amount can be withdrawn each month. After you arrive, the beneficiary named on the account is the foreigners’ authority (Ausländerbehörde).',
    ],
    whatToBring: [
      'Ask the bank what to bring. The University of Münster lists a passport or ID card, your notification of admission, a residence permit for study purposes if applicable and your tax ID number.',
      'When you book, ask whether the bank needs your tax ID at the appointment or whether you can send it afterwards, as the University of Münster advises. Münster says the number is sent to you after you register your address.',
    ],
    whereDone: [
      'At the bank you choose. For the blocked account, your provider’s terms apply. If you are in Germany and need the blocking notice lifted to close a blocked account, the Federal Foreign Office says to contact the foreigners’ authority.',
    ],
    sources: [
      SOURCES.daadRegistering,
      SOURCES.foreignOfficeBlockedAccount,
      SOURCES.muensterBankAccount,
    ],
    support: [ARRIVAL_SUPPORT.settling, ARRIVAL_SUPPORT.quote],
  },
  {
    id: 'campus-setup',
    title: 'Semester contribution, student card and campus orientation',
    shortTitle: 'Student card and campus',
    german: {
      word: 'Semesterbeitrag und Semesterticket',
      meaning: 'semester contribution and public transport ticket',
    },
    whatItIs: [
      'The DAAD says every student pays a Semesterbeitrag (semester contribution), at enrolment and again before each new semester. It is separate from tuition fees and covers contributions to student services and the student government. Many universities include a local public transport ticket (Semesterticket) in it or offer a discounted one.',
      'Check how your university issues the student card. At TUM, students in Munich, Garching and Weihenstephan get a physical StudentCard by post, and a digital StudentCard is available in the TUM Campus App. TUM says you can still take exams without a current card if you bring a printed proof of enrolment and an official ID card or passport.',
    ],
    whatToBring: [
      'The payment details for the Semesterbeitrag from your university portal. At TUM, the amount and deadline are in your TUMonline account, and you are enrolled only once the fee is paid.',
      'For TUM’s physical StudentCard, a German correspondence address entered in TUMonline. The photo you upload in TUMonline is used for the card.',
      'For TUM exams without a current card, a printed proof of enrolment and your passport or another official ID.',
    ],
    whereDone: [
      'On your university’s enrolment and orientation pages. TUM’s StudentCard page explains the physical and digital cards by campus. TUM First Steps is an online programme in English for admitted international students, with information sessions before the semester on topics such as enrolment, address registration, health insurance and finding a room.',
    ],
    sources: [SOURCES.daad, SOURCES.daadEnrolling, SOURCES.tumStudentCard, SOURCES.tumFirstSteps],
    support: [ARRIVAL_SUPPORT.settling, ARRIVAL_SUPPORT.quote],
  },
  {
    id: 'broadcasting-fee',
    title: 'Public broadcasting fee',
    shortTitle: 'Broadcasting fee',
    german: {
      word: 'Rundfunkbeitrag',
      meaning: 'public broadcasting contribution per dwelling',
    },
    whatItIs: [
      'The Rundfunkbeitrag (public broadcasting contribution) is €18.36 per month for each dwelling: one dwelling, one fee, whatever the number of residents or devices. When the registration office reports a new residence, the Beitragsservice (contribution service) writes to the people concerned.',
      'In a Wohngemeinschaft (WG, shared flat), only one resident needs to register. In a student hall, a room that opens onto a generally accessible hallway counts as a dwelling. Rooms that share a common front door follow the flat-share rule. The contribution service’s student page explains the exemption for students who receive BAföG (a state student grant) and do not live with their parents.',
    ],
    whatToBring: [
      'Any letter from the Beitragsservice. It shows a reference number (Aktenzeichen) that you can quote when you reply.',
      'If a flatmate already pays for your dwelling: that person’s nine-digit Beitragsnummer (contribution number), to send when the service asks, instead of registering a second account.',
      'If no account exists for your dwelling, the service recommends registering it. Its online form is called “Register a dwelling”. SEPA direct debit is one of the ways to pay.',
    ],
    whereDone: [
      'Online at rundfunkbeitrag.de, which publishes official explanations in English, including a page for students and apprentices.',
    ],
    sources: [SOURCES.rundfunkbeitragWelcome, SOURCES.rundfunkbeitragStudents],
  },
  {
    id: 'residence-permit',
    title: 'Residence permit for studies',
    shortTitle: 'Residence permit',
    german: {
      word: 'Aufenthaltserlaubnis',
      meaning: 'residence permit for full-time study',
    },
    whatItIs: [
      'Section 16b of the Residence Act sets out the residence permit for full-time study. It requires that your university has admitted you.',
      'If you apply for a residence permit before your current permit expires, section 81 of the Residence Act treats your current permit as still valid until the authority decides. The law provides for a certificate of this (Fiktionsbescheinigung). Berlin’s page says this does not apply to Schengen short-stay visas. Check with your authority how this applies to your visa.',
    ],
    whatToBring: [
      'Berlin asks for colour copies of the data pages of your passport, plus your entry stamp or visa if applicable.',
      'A certificate of enrolment (Immatrikulationsbescheinigung) or proof of conditional admission. Berlin says enrolment or conditional admission is required.',
      'Proof of your main residence. Berlin accepts the registration certificate (Meldebestätigung), or the lease together with the landlord confirmation.',
      'Proof of livelihood. Berlin lists a blocked account (Sperrkonto), a scholarship or a parental declaration as examples.',
      'Proof of German health insurance. Berlin says German statutory or comparable private cover counts and foreign insurance is not sufficient.',
      'Berlin takes the fee online, by credit card or PayPal, before you submit. Check how your own authority takes payment.',
    ],
    whereDone: [
      'At the Ausländerbehörde (foreigners’ authority) for your place of residence. Berlin takes this application online. It then reviews the documents, may ask for more, and holds an in-person appointment where you bring the originals. Use your own authority’s document list and procedure.',
    ],
    guideLink: {
      label: `${REQUIREMENT_TOPIC_TITLES['visa-enrolment']} in the requirements guide`,
      to: requirementsHref('visa-enrolment'),
    },
    sources: [SOURCES.residenceActStudy, SOURCES.residenceActApplications, SOURCES.berlinResidencePermit],
  },
  {
    id: 'student-work-rules',
    title: 'Rules on student part-time work',
    shortTitle: 'Part-time work rules',
    german: {
      word: 'Nebenjob',
      meaning: 'part-time work alongside your studies',
    },
    whatItIs: [
      'Section 16b of the Residence Act says that, with a residence permit for study, employment may not exceed 140 working days a year in total. Work of up to four hours in a day counts as half a working day. Student side jobs (studentische Nebentätigkeiten) are not counted.',
      'The law also lets the count run by week where that is more favourable to you: a calendar week counts as two and a half working days if you work up to 20 hours a week in the lecture period, or in any week outside the lecture period. The law does not define student side jobs, so ask the foreigners’ authority whether a job counts.',
    ],
    whatToBring: [
      'Your residence permit or visa when you ask about a specific job, so the authority can check the conditions it carries.',
    ],
    whereDone: [
      'For questions about whether a job counts towards your allowance, contact your local Ausländerbehörde (foreigners’ authority).',
    ],
    sources: [SOURCES.residenceActStudy],
    support: [ARRIVAL_SUPPORT.settling, ARRIVAL_SUPPORT.complimentary, ARRIVAL_SUPPORT.quote],
  },
] as const;
