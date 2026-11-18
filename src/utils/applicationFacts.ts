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
  dmat: { label: 'APS India: dMAT rules', url: 'https://aps-india.de/dmat/', reviewed: '18 November 2026' },
  test: { label: 'g.a.s.t.: dMAT schedule', url: 'https://www.d-mat.de/en/dmat-in-india/', reviewed },
  // Read for the dMAT guide and the practice page; each keeps the date it was read.
  dmatFaq: { label: 'g.a.s.t.: dMAT questions and answers for graduates in India', url: 'https://www.d-mat.de/en/faq-graduate-students-india/', reviewed: '17 November 2026' },
  // The preparation material is a PDF linked from this page; the PDF's own URL changes with each edition.
  dmatPreparation: { label: 'g.a.s.t.: dMAT preparation material (PDF linked from this page)', url: 'https://www.d-mat.de/en/dmat-in-india/', reviewed: '17 November 2026' },
  // The videos on how the exam works on screen, linked from this page. Watched, not re-read: the date is the day they were watched.
  dmatVideos: { label: 'g.a.s.t.: videos on how the dMAT works on screen (linked from this page)', url: 'https://www.d-mat.de/en/dmat-in-india/', reviewed: '16 November 2026' },
  dmatTerms: { label: 'g.a.s.t.: dMAT terms and exam-day rules', url: 'https://www.d-mat.de/en/terms-conditions/', reviewed: '17 November 2026' },
  // The fee is in the graduate leaflet linked from this page; the leaflet's own URL changes with each edition.
  aps: { label: 'APS India: checklists and graduate leaflet', url: 'https://aps-india.de/checklists/', reviewed: '18 November 2026' },
  // The checklists page and the APS FAQs both point applicants who are unsure which APS procedure applies to this quiz.
  apsQuiz: { label: 'APS India: requirements quiz', url: 'https://aps-india.de/new-quiz/', reviewed: '16 November 2026' },
  vpd: { label: 'uni-assist: VPD', url: 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/', reviewed: '18 November 2026' },
  applications: { label: 'uni-assist: handling fees', url: 'https://www.uni-assist.de/en/how-to-apply/apply-online/pay-submit/', reviewed: '18 November 2026' },
  visa: { label: 'German Missions: visa FAQs', url: 'https://india.diplo.de/in-en/service/2546328-2546328', reviewed: '18 November 2026' },
  visaFee: { label: 'German Missions: national visa', url: 'https://india.diplo.de/in-en/service/2755482-2755482', reviewed: '18 November 2026' },
  daad: { label: 'DAAD: costs', url: 'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/', reviewed: '18 November 2026' },
  tum: { label: 'TUM: tuition fees', url: 'https://www.tum.de/en/studies/fees/tuition', reviewed: '18 November 2026' },
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
  uniAssist: { label: 'uni-assist: profile', url: 'https://www.uni-assist.de/en/about-us/profile/', reviewed: '18 November 2026' },
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
    reviewed: '18 November 2026',
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
  apsFaqs: { label: 'APS India: FAQs', url: 'https://aps-india.de/faqs/', reviewed: '18 November 2026' },
  visaChecklist: {
    label: 'German Missions: student visa checklist',
    url: 'https://india.diplo.de/in-en/service/2756350-2756350',
    reviewed: '18 November 2026',
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
  // Read for the /arrival checklist; each keeps the date it was read.
  bmgLandlord: {
    label: 'Federal Registration Act (BMG), sections 17 and 19 (in German)',
    url: 'https://www.gesetze-im-internet.de/bmg/BJNR108410013.html',
    reviewed: '18 November 2026',
  },
  bmgRegistrationExceptions: {
    label: 'Federal Registration Act (BMG), section 27 on exceptions (in German)',
    url: 'https://www.gesetze-im-internet.de/bmg/__27.html',
    reviewed: '18 November 2026',
  },
  daadRegistering: {
    label: 'DAAD: residence permit and address registration',
    url: 'https://www.daad.de/en/studying-in-germany/living-in-germany/registering/',
    reviewed: '18 November 2026',
  },
  berlinAnmeldung: {
    label: 'ServicePortal Berlin: registering a main residence (in German, example)',
    url: 'https://service.berlin.de/dienstleistung/120686/',
    reviewed: '18 November 2026',
  },
  bzstTaxId: {
    label: 'Federal Central Tax Office (BZSt), tax identification number (in German)',
    url: 'https://bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer.html',
    reviewed: '18 November 2026',
  },
  bzstTaxIdFirstRegistration: {
    label: 'BZSt online portal, receiving your tax identification number (in German)',
    url: 'https://online.portal.bzst.de/SharedDocs/Leistungsbeschreibung/DE/erneute_mitteilung_der_ID-Nr.html?nn=23996',
    reviewed: '18 November 2026',
  },
  tumEnrolment: {
    label: 'TUM: enrolment through TUMonline (example)',
    url: 'https://www.tum.de/en/studies/application/enrollment-info-portal/enrollment',
    reviewed: '18 November 2026',
  },
  foreignOfficeBlockedAccount: {
    label: 'Federal Foreign Office: opening and closing a blocked account',
    url: 'https://www.auswaertiges-amt.de/en/sperrkonto/388600',
    reviewed: '18 November 2026',
  },
  muensterBankAccount: {
    label: 'University of Münster: opening a bank account (example)',
    url: 'https://www.uni-muenster.de/international/en/studierende/general-information/bank-account.html',
    reviewed: '18 November 2026',
  },
  tumStudentCard: {
    label: 'TUM: StudentCard (example)',
    url: 'https://www.tum.de/en/studies/application/enrollment-info-portal/studentcard',
    reviewed: '18 November 2026',
  },
  tumFirstSteps: {
    label: 'TUM: First Steps for international students (example)',
    url: 'https://www.tum.de/en/studies/during-your-studies/starting-your-studies/tum-first-steps',
    reviewed: '18 November 2026',
  },
  rundfunkbeitragWelcome: {
    label: 'Rundfunkbeitrag: general information in English',
    url: 'https://www.rundfunkbeitrag.de/welcome/english',
    reviewed: '18 November 2026',
  },
  rundfunkbeitragStudents: {
    label: 'Rundfunkbeitrag: information for students and apprentices',
    url: 'https://www.rundfunkbeitrag.de/welcome/english/students-and-apprentices',
    reviewed: '18 November 2026',
  },
  berlinResidencePermit: {
    label: 'ServicePortal Berlin: residence permit for full-time studies (example)',
    url: 'https://service.berlin.de/dienstleistung/305244/en/',
    reviewed: '18 November 2026',
  },
  residenceActStudy: {
    label: 'Residence Act, section 16b on studying and working (in German)',
    url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html',
    reviewed: '18 November 2026',
  },
  residenceActApplications: {
    label: 'Residence Act, section 81 on applying for a residence title (in German)',
    url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__81.html',
    reviewed: '18 November 2026',
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

/**
 * How the test runs, in numbers. The subtests, their tasks and minutes, the academic module's minutes and
 * the break are in the preparation material (`SOURCES.dmatPreparation`); the number of academic questions
 * is an average g.a.s.t. gives in its questions and answers (`SOURCES.dmatFaq`); the pause between Core
 * subtests is the countdown the official videos show (`SOURCES.dmatVideos`). The practice page's clock
 * and the guide read these; nobody retypes a number.
 */
export const DMAT_FORMAT = {
  subtests: 3,
  tasksPerSubtest: 20,
  subtestMinutes: 25,
  pauseMinutes: 2,
  breakMinutes: 30,
  academicMinutes: 90,
  academicQuestions: 'about 60',
} as const;

/** Official test format and preparation. Practice controls and feedback live with the practice page. */
export const DMAT_EXAM = {
  organiser: 'The full name of g.a.s.t. is the Society for Academic Study Preparation and Test Development.',
  aps: 'APS India is the Academic Evaluation Center, which checks Indian academic documents for the German Embassy.',
  format: {
    modules: 'For the APS procedure, applicants who need the dMAT take both the Core Module and the General Academic Module.',
    core: `The Core Module has ${DMAT_FORMAT.subtests} subtests. Each gives you ${DMAT_FORMAT.subtestMinutes} minutes for ${DMAT_FORMAT.tasksPerSubtest} tasks.`,
    puzzles: [
      { name: 'Figure Sequences', task: 'Work out how the shapes change and use the pattern to choose the next two grids.' },
      { name: 'Mathematical Equations', task: 'Work out which values make every equation in a set true.' },
      { name: 'Latin Squares', task: 'Use the letters already in the grid to find the missing letter, without repeating a letter in any row or column.' },
    ],
    pause: `The official on-screen demo shows a ${DMAT_FORMAT.pauseMinutes}-minute pause between Core subtests.`,
    break: `A ${DMAT_FORMAT.breakMinutes}-minute break separates the two modules.`,
    academic: `In the General Academic Module, you have ${DMAT_FORMAT.academicMinutes} minutes to read passages and answer questions about them. The question count is ${DMAT_FORMAT.academicQuestions} on average and can vary.`,
    choices: 'The General Academic Module is in English. Choose one answer per question.',
    guessing: 'For the questions with answer options, the official preparation material advises choosing your best guess if you are unsure.',
  },
  day: {
    passport: 'Bring the original of the valid passport you registered with. If you have replaced it, update the passport details in the participant portal.',
    desk: 'Keep only your passport on the desk. Notes and aids such as calculators are prohibited. Taking in an unauthorised aid or attempting to cheat can lead to exclusion.',
    checkIn: 'Check the participant portal for your check-in time, meeting point and exam-day details. The India FAQ says to look for this information around five days before your test.',
    software: 'Watch the official videos before test day. The India FAQ says the test software will give no further detailed guidance on how to use it during the exam.',
  },
} as const;

/** Booking and results for the APS procedure, from the India FAQ, schedule and APS India. */
export const DMAT_PORTAL = {
  bookingUrl: 'https://www.gast.de/portal/center-search/center-search/dmat/exams/worldwide?lang=en',
  registration: [
    'Choose a test date and centre through the participant portal. Each date has its own registration deadline.',
    'Enter your details as they appear in your valid passport, the only accepted ID. Upload a passport-style photo in the portal by the deadline.',
    'Pay with PayPal or a Visa or Mastercard credit card with 3D Secure enabled. The booking system does not accept debit cards.',
    'To cancel your booking, use the participant portal by the registration deadline.',
  ],
  results: [
    'The certificate reports a percentile rank, the share of other participants whose result was at or below yours. Each module has a score on a 0–200 scale, with an average of 100. Adding the two module scores gives the total.',
    'You can take the test again.',
    'Download the certificate from the participant portal and submit it to APS India for your verification procedure.',
  ],
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
      { label: 'uni-assist', amount: '€75 / €30', detail: 'First course / each additional course in the same semester, including VPD.', source: SOURCES.applications },
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
