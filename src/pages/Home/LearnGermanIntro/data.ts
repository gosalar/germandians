import { GERMAN_LESSONS } from '@/utils/constants';

/**
 * Copy for the home intro to German lessons. The limits (languages, charges, certificate) are
 * `GERMAN_LESSONS` in constants.ts and sit together in the notice, beside the link to the full page.
 */
export const LEARN_GERMAN_INTRO = {
  title: 'Learn German through your own language',
  body: `${GERMAN_LESSONS.offer} ${GERMAN_LESSONS.separate}`,
  noticeGerman: 'Hinweis',
  noticeEnglish: 'Please note',
  link: 'How German lessons work',
} as const;
