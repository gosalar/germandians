import { HOUSING } from '@/utils/applicationFacts';
import { APPLICANT_CONTROL, FEE_PROMISE, INTAKE_SEATS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

const MENTORS = 6;
const STUDENTS_PER_MENTOR = INTAKE_SEATS / MENTORS;

export const MENTOR_COPY = {
  title: 'How our mentors work',
  intro: 'Our six mentors are Indian students at German universities who went through this process themselves. Each works with up to five students at a time, so there is time to check your programme requirements, review your documents and work on your SOP with you.',
  ratio: 'One mentor, up to five students.',
  commitmentsTitle: 'What we commit to',
  topicHeader: 'Part of the service',
  commitmentHeader: 'Our commitment',
} as const;

export const METHOD_POINTS = [
  {
    color: '#1d7a3d',
    text: 'We check each programme’s admission requirements before it goes on your shortlist: the degree it accepts, language evidence, tests and deadlines.',
  },
  {
    color: '#ef8a21',
    text: 'We compare your subject credits with each programme’s prerequisites. Formal requirements decide eligibility, so this comes before the SOP.',
  },
  {
    color: '#d42b1f',
    text: 'A mentor helps you draft and revise your SOP and reviews every document before it is submitted.',
  },
];

/** The cap in numbers: what one mentor takes on, and what that adds up to for the intake. */
export const WORKLOAD = {
  mentor: {
    title: 'Each mentor',
    head: '1 mentor',
    crowd: `Up to ${STUDENTS_PER_MENTOR} students`,
    outcome: 'A shortlist for each student',
    note: 'Requirements, documents and SOP reviewed for that one student',
  },
  team: {
    title: 'The whole team',
    head: `${MENTORS} mentors`,
    crowd: `Up to ${STUDENTS_PER_MENTOR} students each`,
    outcome: `${INTAKE_SEATS} places for ${siteConfig.intake}`,
    note: 'Our capacity for this intake',
  },
  studentsPerMentor: STUDENTS_PER_MENTOR,
  mentors: MENTORS,
} as const;

/** What Germandians commits to. Each row is something a client can hold the team to. */
export const COMMITMENTS = [
  { topic: 'Who advises you', commitment: 'Students living in Germany right now' },
  { topic: 'Your documents', commitment: 'Reviewed by a mentor before anything is submitted' },
  { topic: 'Your SOP', commitment: 'Your statement in your own words, drafted and revised with your mentor' },
  { topic: 'Your applications', commitment: APPLICANT_CONTROL },
  { topic: 'When payment is due', commitment: FEE_PROMISE },
  {
    topic: 'Help after admission',
    commitment: `Help with your loan, blocked account and visa. ${HOUSING.arrival}`,
  },
];
