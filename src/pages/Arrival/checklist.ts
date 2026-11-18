import { ARRIVAL_ITEM_IDS, orderTickedItems, type ArrivalItemId } from './storage';

export interface ArrivalProgressSummary {
  done: number;
  total: number;
  remaining: number;
  percent: number;
}

export function toggleArrivalItem(current: readonly ArrivalItemId[], id: ArrivalItemId): ArrivalItemId[] {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return orderTickedItems(next);
}

export function summarizeArrivalProgress(
  ticked: readonly ArrivalItemId[],
  total: number = ARRIVAL_ITEM_IDS.length,
): ArrivalProgressSummary {
  const done = Math.min(ticked.length, total);
  const remaining = Math.max(total - done, 0);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, remaining, percent };
}
