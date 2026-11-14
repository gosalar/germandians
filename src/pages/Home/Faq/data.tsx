import type { ReactNode } from 'react';

import DmatNote from '@/components/DmatNote';
import { QUOTE_TOPIC } from '@/pages/Home/Fees/data';
import { ARRIVAL_SUPPORT, FEE_POLICY } from '@/utils/constants';
import { REVIEW_OUTCOME } from '@/utils/siteConfig';

interface Question {
  q: string;
  a: ReactNode;
}

interface QuestionGroup {
  title: string;
  /** Shown under the title. `checkLink` is the link text to the requirements check. */
  note?: { text: string; checkLink: string };
  questions: Question[];
}

export const FAQ_GROUPS: QuestionGroup[] = [
  {
    title: 'The service',
    questions: [
      {
        q: 'Can you guarantee admission?',
        a: `No. Universities make every admission decision themselves. Our standard payment model is ${FEE_POLICY.amount} ${FEE_POLICY.timing}. ${FEE_POLICY.exception}`,
      },
      {
        q: 'Is the service right for my degree and stage?',
        a: `Tell us your degree goal, your subject area and how far you have got, for example with APS or applications already under way. ${REVIEW_OUTCOME} If you need only part of the service, your written quote states ${QUOTE_TOPIC.partial}.`,
      },
      {
        q: 'Can I apply only to public universities?',
        a: 'Yes. Tell us in your profile review. We check your subject credits against the requirements of the public programmes you want and tell you where they match and where they fall short.',
      },
      {
        q: 'What help do you give with housing and settling in?',
        a: `Before you travel, we help you look for housing and apply, and help you find a temporary stay if no longer-term place is confirmed. ${ARRIVAL_SUPPORT.availability} ${ARRIVAL_SUPPORT.settling} ${ARRIVAL_SUPPORT.complimentary} ${ARRIVAL_SUPPORT.quote} If a step could fall later, such as a registration appointment, raise it in your profile review before you agree the quote.`,
      },
      {
        q: 'Are you connected to any university?',
        a: "No. We study at German universities, but we don't represent any of them and none of them pay us. We recommend universities only on how well they fit your profile.",
      },
    ],
  },
  {
    title: 'Fees and terms',
    questions: [
      {
        q: 'When do I get the terms in writing?',
        a: 'After your profile review and before any work starts. The written quote states the fee, what triggers payment and what your support includes. The fees section lists every point it covers.',
      },
      {
        q: 'What if I’m not admitted, or my visa is refused?',
        a: `Your written quote states what happens after ${QUOTE_TOPIC.setbacks}, and its terms for ${QUOTE_TOPIC.cancellation}. You receive it before any work starts.`,
      },
      {
        q: 'Do you help with funding?',
        a: 'Yes. Help with your education loan and with opening your blocked account is part of the full service. Your lender decides on the loan. The fees section lists the costs you pay to other organisations, with their official sources.',
      },
    ],
  },
  {
    title: 'Requirements',
    note: {
      text: 'Universities decide admission, and each programme sets its own rules.',
      checkLink: 'See what to check for each programme',
    },
    questions: [
      {
        q: 'Do I need dMAT for APS?',
        a: <DmatNote detail />,
      },
      {
        q: 'Can I apply with backlogs?',
        a: 'That depends on the programme. Its admission rules decide how your transcript is assessed and whether it accepts a degree with exams still to clear. We check those rules against your record in the profile review.',
      },
      {
        q: 'Is a three-year bachelor’s degree enough?',
        a: 'That depends on the programme. Duration alone does not establish a credit total: each programme sets the degree and credits it requires. We compare your credits and subjects with those requirements in the profile review.',
      },
      {
        q: 'Does a gap year matter?',
        a: 'That depends on the programme. We check what each programme on your list asks for in the profile review. Your SOP is where you explain your record in your own words.',
      },
      {
        q: 'Which language certificate do I need?',
        a: 'That depends on the programme and the language it is taught in. Each programme lists the certificates, scores and exemptions it accepts, and we check them for every programme on your list.',
      },
    ],
  },
];
