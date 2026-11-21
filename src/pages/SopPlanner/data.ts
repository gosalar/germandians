import { MENTORING, NAV_CTA, NO_LOGIN_NEEDED } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';
import type { SopPartId, StockPhraseDefinition } from '@/utils/sopPlanner';

export interface SopPartSpec {
  readonly id: SopPartId;
  readonly title: string;
  readonly shortTitle: string;
  readonly guidance: string;
  readonly placeholder: string;
}

export const SOP_PARTS: readonly SopPartSpec[] = [
  {
    id: 'why-subject',
    title: 'Why this subject',
    shortTitle: 'Why this subject',
    guidance:
      'Name the specific course, project, lab or problem during your degree that led you to this subject.',
    placeholder:
      'In your own words: which topic or problem drew your interest, and what did you read, build or test?',
  },
  {
    id: 'record',
    title: 'What my record shows (including the hard semesters)',
    shortTitle: 'What my record shows',
    guidance:
      'Note what your mark sheets show: the relevant subjects you took, and one plain, factual sentence for any weak semester, backlog or gap.',
    placeholder:
      'In your own words: which subjects back up your choice, and if a semester went badly, what happened and how did you recover?',
  },
  {
    id: 'beyond',
    title: "What I've done beyond it",
    shortTitle: "What I've done beyond it",
    guidance:
      'List work outside compulsory classes that connects to the subject: a thesis, workshop, internship, job or independent project.',
    placeholder:
      'In your own words: what was your own task in that project or role, and what did you learn from doing it?',
  },
  {
    id: 'why-programme',
    title: 'Why this programme',
    shortTitle: 'Why this programme',
    guidance:
      'Point to concrete parts of this course on the university’s website: compulsory modules, electives, lab tracks or thesis options.',
    placeholder:
      'In your own words: which named modules or tracks in this programme build on what you have studied so far?',
  },
  {
    id: 'next',
    title: 'What comes next',
    shortTitle: 'What comes next',
    guidance:
      'State the kind of technical, research or professional work you plan to pursue after finishing the degree.',
    placeholder:
      'In your own words: what concrete direction does this master’s prepare you for after graduation?',
  },
] as const;

/**
 * Static stock-phrase examples checked case-insensitively in the browser against the visitor's outline.
 * Starts from the generic draft on Home ("since my childhood", "passionate about",
 * "hardworking, dedicated and sincere", "due to some personal reasons", "fully ready for a master's")
 * and adds common SOP stock phrases of the same kind.
 */
