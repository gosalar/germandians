export const HOUSING_COPY = {
  title: 'Housing and settling in',
  lede: 'We help you look for somewhere to live before you travel, and help you settle in once you arrive.',
} as const;

/** The housing offer. The availability limit is shown inside the same card, beside the offer it qualifies. */
export const HOUSING_HELP = {
  when: 'Before you travel',
  title: 'Somewhere to live',
  points: [
    'We help you explore your options, from student residences to private rooms.',
    'We help you prepare, send and follow up your applications.',
    'If no longer-term place is confirmed before you travel, we help you find a temporary stay.',
  ],
  effort: 'We make a strong effort to find you options.',
  costs: 'Rent and deposits go to your landlord or residence, separately from our service fee.',
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
