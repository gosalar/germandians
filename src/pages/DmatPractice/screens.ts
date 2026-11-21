import type { Dispatch, SetStateAction } from 'react';

import type { SectionRun } from '@/utils/dmat/session';
import {
  CURRENT_FIGURE_BANK_REVISION,
  type FigureBankRevision,
  type SectionContent,
  type SectionId,
} from '@/utils/dmat/types';

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

export const runKey = (
  run: Pick<SectionRun, 'id' | 'setId' | 'mock'>,
  figureRevision: FigureBankRevision = CURRENT_FIGURE_BANK_REVISION,
) => {
  const mock = run.mock ?? (run.setId === 'mock' ? 1 : undefined);
  const base = mock !== undefined ? `${run.id}:${run.setId}:${mock}` : `${run.id}:${run.setId}`;
  return run.id === 'figures' ? `${base}:r${figureRevision}` : base;
};

export async function fetchScreen(keep: Keep, name: LazyScreen): Promise<void> {
  const { default: view } = await SCREENS[name]();
  keep((current) => current.screens[name] === view ? current : { ...current, screens: { ...current.screens, [name]: view } });
}

/** `key` is a `runKey`. */
export async function fetchRun(keep: Keep, key: string): Promise<void> {
  const [section, setId, ...rest] = key.split(':') as [SectionId, string, ...string[]];
  let mock: number | undefined;
  let figureRevision: FigureBankRevision | undefined;
  for (const part of rest) {
    if (part.startsWith('r')) figureRevision = Number(part.slice(1)) as FigureBankRevision;
    else mock = Number(part);
  }
  const content = await loadSection(section, setId, mock, figureRevision);
  keep((current) => current.sections[key] === content ? current : { ...current, sections: { ...current.sections, [key]: content } });
}

/** Fetching ahead stays silent: if it failed, the screen's own load reports it and offers Retry. */
export function quietly(request: Promise<void>): void {
  void request.catch(() => {});
}
