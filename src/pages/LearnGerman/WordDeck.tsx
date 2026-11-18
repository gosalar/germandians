import { Button } from '@mantine/core';
import { useEffect, useReducer } from 'react';
import { Link } from 'react-router';

import { PAGE_LINKS, destinationHref } from '@/utils/constants';

import {
  ALL_DECK_CARDS,
  DECK_COPY,
  DEFAULT_DECK_ID,
  WORD_DECKS,
  formatDeckProgress,
  formatOverallProgress,
  type CardStatus,
  type DeckCard,
  type DeckId,
} from './decks';
import styles from './styles.module.scss';
import deckStyles from './WordDeck.module.scss';
import {
  clearWordDeckProgress,
  readWordDeckProgress,
  writeWordDeckProgress,
  type WordDeckProgress,
} from './WordDeckStorage';

interface WordCardProps {
  readonly word: DeckCard;
  readonly turned: boolean;
  readonly status: CardStatus | undefined;
  readonly onToggleTurn: (cardId: string) => void;
  readonly onMark: (cardId: string, nextStatus: CardStatus) => void;
}

interface DeckState {
  readonly activeDeckId: DeckId;
  readonly turnedCards: Readonly<Record<string, boolean>>;
  readonly cardMarks: Readonly<Record<string, CardStatus>>;
  readonly storageUnavailable: boolean;
}

type DeckAction =
  | { type: 'load'; progress: WordDeckProgress | null; failed: boolean }
  | { type: 'select-deck'; deckId: DeckId; storageFailed: boolean }
  | { type: 'toggle-turn'; cardId: string }
  | {
      type: 'set-marks';
      cardMarks: Readonly<Record<string, CardStatus>>;
      storageFailed: boolean;
    }
  | { type: 'clear'; storageFailed: boolean };

const initialDeckState: DeckState = {
  activeDeckId: DEFAULT_DECK_ID,
  turnedCards: {},
  cardMarks: {},
  storageUnavailable: false,
};

function deckReducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case 'load':
      return {
        ...state,
        activeDeckId: action.progress ? action.progress.deck : state.activeDeckId,
        cardMarks: action.progress ? action.progress.cards : state.cardMarks,
        storageUnavailable: state.storageUnavailable || action.failed,
      };
    case 'select-deck':
      return {
        ...state,
        activeDeckId: action.deckId,
        storageUnavailable: state.storageUnavailable || action.storageFailed,
      };
    case 'toggle-turn':
      return {
        ...state,
        turnedCards: {
          ...state.turnedCards,
          [action.cardId]: !state.turnedCards[action.cardId],
        },
      };
    case 'set-marks':
      return {
        ...state,
        cardMarks: action.cardMarks,
        storageUnavailable: state.storageUnavailable || action.storageFailed,
      };
    case 'clear':
      return {
        ...state,
        turnedCards: {},
        cardMarks: {},
        storageUnavailable: state.storageUnavailable || action.storageFailed,
      };
  }
}

/**
 * One flip card with per-card progress buttons underneath. Both faces stay in the accessibility
 * tree at all times so screen readers hear the German word, plural, meaning and example together;
 * turning the card over is visual and tracked with `aria-pressed`.
 */
function WordCard({ word, turned, status, onToggleTurn, onMark }: WordCardProps) {
  const labelId = `word-label-${word.id}`;

  return (
    <li
      className={`${styles.wordItem} ${deckStyles.cardSlot}`}
      data-word-item={word.id}
      data-card-status={status ?? 'unmarked'}
    >
      <button
        type="button"
        aria-pressed={turned}
        className={`${styles.wordCard} ${deckStyles.cardFlipButton}`}
        data-word={word.id}
        onClick={() => onToggleTurn(word.id)}
      >
        <span className={`${styles.wordInner} ${deckStyles.printInner}`}>
          <span className={`${styles.wordFront} ${deckStyles.printFace}`}>
            <span id={labelId} className={deckStyles.wordHeading}>
              {word.article ? (
                <span lang="de" className={styles.wordArticle}>
                  {word.article}{' '}
                </span>
              ) : null}
              <span lang="de" className={`${styles.wordTerm} ${deckStyles.cardTerm}`}>
                {word.word}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`${styles.wordHint} ${deckStyles.printHide}`}
            >
              {DECK_COPY.hint}
            </span>
          </span>
          <span className={`${styles.wordBack} ${deckStyles.printFace}`}>
            <span lang="de" className={deckStyles.wordForms}>
              {word.forms}
            </span>
            <span className={styles.wordMeaning}>{word.meaning}</span>
            <span lang="de" className={styles.wordExample}>
              „{word.example.de}“
            </span>
            <span className={styles.wordExampleEn}>{word.example.en}</span>
          </span>
        </span>
      </button>

      <div
        role="group"
        aria-labelledby={labelId}
        className={deckStyles.cardActions}
      >
        <button
          type="button"
          aria-pressed={status === 'again'}
          className={deckStyles.markButton}
          data-mark="again"
          onClick={() => onMark(word.id, 'again')}
        >
          <span aria-hidden="true" className={deckStyles.markIndicator} />
          <span>{DECK_COPY.againButton}</span>
        </button>
        <button
          type="button"
          aria-pressed={status === 'got it'}
          className={deckStyles.markButton}
          data-mark="got-it"
          onClick={() => onMark(word.id, 'got it')}
        >
          <span aria-hidden="true" className={deckStyles.markIndicator} />
          <span>{DECK_COPY.gotItButton}</span>
        </button>
      </div>
    </li>
  );
}

