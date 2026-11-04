export const RECEIPT_ITEMS = [
  'Profile evaluation',
  'APS application',
  'IELTS guidance',
  'University shortlist',
  'SOP, written with you',
  'Portal applications',
  'Loan and blocked account help',
  'Visa preparation',
  'Dorm, Anmeldung, bank account',
];

export const PAID_SEPARATELY = [
  'University and uni-assist application fees',
  'APS certificate fee',
  'IELTS test fee',
  'Visa fee',
  'Blocked account deposit (your own living money)',
  'Health insurance and flights',
];

export const feeCopy = (fee: string) => ({
  short: fee || 'Written quote',
  text: fee
    ? `Our service fee is ${fee}, due once a university admits you. You get the full terms in writing before any work starts.`
    : 'The fee depends on your profile and the universities you apply to. After your profile review we send you the exact amount and the terms in writing, and nothing starts until you agree to them.',
});
