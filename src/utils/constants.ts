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
