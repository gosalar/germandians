export const SOP_PART_IDS = [
  'why-subject',
  'record',
  'beyond',
  'why-programme',
  'next',
] as const;

export type SopPartId = (typeof SOP_PART_IDS)[number];

export type SopOutlineEntries = {
  readonly [Id in SopPartId]: string;
};

export interface StockPhraseDefinition {
  readonly id: string;
  readonly phrase: string;
  readonly why: string;
  readonly prompt: string;
}

export type TextSegment =
  | { readonly kind: 'text'; readonly text: string }
  | {
      readonly kind: 'match';
      readonly text: string;
      readonly phraseId: string;
      readonly noteNumber: number;
    };

export interface PartMatch {
  readonly noteNumber: number;
  readonly item: StockPhraseDefinition;
  readonly count: number;
}

export interface PartAnalysis {
  readonly wordCount: number;
  readonly matches: readonly PartMatch[];
  readonly segments: readonly TextSegment[];
}

export interface OutlineAnalysis {
  readonly totalWords: number;
  readonly totalMatchedSpans: number;
  readonly totalFlaggedPhrases: number;
  readonly parts: {
    readonly [Id in SopPartId]: PartAnalysis;
  };
}
