export const CASE_CYCLE = 'Winter 2025 cycle';

export const SOP_COPY = {
  title: 'How we work on your SOP with you',
  intro: [
    'Your Statement of Purpose is the one place in the application where you explain your record in your own words, including the semesters that went badly.',
    'It stays your statement. Your mentor helps you draft and revise it over several weeks. Nothing is submitted until you’ve approved the final version.',
  ],
  exampleTitle: 'What a revision looks like',
  exampleLabel: 'Illustrative example. The student and details are invented.',
  genericLabel: 'Generic draft',
  revisedLabel: 'Revised with a mentor',
  caseLabel: `Real case from the ${CASE_CYCLE}.`,
  caseTitle: 'Two applicants, one university',
  caseBody: [
    'Both applied to the same German technical university. Applicant B worked with us on the application, including the SOP.',
    'CGPA alone did not explain the outcomes. Each decision weighed the whole application: subject fit, documents, the SOP and the grades.',
  ],
} as const;

export const REVISION_NOTES = [
  'States the reason for the backlogs once, plainly, where the draft hid it behind "personal reasons".',
  'Links the hard semester to a specific technical interest and the final-year project, which leads into the course being applied for.',
];

/** The real Winter 2025 case. The tabs say who each applicant is, not why the decision went as it did. */
export const APPLICANTS = [
  { tab: 'Applicant A', cgpa: '7.8 CGPA', backlogs: '0 backlogs', verdict: 'REJECTED', tone: 'rejected' },
  {
    tab: 'Applicant B, mentored by Germandians',
    cgpa: '7.1 CGPA',
    backlogs: '16 backlogs',
    verdict: 'ADMITTED',
    tone: 'admitted',
  },
] as const;
