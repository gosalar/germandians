import { DMAT_FORMAT, SOURCES } from '@/utils/applicationFacts';

const {
  subtests, tasksPerSubtest, subtestMinutes, pauseMinutes, breakMinutes, academicMinutes, academicQuestions,
} = DMAT_FORMAT;

const fullMinutes = subtests * subtestMinutes + (subtests - 1) * pauseMinutes + breakMinutes + academicMinutes;

export const START_COPY = {
  paper: { de: 'Übungsschein', en: 'Practice slip' },
  mode: 'What would you like to practise?',
  sections: 'Which part?',
  subjects: 'Which subject?',
  reminders: 'Before you start',
  checklist: ['Put away your notes', 'Put away your calculator', 'Find somewhere quiet'],
  setAside: (minutes: number) => `Set aside ${minutes} minutes`,
  stamp: { de: 'Los geht’s', en: 'Off we go' },
  storageFailed: 'This browser is unable to save your test. Reloading the page will lose it.',
  javascript: 'Starting a test needs JavaScript.',
  format: 'How the real test runs',
  guide: 'See the dMAT guide for registration and test day',
  preparation: 'Official preparation material and videos',
  about: 'About these questions',
  independence: 'Independent practice material from Germandians. Not affiliated with or endorsed by g.a.s.t., which runs the dMAT.',
  questions: 'We put these questions together ourselves, closely following the format and task rules g.a.s.t. publishes for the dMAT.',
  difficulty: 'The real test may be harder. Use this to get used to the format and the clock, not to predict your result.',
  academicSet: 'There is one full academic section. If you take the full mock, you will have seen it.',
  figures: 'Each matrix has a text description. You can use a screen reader to work through Figure Sequences, though the tasks may be harder to follow.',
  privacy: 'Your answers are saved in this browser only, so a reload does not lose your test. They are never sent to us.',
  privacyLink: 'Privacy note',
  backup: {
    title: 'Unfinished practice',
    record: 'A practice record is saved in this browser.',
    practice: 'An untimed practice run is waiting.',
    break: 'Your full mock is waiting at the break.',
    full: 'A full mock is waiting.',
    section: 'A timed section is waiting.',
    resume: 'Continue',
    discard: 'Discard',
    confirm: {
      title: 'Discard this practice?',
      description: 'This deletes the saved practice and its answers from this browser.',
      cancel: 'Keep practice',
      accept: 'Discard',
    },
  },
} as const;

export const MODE_DESCRIPTIONS = {
  full: `Both modules with a break between them. Set aside ${fullMinutes} minutes for this mock.`,
  section: `One timed part. Allow ${subtestMinutes} minutes for a Core subtest or ${academicMinutes} minutes for the academic module.`,
  practice: 'No clock. Choose a puzzle type or a subject and check your answers as you go.',
} as const;

export const FORMAT_ROWS = [
  {
    time: `${subtests} × ${subtestMinutes} min`,
    description: `Core Module: Figure Sequences, Mathematical Equations and Latin Squares, with ${tasksPerSubtest} tasks per subtest.`,
  },
  { time: `${pauseMinutes} min`, description: 'Pause between Core subtests.' },
  { time: `${breakMinutes} min`, description: 'Break between the two modules.' },
  { time: `${academicMinutes} min`, description: `General Academic Module: passages with ${academicQuestions} questions in total.` },
] as const;

export const FORMAT_SOURCES = [SOURCES.dmatPreparation, SOURCES.dmatFaq, SOURCES.dmatVideos];
export const TIMED_MINUTES = { full: fullMinutes, core: subtestMinutes, academic: academicMinutes } as const;
