import type { CoreSubtest, CoreTask, Passage, SectionContent, SectionId } from '@/utils/dmat/types';

import practiceIndex from './practice-index.json';

/**
 * The question bank: static JSON written by `scripts/dmat/build-bank.ts`, loaded only when a test starts.
 * This file is the only place a bank file is named and the only place an import is given its type.
 */

type Loader = () => Promise<{ default: unknown }>;

export const BANK = {
  figures: {
    mock: () => import('./figures-mock.json'),
    section: () => import('./figures-section.json'),
    practice: () => import('./figures-practice.json'),
  },
  equations: {
    mock: () => import('./equations-mock.json'),
    section: () => import('./equations-section.json'),
    practice: () => import('./equations-practice.json'),
  },
  latin: {
    mock: () => import('./latin-mock.json'),
    section: () => import('./latin-section.json'),
    practice: () => import('./latin-practice.json'),
  },
  academic: {
    mock: () => import('./academic-mock.json'),
  },
  passages: {
    p10: () => import('./passage-p10.json'),
    p11: () => import('./passage-p11.json'),
    p12: () => import('./passage-p12.json'),
    p13: () => import('./passage-p13.json'),
    p14: () => import('./passage-p14.json'),
    p15: () => import('./passage-p15.json'),
    p16: () => import('./passage-p16.json'),
    p17: () => import('./passage-p17.json'),
  },
} as const satisfies Record<CoreSubtest | 'academic' | 'passages', Record<string, Loader>>;

/** The practice passages by subject, for the slip, without loading a passage. */
export const PRACTICE_PASSAGES = practiceIndex as readonly { id: string; area: string; title: string }[];

const loaderFor = (group: Record<string, Loader>, setId: string, what: string): Loader => {
  if (!Object.hasOwn(group, setId)) throw new Error(`Unknown ${what}: ${setId}`);
  return group[setId];
};

/** Loads what a section shows. The only function the page calls. */
export async function loadSection(section: SectionId, setId: string): Promise<SectionContent> {
  if (section !== 'academic') {
    const tasks = (await loaderFor(BANK[section], setId, `${section} set`)()).default as CoreTask[];
    return { section, tasks };
  }
  if (setId === 'mock') {
    return { section, passages: (await BANK.academic.mock()).default as Passage[] };
  }
  return { section, passages: [(await loaderFor(BANK.passages, setId, 'practice passage')()).default as Passage] };
}
