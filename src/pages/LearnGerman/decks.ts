/**
 * Five themed everyday German word decks for the Learn German page (`Uni`, `Wohnung`, `Behörde`,
 * `Einkaufen`, `Arbeit`), together with all visible UI copy for the deck chooser and progress controls.
 *
 * Every entry explains the word itself, never official rules, fees, deadlines or legal duties.
 * Words shared with the German words glossary (`/german-words`) carry the exact same grammatical
 * article, plural form and plain British-English meaning.
 */

export const DECK_IDS = ['uni', 'wohnung', 'behoerde', 'einkaufen', 'arbeit'] as const;

export type DeckId = (typeof DECK_IDS)[number];

export const DEFAULT_DECK_ID: DeckId = 'uni';

export const CARD_ARTICLES = ['der', 'die', 'das'] as const;

export type CardArticle = (typeof CARD_ARTICLES)[number];

export const CARD_STATUSES = ['again', 'got it'] as const;

export type CardStatus = (typeof CARD_STATUSES)[number];

export interface DeckCard {
  readonly id: string;
  readonly article: CardArticle | '';
  readonly word: string;
  readonly forms: string;
  readonly meaning: string;
  readonly example: {
    readonly de: string;
    readonly en: string;
  };
}

export interface WordDeckDefinition {
  readonly id: DeckId;
  readonly de: string;
  readonly en: string;
  readonly description: string;
  readonly cards: readonly DeckCard[];
}

export const DECK_COPY = {
  kicker: { de: 'Wortschatz', en: 'Vocabulary' },
  title: 'Everyday words by theme',
  lede: 'Choose a deck, tap a card to turn it over, and mark whether you have got it or want to see it again. Your progress stays in this browser on your device.',
  chooserLabel: 'Choose a word deck',
  hint: 'Tap to turn',
  againButton: 'Again',
  gotItButton: 'Got it',
  clearButton: 'Clear my entries',
  allWordsLink: 'See all German words in the Wörterbuch',
  storageNote: 'Saved only in this browser. Nothing is sent anywhere.',
  storageWarning:
    'Browser storage is unavailable or could not be updated. Your changes may not be saved or cleared.',
} as const;

export function formatDeckOptionLabel(deck: Pick<WordDeckDefinition, 'de' | 'en'>): string {
  return `${deck.de} · ${deck.en}`;
}

export function formatDeckProgress(gotIt: number, again: number, total: number): string {
  if (gotIt === 0 && again === 0) {
    return `0 of ${total} marked in this deck`;
  }
  return `${gotIt} of ${total} got it · ${again} again in this deck`;
}

export function formatOverallProgress(markedTotal: number, allCardsTotal: number): string {
  if (markedTotal === 0) {
    return DECK_COPY.storageNote;
  }
  return `${markedTotal} of ${allCardsTotal} cards marked across all decks`;
}