export const STOCK_PHRASES: readonly StockPhraseDefinition[] = [
  {
    id: 'since-my-childhood',
    phrase: 'since my childhood',
    why: 'Starts too far back and says nothing about your degree or recent academic work.',
    prompt: 'Write the specific subject, lab, workshop or problem in your bachelor’s degree where this interest began.',
  },
  {
    id: 'passionate-about',
    phrase: 'passionate about',
    why: 'Names a feeling without showing any work you have done in the subject.',
    prompt: 'Name a course, project or technical problem you spent time on and state what you did.',
  },
  {
    id: 'hardworking-dedicated-sincere',
    phrase: 'hardworking, dedicated and sincere',
    why: 'Lists adjectives about yourself that any applicant could write without evidence.',
    prompt: 'Describe one concrete task, project or difficult semester that shows how you worked.',
  },
  {
    id: 'due-to-some-personal-reasons',
    phrase: 'due to some personal reasons',
    why: 'Hides what happened during a weak semester or gap and leaves the reader guessing.',
    prompt: 'State the factual reason once in one plain sentence, then explain how you cleared the exams or caught up.',
  },
  {
    id: 'due-to-personal-reasons',
    phrase: 'due to personal reasons',
    why: 'Gives no clear context for backlogs, low marks or a gap in your record.',
    prompt: 'Give the brief factual context once, such as illness, family care or evening work, and what followed.',
  },
  {
    id: 'fully-ready-for-a-masters',
    phrase: "fully ready for a master's",
    why: 'States readiness as a conclusion instead of showing the preparation behind it.',
    prompt: 'Name the prerequisites, coursework or project work you completed that prepare you for this curriculum.',
  },
  {
    id: 'dream-country',
    phrase: 'dream country',
    why: 'Talks about Germany in general rather than the academic programme you are applying to.',
    prompt: 'Name the modules, curriculum structure or lab focus of this specific programme instead.',
  },
  {
    id: 'dream-university',
    phrase: 'dream university',
    why: 'Praises the institution broadly instead of showing that you read the course page.',
    prompt: 'Refer to two or three named modules or tracks in this programme and how they connect to your background.',
  },
  {
    id: 'world-renowned-faculty',
    phrase: 'world-renowned faculty',
    why: 'Repeats generic praise that could be pasted into an application to any university.',
    prompt: 'Name the specific teaching area, lab or module topic on the programme page that fits your study plan.',
  },
  {
    id: 'cutting-edge-research',
    phrase: 'cutting-edge research',
    why: 'Uses a broad label instead of naming the topic or method you want to study.',
    prompt: 'Write the exact technical topic, method or system from the programme description that interests you.',
  },
  {
    id: 'prestigious-institution',
    phrase: 'prestigious institution',
    why: 'Focuses on general reputation rather than what the curriculum teaches.',
    prompt: 'Describe what this course covers that your bachelor’s degree did not.',
  },
  {
    id: 'broaden-my-horizons',
    phrase: 'broaden my horizons',
    why: 'States a vague wish rather than naming what you want to learn next.',
    prompt: 'State which skills or methods you want to gain from this programme and how you plan to use them.',
  },
] as const;

export const SOP_PLANNER_COPY = {
  title: 'SOP planner',
  lede: 'Plan a Statement of Purpose in five parts, in your own words. Nothing is generated or rewritten for you, and everything you type stays in this browser.',
  badges: [NO_LOGIN_NEEDED, 'Saved in this browser only', 'Prints for a mentor'],
  contextNote:
    'Each university and programme sets its own rules on whether a motivation letter is asked for, what it must cover and how long it may be. Check each programme’s application page before you draft.',
  homeSopLinkLabel: 'See how we work on your SOP',
  documentsLinkLabel: `${REQUIREMENT_TOPIC_TITLES.documents} in the requirements guide`,
  outlineKicker: { de: 'Gliederung', en: 'Five-part outline' },
  summaryTitle: 'Outline summary',
  totalWordsLabel: 'Total words',
  stockCheckTitle: 'Stock-phrase check',
  stockCheckClean: 'No listed stock phrases found in your notes.',
  stockCheckIdle: 'Write in any part to check your notes against common stock phrases.',
  partBreakdownTitle: 'Words by part',
  browserNote:
    'Saved automatically in this browser on this device. Nothing you write here is sent to Germandians or anywhere else.',
  lockingUnavailableBrowserNote:
    'Nothing you write here is sent to Germandians or anywhere else.',
  storageWarning:
    'Browser storage is unavailable right now. Your latest changes may not be saved.',
  lockingUnavailableWarning:
    'Automatic saving is unavailable in this browser session. You can still write and print your outline, but changes here are not saved automatically.',
  conflictIntro:
    'Choose which version to keep in this browser. Both versions are shown below so you can copy anything you need first.',
  conflictClearedIntro:
    'Another tab cleared the saved outline. Choose whether to keep your text here or clear this section to match.',
  conflictRecoveredIntro:
    'Another tab had unsaved text for this section that differed from the saved outline. Choose which version to keep.',
  conflictUpdatedNotice:
    'Another tab saved a newer version while you were reviewing this section. Check the updated text below before choosing again.',
  conflictLocalLabel: 'Your text (this tab)',
  conflictRemoteLabel: 'Text from the other tab',
  conflictEmptyLocalText: 'Empty (no text in this tab)',
  conflictEmptyRemoteText: 'Empty (cleared in the other tab)',
  conflictUseLocalButton: 'Use my text',
  conflictUseRemoteButton: 'Use text from the other tab',
  conflictSummaryTitle: 'Sections needing a choice',
  printButton: 'Print outline',
  clearButton: 'Clear my entries',
  clearConfirmPrompt: 'Clear all entries?',
  clearConfirmYes: 'Yes, clear',
  clearConfirmCancel: 'Cancel',
  clearedAnnouncement: 'Cleared all five parts and removed the saved outline from this browser.',
  clearFailedAnnouncement: 'The notes were cleared on screen, but the saved outline could not be removed from this browser.',
  partFlagsHeading: 'Flagged stock phrases in this part',
  annotatedPreviewLabel: 'Highlighted in your notes',
  stockBadgeLabel: 'Stock phrase',
  whyHeading: 'Why it says little:',
  promptHeading: 'Write what happened instead:',
  emptyPrintText: 'No notes entered for this part.',
  printMetaPrefix: 'Statement of Purpose outline · Five parts in your own words',
  mentoring: {
    kicker: { de: 'Mentoring', en: 'Working with a mentor' },
    title: 'Bring your outline to a mentor',
    body: MENTORING.mentoring,
    facts: MENTORING.facts,
    places: MENTORING.places,
    reviewCta: NAV_CTA.label,
    sopSectionCta: 'Read our SOP example on Home',
  },
} as const;

