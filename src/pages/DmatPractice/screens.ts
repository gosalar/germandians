import type { Dispatch, SetStateAction } from 'react';

import type { SectionRun } from '@/utils/dmat/session';
import type { SectionContent, SectionId } from '@/utils/dmat/types';

import { loadSection } from './bank';

/**
 * The test and record screens load on demand; the start page and the pause and break screen ship with the
 * page, so a test can always reach its next section. What has arrived is kept in the page's state, which
 * is all the page reads while it renders.
 */
const SCREENS = {
  runner: () => import('./Runner'),
  record: () => import('./Record'),
};

export type LazyScreen = keyof typeof SCREENS;

export interface Loaded {
  screens: { [K in LazyScreen]?: Awaited<ReturnType<(typeof SCREENS)[K]>>['default'] };
  /** By `runKey`. */
  sections: Record<string, SectionContent>;
}

export const NOTHING_LOADED: Loaded = { screens: {}, sections: {} };

type Keep = Dispatch<SetStateAction<Loaded>>;

export const runKey = (run: Pick<SectionRun, 'id' | 'setId' | 'mock'>) => {
  const mock = run.mock ?? (run.setId === 'mock' ? 1 : undefined);
  return mock !== undefined ? `${run.id}:${run.setId}:${mock}` : `${run.id}:${run.setId}`;
};

export async function fetchScreen(keep: Keep, name: LazyScreen): Promise<void> {
  const { default: view } = await SCREENS[name]();
  keep((current) => current.screens[name] === view ? current : { ...current, screens: { ...current.screens, [name]: view } });
}

/** `key` is a `runKey`. */
export async function fetchRun(keep: Keep, key: string): Promise<void> {
  const [section, setId, mockPart] = key.split(':') as [SectionId, string, string | undefined];
  const mock = mockPart !== undefined ? Number(mockPart) : undefined;
  const content = await loadSection(section, setId, mock);
  keep((current) => current.sections[key] === content ? current : { ...current, sections: { ...current.sections, [key]: content } });
}

/** Fetching ahead stays silent: if it failed, the screen's own load reports it and offers Retry. */
export function quietly(request: Promise<void>): void {
  void request.catch(() => {});
}
