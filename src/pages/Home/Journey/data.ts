import { DMAT, HOUSING, SOURCES, type OfficialSource } from '@/utils/applicationFacts';
import { ARRIVAL_SUPPORT } from '@/utils/constants';

export const JOURNEY_COPY = {
  lede: 'Four stages that overlap. The seven months below are one example of how they can fit together, not a fixed duration.',
  sources: 'Official sources for these stages',
  explorer: 'Each month has a main focus, shown by its colour. Work from the other stages runs alongside it, and your programme deadlines set the real dates.',
  work: 'What we work on',
  waiting: 'Waiting on',
} as const;

/** Sources for the facts the stage cards mention, in card order. */
export const STAGE_SOURCES = [SOURCES.dmat, SOURCES.vpd, SOURCES.visa];

export interface Phase {
  n: number;
  name: string;
  /** First month of the phase. */
  start: number;
  /** Bar and segment colour. */
  color: string;
  /** Text colour on light backgrounds. */
  ink: string;
  /** Background of the month detail panel. */
  tint: string;
  /** Segment label colour. */
  labelColor: string;
  /** Corner radii of the track segment. */
  radius: string;
  /** Track segment width, in months. */
  months: number;
  desc: string;
}

export const PHASES: Phase[] = [
  {
    n: 1,
    name: 'Foundation',
    start: 1,
    color: '#1d7a3d',
    ink: '#1d7a3d',
    tint: '#e4f0e6',
    labelColor: '#ffffff',
    radius: '10px 4px 4px 10px',
    months: 2,
    desc: 'We evaluate your profile and start programme research, requirement checks and deadline planning with you. Alongside that we help you apply for APS, check whether you need dMAT and plan your IELTS preparation.',
  },
  {
    n: 2,
    name: 'Applications',
    start: 3,
    color: '#ef8a21',
    ink: '#b85d06',
    tint: '#fdeedb',
    labelColor: '#10182e',
    radius: '4px',
    months: 2,
    desc: 'We shortlist universities with you, help you draft and revise your SOP and prepare each application with you. You approve every submission. Where a programme needs a VPD from uni-assist, we help you request it early: the university application is a separate step with its own deadline.',
  },
  {
    n: 3,
    name: 'Pre-departure',
    start: 5,
    color: '#d42b1f',
    ink: '#c4261b',
    tint: '#fbe4e1',
    labelColor: '#ffffff',
    radius: '4px',
    months: 2,
    desc: 'We help with your education loan, help you open your blocked account and prepare your visa documents and appointment. We plan these with you early and complete each one as your offers and documents arrive. Alongside them, we help you look for housing or a temporary stay.',
  },
  {
    n: 4,
    name: 'Arrival',
    start: 7,
    color: '#121212',
    ink: '#121212',
    tint: '#ebebe8',
    labelColor: '#ffffff',
    radius: '4px 10px 10px 4px',
    months: 1,
    desc: ARRIVAL_SUPPORT.settling,
  },
];

interface JourneyTask {
  /** The stage this task belongs to; a month holds tasks from more than one. */
  strand: string;
  text: string;
  source?: OfficialSource;
}

interface JourneyMonth {
  m: number;
  /** Index of the month's main focus in PHASES. */
  phase: number;
  /** Work the applicant and mentor do. */
  tasks: JourneyTask[];
  /** Steps that depend on an outside organisation. */
  waits: JourneyTask[];
}