export function formatWordCount(count: number): string {
  return count === 1 ? '1 word' : `${count} words`;
}

export function formatFlaggedCount(count: number): string {
  if (count === 0) return '0 stock phrases';
  return count === 1 ? '1 stock phrase flagged' : `${count} stock phrases flagged`;
}

export function formatMatchedHeading(phrase: string, count: number): string {
  return count > 1 ? `“${phrase}” (${count} times)` : `“${phrase}”`;
}

export function formatPrintSummaryLine(totalWords: number): string {
  return `${SOP_PLANNER_COPY.printMetaPrefix} · ${SOP_PLANNER_COPY.totalWordsLabel}: ${formatWordCount(totalWords)}`;
}

export function getStockSummaryText(hasAnyText: boolean, totalFlaggedPhrases: number): string {
  if (!hasAnyText) return SOP_PLANNER_COPY.stockCheckIdle;
  if (totalFlaggedPhrases === 0) return SOP_PLANNER_COPY.stockCheckClean;
  return formatFlaggedCount(totalFlaggedPhrases);
}

export function formatConflictHeading(
  partTitle: string,
  kind: 'changed' | 'cleared' | 'recovered',
): string {
  if (kind === 'cleared') return `“${partTitle}” was cleared in another tab`;
  if (kind === 'recovered') return `Unsaved text recovered for “${partTitle}”`;
  return `“${partTitle}” changed in another tab`;
}

export function formatConflictDetectedAnnouncement(
  partTitle: string,
  remoteCleared: boolean,
): string {
  return remoteCleared
    ? `“${partTitle}” was cleared in another tab. Review both versions below that section.`
    : `“${partTitle}” changed in another tab. Review both versions below that section.`;
}

export function formatConflictUpdatedAnnouncement(partTitle: string): string {
  return `Another tab saved a newer version of “${partTitle}”. Review the updated text before choosing again.`;
}

export function formatConflictResolvedAnnouncement(
  partTitle: string,
  choice: 'local' | 'remote',
  cleared: boolean,
): string {
  if (choice === 'local') {
    return `Kept your text for “${partTitle}” and saved it in this browser.`;
  }
  return cleared
    ? `Cleared “${partTitle}” to match the other tab.`
    : `Updated “${partTitle}” with the text from the other tab.`;
}

export function formatConflictSummaryCount(count: number): string {
  return count === 1
    ? '1 section has two versions to review:'
    : `${count} sections have two versions to review:`;
}
