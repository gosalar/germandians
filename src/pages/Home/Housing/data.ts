import { HOUSING_SUPPORT } from '@/utils/constants';

export const HOUSING_COPY = {
  title: 'Housing and settling in',
  lede: 'We help you look for somewhere to live before you travel, and help you settle in once you arrive.',
} as const;

/** The housing offer. The availability limit is shown inside the same card, beside the offer it qualifies. */
export const HOUSING_HELP = {
  when: 'Before you travel',
  title: 'Somewhere to live',
  points: [
    HOUSING_SUPPORT.explore,
    HOUSING_SUPPORT.apply,
    HOUSING_SUPPORT.temporary,
  ],
  effort: 'We make a strong effort to find you options.',
  costs: HOUSING_SUPPORT.costs,
} as const;

export const SETTLING_HELP = {
  when: 'After you arrive',
  title: 'Settling in',
  points: [
    {
      term: 'City registration (Anmeldung)',
      text: 'We explain what to bring and what happens at the appointment.',
    },
    {
      term: 'Finding your feet',
      text: 'Help opening a bank account and finding your way around, and introductions to seniors who arrived before you.',
    },
    {
      term: 'Part-time work',
      text: 'Guidance on where to look and how to choose a job that fits around your studies. Employers make their own hiring decisions.',
    },
    {
      term: 'Rules for students',
      text: 'Help understanding the general rules, including those on working while you study, and where to check your own case officially.',
    },
  ],
} as const;
