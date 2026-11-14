import DmatNote from '@/components/DmatNote';

export const COPY = {
  kicker: 'Where we started',
  aboutLink: 'More about us',
  motto: 'By the students, for the students',
} as const;

export const PRINCIPLES = [
  {
    title: 'We start from scratch',
    color: '#1d7a3d',
    body: (
      <>
        You can come to us before you have APS or a shortlist. We start with your profile and take the steps in order from there.
        <br />
        <DmatNote />
      </>
    ),
  },
  {
    title: 'We guide from experience',
    color: '#ef8a21',
    body: 'Every mentor on our team went through APS, university applications, the blocked account, the visa and Anmeldung themselves. You get what we learned doing it, and what the questions from our community have taught us since.',
  },
];
