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
  dmat: { label: 'APS India: dMAT rules', url: 'https://aps-india.de/dmat/', reviewed },
  test: { label: 'g.a.s.t.: dMAT schedule', url: 'https://www.d-mat.de/en/dmat-in-india/', reviewed },
  // The fee is in the graduate leaflet linked from this page; the leaflet's own URL changes with each edition.
  aps: { label: 'APS India: checklists and graduate leaflet', url: 'https://aps-india.de/checklists/', reviewed },
  vpd: { label: 'uni-assist: VPD', url: 'https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/', reviewed },
  applications: { label: 'uni-assist: handling fees', url: 'https://www.uni-assist.de/en/how-to-apply/apply-online/pay-submit/', reviewed },
  visa: { label: 'German Missions: visa FAQs', url: 'https://india.diplo.de/in-en/service/2546328-2546328', reviewed },
  visaFee: { label: 'German Missions: national visa', url: 'https://india.diplo.de/in-en/service/2755482-2755482', reviewed },
  daad: { label: 'DAAD: costs', url: 'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/', reviewed },
  tum: { label: 'TUM: tuition fees', url: 'https://www.tum.de/en/studies/fees/tuition', reviewed },
  housing: {
    label: 'Studierendenwerk München Oberbayern: housing FAQs',
    url: 'https://www.studierendenwerk-muenchen-oberbayern.de/en/accommodation/faq/',
    reviewed,
  },
} satisfies Record<string, OfficialSource>;

export const DMAT = {
  summary: 'dMAT applies to selected Indian master’s applicants from Summer 2027 onwards; exemptions apply.',
  fields: 'All B.Tech/B.Eng degrees; other engineering degrees; commerce, accounting, finance, economics; business/management; tourism, travel and hospitality. Integrated or dual degrees count if a component or major falls in these fields.',
  exemptions: 'Bachelor’s and PhD applicants, other degree fields, officially confirmed exchange, double-degree or university partnership programmes and students below 5 completed semesters of a 3-year degree or 7 of a 4-year degree are exempt under the current procedure.',
  transition: 'APS registration or complete document shipment before 29 June 2026 exempts that procedure. New APS applications follow the rules then in force.',
  sequence: 'You may submit APS documents before the dMAT certificate is available. Where required, APS issuance waits for the certificate and result verification. Other required academic documents must accompany the initial submission.',
  completed: 'Your completed APS procedure does not require dMAT. A new APS application follows the rules then in force.',
  fee: '€150',
  windows: [
    { deadline: '4 January 2027', test: '16 January 2027', results: '8 February 2027' },
    { deadline: '1 March 2027', test: '13 March 2027', results: '5 April 2027' },
  ],
} as const;

/** Labels for the parts of the dMAT rule where it is shown in full. */
export const DMAT_LABELS = {
  fields: 'Affected degree fields',
  exemptions: 'Who is exempt',
  transition: 'Earlier APS applications',
  sequence: 'dMAT and APS',
  windows: 'Test dates',
  fee: 'Test fee',
} as const;

export const HOUSING = {
  preparation: 'Housing preparation starts before you travel. Apply as soon as each provider opens applications: rooms are allocated from waiting lists and a place is not guaranteed. Keep private rooms and temporary accommodation in view as alternatives.',
} as const;

export const TUITION = {
  public: 'Many public programmes have no tuition, but non-EU fees apply at some institutions and in some states; certain programmes also charge tuition. A semester contribution is separate. Check your programme’s fees and exemptions.',
  private: 'Private universities charge programme-specific tuition. Check the full fee schedule and any separate semester contribution.',
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
      { label: 'uni-assist', amount: '€75 / €30', detail: 'First course / each additional course in the same semester, including VPD. Direct university fees vary.', source: SOURCES.applications },
      { label: 'APS', amount: '₹18,000', detail: 'Individual graduate verification procedure.', source: SOURCES.aps },
      { label: 'dMAT, where required', amount: DMAT.fee, detail: 'Paid to g.a.s.t. during registration; check the exemptions.', source: SOURCES.dmat },
      { label: 'IELTS, health insurance and flights', detail: 'Check the current test, policy and travel prices with your chosen providers.' },
      { label: 'National visa', amount: '€75', detail: 'Fee for applicants over 18, paid in INR at the exchange rate on the appointment day. The service provider charges its own fee on top.', source: SOURCES.visaFee },
    ],
  },
  {
    group: 'Semester contributions',
    items: [
      { label: 'Contribution per semester', amount: '€70–€430', detail: 'DAAD’s range; confirm the amount with your university. Separate from tuition.', source: SOURCES.daad },
    ],
  },
  {
    group: 'Tuition',
    items: [
      { label: 'Public and private programmes', detail: `${TUITION.public} ${TUITION.private}`, source: SOURCES.daad },
      { label: 'TUM example', amount: '€4,000 or €6,000', detail: 'Usual master’s tuition per semester for non-EU/EEA students liable for fees, rising to €4,600 or €6,800 from winter semester 2027/28. Programme, exemption and waiver rules apply.', source: SOURCES.tum },
    ],
  },
  {
    group: 'Blocked-account deposit',
    items: [
      {
        label: 'Your own living money',
        amount: `${euros(LIVING_FUNDS.monthly)} per month`,
        detail: `The mission’s figure, in force since 1 September 2024. ${LIVING_FUNDS.months} months at that rate comes to ${euros(LIVING_FUNDS.monthly * LIVING_FUNDS.months)}. A blocked account is one way to prove funds, not a service fee. Provider charges are separate; check the current visa checklist.`,
        source: SOURCES.visa,
      },
    ],
  },
];