/** Five themed decks of everyday German words, with progress saved only in the browser. */
export default function WordDeck() {
  const [state, dispatch] = useReducer(deckReducer, initialDeckState);

  useEffect(() => {
    const { progress, failed } = readWordDeckProgress();
    dispatch({ type: 'load', progress, failed });
  }, []);

  const activeDeck = WORD_DECKS.find((deck) => deck.id === state.activeDeckId) ?? WORD_DECKS[0];

  let deckGotIt = 0;
  let deckAgain = 0;
  for (const card of activeDeck.cards) {
    const mark = state.cardMarks[card.id];
    if (mark === 'got it') deckGotIt++;
    else if (mark === 'again') deckAgain++;
  }

  const markedTotal = Object.keys(state.cardMarks).length;

  const handleSelectDeck = (nextDeckId: DeckId) => {
    const hasMarks = Object.keys(state.cardMarks).length > 0;
    const ok = hasMarks ? writeWordDeckProgress(nextDeckId, state.cardMarks) : true;
    dispatch({ type: 'select-deck', deckId: nextDeckId, storageFailed: !ok });
  };

  const handleToggleTurn = (cardId: string) => {
    dispatch({ type: 'toggle-turn', cardId });
  };

  const handleMarkCard = (cardId: string, nextStatus: CardStatus) => {
    const updated: Record<string, CardStatus> = { ...state.cardMarks };
    if (updated[cardId] === nextStatus) {
      delete updated[cardId];
    } else {
      updated[cardId] = nextStatus;
    }
    const ok = writeWordDeckProgress(state.activeDeckId, updated);
    dispatch({ type: 'set-marks', cardMarks: updated, storageFailed: !ok });
  };

  const handleClearEntries = () => {
    const ok = clearWordDeckProgress();
    dispatch({ type: 'clear', storageFailed: !ok });
  };

  return (
    <section
      aria-labelledby="learn-german-words"
      className={`${styles.words} ${deckStyles.wordsSection}`}
    >
      <div className={styles.wordsInner}>
        <div className={styles.wordsHead}>
          <p className={`${styles.kicker} ${deckStyles.printDarkText}`}>
            <span lang="de">{DECK_COPY.kicker.de}</span>
            <span className={`${styles.kickerEn} ${deckStyles.printMutedText}`}>
              {DECK_COPY.kicker.en}
            </span>
          </p>
          <h2
            id="learn-german-words"
            className={`${styles.wordsTitle} ${deckStyles.printDarkText}`}
          >
            {DECK_COPY.title}
          </h2>
          <p className={`${styles.wordsLede} ${deckStyles.printMutedText}`}>
            {DECK_COPY.lede}
          </p>
          <p className={deckStyles.allWords}>
            <Link
              to={destinationHref(PAGE_LINKS.germanWords.destination)}
              className={deckStyles.allWordsLink}
            >
              {DECK_COPY.allWordsLink}
            </Link>
          </p>
        </div>

        <div
          role="group"
          aria-label={DECK_COPY.chooserLabel}
          className={deckStyles.chooser}
        >
          {WORD_DECKS.map((deck) => (
            <button
              key={deck.id}
              type="button"
              aria-pressed={deck.id === activeDeck.id}
              className={deckStyles.deckChoice}
              data-deck={deck.id}
              onClick={() => handleSelectDeck(deck.id)}
            >
              <span lang="de">{deck.de}</span>
              <span aria-hidden="true" className={deckStyles.deckSep}>
                ·
              </span>
              <span className={deckStyles.deckEn}>{deck.en}</span>
            </button>
          ))}
        </div>

        <div className={deckStyles.toolbar}>
          <div className={deckStyles.toolbarCopy}>
            <p className={`${deckStyles.deckDescription} ${deckStyles.printDarkText}`}>
              <span lang="de">{activeDeck.de}</span> · {activeDeck.en} — {activeDeck.description}
            </p>
            <p
              role="status"
              aria-live="polite"
              className={`${deckStyles.progressLine} ${deckStyles.printMutedText}`}
              data-deck-progress
            >
              <span className={`${deckStyles.progressDeckCount} ${deckStyles.printDarkText}`}>
                {formatDeckProgress(deckGotIt, deckAgain, activeDeck.cards.length)}
              </span>
              <span aria-hidden="true" className={deckStyles.progressSep}>
                ·
              </span>
              <span>{formatOverallProgress(markedTotal, ALL_DECK_CARDS.length)}</span>
            </p>
          </div>

          <Button
            type="button"
            variant="ring-dark"
            size="md"
            className={deckStyles.clearButton}
            onClick={handleClearEntries}
          >
            {DECK_COPY.clearButton}
          </Button>
        </div>

        {state.storageUnavailable ? (
          <p role="alert" className={deckStyles.storageWarning}>
            {DECK_COPY.storageWarning}
          </p>
        ) : null}

        <ul className={`${styles.deck} ${deckStyles.deckGrid}`}>
          {activeDeck.cards.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              turned={Boolean(state.turnedCards[word.id])}
              status={state.cardMarks[word.id]}
              onToggleTurn={handleToggleTurn}
              onMark={handleMarkCard}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
