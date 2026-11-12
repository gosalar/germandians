export const ROUTES = {
  home: '/',
  check: '/check',
  privacy: '/privacy',
} as const;

/** In-page anchors on the home page. */
export const SECTIONS = {
  top: 'top',
  community: 'community',
  fees: 'fees',
  journey: 'journey',
  universities: 'universities',
  faq: 'faq',
  contact: 'contact',
  contactForm: 'contact-form',
  mentors: 'why',
  sop: 'sop',
} as const;

export const hashLink = (id: string) => `#${id}`;

export const NAV_LINKS = [
  { href: ROUTES.check, label: 'Grade check' },
  { href: hashLink(SECTIONS.community), label: 'Why us' },
  { href: hashLink(SECTIONS.fees), label: 'Fees' },
  { href: hashLink(SECTIONS.journey), label: 'Journey' },
  { href: hashLink(SECTIONS.universities), label: 'Public vs private' },
  { href: hashLink(SECTIONS.faq), label: 'FAQ' },
  { href: hashLink(SECTIONS.contact), label: 'Contact' },
] as const;
export const NAV_CTA = { id: SECTIONS.contactForm, label: 'Get my profile reviewed' } as const;

export const FEE_POLICY = {
  amount: '€0',
  timing: 'service fee until you’re admitted',
  qualifier: 'under the standard arrangement',
  exception: 'Any exception, including a fee before admission or for partial support, is stated in your written quote before you agree to work.',
  due: 'Under the standard arrangement, the service fee becomes due after a university admits you.',
  receiptLabel: 'Due now, as standard',
  trigger: 'As agreed in quote',
} as const;
export const FEE_PROMISE = `${FEE_POLICY.amount} ${FEE_POLICY.timing}, ${FEE_POLICY.qualifier}.`;

/** What the community figure counts: an audience. It is not students guided or applications handled. */
export const COMMUNITY = {
  size: '22,000+',
  label: 'Community audience on Instagram and WhatsApp',
} as const;

const GUIDED = { count: 'up to 70', terms: 'over two years, unpaid, before the paid service began' } as const;

/** The unpaid guidance that came before the paid service. Every mention uses these words. */
export const TRACK_RECORD = {
  value: `${GUIDED.count[0].toUpperCase()}${GUIDED.count.slice(1)}`,
  label: `Students guided ${GUIDED.terms}`,
  sentence: `We guided ${GUIDED.count} students ${GUIDED.terms}.`,
} as const;

/** Who checks, approves and holds the accounts. Stated in full once, in the commitments table. */
export const APPLICANT_CONTROL = 'You check the facts, approve each submission and keep control of your own accounts, so the confirmations come to you.';

export const CONTACT = {
  email: 'thegermandians@gmail.com',
  instagramHandle: '@germandians',
  instagramUrl: 'https://instagram.com/germandians',
  whatsappGreeting: "Hi Germandians, I'd like a profile review.",
} as const;

export const INTAKE_SEATS = 30;
export const INTAKE_SEASONS = ['Summer', 'Winter'] as const;
export type IntakeSeason = (typeof INTAKE_SEASONS)[number];

export const INTAKE_STATUSES = ['Not confirmed', 'Enquiries open', 'Waitlist only', 'Enquiries closed'] as const;
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];
