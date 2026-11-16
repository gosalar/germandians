/**
 * Facts from outside organisations, each with the official page it came from
 * and the date it was last read. Re-read the source before changing a value.
 */
export interface OfficialSource {
  label: string;
  url: string;
  reviewed: string;
}

const reviewed = '12 November 2026';

export const SOURCES = {
  dmat: { label: 'APS India: dMAT rules', url: 'https://aps-india.de/dmat/', reviewed: '16 November 2026' },
  test: { label: 'g.a.s.t.: dMAT schedule', url: 'https://www.d-mat.de/en/dmat-in-india/', reviewed },
  // The fee is in the graduate leaflet linked from this page; the leaflet's own URL changes with each edition.
  aps: { label: 'APS India: checklists and graduate leaflet', url: 'https://aps-india.de/checklists/', reviewed },
  // The checklists page and the APS FAQs both point applicants who are unsure which APS procedure applies to this quiz.
  apsQuiz: { label: 'APS India: requirements quiz', url: 'https://aps-india.de/new-quiz/', reviewed: '16 November 2026' },
  vpd: { label: 'uni-assist: VPD', url: 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/', reviewed },
  applications: { label: 'uni-assist: handling fees', url: 'https://www.uni-assist.de/en/how-to-apply/apply-online/pay-submit/', reviewed },
  visa: { label: 'German Missions: visa FAQs', url: 'https://india.diplo.de/in-en/service/2546328-2546328', reviewed },
  visaFee: { label: 'German Missions: national visa', url: 'https://india.diplo.de/in-en/service/2755482-2755482', reviewed },
  daad: { label: 'DAAD: costs', url: 'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/', reviewed: '16 November 2026' },
  tum: { label: 'TUM: tuition fees', url: 'https://www.tum.de/en/studies/fees/tuition', reviewed },
  housing: {
    label: 'Studierendenwerk München Oberbayern: housing FAQs',
    url: 'https://www.studierendenwerk-muenchen-oberbayern.de/en/accommodation/faq/',
    reviewed,
  },
  // Read for the /requirements guide; each keeps the date it was read.
  anabin: { label: 'KMK anabin: foreign qualifications database (in German)', url: 'https://anabin.kmk.org/', reviewed: '14 November 2026' },
  anabinAbout: { label: 'anabin: about the database (in German)', url: 'https://anabin.kmk.org/ueber-anabin', reviewed: '14 November 2026' },
  anabinInstitutions: { label: 'anabin: institution statuses (in German)', url: 'https://anabin.kmk.org/db/institutionen-information', reviewed: '14 November 2026' },
  anabinDegrees: { label: 'anabin: degree classifications (in German)', url: 'https://anabin.kmk.org/db/hochschulabschluesse-information', reviewed: '14 November 2026' },
  uniAssist: { label: 'uni-assist: profile', url: 'https://www.uni-assist.de/en/about-us/profile/', reviewed: '15 November 2026' },
  masters: { label: 'uni-assist: master’s admission criteria', url: 'https://www.uni-assist.de/en/how-to-apply/get-information/master/', reviewed: '14 November 2026' },
  india: { label: 'uni-assist: documents from India', url: 'https://www.uni-assist.de/en/tools/info-country-by-country/details-country/country/in/', reviewed: '14 November 2026' },
  gradeFormula: {
    label: 'KMK: agreement on overall grades for foreign entrance qualifications (in German, PDF)',
    url: 'https://www.kmk.org/fileadmin/Dateien/pdf/ZAB/Hochschulzugang_Beschluesse_der_KMK/GesNot05.pdf',
    reviewed: '14 November 2026',
  },
  gradeConversion: {
    label: 'TUM: grade conversion for grades earned outside Germany',
    url: 'https://www.tum.de/en/studies/application/application-info-portal/grade-conversion-formula-for-grades-earned-outside-germany',
    reviewed: '14 November 2026',
  },
  ects: {
    label: 'European Commission: ECTS',
    url: 'https://education.ec.europa.eu/education-levels/higher-education/inclusive-and-connected-higher-education/european-credit-transfer-and-accumulation-system',
    reviewed: '14 November 2026',
  },
  rwthSse: {
    label: 'RWTH Aachen: Software Systems Engineering admission (example)',
    url: 'https://sc.informatik.rwth-aachen.de/en/studium/master/sse/application-for-admission/',
    reviewed: '14 November 2026',
  },
  tumInformatics: {
    label: 'TUM: Informatics master’s (example)',
    url: 'https://www.cit.tum.de/en/cit/studies/degree-programs/master-informatics/',
    reviewed: '14 November 2026',
  },
  apsFaqs: { label: 'APS India: FAQs', url: 'https://aps-india.de/faqs/', reviewed: '15 November 2026' },
  visaChecklist: {
    label: 'German Missions: student visa checklist',
    url: 'https://india.diplo.de/in-en/service/2756350-2756350',
    reviewed: '14 November 2026',
  },
  uniAssistLanguage: {
    label: 'uni-assist: language certificates',
    url: 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/language-certificates/',
    reviewed: '14 November 2026',
  },
  uniAssistCertificates: {
    label: 'uni-assist: educational certificates and translations',
    url: 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/educational-certificates-translations/',
    reviewed: '14 November 2026',
  },
  uniAssistOtherDocuments: {
    label: 'uni-assist: other documents',
    url: 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/other-documents/',
    reviewed: '14 November 2026',
  },
  uniAssistFaqs: {
    label: 'uni-assist: FAQs on planning your application',
    url: 'https://www.uni-assist.de/en/faqs/plan-your-application/',
    reviewed: '14 November 2026',
  },
  uniAssistUniversities: {
    label: 'uni-assist: universities it evaluates applications for',
    url: 'https://www.uni-assist.de/en/tools/uni-assist-universities/',
    reviewed: '14 November 2026',
  },
  uniAssistBachelors: {
    label: 'uni-assist: bachelor’s applications',
    url: 'https://www.uni-assist.de/en/how-to-apply/get-information/bachelor-staatsexamen/',
    reviewed: '14 November 2026',
  },
  tumManagement: {
    label: 'TUM: Master in Management, Munich (example)',
    url: 'https://www.mgt.tum.de/programs/master-in-management/munich/how-to-apply',
    reviewed: '15 November 2026',
  },
  tumAdmissionProcedures: {
    label: 'TUM: admission procedures',
    url: 'https://www.tum.de/en/studies/application/application-info-portal/admission-procedures',
    reviewed: '15 November 2026',
  },
  tumAps: {
    label: 'TUM: APS certificate (example)',
    url: 'https://www.tum.de/en/studies/application/application-info-portal/aps',
    reviewed: '16 November 2026',
  },
  semesters: {
    label: 'uni-assist: glossary, semester',
    url: 'https://www.uni-assist.de/en/tools/glossary-of-terms/description/term/semester/',
    reviewed: '16 November 2026',
  },
  daadEnrolling: {
    label: 'DAAD: enrolling',
    url: 'https://www.daad.de/en/studying-in-germany/requirements/enrolling/',
    reviewed: '14 November 2026',
  },
  daadHealthInsurance: {
    label: 'DAAD: health insurance',
    url: 'https://www.daad.de/en/studying-in-germany/living-in-germany/health-insurance/',
    reviewed: '14 November 2026',
  },
  daadPhd: {
    label: 'DAAD: ways to your PhD',
    url: 'https://www.daad.de/en/studying-in-germany/phd-studies-research/ways-to-your-phd/',
    reviewed: '14 November 2026',
  },
} satisfies Record<string, OfficialSource>;

/** What uni-assist is, as its profile page describes it. Used where a topic first explains uni-assist. */
export const UNI_ASSIST = {
  about: 'uni-assist is an association, supported by German universities, that processes and evaluates international student applications.',
  source: SOURCES.uniAssist,
} as const;

/**
 * What APS is and who needs it, as the APS FAQs (`SOURCES.apsFaqs`) state it. `programmes` rests on the
 * FAQs (the certificate goes to universities and uni-assist too) and on TUM's APS page (`SOURCES.tumAps`).
 */
export const APS = {
  about: 'APS is the German Embassy’s check of your Indian academic documents.',
  need: 'If your academic documents were issued by an Indian institution, you generally need an APS certificate for the German student visa: what counts is where your documents were issued, not your nationality.',
  programmes: 'Programmes can ask for it too, so check where and by when each programme wants it.',
} as const;

/**
 * Who the German Missions in India are, as their own site lists them (`SOURCES.visaFee`), for the one
 * place the page explains the name. The APS FAQs (`SOURCES.apsFaqs`) say the competent mission decides the visa.
 */
export const GERMAN_MISSIONS = {
  about: 'the German Missions in India (the German Embassy in New Delhi and the German consulates)',
} as const;

/**
 * The figures in the dMAT rule that other code decides with, each typed once. The `DMAT` sentences
 * below are built from them, and the /requirements questions read them.
 */
export const DMAT_RULE_VALUES = {
  /** Students below this many completed semesters of a bachelor's of this length are exempt. */
  semesterThresholds: { '3-year': 5, '4-year': 7 },
  /** APS registration or complete document shipment before this date exempts that procedure. */
  transitionDate: '29 June 2026',
} as const;

const DMAT_FEE = '€150';
const DMAT_WINDOWS = [
  { deadline: '4 January 2027', test: '16 January 2027', results: '8 February 2027' },
  { deadline: '1 March 2027', test: '13 March 2027', results: '5 April 2027' },
] as const;
const { semesterThresholds, transitionDate } = DMAT_RULE_VALUES;

/**
 * The rule for earlier APS applications in its parts. The next-steps slip uses one part with
 * `newApplications`; the guide joins all three so the sentence on new applications is said once.
 */
const DMAT_EARLIER_APPLICATIONS = {
  completed: 'If you already hold an APS certificate, that completed APS procedure does not need dMAT.',
  transition: `If you registered with APS online, or sent your complete APS documents, before ${transitionDate}, that APS procedure does not need dMAT.`,
  newApplications: 'A new APS application follows the rules in force when you make it.',
} as const;

/** How dMAT fits into the APS procedure, in two parts: the deadlines topic shows only `order`. */
const DMAT_SEQUENCE = {
  order: 'If you need dMAT, you may send your APS documents before you have the dMAT certificate. APS issues its own certificate only after the dMAT certificate has arrived and the result is verified.',
  otherDocuments: 'Send all your other academic documents with your first APS submission.',
} as const;

export const DMAT = {
  /** What dMAT is, as the APS India dMAT page (`SOURCES.dmat`) and g.a.s.t.'s own dMAT page (`SOURCES.test`) both describe it. */
  about: 'dMAT (the digital Master Test) is a standardised academic aptitude test for master’s applicants, run by an organisation called g.a.s.t.',
  /** The one-line rule, in the APS dMAT page's own terms: an element of the APS documents, by intake. */
  summary: 'From the summer semester 2027 intake onwards, dMAT is part of the APS documents for Indian master’s applicants whose bachelor’s degree is in certain fields. Exemptions apply.',
  /** The one name for the fields the rule lists, wherever the page refers to them. */
  fieldsName: 'dMAT fields',
  fields: 'All B.Tech/B.Eng degrees; other engineering degrees; commerce, accounting, finance, economics; business/management; tourism, travel and hospitality. Integrated or dual degrees count if a component or major falls in these fields.',
  /** Who is exempt: the lead-in, then one entry per group. */
  exemptionsLead: 'Under the current rules, dMAT does not apply to:',
  exemptions: [
    'bachelor’s and PhD applicants',
    'degrees outside the dMAT fields',
    'officially confirmed exchange, double-degree or university partnership programmes',
    `students who have completed fewer than ${semesterThresholds['3-year']} semesters of a 3-year degree, or fewer than ${semesterThresholds['4-year']} of a 4-year degree`,
  ],
  sequence: `${DMAT_SEQUENCE.order} ${DMAT_SEQUENCE.otherDocuments}`,
  /** `sequence` in parts. */
  sequenceParts: DMAT_SEQUENCE,
  /** The rule for earlier APS applications in parts. */
  earlierApplications: DMAT_EARLIER_APPLICATIONS,
  fee: DMAT_FEE,
  windows: DMAT_WINDOWS,
  /** The test dates as one sentence, wherever the full rule is shown. */
  schedule: `${DMAT_WINDOWS.map((window) => `${window.test} (register by ${window.deadline}; results on ${window.results})`).join(' and ')}.`,
  /** The fee with who is paid and when, wherever the full rule is shown. */
  feeNote: `${DMAT_FEE}, paid to g.a.s.t. when you register.`,
} as const;

/** Labels for the parts of the dMAT rule where it is shown in full. */
export const DMAT_LABELS = {
  fields: DMAT.fieldsName,
  exemptions: 'Who is exempt',
  transition: 'Earlier APS applications',
  sequence: 'dMAT and APS',
  windows: 'Test dates',
  fee: 'Test fee',
} as const;

export const HOUSING = {
  preparation: 'Housing preparation starts before you travel. Apply as soon as each provider opens applications: rooms are allocated from waiting lists and a place is not guaranteed. Keep private rooms and temporary accommodation in view as alternatives.',
} as const;

/** Tuition as the DAAD costs page (`SOURCES.daad`) describes it, then what to check, said once. */
export const TUITION = {
  public: 'Many public programmes charge no tuition. Some institutions and states charge students from outside the EU, and some programmes charge tuition too.',
  private: 'Private universities set tuition for each programme.',
  check: 'Check your programme’s full fees, any exemptions and its semester contribution.',
} as const;

export interface ExternalCost {
  label: string;
  amount?: string;
  detail: string;
  source?: OfficialSource;
}

const LIVING_FUNDS = { monthly: 992, months: 12 } as const;
const euros = (value: number) => `€${value.toLocaleString('en-GB')}`;

export const EXTERNAL_COSTS: { group: string; items: ExternalCost[] }[] = [
  {
    group: 'Provider charges',
    items: [
      { label: 'uni-assist', amount: '€75 / €30', detail: 'First course / each additional course in the same semester, including VPD. Universities you apply to directly may charge their own fee.', source: SOURCES.applications },
      { label: 'APS', amount: '₹18,000', detail: 'Individual graduate verification procedure.', source: SOURCES.aps },
      { label: 'dMAT, where required', amount: DMAT.fee, detail: 'Paid to g.a.s.t. during registration; check the exemptions.', source: SOURCES.dmat },
      { label: 'IELTS, health insurance and flights', detail: 'Check the current test, policy and travel prices with your chosen providers.' },
      { label: 'National visa', amount: '€75', detail: 'Fee for applicants over 18, paid in INR at the exchange rate on the appointment day. The German Missions’ external service provider, VFS, charges its own service fee on top.', source: SOURCES.visaFee },
    ],
  },
  {
    group: 'Semester contributions',
    items: [
      { label: 'Contribution per semester', amount: '€70–€430', detail: 'Pays for student services and the student government, and at many universities includes a local transport ticket. Separate from tuition. The DAAD, Germany’s academic exchange service, gives this range: confirm the amount with your university.', source: SOURCES.daad },
    ],
  },
  {
    group: 'Tuition',
    items: [
      { label: 'Public and private programmes', detail: `${TUITION.public} ${TUITION.private} ${TUITION.check}`, source: SOURCES.daad },
      { label: 'TUM example', amount: '€4,000 or €6,000', detail: 'Usual master’s tuition per semester for non-EU/EEA students who have to pay fees, rising to €4,600 or €6,800 from winter semester 2027/28. Programme, exemption and waiver rules apply.', source: SOURCES.tum },
    ],
  },
  {
    group: 'Blocked-account deposit',
    items: [
      {
        label: 'Your own living money',
        amount: `${euros(LIVING_FUNDS.monthly)} per month`,
        detail: `The German Missions’ figure, in force since 1 September 2024. ${LIVING_FUNDS.months} months at that rate comes to ${euros(LIVING_FUNDS.monthly * LIVING_FUNDS.months)}. A blocked account is one way to prove funds, not a service fee. Provider charges are separate; check the current visa checklist.`,
        source: SOURCES.visa,
      },
    ],
  },
];
