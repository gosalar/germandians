import { AREA_LABELS } from './data';
import { WORD_AREAS, type GlossaryEntry, type WordArea } from './types';

export type AreaFilter = 'all' | WordArea;

/** Fold case, punctuation spacing and German umlauts so plain ASCII searches match German headwords too. */
function foldUmlauts(text: string): string {
  return text
    .toLowerCase()
    .replaceAll('\u00ad', '')
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss');
}

function stripDiacritics(text: string): string {
  return text
    .toLowerCase()
    .replaceAll('\u00ad', '')
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .replaceAll('ß', 'ss');
}

function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function entrySearchText(entry: GlossaryEntry): { raw: string; ae: string; plain: string } {
  const area = AREA_LABELS[entry.area];
  const joined = [
    entry.article ? `${entry.article} ${entry.term}` : entry.term,
    entry.term,
    entry.forms,
    entry.meaning,
    entry.example.de,
    entry.example.en,
    entry.where,
    area.en,
    area.de,
  ].join(' ');

  return {
    raw: joined.toLowerCase().replaceAll('\u00ad', ''),
    ae: foldUmlauts(joined),
    plain: stripDiacritics(joined),
  };
}

export function filterEntries(
  entries: readonly GlossaryEntry[],
  query: string,
  area: AreaFilter,
): readonly GlossaryEntry[] {
  const cleaned = normalizeWhitespace(query);
  const rawNeedle = cleaned.toLowerCase();
  const aeNeedle = foldUmlauts(cleaned);
  const plainNeedle = stripDiacritics(cleaned);

  return entries.filter((entry) => {
    if (area !== 'all' && entry.area !== area) return false;
    if (!cleaned) return true;
    const haystack = entrySearchText(entry);
    return (
      haystack.raw.includes(rawNeedle) ||
      haystack.ae.includes(aeNeedle) ||
      haystack.plain.includes(plainNeedle)
    );
  });
}

export function countByArea(entries: readonly GlossaryEntry[]): { readonly [Area in WordArea]: number } {
  const counts = {
    study: 0,
    paperwork: 0,
    housing: 0,
    money: 0,
    'daily-life': 0,
  };
  for (const area of WORD_AREAS) {
    counts[area] = entries.filter((entry) => entry.area === area).length;
  }
  return counts;
}
