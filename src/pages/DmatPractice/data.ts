import { DMAT } from '@/utils/applicationFacts';
import { DMAT_PRACTICE } from '@/utils/constants';
import type { Mode, SectionId } from '@/utils/dmat/types';

/**
 * The labels the practice page's screens share. Copy that only one screen needs lives in that screen's
 * own `data.ts`. What the dMAT is comes from `DMAT.about`, and the practice offer from `DMAT_PRACTICE`;
 * neither is retyped here.
 */
export const PAGE_COPY = {
  title: 'dMAT practice',
  introduction: `${DMAT.about} ${DMAT_PRACTICE.modes}`,
  /** Shown while a section's tasks load, and when loading them fails. */
  loading: 'Loading the tasks.',
  loadFailed: 'The tasks did not load. Check your connection and try again.',
  retry: 'Try again',
} as const;

/** `module` is the part of the test a section belongs to; `unit` is what one screen of it holds. */
export const SECTION_LABELS = {
  figures: { name: 'Figure Sequences', module: 'Core Module', unit: 'task' },
  equations: { name: 'Mathematical Equations', module: 'Core Module', unit: 'task' },
  latin: { name: 'Latin Squares', module: 'Core Module', unit: 'task' },
  academic: { name: 'General Academic Module', module: 'Subject Module', unit: 'passage' },
} as const satisfies Record<SectionId, { name: string; module: string; unit: string }>;

export const MODE_LABELS = {
  full: { name: 'Full mock', start: 'Start the full mock' },
  section: { name: 'One section', start: 'Start the section' },
  practice: { name: 'Practice', start: 'Start practising' },
} as const satisfies Record<Mode, { name: string; start: string }>;

export const mockName = (mock: number) => `Mock ${mock}`;
