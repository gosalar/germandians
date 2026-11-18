import {
  ADMISSION_DECISION,
  APPLICANT_CONTROL,
  EXTERNAL_COSTS_GUIDE_LEAD,
  EXTERNAL_COSTS_SEPARATE,
  FEE_POLICY,
  FEE_PROMISE,
  MENTORING,
  MENTOR_INTRO,
  NAV_CTA,
  QUOTE_TOPICS,
  ROUTES,
  SETBACKS_POLICY,
  SOP_INTRO,
  feeQuoteText,
} from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';
import { siteConfig } from '@/utils/siteConfig';

export interface AdviserQuestion {
  readonly id: string;
  readonly number: string;
  readonly question: string;
  /** Plain checks a student or parent can use when speaking to any admissions adviser. */
  readonly checks: readonly string[];
  /** Germandians' own answer, composed strictly from shared constants. */
  readonly answer: {
    readonly paragraphs: readonly string[];
    readonly list?: {
      readonly lead: string;
      readonly items: readonly string[];
    };
    readonly linkedParagraph?: {
      readonly before: string;
      readonly linkLabel: string;
      readonly linkHref: string;
      readonly after: string;
    };
  };
}

export const PAGE_COPY = {
  title: 'Before you pay anyone',
  introduction:
    'Six questions you can ask any admissions adviser before you agree to work or pay a fee, with what to check in the reply and how Germandians answers each one.',
  jumpNavLabel: 'The six questions',
  printAction: 'Print these questions',
  checkHeading: 'What to ask and check',
  answerHeading: 'How Germandians answers',
} as const;

export const QUESTIONS: readonly AdviserQuestion[] = [
  {
    id: 'written-terms',
    number: '01',
    question: 'Are the terms in writing before I pay?',
    checks: [
      'Ask for the full scope, fee and payment stages in writing before you transfer money or hand over documents.',
      'Check what counts as an admission offer, how many applications are included, and whether taxes or currency charges apply.',
      'Keep a dated copy of the written quote so both sides can refer to the same document later.',
    ],
    answer: {
      paragraphs: [
        FEE_PROMISE,
        feeQuoteText(siteConfig.feeAfterAdmission),
        FEE_POLICY.exception,
      ],
      list: QUOTE_TOPICS,
    },
  },
  {
    id: 'who-advises-me',
    number: '02',
    question: 'Who exactly advises me, and how many students do they have?',
    checks: [
      'Ask who works on your shortlist, documents and applications week to week after you sign up, not only who speaks to you on an introductory call.',
      'Ask how many active students each adviser supports at one time, and whether total places for your target intake are capped.',
      'Check whether your adviser has direct experience with German university admissions rules and portals.',
    ],
    answer: {
      paragraphs: [
        MENTOR_INTRO,
        MENTORING.places(siteConfig.intake),
      ],
    },
  },
  {
    id: 'not-admitted-or-visa-refused',
    number: '03',
    question: "What happens if I'm not admitted, or my visa is refused?",
    checks: [
      'Ask what happens in each separate case: no admission offer across your agreed shortlist, a conditional offer you cannot take up, a visa refusal after admission, or a funding delay.',
      'Ask what happens if you decide to cancel early or defer to a later semester.',
      'Check that every one of those cases is written into your quote before work starts.',
    ],
    answer: {
      paragraphs: [
        ADMISSION_DECISION,
        FEE_POLICY.due,
        FEE_POLICY.exception,
        SETBACKS_POLICY,
      ],
    },
  },
  {
    id: 'portal-logins',
    number: '04',
    question: 'Do I keep my own portal logins?',
    checks: [
      'Ask whose email address is used to create accounts on document-check, application and university portals.',
      'Check that you hold every password yourself so university messages, document requests and offer letters reach you directly.',
      'Confirm that nothing is uploaded or sent in your name until you have checked the entries and approved the submission.',
    ],
    answer: {
      paragraphs: [APPLICANT_CONTROL],
    },
  },
  {
    id: 'sop-ownership',
    number: '05',
    question: 'Is my SOP my own?',
    checks: [
      'Ask how your Statement of Purpose (SOP) is put together: whether you draft it from your own coursework, projects and reasons for applying, with feedback on clarity and structure.',
      'Check that the statement is written in your own words, from your own record, and that nobody adds claims you did not make.',
      'Confirm that you read and sign off the final version for every programme before it is submitted.',
    ],
    answer: {
      paragraphs: SOP_INTRO,
    },
  },
  {
    id: 'external-costs',
    number: '06',
    question: 'Which costs go to other organisations?',
    checks: [
      'Ask for a clear separation between the adviser’s own service fee and fees you pay to outside organisations for document checks, tests, application portals, semester contributions, tuition, visas and health insurance.',
      'Keep the living funds needed for your student visa separate in your budget and check the accepted evidence on the official visa checklist.',
      'Before paying any official fee, check the current amount and refund rules directly on that organisation’s website.',
    ],
    answer: {
      paragraphs: [],
      linkedParagraph: {
        before: EXTERNAL_COSTS_GUIDE_LEAD,
        linkLabel: `${REQUIREMENT_TOPIC_TITLES.costs} in the requirements guide`,
        linkHref: requirementsHref('costs'),
        after: EXTERNAL_COSTS_SEPARATE,
      },
    },
  },
];

export const NEXT_COPY = {
  title: 'Check the official rules first, or ask for a written quote',
  body: `${MENTORING.community} ${MENTORING.facts[0]}`,
  profileReview: NAV_CTA.label,
  requirements: 'Read the requirements guide',
  requirementsHref: ROUTES.requirements,
} as const;
