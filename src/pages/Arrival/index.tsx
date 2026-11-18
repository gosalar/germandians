import { Button, Checkbox } from '@mantine/core';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { SECTIONS, hashLink } from '@/utils/constants';

import { summarizeArrivalProgress, toggleArrivalItem } from './checklist';
import {
  ARRIVAL_ITEMS,
  CLOSING_COPY,
  ITEM_SECTION_HEADINGS,
  PAGE_COPY,
  PROGRESS_COPY,
  type ArrivalItem,
} from './data';
import {
  clearArrivalProgress,
  readArrivalProgress,
  writeArrivalProgress,
  type ArrivalItemId,
} from './storage';
import styles from './styles.module.scss';

interface ChecklistState {
  ticked: ArrivalItemId[];
  storageFailed: boolean;
  clearedNotice: boolean;
}

type ChecklistAction =
  | { type: 'load'; ticked: ArrivalItemId[]; failed: boolean }
  | { type: 'set'; ticked: ArrivalItemId[]; failed: boolean }
  | { type: 'clear'; failed: boolean };

const initialState: ChecklistState = {
  ticked: [],
  storageFailed: false,
  clearedNotice: false,
};

function reducer(state: ChecklistState, action: ChecklistAction): ChecklistState {
  switch (action.type) {
    case 'load':
      return {
        ticked: action.ticked,
        storageFailed: state.storageFailed || action.failed,
        clearedNotice: false,
      };
    case 'set':
      return {
        ticked: action.ticked,
        storageFailed: state.storageFailed || action.failed,
        clearedNotice: false,
      };
    case 'clear':
      return {
        ticked: [],
        storageFailed: state.storageFailed || action.failed,
        // Never announce a clear that the browser did not carry out.
        clearedNotice: !action.failed,
      };
  }
}

interface ChecklistCardProps {
  item: ArrivalItem;
  number: number;
  isTicked: boolean;
  onToggle: (id: ArrivalItemId) => void;
}

