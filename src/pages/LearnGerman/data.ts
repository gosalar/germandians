import { FEE_POLICY, GERMAN_LESSONS } from '@/utils/constants';

/**
 * Copy for the Learn German page. The shared terms (languages, charges, certificate) and the enquiry
 * label, hint and email draft are `GERMAN_LESSONS` in constants.ts; this file holds only the page's own
 * wording. Nothing here names a language, a level, a format, a schedule, a price or an outcome: the owners
 * have confirmed none of them.
 */
export const PAGE_COPY = {
  title: 'Learn German',
  introduction: GERMAN_LESSONS.offer,
} as const;

/** What the offer is, with its limits inside the same card. */
export const OFFER = {
  title: 'What we offer',
  body: [
    'We can help you learn German through your native language, with explanations and answers to your questions in a language you know well.',
    GERMAN_LESSONS.separate,
  ],
  languagesLead: 'We can’t promise every language.',
} as const;

/** Why a familiar language may help. Modest and concrete: no fluency, speed, exam or pass-rate claims. */
export const WHY = {
  title: 'Why your own language can help',
  lede: 'Learning German brings a lot of questions. In a language you already think in, you can ask them as they come to you.',
  points: [
    {
      title: 'Ask in your own words',
      body: 'Put a question the way it comes to you, without first working out how to say it in German or English.',
    },
    {
      title: 'Hear it in familiar words',
      body: 'Grammar and new words are explained in a language you know well.',
    },
  ],
} as const;

/** The enquiry section: how it works beside the form. */
export const ASK = {
  title: 'Ask about lessons',
  lede: 'Tell us a little about what you need. These details help us answer.',
  stepsTitle: { de: 'So läuft’s', en: 'How it works' },
  steps: [
    'Fill in the Anfrage: it takes a minute.',
    'An admin replies on WhatsApp, at the number you give.',
    'Ask us there whether we can teach in your language, and about the charges.',
  ],
  /** The admissions fee arrangement, composed from the shared fee wording, does not cover lessons. */
  separate: `${GERMAN_LESSONS.separate} The “${FEE_POLICY.amount} ${FEE_POLICY.timing}” arrangement does not cover them.`,
} as const;

/**
 * The German lessons form, styled as a German form like the profile review. Its questions are the
 * visitor's answers, not features of a course: no levels, formats or schedules are offered.
 */
export const LESSONS_FORM = {
  title: 'Anfrage zum Deutschunterricht',
  subtitle: 'Enquiry about German lessons',
  intro: 'Tell us a little about what you need, and an admin replies on WhatsApp.',
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  whatsappLabel: 'WhatsApp number',
  whatsappPlaceholder: '+91 98765 43210',
  emailLabel: 'Email (optional)',
  emailPlaceholder: 'you@example.com',
  languageLabel: 'The language you’d like explanations in',
  languagePlaceholder: 'Your language',
  purposeLabel: 'What you need German for (optional)',
  purposePlaceholder: 'e.g. university, daily life or work',
  experienceLabel: 'Any German you already have (optional)',
  experiencePlaceholder: 'e.g. none yet, or a few words',
  consent: 'I agree that Germandians can use my name, WhatsApp number, any email address I provide and my answers above to contact me about German lessons. Details are in the',
  privacyLink: 'privacy note',
  submit: 'Send my enquiry',
  openDraft: 'Open email draft',
  emailAppHint: 'This opens your email app. Nothing is sent until you press send there. You can also email',
  sendingButton: 'Sending…',
  sendingStatus: 'Sending your enquiry…',
  mailtoStatus: 'Your email draft is ready. Nothing has been sent by this page. Press send in your email app.',
  received: 'Received. An admin will message you on WhatsApp.',
  sendAnother: 'Send another',
  failure: 'We could not confirm receipt.',
  timeout: 'We could not confirm receipt within 15 seconds.',
  failureNext: 'Your details are still here. You can try again, or email',
  draftPrompt: 'No email app? Copy these details and send them to',
  draftLabel: 'Email details',
  openDraftAgain: 'Open the draft again',
  nameError: 'Please enter your name.',
  whatsappError: 'Please enter your WhatsApp number with 10–15 digits, including the country code.',
  emailError: 'Please enter a valid email address.',
  languageError: 'Please tell us the language you’d like explanations in.',
  consentError: 'Please tick the box so we can contact you.',
} as const;

/** The German-form notice label above the terms in the enquiry card. */
export const NOTICE = {
  german: 'Hinweis',
  english: 'Please note',
} as const;

/** Admissions questions go to the profile review, kept apart from the language enquiry. */
export const ADMISSIONS = {
  title: 'Applying to a German university?',
  body: 'For help with your application, start with a profile review.',
} as const;

/** Four ways to say hello, as bubbles in the header. Where each is used, in English beside it. */
export const GREETINGS = {
  caption: 'Four ways to say hello in German',
  items: [
    { id: 'hallo', de: 'Hallo!', en: 'anywhere' },
    { id: 'guten-tag', de: 'Guten Tag!', en: 'polite' },
    { id: 'moin', de: 'Moin!', en: 'in the north' },
    { id: 'servus', de: 'Servus!', en: 'in the south' },
  ],
} as const;

/** The "why" section's chat: a German question, then an answer in the visitor's own language. */
export const CHAT = {
  question: { de: 'Wie bitte?', en: 'Sorry, what was that?' },
  answer: 'Ask in your own language.',
} as const;

/**
 * A taste of everyday German as flip cards: the word on the front, its meaning and an example on the
 * back. Everyday words only, no official procedures: those belong with their sources elsewhere. Long
 * words carry a soft hyphen (­) so they break cleanly on phones.
 */
export const WORDS = {
  kicker: { de: 'Wortschatz', en: 'Vocabulary' },
  title: 'Six words you’ll hear early on',
  lede: 'Tap a card to turn it over.',
  hint: 'Tap to turn',
  cards: [
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
  ],
} as const;
