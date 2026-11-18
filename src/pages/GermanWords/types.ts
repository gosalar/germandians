import type { RequirementTopicId, RequirementsAnchorId } from '@/utils/requirements/topics';

export const WORD_AREAS = ['study', 'paperwork', 'housing', 'money', 'daily-life'] as const;

export type WordArea = (typeof WORD_AREAS)[number];

export const ARTICLES = ['der', 'die', 'das'] as const;

export type GermanArticle = (typeof ARTICLES)[number];

export type GlossaryTopicTarget = RequirementTopicId | RequirementsAnchorId;

export interface GlossaryEntry {
  readonly id: string;
  readonly area: WordArea;
  /** Grammatical article for nouns and noun phrases, or empty for modal particles such as `doch`. */
  readonly article: GermanArticle | '';
  /** German headword in its standard citation form (or established plural where the site uses the plural). */
  readonly term: string;
  /** Plural form (or singular + plural for plural headwords, or `Plural only` / `No plural`). */
  readonly forms: string;
  /** Plain British-English meaning of the word itself, without procedural rules. */
  readonly meaning: string;
  readonly example: {
    readonly de: string;
    readonly en: string;
  };
  /** Where a student meets the word on this site or in Germany. */
  readonly where: string;
  /** Matching topic or section on `/requirements`, linked with `requirementsHref`. */
  readonly topic?: GlossaryTopicTarget;
}
