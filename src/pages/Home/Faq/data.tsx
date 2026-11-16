import type { ReactElement } from 'react';
import { Link } from 'react-router';

import DmatNote from '@/components/DmatNote';
import { FEES_COPY, QUOTE_TOPIC, QUOTE_TOPICS, feeCopy } from '@/pages/Home/Fees/data';
import { DMAT } from '@/utils/applicationFacts';
import { ARRIVAL_SUPPORT, FEE_POLICY, SECTIONS } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';
import { REVIEW_OUTCOME, siteConfig } from '@/utils/siteConfig';

/**
 * A string renders as one paragraph. An element renders as a block and brings its own paragraphs and
 * lists, for answers with a list or a link.
 */
type Answer = string | ReactElement;

interface Question {
  q: string;
  a: Answer;
}

interface QuestionGroup {
  title: string;
  /** Anchor on the group, for links from elsewhere on the page. */
  id?: string;
  /** Shown under the title. `link` is the text of the link to the requirements page. */
  note?: { text: string; link: string };
  questions: Question[];
}

const fee = feeCopy(siteConfig.feeAfterAdmission);

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
    id: SECTIONS.faqFees,
    questions: [
      {
        q: 'When do I get the terms in writing?',
        a: (
          <>
            <p>{fee.text}</p>
            <p>{QUOTE_TOPICS.lead}</p>
            <ul>
              {QUOTE_TOPICS.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ),
      },
      {
        q: 'When is payment due?',
        a: FEES_COPY.payment,
      },
      {
        q: 'What if I’m not admitted, or my visa is refused?',
        a: `Your written quote states what happens after ${QUOTE_TOPIC.setbacks}, and its terms for ${QUOTE_TOPIC.cancellation}. You receive it before any work starts.`,
      },
      {
        q: 'Do you help with funding?',
        a: (
          <p>
            Yes. Help with your education loan and with opening your blocked account is part of the full service.
            Your lender decides on the loan. The costs you pay to other organisations are listed, with their official
            sources, under <Link to={requirementsHref('costs')}>{REQUIREMENT_TOPIC_TITLES.costs} in the requirements guide</Link>.{' '}
            {FEES_COPY.separate}
          </p>
        ),
      },
    ],
  },
  {
    title: 'Requirements',
    note: {
      text: 'Universities decide admission, and each programme sets its own rules.',
      link: 'See what to check for each programme',
    },
    questions: [
      {
        q: 'Do I need dMAT for APS?',
        a: (
          <>
            <p>
              {DMAT.about} <DmatNote />
            </p>
            <p>
              See <Link to={requirementsHref('aps-dmat')}>{REQUIREMENT_TOPIC_TITLES['aps-dmat']} in the requirements guide</Link>.
            </p>
          </>
        ),
      },
      {
        q: 'Can I apply with backlogs?',
        a: 'That depends on the programme. Its admission rules decide how your transcript is assessed and whether it accepts a degree with exams still to clear. We check those rules against your record in the profile review.',
      },
      {
        q: 'Is a three-year bachelor’s degree enough?',
        a: (
          <p>
            That depends on the programme. Duration alone does not establish a credit total: each programme sets the
            degree and credits it requires. We compare your credits and subjects with those requirements in the profile
            review. See <Link to={requirementsHref('degree')}>{REQUIREMENT_TOPIC_TITLES.degree}</Link> and{' '}
            <Link to={requirementsHref('subject-credits')}>{REQUIREMENT_TOPIC_TITLES['subject-credits']}</Link> in the
            requirements guide.
          </p>
        ),
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
