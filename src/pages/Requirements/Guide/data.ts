export const GUIDE_COPY = {
  heading: 'The guide',
  intro: 'Each topic says what it is, who it applies to, what to do and where to check. More detail sits underneath.',
  /** The contents list beside the guide, from 1024px. */
  contentsTitle: 'The topics',
  /** Read after a stamped topic's name in the contents list, in place of the red dot. */
  stampedHidden: '(from your answers)',
} as const;

/** The labels every topic card repeats, so a reader learns the pattern once. */
export const TOPIC_CARD_COPY = {
  need: 'Who this applies to',
  steps: 'What to do',
  sources: 'Where to check',
  moreDetail: 'More detail',
  /** Phones and tablets: back to the route card, which is the contents there. */
  allTopics: 'All topics',
} as const;

/** Column headings and the empty-amount note for the costs table. */
export const COSTS_TABLE_COPY = {
  item: 'Cost',
  amount: 'Amount',
  detail: 'Details',
  /** In the amount column when the official figure depends on the details beside it. */
  noAmount: 'Varies',
} as const;

/** The rubber stamp on a topic the visitor's answers point to. */
export const STAMP_COPY = {
  /** German, rendered with `lang="de"`. */
  word: 'Für dich',
  note: 'from your answers',
} as const;
