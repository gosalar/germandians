import { FEE_POLICY } from '@/utils/constants';

export const RECEIPT_ITEMS = [
  'Profile evaluation',
  'APS application',
  'IELTS guidance',
  'University shortlist',
  'SOP drafting and review',
  'Applications, approved by you',
  'Loan and blocked account help',
  'Visa preparation',
  'Housing help',
  'Anmeldung and bank account',
];

export const FEES_COPY = {
  intro: `${FEE_POLICY.exception} The receipt lists the full service; your quote confirms what yours includes.`,
  quoteTitle: 'Agreeing your quote',
  paymentTitle: 'When payment is due',
  payment: `${FEE_POLICY.due} Your written quote states what triggers payment.`,
  separateTitle: 'Paid separately, to other organisations',
  separate: 'These costs are separate from the Germandians service fee. They are planning figures, not a quote. Check the current charge and refund terms with each provider.',
} as const;

/** Quote topics the FAQ also refers to, so both name them the same way. */
export const QUOTE_TOPIC = {
  partial: 'what partial support includes',
  cancellation: 'cancellation and deferral',
  setbacks: 'an unsuccessful intake, a visa refusal or a funding failure',
} as const;

/** What the written quote settles before work starts. The site names the topics; the quote answers them. */
export const QUOTE_TOPICS = {
  lead: 'Before work starts, your written quote states:',
  items: [
    'what changes the price',
    'what counts as admission, including conditional, private and backup offers, and whether only your approved shortlist counts',
    'whether there is one fee or a fee per admission',
    'how many applications are covered',
    QUOTE_TOPIC.partial,
    QUOTE_TOPIC.cancellation,
    QUOTE_TOPIC.setbacks,
    'the payment currency and taxes',
  ],
} as const;

/** Longer fee settings don't fit the receipt's value column, so the receipt points to the quote instead. */
const RECEIPT_VALUE_MAX_LENGTH = 16;

export const feeCopy = (fee: string) => ({
  receipt: fee.length > RECEIPT_VALUE_MAX_LENGTH ? 'See quote' : fee || 'Written quote',
  text: `${fee ? `Our service fee is ${fee}. ` : 'The fee depends on your profile and the universities you apply to. '}After your profile review, you receive the amount, scope and terms in writing. Work starts only after you agree.`,
});