export const MONTHS: JourneyMonth[] = [
  {
    m: 1,
    phase: 0,
    tasks: [
      { strand: 'Foundation', text: 'Profile and eligibility evaluation, and help with your APS application.' },
      { strand: 'Foundation', text: `We check whether you need dMAT. ${DMAT.summary}`, source: SOURCES.dmat },
      { strand: 'Applications', text: 'Programme research, requirement checks and a deadline plan for each course on your list.' },
      { strand: 'Pre-departure', text: 'A first plan for funding, visa documents and housing.' },
    ],
    waits: [{ strand: 'APS certificate', text: DMAT.sequence, source: SOURCES.dmat }],
  },
  {
    m: 2,
    phase: 0,
    tasks: [
      { strand: 'Foundation', text: 'IELTS preparation plan and guidance.' },
      { strand: 'Applications', text: 'University shortlisting with you. Where a programme needs a VPD, we help you request it now.' },
      { strand: 'Housing', text: HOUSING.preparation, source: SOURCES.housing },
    ],
    waits: [
      {
        strand: 'dMAT result',
        text: 'g.a.s.t. runs the test on fixed dates and releases results on a set day. Where dMAT applies, the APS certificate follows the result.',
        source: SOURCES.test,
      },
      {
        strand: 'uni-assist / VPD',
        text: 'uni-assist says a VPD usually takes 4 to 6 weeks and advises requesting it at least 8 weeks before the deadline. You then send it to the university with your application.',
        source: SOURCES.vpd,
      },
    ],
  },
  {
    m: 3,
    phase: 1,
    tasks: [
      { strand: 'Applications', text: 'SOP drafting and revision with your mentor.' },
      { strand: 'Applications', text: 'Document checks against each programme’s requirements.' },
      { strand: 'Foundation', text: 'Your language test, and answers to any questions from APS.' },
    ],
    waits: [
      {
        strand: 'APS certificate',
        text: 'APS India verifies your documents and updates your online profile with the result.',
        source: SOURCES.aps,
      },
    ],
  },
  {
    m: 4,
    phase: 1,
    tasks: [
      { strand: 'Applications', text: 'Your applications go in on the portals once you have approved each one.' },
      { strand: 'Applications', text: 'Answering document requests from universities.' },
      { strand: 'Pre-departure', text: 'Funding plan and visa document list, ready for when an offer arrives.' },
    ],
    waits: [{ strand: 'Admission decisions', text: 'Each university decides on its own timetable.' }],
  },
  {
    m: 5,
    phase: 2,
    tasks: [
      { strand: 'Applications', text: 'Tracking admission decisions and reviewing each offer’s conditions and acceptance deadline.' },
      { strand: 'Pre-departure', text: 'Help with your education loan.' },
      { strand: 'Housing', text: 'Following up your housing applications and lining up private or temporary options.' },
    ],
    waits: [
      { strand: 'Admission decisions', text: 'The remaining universities are still deciding.' },
      { strand: 'Loan decision', text: 'Your lender runs its own checks on your documents.' },
    ],
  },
  {
    m: 6,
    phase: 2,
    tasks: [
      { strand: 'Pre-departure', text: 'Help opening your blocked account.' },
      { strand: 'Pre-departure', text: 'Visa documents and appointment booking.', source: SOURCES.visaFee },
      { strand: 'Housing', text: 'Confirming where you will stay, or looking for a temporary stay if no longer-term place comes through.' },
    ],
    waits: [
      {
        strand: 'Visa appointment',
        text: 'Appointments are booked through the official route and are not moved forward because a course starts sooner.',
        source: SOURCES.visa,
      },
      { strand: 'Visa decision', text: 'The mission says processing may take several months.', source: SOURCES.visa },
      {
        strand: 'Housing',
        text: 'Student housing is allocated from a waiting list, and a place is not guaranteed.',
        source: SOURCES.housing,
      },
    ],
  },
  {
    m: 7,
    phase: 3,
    tasks: [
      { strand: 'Arrival', text: 'City registration (Anmeldung).' },
      { strand: 'Arrival', text: 'Help opening a bank account.' },
      { strand: 'Arrival', text: 'Getting oriented, with introductions to seniors.' },
      { strand: 'Arrival', text: 'Guidance on part-time work and the rules for international students.' },
    ],
    waits: [
      { strand: 'Local appointments', text: 'Registration offices and banks give appointments on their own schedule.' },
    ],
  },
];

export const TOTAL_MONTHS = MONTHS.length;

/** The four stage cards above the explorer. Each shows its phase's description. */
export const STAGES = [
  { phase: PHASES[0], when: 'From the start', tag: 'APS', lang: 'de' },
  // The stage title is already "Applications", so a tag here would only repeat it.
  { phase: PHASES[1], when: 'Overlaps with Foundation', tag: null, lang: null },
  { phase: PHASES[2], when: 'Overlaps with Applications', tag: 'Visa', lang: 'en' },
  { phase: PHASES[3], when: 'Once you can travel', tag: 'Anmeldung', lang: 'de' },
] as const;
