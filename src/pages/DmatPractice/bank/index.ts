import type { CoreSubtest, CoreTask, Passage, SectionContent, SectionId } from '@/utils/dmat/types';

import practiceIndex from './practice-index.json';

/**
 * The question bank: static JSON written by `scripts/dmat/build-bank.ts`, loaded only when a test starts.
 * This file is the only place a bank file is named and the only place an import is given its type.
 */

type Loader = () => Promise<{ default: unknown }>;

export const MOCKS = [
  {
    figures: () => import('./figures-mock.json'),
    equations: () => import('./equations-mock.json'),
    latin: () => import('./latin-mock.json'),
    academic: () => import('./academic-mock.json'),
  },
  {
    figures: () => import('./figures-mock-2.json'),
    equations: () => import('./equations-mock-2.json'),
    latin: () => import('./latin-mock-2.json'),
    academic: () => import('./academic-mock-2.json'),
  },
  {
    figures: () => import('./figures-mock-3.json'),
    equations: () => import('./equations-mock-3.json'),
    latin: () => import('./latin-mock-3.json'),
    academic: () => import('./academic-mock-3.json'),
  },
  {
    figures: () => import('./figures-mock-4.json'),
    equations: () => import('./equations-mock-4.json'),
    latin: () => import('./latin-mock-4.json'),
    academic: () => import('./academic-mock-4.json'),
  },
] as const satisfies readonly Record<SectionId, Loader>[];

export const MOCK_COUNT = MOCKS.length;
export const MOCK_NUMBERS: readonly number[] = MOCKS.map((_, index) => index + 1);

export const BANK = {
  figures: {
    section: () => import('./figures-section.json'),
    practice: () => import('./figures-practice.json'),
  },
  equations: {
    section: () => import('./equations-section.json'),
    practice: () => import('./equations-practice.json'),
  },
  latin: {
    section: () => import('./latin-section.json'),
    practice: () => import('./latin-practice.json'),
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
} as const satisfies Record<CoreSubtest | 'passages', Record<string, Loader>>;

/** The practice passages by subject, for the slip, without loading a passage. */
export const PRACTICE_PASSAGES = practiceIndex as readonly { id: string; area: string; title: string }[];

const loadedSections = new Map<string, SectionContent>();
const inFlightSections = new Map<string, Promise<SectionContent>>();

function resolveMockNumber(setId: string, mock?: number): number | null {
  return setId === 'mock' ? mock ?? 1 : null;
}

function sectionKey(section: SectionId, setId: string, mock?: number): string {
  const mockNumber = resolveMockNumber(setId, mock);
  return mockNumber !== null ? `${section}:mock:${mockNumber}` : `${section}:${setId}`;
}

const loaderFor = (group: Record<string, Loader>, setId: string, what: string): Loader => {
  if (!Object.hasOwn(group, setId)) throw new Error(`Unknown ${what}: ${setId}`);
  return group[setId];
};

function mockLoaderFor(mockNumber: number, section: SectionId): Loader {
  const entry = MOCKS[mockNumber - 1];
  if (!entry) throw new Error(`Unknown mock: ${mockNumber}`);
  return entry[section];
}

async function fetchSection(section: SectionId, setId: string, mock?: number): Promise<SectionContent> {
  const mockNumber = resolveMockNumber(setId, mock);
  if (mockNumber !== null) {
    const loader = mockLoaderFor(mockNumber, section);
    if (section === 'academic') {
      return { section, passages: (await loader()).default as Passage[] };
    }
    return { section, tasks: (await loader()).default as CoreTask[] };
  }
  if (section !== 'academic') {
    const tasks = (await loaderFor(BANK[section], setId, `${section} set`)()).default as CoreTask[];
    return { section, tasks };
  }
  return { section, passages: [(await loaderFor(BANK.passages, setId, 'practice passage')()).default as Passage] };
}

/** Loads what a section shows, reusing any cached or in-flight request. */
export function loadSection(section: SectionId, setId: string, mock?: number): Promise<SectionContent> {
  const key = sectionKey(section, setId, mock);
  const cached = loadedSections.get(key);
  if (cached) return Promise.resolve(cached);
  const inFlight = inFlightSections.get(key);
  if (inFlight) return inFlight;

  const request = fetchSection(section, setId, mock).then(
    (content) => {
      loadedSections.set(key, content);
      inFlightSections.delete(key);
      return content;
    },
    (error: unknown) => {
      inFlightSections.delete(key);
      throw error;
    },
  );
  inFlightSections.set(key, request);
  return request;
}
