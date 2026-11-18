import { EXTERNAL_COSTS_SEPARATE, FEE_POLICY, QUOTE_TOPIC, QUOTE_TOPICS, feeQuoteText } from '@/utils/constants';

export { QUOTE_TOPIC, QUOTE_TOPICS };

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
  /** Link to the FAQ's fee questions, where the quote terms and payment timing are answered. */
  quoteLink: 'How the quote works',
  /** Link to the costs topic on /requirements: what students pay to other organisations. */
  costsLink: 'Other costs to plan for',
  /** Read by the FAQ's "When is payment due?". */
  payment: `${FEE_POLICY.due} Your written quote states what triggers payment.`,
  /** Read by the FAQ's "Do you help with funding?", after its link to the costs topic. Never on /requirements: it names the service fee. */
  separate: EXTERNAL_COSTS_SEPARATE,
} as const;

/** Longer fee settings don't fit the receipt's value column, so the receipt points to the quote instead. */
const RECEIPT_VALUE_MAX_LENGTH = 16;

export const feeCopy = (fee: string) => ({
  receipt: fee.length > RECEIPT_VALUE_MAX_LENGTH ? 'See quote' : fee || 'Written quote',
  text: feeQuoteText(fee),
});
