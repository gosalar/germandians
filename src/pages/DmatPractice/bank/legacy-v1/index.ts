import type { FigureTask } from '@/utils/dmat/types';

/**
 * Immutable revision-1 figure sets kept for sessions saved before the figure-option update.
 * Loaded on demand only when a stored revision-1 session is opened.
 */

type Loader = () => Promise<{ default: unknown }>;

const LEGACY_MOCK_FIGURES = [
  () => import('./legacy-v1-figures-mock.json'),
  () => import('./legacy-v1-figures-mock-2.json'),
  () => import('./legacy-v1-figures-mock-3.json'),
  () => import('./legacy-v1-figures-mock-4.json'),
] as const satisfies readonly Loader[];

const LEGACY_SET_FIGURES = {
  section: () => import('./legacy-v1-figures-section.json'),
  practice: () => import('./legacy-v1-figures-practice.json'),
} as const satisfies Record<string, Loader>;

export async function loadLegacyFigureSet(setId: string, mockNumber: number | null): Promise<FigureTask[]> {
  if (mockNumber !== null) {
    const loader = LEGACY_MOCK_FIGURES[mockNumber - 1];
    if (!loader) throw new Error(`Unknown legacy figures mock: ${mockNumber}`);
    return (await loader()).default as FigureTask[];
  }
  if (!Object.hasOwn(LEGACY_SET_FIGURES, setId)) {
    throw new Error(`Unknown legacy figures set: ${setId}`);
  }
  return (await LEGACY_SET_FIGURES[setId as keyof typeof LEGACY_SET_FIGURES]()).default as FigureTask[];
}
