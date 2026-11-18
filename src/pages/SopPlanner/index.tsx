import { Badge, Button, Textarea } from '@mantine/core';
import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import { DESTINATIONS, SECTIONS, destinationHref, hashLink } from '@/utils/constants';
import { requirementsHref } from '@/utils/requirements/topics';
import { siteConfig } from '@/utils/siteConfig';
import {
  EMPTY_ENTRIES,
  MAX_PART_LENGTH,
  analyseOutline,
  clearEntries,
  readEntries,
  writeEntries,
  type SopOutlineEntries,
  type SopPartId,
} from '@/utils/sopPlanner';

import {
  SOP_PARTS,
  SOP_PLANNER_COPY,
  STOCK_PHRASES,
  formatFlaggedCount,
  formatMatchedHeading,
  formatPrintSummaryLine,
  formatWordCount,
  getStockSummaryText,
} from './data';
import styles from './styles.module.scss';

interface PlannerState {
  entries: SopOutlineEntries;
  storageFailed: boolean;
  statusAnnouncement: string;
}

type PlannerAction =
  | { type: 'load'; entries: SopOutlineEntries; failed: boolean }
  | { type: 'update'; entries: SopOutlineEntries; failed: boolean }
  | { type: 'clear'; failed: boolean };

const INITIAL_STATE: PlannerState = {
  entries: EMPTY_ENTRIES,
  storageFailed: false,
  statusAnnouncement: '',
};

function reducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'load':
      return {
        entries: action.entries,
        storageFailed: state.storageFailed || action.failed,
        statusAnnouncement: '',
      };
    case 'update':
      return {
        entries: action.entries,
        storageFailed: state.storageFailed || action.failed,
        statusAnnouncement: '',
      };
    case 'clear':
      return {
        entries: EMPTY_ENTRIES,
        storageFailed: state.storageFailed || action.failed,
        statusAnnouncement: action.failed
          ? SOP_PLANNER_COPY.clearFailedAnnouncement
          : SOP_PLANNER_COPY.clearedAnnouncement,
      };
  }
}

