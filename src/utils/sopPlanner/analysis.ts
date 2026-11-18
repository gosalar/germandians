import {
  SOP_PART_IDS,
  type OutlineAnalysis,
  type PartAnalysis,
  type PartMatch,
  type SopOutlineEntries,
  type SopPartId,
  type StockPhraseDefinition,
  type TextSegment,
} from './types.ts';

interface RawSpan {
  readonly start: number;
  readonly end: number;
  readonly item: StockPhraseDefinition;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPhrasePattern(phrase: string): RegExp {
  const words = phrase
    .trim()
    .split(/\s+/)
    .map((word) => escapeRegExp(word).replace(/['’]/g, "['’]"))
    .join('\\s+');
  return new RegExp(`\\b${words}\\b`, 'gi');
}

/** Counts whitespace-separated tokens that contain at least one letter or digit. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Finds non-overlapping case-insensitive stock-phrase matches and builds text segments for highlighting. */
export function analysePart(text: string, phrases: readonly StockPhraseDefinition[]): PartAnalysis {
  const wordCount = countWords(text);
  if (!text.trim() || phrases.length === 0) {
    return { wordCount, matches: [], segments: text ? [{ kind: 'text', text }] : [] };
  }

  const candidates: RawSpan[] = [];
  for (const item of phrases) {
    if (!item.phrase.trim()) continue;
    const pattern = buildPhrasePattern(item.phrase);
    for (let found = pattern.exec(text); found !== null; found = pattern.exec(text)) {
      candidates.push({
        start: found.index,
        end: found.index + found[0].length,
        item,
      });
    }
  }

  if (candidates.length === 0) {
    return { wordCount, matches: [], segments: [{ kind: 'text', text }] };
  }

  // Prefer the earliest match; when two phrases start at the same index, prefer the longer phrase.
  candidates.sort((left, right) => left.start - right.start || right.end - right.start - (left.end - left.start));

  const accepted: RawSpan[] = [];
  let cursor = 0;
  for (const span of candidates) {
    if (span.start < cursor) continue;
    accepted.push(span);
    cursor = span.end;
  }

  const noteByPhraseId = new Map<string, { noteNumber: number; item: StockPhraseDefinition; count: number }>();
  const segments: TextSegment[] = [];
  let offset = 0;

  for (const span of accepted) {
    if (span.start > offset) {
      segments.push({ kind: 'text', text: text.slice(offset, span.start) });
    }
    let record = noteByPhraseId.get(span.item.id);
    if (!record) {
      record = { noteNumber: noteByPhraseId.size + 1, item: span.item, count: 0 };
      noteByPhraseId.set(span.item.id, record);
    }
    record.count += 1;
    segments.push({
      kind: 'match',
      text: text.slice(span.start, span.end),
      phraseId: span.item.id,
      noteNumber: record.noteNumber,
    });
    offset = span.end;
  }

  if (offset < text.length) {
    segments.push({ kind: 'text', text: text.slice(offset) });
  }

  const matches: PartMatch[] = [...noteByPhraseId.values()].map(({ noteNumber, item, count }) => ({
    noteNumber,
    item,
    count,
  }));

  return { wordCount, matches, segments };
}

export function analyseOutline(
  entries: SopOutlineEntries,
  phrases: readonly StockPhraseDefinition[],
): OutlineAnalysis {
  let totalWords = 0;
  let totalMatchedSpans = 0;
  const distinctPhraseIds = new Set<string>();
  const parts = {} as { [Id in SopPartId]: PartAnalysis };

  for (const id of SOP_PART_IDS) {
    const analysis = analysePart(entries[id], phrases);
    parts[id] = analysis;
    totalWords += analysis.wordCount;
    for (const match of analysis.matches) {
      totalMatchedSpans += match.count;
      distinctPhraseIds.add(match.item.id);
    }
  }

  return {
    totalWords,
    totalMatchedSpans,
    totalFlaggedPhrases: distinctPhraseIds.size,
    parts,
  };
}
