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
    desc: 'We evaluate your profile and eligibility, help you apply for APS and plan your IELTS preparation.',
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
    desc: 'We shortlist universities with you, write your SOP with you and submit every application on the university portals.',
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
    desc: 'As admission decisions arrive, we help with your education loan, help you open your blocked account and prepare your visa documents and appointment.',
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
    desc: 'We help with your student dorm applications, take you through city registration (Anmeldung) and opening a bank account, and introduce you to seniors at your university.',
  },
];

export const MONTHS = [
  { m: 1, phase: 0, tasks: ['Profile and eligibility evaluation', 'APS application support'] },
  { m: 2, phase: 0, tasks: ['IELTS preparation plan and guidance'] },
  { m: 3, phase: 1, tasks: ['University shortlisting with you', 'SOP writing with you, by hand'] },
  { m: 4, phase: 1, tasks: ['Submitting your applications on the portals'] },
  { m: 5, phase: 2, tasks: ['Tracking admission decisions', 'Help with your education loan'] },
  { m: 6, phase: 2, tasks: ['Help opening your blocked account', 'Visa documents and appointment booking'] },
  {
    m: 7,
    phase: 3,
    tasks: [
      'Help with student dorm applications',
      'City registration (Anmeldung)',
      'Help opening a bank account',
      'Introductions to seniors',
    ],
  },
];

export const TOTAL_MONTHS = MONTHS.length;

/** The four stage cards above the explorer. Their copy differs slightly from the phase descriptions. */
export const STAGES = [
  {
    phase: PHASES[0],
    when: 'Phase 1, months 1–2',
    german: 'APS',
    body: 'We evaluate your profile and eligibility, help you apply for APS and plan your IELTS preparation.',
  },
  {
    phase: PHASES[1],
    when: 'Phase 2, months 3–4',
    german: 'Bewerbung',
    body: 'We shortlist universities with you, write your SOP with you and submit every application on the university portals.',
  },
  {
    phase: PHASES[2],
    when: 'Phase 3, months 5–6',
    german: 'Visum',
    body: 'As admission decisions arrive, we help with your education loan, help you open your blocked account and prepare your visa documents.',
  },
  {
    phase: PHASES[3],
    when: 'Phase 4, month 7',
    german: 'Anmeldung',
    body: 'We help with your student dorm applications, take you through city registration (Anmeldung) and opening a bank account, and introduce you to seniors.',
  },
];
