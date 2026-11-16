import { type OfficialSource, SOURCES } from '@/utils/applicationFacts';

export const OTHER_APPLICANTS_COPY = {
  heading: 'Other applicants',
  /** One line under the heading; empty means none. */
  intro: 'The questions on this page do not cover these cases; each block links to the official page to start from.',
} as const;

/** The three groups, in display order. A degree from another country covers Indian applicants who studied abroad. */
export const OTHER_APPLICANT_IDS = ['bachelors', 'phd', 'foreign-degree'] as const;
export type OtherApplicantId = (typeof OTHER_APPLICANT_IDS)[number];

/** One short block: how the route differs, and the official page. */
export interface OtherApplicant {
  id: OtherApplicantId;
  title: string;
  /** One or two sentences; empty means the block shows its title only. */
  body: string;
  source?: OfficialSource;
}

/** One block per id, in `OTHER_APPLICANT_IDS` order. Track E writes the bodies and sources from official pages. */
export const OTHER_APPLICANTS: readonly OtherApplicant[] = [
  {
    id: 'bachelors',
    title: 'Bachelor’s',
    body: 'A bachelor’s place needs a university entrance qualification (Hochschulzugangsberechtigung). Depending on your country, some semesters of university study there may also be required; uni-assist explains how to check, including the Studienkolleg, a preparatory course.',
    source: SOURCES.uniAssistBachelors,
  },
  {
    id: 'phd',
    title: 'PhD',
    body: 'A doctorate in Germany follows one of two routes: you find a university professor who will supervise your dissertation, or you join a structured doctoral programme.',
    source: SOURCES.daadPhd,
  },
  {
    id: 'foreign-degree',
    title: 'Degree from another country',
    body: 'APS India verifies documents issued by Indian institutions; your nationality does not decide whether you need it. If your relevant degree was not issued by an Indian institution, you may not need APS verification, but APS asks you to check the requirements carefully before assuming you are exempt.',
    source: SOURCES.apsFaqs,
  },
];
