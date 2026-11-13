import DmatNote from '@/components/DmatNote';
import { TEAM_SIZE } from '@/utils/constants';

export const COPY = {
  kicker: 'Where we started',
  story: 'Germandians began as a page where we answered questions from Indian students who wanted to study in Germany. The consultancy grew out of what they kept asking us.',
  instagram: 'See the community on Instagram',
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
    body: `All ${TEAM_SIZE.word} of us went through APS, university applications, the blocked account, the visa and Anmeldung ourselves. You get what we learned doing it, and what the questions from our community have taught us since.`,
  },
];
