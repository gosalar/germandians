import type { EXTERNAL_COSTS, OfficialSource } from '@/utils/applicationFacts';
import type { RequirementTopicId } from '@/utils/requirements/topics';

/** The German word on a topic's sticker (rendered with `lang="de"`), and what it means. */
export interface GermanWord {
  word: string;
  meaning: string;
}

/** A link to another page of this site, such as the grade check or the German lessons page. */
export interface TopicLink {
  label: string;
  /** A site path for React Router's `Link`: `ROUTES.check`, or a path with a hash for a section of another page. */
  to: string;
}

/**
 * A small table of facts inside a detail part, such as the dMAT test dates. The first column names
 * each row. Below the phone breakpoint each row stacks, with every cell labelled by its column.
 */
export interface DetailTable {
  columns: readonly [string, ...string[]];
  rows: readonly (readonly string[])[];
}

/** One part of a topic's "More detail". */
export interface TopicDetail {
  heading: string;
  /** One paragraph of plain text; '' when the part is only a table. */
  body: string;
  /** A bulleted list after the body, which then reads as its lead-in. */
  list?: readonly string[];
  /** Shown after the body, named by the heading. */
  table?: DetailTable;
  /**
   * The part's official page. Consecutive parts with the same source show it once, after the last of them.
   */
  source?: OfficialSource;
  /** Shown after the body when the part points to another page of this site. */
  link?: TopicLink;
}

/** What every topic card has. An empty string or list means the card skips that part. */
interface TopicBase {
  title: string;
  german: GermanWord;
  /** The one-line "what it is", in larger type under the title. */
  summary: string;
  /** "Who this applies to". */
  need: string;
  /** "What to do", as short tick-box steps. */
  steps: readonly string[];
  /** One link to another page of this site, shown at the end of "What to do" (the grade check, for example). */
  link?: TopicLink;
  /** "Where to check": the official pages, each shown with its review date. */
  sources: readonly OfficialSource[];
  /** "More detail", in order. */
  detail: readonly TopicDetail[];
}

/** A topic with the three panels: who needs it, what to do, where to check. */
export interface StandardTopic extends TopicBase {
  kind: 'standard';
  id: Exclude<RequirementTopicId, 'costs'>;
}

/** The costs topic: the table of what is paid to other organisations, then the same three panels. */
export interface CostsTopic extends TopicBase {
  kind: 'costs';
  id: 'costs';
  /** Every group and item, as the site holds them. No Germandians fee row. */
  costs: typeof EXTERNAL_COSTS;
}

export type Topic = StandardTopic | CostsTopic;