export const WORD_DECKS: readonly WordDeckDefinition[] = [
  {
    id: 'uni',
    de: 'Uni',
    en: 'University',
    description: 'Campus life, lectures, office hours and written exams.',
    cards: [
      {
        id: 'mensa',
        article: 'die',
        word: 'Mensa',
        forms: 'Plural: die Mensen',
        meaning: 'the university canteen',
        example: {
          de: 'Wir treffen uns in der Mensa.',
          en: 'We’ll meet in the canteen.',
        },
      },
      {
        id: 'vorlesung',
        article: 'die',
        word: 'Vorlesung',
        forms: 'Plural: die Vorlesungen',
        meaning: 'a lecture',
        example: {
          de: 'Die Vorlesung beginnt um zehn.',
          en: 'The lecture starts at ten.',
        },
      },
      {
        id: 'kommilitone',
        article: 'der',
        word: 'Kommilitone',
        forms: 'Plural: die Kommilitonen · feminine: die Kommilitonin',
        meaning: 'a fellow student (die Kommilitonin for a woman)',
        example: {
          de: 'Mein Kommilitone erklärt mir die Aufgabe.',
          en: 'My fellow student explains the task to me.',
        },
      },
      {
        id: 'hoersaal',
        article: 'der',
        word: 'Hörsaal',
        forms: 'Plural: die Hörsäle',
        meaning: 'a lecture hall',
        example: {
          de: 'Der Hörsaal liegt im Hauptgebäude direkt neben der Bibliothek.',
          en: 'The lecture hall is in the main building right next to the library.',
        },
      },
      {
        id: 'sprechstunde',
        article: 'die',
        word: 'Sprechstunde',
        forms: 'Plural: die Sprechstunden',
        meaning: 'office hours held by a lecturer or university advising desk',
        example: {
          de: 'Ich melde mich per E-Mail für die nächste Sprechstunde an.',
          en: 'I sign up by email for the next office hours.',
        },
      },
      {
        id: 'klausur',
        article: 'die',
        word: 'Klausur',
        forms: 'Plural: die Klausuren',
        meaning: 'a written university examination',
        example: {
          de: 'Für die Klausur lernen wir gemeinsam in der Bibliothek.',
          en: 'We revise together in the library for the written exam.',
        },
      },
    ],
  },
  {
    id: 'wohnung',
    de: 'Wohnung',
    en: 'Housing',
    description: 'Shared flats, halls of residence, tenancy contracts and rent.',
    cards: [
      {
        id: 'wohngemeinschaft',
        article: 'die',
        word: 'Wohngemeinschaft',
        forms: 'Plural: die Wohngemeinschaften',
        meaning: 'a shared flat, usually shortened to die WG',
        example: {
          de: 'Ich wohne in einer ruhigen Wohngemeinschaft in Campusnähe.',
          en: 'I live in a quiet shared flat near campus.',
        },
      },
      {
        id: 'mitbewohner',
        article: 'der',
        word: 'Mitbewohner',
        forms: 'Plural: die Mitbewohner · feminine: die Mitbewohnerin',
        meaning: 'a flatmate (die Mitbewohnerin for a woman)',
        example: {
          de: 'Mein Mitbewohner zeigt mir den Bäcker an der nächsten Ecke.',
          en: 'My flatmate shows me the bakery on the next corner.',
        },
      },
      {
        id: 'wohnheim',
        article: 'das',
        word: 'Wohnheim',
        forms: 'Plural: die Wohnheime',
        meaning: 'a student hall of residence',
        example: {
          de: 'Das Wohnheim ist mit dem Fahrrad schnell vom Campus erreichbar.',
          en: 'The hall of residence is a short cycle ride from campus.',
        },
      },
      {
        id: 'mietvertrag',
        article: 'der',
        word: 'Mietvertrag',
        forms: 'Plural: die Mietverträge',
        meaning: 'a tenancy agreement',
        example: {
          de: 'Ich lese den Mietvertrag sorgfältig durch, bevor ich unterschreibe.',
          en: 'I read the tenancy agreement carefully before signing.',
        },
      },
      {
        id: 'warmmiete',
        article: 'die',
        word: 'Warmmiete',
        forms: 'Plural: die Warmmieten',
        meaning: 'rent including heating and standard building service charges',
        example: {
          de: 'Für meine Übersicht vergleiche ich bei den Anzeigen die Warmmiete.',
          en: 'For my comparison, I look at the rent including heating and service charges.',
        },
      },
      {
        id: 'kaution',
        article: 'die',
        word: 'Kaution',
        forms: 'Plural: die Kautionen',
        meaning: 'a refundable security deposit for a rented room or flat',
        example: {
          de: 'Nach dem Auszug überweist der Vermieter die Kaution zurück.',
          en: 'After moving out, the landlord transfers the security deposit back.',
        },
      },
    ],
  },
  {
    id: 'behoerde',
    de: 'Behörde',
    en: 'Public offices',
    description: 'Appointments, city registration, certificates and municipal desks.',
    cards: [
      {
        id: 'termin',
        article: 'der',
        word: 'Termin',
        forms: 'Plural: die Termine',
        meaning: 'an appointment',
        example: {
          de: 'Ich habe morgen einen Termin.',
          en: 'I have an appointment tomorrow.',
        },
      },
      {
        id: 'buergeramt',
        article: 'das',
        word: 'Bürgeramt',
        forms: 'Plural: die Bürgerämter',
        meaning: 'the local municipal citizens’ office',
        example: {
          de: 'Im Bürgeramt melde ich meine neue Wohnadresse in der Stadt an.',
          en: 'At the citizens’ office, I register my new residential address in the city.',
        },
      },
      {
        id: 'anmeldung',
        article: 'die',
        word: 'Anmeldung',
        forms: 'Plural: die Anmeldungen',
        meaning: 'registration, especially registering your address at the local citizens’ office',
        example: {
          de: 'Nach dem Einzug buche ich online einen Termin für die Anmeldung.',
          en: 'After moving in, I book an appointment online for city registration.',
        },
      },
      {
        id: 'meldebescheinigung',
        article: 'die',
        word: 'Meldebescheinigung',
        forms: 'Plural: die Meldebescheinigungen',
        meaning: 'the official confirmation of address registration',
        example: {
          de: 'Bei der Kontoeröffnung zeige ich meine aktuelle Meldebescheinigung vor.',
          en: 'When opening my bank account, I show my current registration certificate.',
        },
      },
      {
        id: 'auslaenderbehoerde',
        article: 'die',
        word: 'Ausländerbehörde',
        forms: 'Plural: die Ausländerbehörden',
        meaning: 'the local foreigners’ authority',
        example: {
          de: 'Ich vereinbare online einen Termin bei der Ausländerbehörde.',
          en: 'I book an appointment online at the foreigners’ authority.',
        },
      },
      {
        id: 'aufenthaltstitel',
        article: 'der',
        word: 'Aufenthaltstitel',
        forms: 'Plural: die Aufenthaltstitel',
        meaning: 'a residence permit',
        example: {
          de: 'Der elektronische Aufenthaltstitel hat die Größe einer Bankkarte.',
          en: 'The electronic residence permit is the size of a bank card.',
        },
      },
    ],
  },
  {
    id: 'einkaufen',
    de: 'Einkaufen',
    en: 'Shopping',
    description: 'Supermarkets, weekly markets, receipts and everyday errands.',
    cards: [
      {
        id: 'pfand',
        article: 'das',
        word: 'Pfand',
        forms: 'Plural: die Pfänder (usually singular)',
        meaning: 'a refundable deposit on drink bottles, cans and reusable cups',
        example: {
          de: 'Die leeren Flaschen gebe ich am Automaten im Supermarkt für das Pfand ab.',
          en: 'I return the empty bottles at the supermarket machine for the deposit.',
        },
      },
      {
        id: 'kassenbon',
        article: 'der',
        word: 'Kassenbon',
        forms: 'Plural: die Kassenbons',
        meaning: 'a till receipt from a shop or supermarket',
        example: {
          de: 'An der Kasse fragt der Verkäufer, ob ich den Kassenbon möchte.',
          en: 'At the checkout, the shop assistant politely asks whether I want the till receipt.',
        },
      },
      {
        id: 'bargeld',
        article: 'das',
        word: 'Bargeld',
        forms: 'No plural',
        meaning: 'cash in notes and coins',
        example: {
          de: 'Auf dem Wochenmarkt bezahle ich das frische Brot mit Bargeld.',
          en: 'At the weekly market, I pay for the fresh bread in cash.',
        },
      },
      {
        id: 'drogerie',
        article: 'die',
        word: 'Drogerie',
        forms: 'Plural: die Drogerien',
        meaning: 'a high-street shop selling toiletries, cosmetics and household cleaners',
        example: {
          de: 'Seife, Zahnpasta und Waschmittel kaufe ich in der Drogerie.',
          en: 'I buy soap, toothpaste and laundry detergent at the toiletries shop.',
        },
      },
      {
        id: 'wochenmarkt',
        article: 'der',
        word: 'Wochenmarkt',
        forms: 'Plural: die Wochenmärkte',
        meaning: 'an open-air weekly market for fresh fruit, vegetables and bread',
        example: {
          de: 'Am Samstagmorgen kaufen wir frisches Gemüse auf dem Wochenmarkt.',
          en: 'On Saturday morning, we buy fresh vegetables at the weekly market.',
        },
      },
      {
        id: 'doch',
        article: '',
        word: 'doch',
        forms: 'Modal particle · no article',
        meaning: '“yes, actually”, when you contradict a negative',
        example: {
          de: 'Kommst du heute nicht mit? – Doch, ich bin schon unterwegs.',
          en: 'Aren’t you coming along today? – Yes, actually, I’m already on my way.',
        },
      },
    ],
  },
  {
    id: 'arbeit',
    de: 'Arbeit',
    en: 'Work',
    description: 'Student jobs, contracts, payslips and the end of the working day.',
    cards: [
      {
        id: 'werkstudent',
        article: 'der',
        word: 'Werkstudent',
        forms: 'Plural: die Werkstudenten · feminine: die Werkstudentin',
        meaning: 'a university student employed part-time alongside their degree',
        example: {
          de: 'Sie arbeitet neben dem Studium als Werkstudentin in einem Softwareteam.',
          en: 'Alongside her degree, she works as a working student in a software team.',
        },
      },
      {
        id: 'lebenslauf',
        article: 'der',
        word: 'Lebenslauf',
        forms: 'Plural: die Lebensläufe',
        meaning: 'a curriculum vitae (CV)',
        example: {
          de: 'Mein tabellarischer Lebenslauf führt Studium und Projekte übersichtlich auf.',
          en: 'My tabular CV lists my degree and projects clearly.',
        },
      },
      {
        id: 'arbeitsvertrag',
        article: 'der',
        word: 'Arbeitsvertrag',
        forms: 'Plural: die Arbeitsverträge',
        meaning: 'an employment contract',
        example: {
          de: 'Ich lese den Arbeitsvertrag vor der Unterschrift in Ruhe durch.',
          en: 'I read through the employment contract carefully before signing.',
        },
      },
      {
        id: 'praktikum',
        article: 'das',
        word: 'Praktikum',
        forms: 'Plural: die Praktika',
        meaning: 'an internship or practical placement',
        example: {
          de: 'Im Sommer mache ich ein Praktikum in einem Ingenieurbüro.',
          en: 'In the summer, I am doing an internship at an engineering office.',
        },
      },
      {
        id: 'gehaltsabrechnung',
        article: 'die',
        word: 'Gehaltsabrechnung',
        forms: 'Plural: die Gehaltsabrechnungen',
        meaning: 'a monthly payslip',
        example: {
          de: 'Auf der Gehaltsabrechnung sind der Lohn und alle Abzüge aufgeführt.',
          en: 'Pay and all deductions are listed on the payslip.',
        },
      },
      {
        id: 'feierabend',
        article: 'der',
        word: 'Feierabend',
        forms: 'Plural: die Feierabende',
        meaning: 'the end of the working day, and the free time after it',
        example: {
          de: 'Am Feierabend kochen wir gemeinsam in der Küche.',
          en: 'At the end of the working day, we cook together in the kitchen.',
        },
      },
    ],
  },
];

export const ALL_DECK_CARDS: readonly DeckCard[] = WORD_DECKS.flatMap((deck) => deck.cards);

export const ALL_CARD_IDS: ReadonlySet<string> = new Set(ALL_DECK_CARDS.map((card) => card.id));
