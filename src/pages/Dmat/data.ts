import { DMAT, DMAT_EXAM, DMAT_PORTAL, SOURCES } from '@/utils/applicationFacts';
import { ROUTES } from '@/utils/constants';
import { requirementsHref } from '@/utils/requirements/topics';

export const PAGE_COPY = {
  title: 'dMAT guide',
  introduction: DMAT.about,
  guideNav: 'On this page',
  practice: {
    title: 'Try dMAT practice',
    introduction: 'Get used to the format and the clock with independent practice from Germandians.',
    action: 'Open dMAT practice',
    href: ROUTES.dmatPractice,
  },
} as const;

export const GUIDE = {
  need: {
    id: 'do-i-need-it',
    title: 'Do I need it?',
    paragraphs: [DMAT_EXAM.aps, DMAT.summary],
    sources: [SOURCES.dmat],
    action: { label: 'Check the fields and exemptions', href: requirementsHref('aps-dmat') },
  },
  format: {
    id: 'test-format',
    title: 'What is in the test',
    paragraphs: [DMAT_EXAM.format.modules, DMAT_EXAM.format.core],
    puzzles: DMAT_EXAM.format.puzzles,
    timing: [DMAT_EXAM.format.pause, DMAT_EXAM.format.break],
    academic: [DMAT_EXAM.format.academic, DMAT_EXAM.format.choices, DMAT_EXAM.format.guessing],
    sources: [SOURCES.dmatPreparation, SOURCES.dmatFaq, SOURCES.dmatVideos],
    action: { label: 'See how to prepare', href: '#prepare' },
  },
  registration: {
    id: 'registering',
    title: 'Registering',
    paragraphs: DMAT_PORTAL.registration,
    sources: [SOURCES.dmatFaq, SOURCES.dmatTerms],
    action: { label: 'Open dMAT registration', href: DMAT_PORTAL.bookingUrl },
  },
  dates: {
    id: 'dates-and-fee',
    title: 'Dates and fee',
    fee: DMAT.feeNote,
    windows: DMAT.windows,
    columns: ['Test date', 'Register by', 'Results'],
    sources: [SOURCES.test, SOURCES.dmat],
    action: { label: 'Check availability in the booking portal', href: DMAT_PORTAL.bookingUrl },
  },
  day: {
    id: 'on-the-day',
    title: 'On the day',
    paragraphs: [DMAT_EXAM.day.passport, DMAT_EXAM.day.desk, DMAT_EXAM.day.checkIn, DMAT_EXAM.day.software],
    sources: [SOURCES.dmatTerms, SOURCES.dmatFaq],
    action: { label: 'Find the official preparation materials', href: '#prepare' },
  },
  results: {
    id: 'results',
    title: 'Results',
    paragraphs: DMAT_PORTAL.results,
    sources: [SOURCES.dmatFaq, SOURCES.dmat],
    action: { label: 'Check how to submit the certificate', href: requirementsHref('aps-dmat') },
  },
  prepare: {
    id: 'prepare',
    title: 'Prepare',
    paragraphs: ['Start with the official preparation material and videos. Then practise the format here.'],
    sources: [SOURCES.dmatPreparation, SOURCES.dmatVideos],
  },
} as const;
