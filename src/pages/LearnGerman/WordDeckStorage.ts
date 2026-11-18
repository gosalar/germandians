import {
  ALL_CARD_IDS,
  CARD_STATUSES,
  DECK_IDS,
  DEFAULT_DECK_ID,
  type CardStatus,
  type DeckId,
} from './decks';

/**
 * Browser storage for Learn German word-deck progress (`germandians:word-decks`).
 * Read only after mount, with every read, write and removal wrapped in try/catch.
 * Invalid stored shapes are discarded immediately. Nothing stored leaves the browser.
 */
export const STORAGE_KEY = 'germandians:word-decks';

export interface WordDeckProgress {
  readonly version: 1;
  readonly deck: DeckId;
  readonly cards: Readonly<Record<string, CardStatus>>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDeckId = (value: unknown): value is DeckId =>
  typeof value === 'string' && (DECK_IDS as readonly string[]).includes(value);

const isCardStatus = (value: unknown): value is CardStatus =>
  typeof value === 'string' && (CARD_STATUSES as readonly string[]).includes(value);

export function validWordDeckProgress(value: unknown): value is WordDeckProgress {
  if (!isRecord(value) || value.version !== 1 || !isDeckId(value.deck) || !isRecord(value.cards)) {
    return false;
  }

  // Unknown card ids are allowed here: `normaliseProgress` drops them, so a card removed or renamed
  // in a later edit never wipes the progress on the other cards.
  for (const status of Object.values(value.cards)) {
    if (!isCardStatus(status)) {
      return false;
    }
  }

  return true;
}

function normaliseProgress(deck: DeckId, cards: Readonly<Record<string, CardStatus>>): WordDeckProgress {
  const cleanCards: Record<string, CardStatus> = {};
  for (const [cardId, status] of Object.entries(cards)) {
    if (ALL_CARD_IDS.has(cardId) && isCardStatus(status)) {
      cleanCards[cardId] = status;
    }
  }
  return {
    version: 1,
    deck: isDeckId(deck) ? deck : DEFAULT_DECK_ID,
    cards: cleanCards,
  };
}

export function readWordDeckProgress(): { progress: WordDeckProgress | null; failed: boolean } {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return { progress: null, failed: false };
    let parsed: unknown;
    try {
      parsed = JSON.parse(stored);
    } catch {
      parsed = null;
    }
    if (!validWordDeckProgress(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { progress: null, failed: false };
    }
    return { progress: normaliseProgress(parsed.deck, parsed.cards), failed: false };
  } catch {
    return { progress: null, failed: true };
  }
}

export function writeWordDeckProgress(
  deck: DeckId,
  cards: Readonly<Record<string, CardStatus>>,
): boolean {
  try {
    const normalised = normaliseProgress(deck, cards);
    if (Object.keys(normalised.cards).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalised));
    return true;
  } catch {
    return false;
  }
}

export function clearWordDeckProgress(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
