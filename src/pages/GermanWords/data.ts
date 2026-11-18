import { REQUIREMENT_TOPIC_TITLES, type RequirementTopicId } from '@/utils/requirements/topics';

import { DAILY_LIFE_ENTRIES } from './daily-life/data';
import { HOUSING_ENTRIES } from './housing/data';
import { MONEY_ENTRIES } from './money/data';
import { PAPERWORK_ENTRIES } from './paperwork/data';
import { STUDY_ENTRIES } from './study/data';
import type { GlossaryEntry, GlossaryTopicTarget, WordArea } from './types';

export { WORD_AREAS, type GermanArticle, type GlossaryEntry, type GlossaryTopicTarget, type WordArea } from './types';

/**
 * Copy and entries for the German words glossary (/german-words). Definitions and examples explain
 * words only, never official rules, deadlines, fees or caps; official rules live on /requirements
 * with their sources.
 */
export const PAGE_COPY = {
  kicker: { de: 'Wörterbuch', en: 'Glossary' },
  title: 'German words',
  introduction:
    'Wörterbuch means dictionary or glossary. Here are everyday study, paperwork, housing, money and daily-life words you meet on German university pages, forms and streets, each with its article, plural, plain meaning and an example.',
} as const;

export const ARTICLE_GUIDE = {
  title: { de: 'Der, die, das', en: 'Reading a card' },
  body: 'German nouns start with a capital letter and carry a grammatical article. Learning the article and plural alongside the noun makes forms and portals much easier to read.',
  articles: [
    { article: 'der', note: 'masculine singular' },
    { article: 'die', note: 'feminine singular, and all plurals' },
    { article: 'das', note: 'neuter singular' },
  ],
  disclaimer:
    'Entries explain words, not official rules. Follow the link on a card to check the official source in our requirements guide.',
} as const;

export const AREA_LABELS: {
  readonly [Area in WordArea]: { readonly en: string; readonly de: string };
} = {
  study: { en: 'Study', de: 'Studium' },
  paperwork: { en: 'Paperwork', de: 'Unterlagen' },
  housing: { en: 'Housing', de: 'Wohnen' },
  money: { en: 'Money', de: 'Geld' },
  'daily-life': { en: 'Daily life', de: 'Alltag' },
};

export const FILTER_COPY = {
  heading: 'Find a word',
  searchLabel: 'Filter by German or English word',
  searchPlaceholder: 'e.g. Anmeldung or rent',
  areasLabel: 'Filter by area',
  allAreas: 'All areas',
  clear: 'Clear filter',
  areaChip: (label: string, count: number) => `${label} (${count})`,
  showingAll: (total: number) => `All ${total} words`,
  showingFiltered: (matches: number, total: number) => `${matches} of ${total} words match`,
  showingNone: (query: string) => (query ? `No words match “${query}”.` : 'No words match this filter.'),
} as const;

/** Cards shown first, and added by each press of the show-more button. */
export const WORDS_PAGE_SIZE = 24;

export const LIST_COPY = {
  heading: 'Glossary entries',
  showMore: 'Show more words',
  count: (shown: number, total: number) =>
    shown >= total ? `Showing all ${total} words` : `Showing ${shown} of ${total} words`,
} as const;

export const CARD_COPY = {
  particleBadge: 'particle',
  whereLabel: 'Where you’ll meet it',
  linkArrow: '→',
} as const;

export function entryHeadword(entry: Pick<GlossaryEntry, 'article' | 'term'>): string {
  return entry.article ? `${entry.article} ${entry.term}` : entry.term;
}

const ANCHOR_TOPIC_LABELS: Record<Exclude<GlossaryTopicTarget, RequirementTopicId>, string> = {
  route: 'Requirements page: Topics overview',
  questions: 'Requirements page: Questionnaire',
  'next-steps': 'Requirements page: Your next steps',
  guide: 'Requirements guide',
  'common-questions': 'Requirements page: Common questions',
  'other-applicants': 'Requirements page: Other applicants',
};

export function topicLinkLabel(target: GlossaryTopicTarget): string {
  if (target in REQUIREMENT_TOPIC_TITLES) {
    return `Requirements guide: ${REQUIREMENT_TOPIC_TITLES[target as RequirementTopicId]}`;
  }
  return ANCHOR_TOPIC_LABELS[target as Exclude<GlossaryTopicTarget, RequirementTopicId>];
}

export const EMPTY_COPY = {
  title: 'No matching words',
  body: 'Try a shorter word, search without umlauts (such as “ue” for “ü”), or show every area again.',
  reset: 'Show all words',
} as const;

export const NEXT_COPY = {
  title: 'Applying or learning German?',
  body: 'Check official master’s admission rules in the requirements guide, read how our native-language German lessons work, or start with a profile review.',
  requirementsAction: 'Open the requirements guide',
  learnGermanAction: 'How German lessons work',
} as const;

export const GERMAN_WORDS_ENTRIES: readonly GlossaryEntry[] = [
  ...STUDY_ENTRIES,
  ...PAPERWORK_ENTRIES,
  ...HOUSING_ENTRIES,
  ...MONEY_ENTRIES,
  ...DAILY_LIFE_ENTRIES,
];
