import type { SectionResult } from '@/utils/dmat/marking';
import type { SectionContent } from '@/utils/dmat/types';

import { TAG_LABELS } from './data';

export function getMissedTags(content: SectionContent, result: SectionResult) {
  const missed = new Set(result.tasks.filter(({ verdict }) => verdict !== 'right').map(({ id }) => id));
  const tasks = content.section === 'academic'
    ? content.passages.flatMap(({ questions }) => questions.map(({ id, type }) => ({ id, tags: [type] })))
    : content.tasks;
  const counts = new Map<string, number>();

  for (const { id, tags } of tasks) {
    if (!missed.has(id)) continue;
    for (const tag of new Set(tags)) {
      if (Object.hasOwn(TAG_LABELS, tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3);
}

export function longestScreens(content: SectionContent, timeOn: Record<string, number>) {
  const screens = content.section === 'academic' ? content.passages : content.tasks;
  return new Set(screens
    .map(({ id }, index) => ({ id, time: timeOn[`${content.section}:${index}`] ?? timeOn[id] ?? 0 }))
    .filter(({ time }) => time > 0)
    .sort((a, b) => b.time - a.time)
    .slice(0, 3)
    .map(({ id }) => id));
}