function ChecklistCard({ item, number, isTicked, onToggle }: ChecklistCardProps) {
  const titleId = `${item.id}-title`;
  const checkboxId = `arrival-check-${item.id}`;

  return (
    <article
      id={item.id}
      aria-labelledby={titleId}
      data-ticked={isTicked || undefined}
      className={styles.card}
    >
      <header className={styles.cardHead}>
        <div className={styles.cardHeadingRow}>
          <span aria-hidden="true" className={styles.stepNumber}>
            {number}
          </span>
          <div className={styles.titleBlock}>
            <h2 id={titleId} className={styles.cardTitle}>
              {item.title}
            </h2>
            <p className={styles.germanTerm}>
              <span lang="de" className={styles.germanWord}>
                {item.german.word}
              </span>
              <span className={styles.visuallyHidden}>, </span>
              <span className={styles.germanMeaning}>{item.german.meaning}</span>
            </p>
          </div>
        </div>

        <div className={styles.tickControl}>
          {isTicked ? (
            <span className={styles.tickedPill} data-testid={`ticked-badge-${item.id}`}>
              {PROGRESS_COPY.tickedBadge}
            </span>
          ) : null}
          <Checkbox
            id={checkboxId}
            checked={isTicked}
            onChange={() => onToggle(item.id)}
            aria-label={PROGRESS_COPY.tickAriaLabel(item.title)}
            classNames={{
              root: styles.checkboxRoot,
              body: styles.checkboxBody,
              inner: styles.checkboxInner,
              input: styles.checkboxInput,
              labelWrapper: styles.checkboxLabelWrapper,
              label: styles.checkboxLabel,
            }}
            label={PROGRESS_COPY.tickLabel}
          />
        </div>
      </header>

      <div className={styles.cardSections}>
        <div className={styles.panel} data-part="what">
          <h3 id={`${item.id}-what`} className={styles.panelTitle}>
            {ITEM_SECTION_HEADINGS.whatItIs}
          </h3>
          <div className={styles.proseStack}>
            {item.whatItIs.map((paragraph) => (
              <p key={paragraph} className={styles.panelBody}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.twoColPanels}>
          <div className={styles.panel} data-part="bring">
            <h3 id={`${item.id}-bring`} className={styles.panelTitle}>
              {ITEM_SECTION_HEADINGS.whatToBring}
            </h3>
            <ul className={styles.bringList}>
              {item.whatToBring.map((entry) => (
                <li key={entry} className={styles.bringItem}>
                  <span aria-hidden="true" className={styles.bullet} />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel} data-part="where">
            <h3 id={`${item.id}-where`} className={styles.panelTitle}>
              {ITEM_SECTION_HEADINGS.whereDone}
            </h3>
            <div className={styles.proseStack}>
              {item.whereDone.map((paragraph) => (
                <p key={paragraph} className={styles.panelBody}>
                  {paragraph}
                </p>
              ))}
              {item.guideLink ? (
                <p className={styles.guideCrossLink}>
                  <Link to={item.guideLink.to} className={styles.inlineActionLink}>
                    {item.guideLink.label}
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.sourcesPanel}>
          <h3 id={`${item.id}-sources`} className={styles.panelTitle}>
            {ITEM_SECTION_HEADINGS.sources}
          </h3>
          <ul className={styles.sourcesList}>
            {item.sources.map((source) => (
              <li key={source.url} className={styles.sourceItem}>
                <SourceNote source={source} />
              </li>
            ))}
          </ul>
        </div>

        {item.support ? (
          <div data-testid={`support-${item.id}`} className={styles.supportCallout}>
            <h3 id={`${item.id}-support`} className={styles.supportTitle}>
              {ITEM_SECTION_HEADINGS.germandiansHelp}
            </h3>
            <div className={styles.supportBody}>
              {item.support.map((sentence) => (
                <p key={sentence} className={styles.supportParagraph}>
                  {sentence}
                </p>
              ))}
            </div>
            <p className={styles.supportLinkRow}>
              <HomeSectionLink href={PAGE_COPY.housingSupportHref} className={styles.inlineActionLink}>
                {PAGE_COPY.housingSupportLink}
              </HomeSectionLink>
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Arrival() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const { ticked, failed } = readArrivalProgress();
    dispatch({ type: 'load', ticked, failed });
  }, []);

  const tickedSet = new Set(state.ticked);
  const summary = summarizeArrivalProgress(state.ticked, ARRIVAL_ITEMS.length);

  const handleToggle = (id: ArrivalItemId) => {
    const next = toggleArrivalItem(state.ticked, id);
    const saved = writeArrivalProgress(next);
    dispatch({ type: 'set', ticked: next, failed: !saved });
  };

  const [confirmingClear, setConfirmingClear] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const confirmYesRef = useRef<HTMLButtonElement>(null);
  const returnFocusToClear = useRef(false);

  // Move focus into the question when it opens, and back to the Clear button when it closes.
  useEffect(() => {
    if (confirmingClear) {
      confirmYesRef.current?.focus();
    } else if (returnFocusToClear.current) {
      returnFocusToClear.current = false;
      clearButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  const handleClear = () => {
    setConfirmingClear(true);
  };

  const handleCancelClear = () => {
    returnFocusToClear.current = true;
    setConfirmingClear(false);
  };

  const handleConfirmClear = () => {
    const cleared = clearArrivalProgress();
    dispatch({ type: 'clear', failed: !cleared });
    returnFocusToClear.current = true;
    setConfirmingClear(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section id={SECTIONS.top} className={styles.opening}>
        <ContentContainer width="wide">
          <div className={styles.openingGrid}>
            <PageHeader
              variant="compact"
              title={PAGE_COPY.title}
              introduction={PAGE_COPY.introduction}
              leading={
                <div className={styles.leadingStack}>
                  <div className={styles.badges}>
                    {PAGE_COPY.badges.map((badge, index) => (
                      <span
                        key={badge}
                        className={styles.badge}
                        data-tone={index === 0 ? 'green' : undefined}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className={styles.openingSticker}>
                    <span lang="de" className={styles.openingGerman}>
                      {PAGE_COPY.germanWord}
                    </span>
                    <span className={styles.visuallyHidden}>, </span>
                    <span className={styles.openingMeaning}>{PAGE_COPY.germanMeaning}</span>
                  </p>
                </div>
              }
              meta={<p className={styles.scopeNote}>{PAGE_COPY.scopeNote}</p>}
            />

            <aside aria-labelledby="arrival-progress-heading" className={styles.slip}>
              <div className={styles.slipPaper}>
                <h2 id="arrival-progress-heading" className={styles.slipTitle}>
                  <span lang="de" className={styles.slipName}>
                    {PROGRESS_COPY.paperTitle}
                  </span>{' '}
                  <span className={styles.slipSubtitle}>{PROGRESS_COPY.heading}</span>
                </h2>
                <div className={styles.slipRule} />

                <div
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="arrival-progress-summary"
                  className={styles.progressSummary}
                >
                  <span className={styles.progressFraction} data-testid="arrival-progress-fraction">
                    {PROGRESS_COPY.fractionLabel(summary.done, summary.total)}
                  </span>
                  <span className={styles.progressText}>
                    {PROGRESS_COPY.summaryLine(summary.done, summary.total, summary.remaining)}
                  </span>
                </div>

                <div aria-hidden="true" className={styles.meterTrack}>
                  {ARRIVAL_ITEMS.map((item) => (
                    <span
                      key={item.id}
                      className={styles.meterSegment}
                      data-done={tickedSet.has(item.id) || undefined}
                    />
                  ))}
                </div>

                <p className={styles.storageNote}>{PROGRESS_COPY.storageNote}</p>

                {state.storageFailed ? (
                  <p role="alert" className={styles.storageWarning}>
                    {PROGRESS_COPY.storageUnavailable}
                  </p>
                ) : null}

                <div className={styles.slipActions}>
                  <Button type="button" variant="outline" size="md" onClick={handlePrint}>
                    {PROGRESS_COPY.printAction}
                  </Button>
                  <Button
                    ref={clearButtonRef}
                    type="button"
                    variant="ring"
                    size="md"
                    aria-expanded={confirmingClear}
                    aria-controls="arrival-clear-confirm"
                    onClick={handleClear}
                  >
                    {PROGRESS_COPY.clearAction}
                  </Button>
                </div>

                {confirmingClear ? (
                  <div
                    id="arrival-clear-confirm"
                    role="group"
                    aria-labelledby="arrival-clear-question"
                    className={styles.clearConfirm}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') handleCancelClear();
                    }}
                  >
                    <p id="arrival-clear-question" className={styles.clearQuestion}>
                      {PROGRESS_COPY.clearConfirmQuestion}
                    </p>
                    <div className={styles.clearConfirmActions}>
                      <Button
                        ref={confirmYesRef}
                        type="button"
                        variant="navy"
                        size="md"
                        onClick={handleConfirmClear}
                      >
                        {PROGRESS_COPY.clearConfirmYes}
                      </Button>
                      <Button type="button" variant="outline" size="md" onClick={handleCancelClear}>
                        {PROGRESS_COPY.clearConfirmCancel}
                      </Button>
                    </div>
                  </div>
                ) : null}

                <p role="status" aria-live="polite" className={styles.clearStatus}>
                  {state.clearedNotice ? PROGRESS_COPY.clearedStatus : ''}
                </p>
              </div>
              <div aria-hidden="true" className={styles.tearEdge} />
            </aside>
          </div>

          <nav aria-label={PAGE_COPY.jumpNavLabel} className={styles.jumpNav}>
            <p className={styles.jumpNavHeading}>{PAGE_COPY.jumpNavHeading}</p>
            <ol className={styles.jumpList}>
              {ARRIVAL_ITEMS.map((item, index) => {
                const done = tickedSet.has(item.id);
                return (
                  <li key={item.id} className={styles.jumpItem}>
                    <a
                      href={hashLink(item.id)}
                      data-done={done || undefined}
                      className={styles.jumpLink}
                    >
                      <span aria-hidden="true" className={styles.jumpIndex}>
                        {done ? PROGRESS_COPY.doneMark : index + 1}
                      </span>
                      <span className={styles.jumpLabel}>{item.shortTitle}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </ContentContainer>
      </section>

      <div className={styles.checklistBand}>
        <ContentContainer width="wide">
          <ol className={styles.checklist}>
            {ARRIVAL_ITEMS.map((item, index) => (
              <li key={item.id} className={styles.checklistItem}>
                <ChecklistCard
                  item={item}
                  number={index + 1}
                  isTicked={tickedSet.has(item.id)}
                  onToggle={handleToggle}
                />
              </li>
            ))}
          </ol>

          <section aria-labelledby="arrival-closing-title" className={styles.closingBand}>
            <div className={styles.closingCopy}>
              <h2 id="arrival-closing-title" className={styles.closingTitle}>
                {CLOSING_COPY.title}
              </h2>
              <p className={styles.closingBody}>{CLOSING_COPY.body}</p>
              <p className={styles.closingGuideRow}>
                <Link to={CLOSING_COPY.guideHref} className={styles.closingGuideLink}>
                  {CLOSING_COPY.guideLabel}
                </Link>
              </p>
            </div>
            <div className={styles.closingAction}>
              <Button component={HomeSectionLink} href={CLOSING_COPY.ctaHref} variant="yellow" size="lg">
                {CLOSING_COPY.ctaLabel}
              </Button>
            </div>
          </section>
        </ContentContainer>
      </div>
    </main>
  );
}