export default function SopPlanner() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { entries, storageFailed, statusAnnouncement } = state;
  const [confirmingClear, setConfirmingClear] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const confirmClearRef = useRef<HTMLButtonElement>(null);
  const restoreClearFocus = useRef(false);
  const clearPromptId = useId();

  // Focus moves to "Yes, clear" when the question opens and back to the first button when it closes.
  useEffect(() => {
    if (confirmingClear) {
      confirmClearRef.current?.focus();
    } else if (restoreClearFocus.current) {
      restoreClearFocus.current = false;
      clearButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  useEffect(() => {
    const loaded = readEntries();
    dispatch({ type: 'load', entries: loaded.entries, failed: loaded.failed });
  }, []);

  const analysis = analyseOutline(entries, STOCK_PHRASES);
  const hasAnyText = SOP_PARTS.some((part) => entries[part.id].trim().length > 0);

  const updatePart = (id: SopPartId, value: string) => {
    const clipped = value.length > MAX_PART_LENGTH ? value.slice(0, MAX_PART_LENGTH) : value;
    const nextEntries: SopOutlineEntries = { ...entries, [id]: clipped };
    const saved = writeEntries(nextEntries);
    dispatch({ type: 'update', entries: nextEntries, failed: !saved });
  };

  const closeClearConfirm = () => {
    restoreClearFocus.current = true;
    setConfirmingClear(false);
  };

  const handleClear = () => {
    closeClearConfirm();
    const cleared = clearEntries();
    dispatch({ type: 'clear', failed: !cleared });
  };

  const handlePrint = () => {
    window.print();
  };

  const ensureVisibleOnFocus = (element: HTMLTextAreaElement) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < 88 || rect.bottom > window.innerHeight - 104) {
      element.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  };

  const stockSummaryText = getStockSummaryText(hasAnyText, analysis.totalFlaggedPhrases);

  const mentoringFacts = [
    ...SOP_PLANNER_COPY.mentoring.facts,
    SOP_PLANNER_COPY.mentoring.places(siteConfig.intake),
  ];

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section id={SECTIONS.top} className={styles.topSection}>
        <ContentContainer width="wide">
          <PageHeader
            variant="compact"
            title={SOP_PLANNER_COPY.title}
            introduction={SOP_PLANNER_COPY.lede}
            leading={(
              <div className={styles.badges}>
                {SOP_PLANNER_COPY.badges.map((badge, index) => (
                  <span
                    key={badge}
                    className={styles.badge}
                    data-tone={index === 0 ? 'green' : undefined}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          />

          <div className={styles.contextBar}>
            <p className={styles.contextText}>{SOP_PLANNER_COPY.contextNote}</p>
            <div className={styles.contextLinks}>
              <HomeSectionLink href={hashLink(SECTIONS.sop)} className={styles.inlineLink}>
                <span>{SOP_PLANNER_COPY.homeSopLinkLabel}</span>
                <span aria-hidden="true">→</span>
              </HomeSectionLink>
              <Link to={requirementsHref('documents')} className={styles.inlineLink}>
                <span>{SOP_PLANNER_COPY.documentsLinkLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <p className={styles.printSummaryLine}>
            {formatPrintSummaryLine(analysis.totalWords)}
          </p>

          <div className={styles.workbench}>
            <div className={styles.outlineColumn}>
              <div className={styles.outlineHead}>
                <h2 className={styles.outlineHeading}>
                  <span lang="de" className={styles.kickerDe}>
                    {SOP_PLANNER_COPY.outlineKicker.de}
                  </span>{' '}
                  <span>{SOP_PLANNER_COPY.outlineKicker.en}</span>
                </h2>
              </div>

              <div className={styles.partsList}>
                {SOP_PARTS.map((part, index) => {
                  const partAnalysis = analysis.parts[part.id];
                  const sectionAnchorId = `part-${part.id}`;
                  const headingId = `sop-heading-${part.id}`;
                  const inputId = `sop-input-${part.id}`;
                  const guidanceId = `sop-guidance-${part.id}`;
                  const countId = `sop-count-${part.id}`;
                  const rawValue = entries[part.id];
                  const hasPrintText = rawValue.trim().length > 0;

                  return (
                    <div
                      key={part.id}
                      id={sectionAnchorId}
                      className={styles.partCard}
                    >
                      <div className={styles.partHead}>
                        <h3 id={headingId} className={styles.partTitle}>
                          <span aria-hidden="true" className={styles.partNumber}>
                            {index + 1}
                          </span>{' '}
                          <label htmlFor={inputId} className={styles.partLabel}>
                            {part.title}
                          </label>
                        </h3>

                        <div className={styles.partMeta}>
                          <span
                            id={countId}
                            data-testid={`word-count-${part.id}`}
                            className={styles.wordPill}
                          >
                            {formatWordCount(partAnalysis.wordCount)}
                          </span>
                          {partAnalysis.matches.length > 0 ? (
                            <Badge className={styles.flagBadge}>
                              {formatFlaggedCount(partAnalysis.matches.length)}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <p id={guidanceId} className={styles.guidance}>
                        {part.guidance}
                      </p>

                      <Textarea
                        id={inputId}
                        rows={5}
                        maxLength={MAX_PART_LENGTH}
                        value={rawValue}
                        onFocus={(event) => ensureVisibleOnFocus(event.currentTarget)}
                        onChange={(event) => updatePart(part.id, event.currentTarget.value)}
                        placeholder={part.placeholder}
                        aria-describedby={`${guidanceId} ${countId}`}
                        classNames={{
                          root: styles.fieldRoot,
                          input: styles.textarea,
                        }}
                      />

                      {partAnalysis.matches.length > 0 ? (
                        <div
                          className={styles.flagsPanel}
                          data-testid={`stock-matches-${part.id}`}
                        >
                          <h4 className={styles.flagsTitle}>
                            {SOP_PLANNER_COPY.partFlagsHeading}
                          </h4>

                          <div className={styles.previewBox}>
                            <span className={styles.previewLabel}>
                              {SOP_PLANNER_COPY.annotatedPreviewLabel}
                            </span>
                            <p className={styles.annotatedPreview}>
                              {partAnalysis.segments.map((segment, segIndex) =>
                                segment.kind === 'match' ? (
                                  <mark
                                    key={`${segment.phraseId}-${segIndex}`}
                                    className={styles.matchedMark}
                                  >
                                    <span>{segment.text}</span>
                                    <span className={styles.matchedRef}>
                                      [{segment.noteNumber}]
                                    </span>
                                  </mark>
                                ) : (
                                  <span key={`text-${segIndex}`}>{segment.text}</span>
                                ),
                              )}
                            </p>
                          </div>

                          <ol className={styles.matchList}>
                            {partAnalysis.matches.map((match) => (
                              <li key={match.item.id} className={styles.matchItem}>
                                <div className={styles.matchHead}>
                                  <span aria-hidden="true" className={styles.matchNumber}>
                                    {match.noteNumber}
                                  </span>
                                  <span className={styles.matchPhrase}>
                                    {formatMatchedHeading(match.item.phrase, match.count)}
                                  </span>
                                  <span className={styles.matchTag}>
                                    {SOP_PLANNER_COPY.stockBadgeLabel}
                                  </span>
                                </div>
                                <p className={styles.matchDetail}>
                                  <strong>{SOP_PLANNER_COPY.whyHeading}</strong>{' '}
                                  {match.item.why}
                                </p>
                                <p className={styles.matchDetail}>
                                  <strong>{SOP_PLANNER_COPY.promptHeading}</strong>{' '}
                                  {match.item.prompt}
                                </p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}

                      <p
                        className={styles.printPartBody}
                        data-empty={!hasPrintText ? 'true' : undefined}
                      >
                        {hasPrintText ? rawValue : SOP_PLANNER_COPY.emptyPrintText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside aria-labelledby="sop-summary-title" className={styles.summaryCard}>
              <div className={styles.summaryHead}>
                <h2 id="sop-summary-title" className={styles.summaryTitle}>
                  {SOP_PLANNER_COPY.summaryTitle}
                </h2>
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="sop-total-live"
                  className={styles.totalsRow}
                >
                  <span className={styles.totalLabel}>{SOP_PLANNER_COPY.totalWordsLabel}</span>
                  <span className={styles.totalValue} data-testid="sop-total-words">
                    {formatWordCount(analysis.totalWords)}
                  </span>
                </div>
              </div>

              <div className={styles.stockSummaryBox} data-testid="sop-stock-summary">
                <span className={styles.stockSummaryLabel}>
                  {SOP_PLANNER_COPY.stockCheckTitle}
                </span>
                <p className={styles.stockSummaryText}>{stockSummaryText}</p>
              </div>

              <div className={styles.breakdown}>
                <h3 className={styles.breakdownTitle}>{SOP_PLANNER_COPY.partBreakdownTitle}</h3>
                <ol className={styles.breakdownList}>
                  {SOP_PARTS.map((part, index) => (
                    <li key={part.id} className={styles.breakdownItem}>
                      <a href={hashLink(`part-${part.id}`)} className={styles.breakdownLink}>
                        {index + 1}. {part.shortTitle}
                      </a>
                      <span className={styles.breakdownCount}>
                        {formatWordCount(analysis.parts[part.id].wordCount)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className={styles.browserNote}>{SOP_PLANNER_COPY.browserNote}</p>

              {storageFailed ? (
                <p role="status" className={styles.storageWarning}>
                  {SOP_PLANNER_COPY.storageWarning}
                </p>
              ) : null}

              <div className={styles.summaryActions}>
                <Button type="button" variant="yellow-dark" size="lg" onClick={handlePrint}>
                  {SOP_PLANNER_COPY.printButton}
                </Button>
                {confirmingClear ? (
                  <div
                    role="group"
                    aria-labelledby={clearPromptId}
                    className={styles.confirmClear}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') closeClearConfirm();
                    }}
                  >
                    <span id={clearPromptId} className={styles.confirmPrompt}>
                      {SOP_PLANNER_COPY.clearConfirmPrompt}
                    </span>
                    <Button
                      ref={confirmClearRef}
                      type="button"
                      variant="yellow-dark"
                      size="md"
                      onClick={handleClear}
                    >
                      {SOP_PLANNER_COPY.clearConfirmYes}
                    </Button>
                    <Button type="button" variant="ring-dark" size="md" onClick={closeClearConfirm}>
                      {SOP_PLANNER_COPY.clearConfirmCancel}
                    </Button>
                  </div>
                ) : (
                  <Button
                    ref={clearButtonRef}
                    type="button"
                    variant="ring-dark"
                    size="md"
                    onClick={() => setConfirmingClear(true)}
                  >
                    {SOP_PLANNER_COPY.clearButton}
                  </Button>
                )}
              </div>

              <div role="status" aria-live="polite" aria-atomic="true" className={styles.statusRegion}>
                {statusAnnouncement}
              </div>
            </aside>
          </div>
        </ContentContainer>
      </section>

      <section aria-labelledby="sop-mentoring-title" className={styles.mentoringSection}>
        <ContentContainer width="wide">
          <div className={styles.mentoringCard}>
            <div className={styles.mentoringCopy}>
              <p className={styles.mentoringKicker}>
                <span lang="de">{SOP_PLANNER_COPY.mentoring.kicker.de}</span>
                <span className={styles.mentoringKickerEn}>
                  {SOP_PLANNER_COPY.mentoring.kicker.en}
                </span>
              </p>
              <h2 id="sop-mentoring-title" className={styles.mentoringTitle}>
                {SOP_PLANNER_COPY.mentoring.title}
              </h2>
              <p className={styles.mentoringBody}>{SOP_PLANNER_COPY.mentoring.body}</p>
            </div>

            <div className={styles.mentoringDetails}>
              <ul className={styles.mentoringFacts}>
                {mentoringFacts.map((fact) => (
                  <li key={fact}>
                    <span aria-hidden="true" className={styles.factBullet} />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.mentoringActions}>
                <Button
                  component={HomeSectionLink}
                  href={destinationHref(DESTINATIONS.profileReview)}
                  variant="navy"
                  size="lg"
                >
                  {SOP_PLANNER_COPY.mentoring.reviewCta}
                </Button>
                <Button
                  component={HomeSectionLink}
                  href={hashLink(SECTIONS.sop)}
                  variant="ring"
                  size="lg"
                >
                  {SOP_PLANNER_COPY.mentoring.sopSectionCta}
                </Button>
              </div>
            </div>
          </div>
        </ContentContainer>
      </section>
    </main>
  );
}
