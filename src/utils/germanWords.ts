/**
 * Everyday German words as cards: the word, its meaning and an example. The Learn German page shows them
 * as flip cards and the dMAT practice page shows one during the break. Everyday words only, no official
 * procedures: those belong with their sources elsewhere. Long words carry a soft hyphen (­) so they
 * break cleanly on phones.
 */
export const GERMAN_WORD_CARDS = [
  {
    id: 'mensa',
    article: 'die',
    word: 'Mensa',
    meaning: 'the university canteen',
    example: { de: 'Wir treffen uns in der Mensa.', en: 'We’ll meet in the canteen.' },
  },
  {
    id: 'vorlesung',
    article: 'die',
    word: 'Vor­lesung',
    meaning: 'a lecture',
    example: { de: 'Die Vorlesung beginnt um zehn.', en: 'The lecture starts at ten.' },
  },
  {
    id: 'kommilitone',
    article: 'der',
    word: 'Kommi­litone',
    meaning: 'a fellow student (die Kommilitonin for a woman)',
    example: { de: 'Mein Kommilitone erklärt mir die Aufgabe.', en: 'My fellow student explains the task to me.' },
  },
  {
    id: 'termin',
    article: 'der',
    word: 'Termin',
    meaning: 'an appointment',
    example: { de: 'Ich habe morgen einen Termin.', en: 'I have an appointment tomorrow.' },
  },
  {
    id: 'feierabend',
    article: 'der',
    word: 'Feier­abend',
    meaning: 'the end of the working day, and the free time after it',
    example: { de: 'Schönen Feierabend!', en: 'Enjoy your evening!' },
  },
  {
    id: 'doch',
    article: '',
    word: 'doch',
    meaning: '“yes, actually”, when you contradict a negative',
    example: { de: 'Kommst du nicht mit? – Doch!', en: 'Aren’t you coming along? – Yes, I am!' },
  },
] as const;
