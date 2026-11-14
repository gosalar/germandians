/**
 * The animals drawn as stand-in portraits (`Portraits.tsx`): three from India and three from Germany,
 * each with its German name and article and its English name.
 */
export const ANIMALS = {
  peacock: { de: 'der Pfau', en: 'peacock' },
  stork: { de: 'der Storch', en: 'stork' },
  tiger: { de: 'der Tiger', en: 'tiger' },
  hedgehog: { de: 'der Igel', en: 'hedgehog' },
  elephant: { de: 'der Elefant', en: 'elephant' },
  owl: { de: 'die Eule', en: 'owl' },
} as const;

export type Animal = keyof typeof ANIMALS;
