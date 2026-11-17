import { DMAT, DMAT_EXAM, DMAT_FORMAT, SOURCES } from '@/utils/applicationFacts';
import { DMAT_PRACTICE } from '@/utils/constants';

const { tasksPerSubtest, subtestMinutes, breakMinutes, academicMinutes } = DMAT_FORMAT;

/**
 * The home lead-in to the dMAT guide and dMAT practice: what the test is, when it applies and how it runs,
 * then one link to each page. The facts come from `applicationFacts.ts`, the practice offer from
 * `DMAT_PRACTICE`; the guide holds the rest.
 */
export const DMAT_INTRO_COPY = {
  title: 'Practise for the dMAT',
  about: DMAT.about,
  rule: DMAT.summary,
  ruleSource: SOURCES.dmat,
  practice: DMAT_PRACTICE.modes,
  independence: DMAT_PRACTICE.independence,
  practiceLink: 'Open dMAT practice',
  guideLink: 'Read the dMAT guide',
  format: { de: 'Ablauf', en: 'How the test runs', source: SOURCES.dmatPreparation },
} as const;

export type FormatTone = 'core' | 'break' | 'academic';

export interface FormatPart {
  name: string;
  note?: string;
  tone: FormatTone;
  /** A part in one block. */
  minutes?: number;
  /** A part made of timed subtests, each in its own block. */
  subtests?: { name: string; minutes: number }[];
}

/** The order the test runs in, from the preparation material. Each bar is drawn to scale against the longest. */
export const FORMAT_PARTS: readonly FormatPart[] = [
  {
    name: 'Core Module',
    note: `${tasksPerSubtest} tasks in each subtest`,
    tone: 'core',
    subtests: DMAT_EXAM.format.puzzles.map(({ name }) => ({ name, minutes: subtestMinutes })),
  },
  { name: 'Break', tone: 'break', minutes: breakMinutes },
  { name: 'General Academic Module', note: 'Passages with questions about them', tone: 'academic', minutes: academicMinutes },
];

export const LONGEST_PART = Math.max(subtestMinutes, breakMinutes, academicMinutes);

export const minutesLabel = (minutes: number) => `${minutes} minutes`;
