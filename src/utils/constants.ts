import { PAGE_REGISTRY } from './pageRegistry.ts';
import { SECTIONS } from './sections.ts';

export { SECTIONS } from './sections.ts';

export const ROUTES = Object.fromEntries(PAGE_REGISTRY.map(({ key, path }) => [key, path])) as {
  readonly [Page in (typeof PAGE_REGISTRY)[number] as Page['key']]: Page['path'];
};

export const hashLink = (id: string) => `#${id}`;

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

/** The unpaid guidance that came before the paid service. Stated once, in the opening. */
export const TRACK_RECORD = {
  sentence: 'We guided up to 70 students over two years, unpaid, before the paid service began.',
} as const;

/** Who checks, approves and holds the accounts. Stated in full once, in the commitments table. */
export const APPLICANT_CONTROL = 'You check the facts, approve each submission and keep control of your own accounts, so the confirmations come to you.';

export const CONTACT = {
  email: 'thegermandians@gmail.com',
  instagramHandle: '@germandians',
  instagramUrl: 'https://instagram.com/germandians',
  whatsappGreeting: "Hi Germandians, I'd like a profile review.",
} as const;

/**
 * Stated facts: team size and intake places.
 * Derived: students per mentor is intake places divided by team size.
 * Word fields are those figures in a sentence, not separate facts.
 * `sentence` is the word at the start of a sentence; `word` is used inside one.
 */
export const TEAM_SIZE = {
  count: 6,
  word: 'six',
  sentence: 'Six',
} as const;

export const INTAKE_SEATS = 30;

export const STUDENTS_PER_MENTOR = {
  count: INTAKE_SEATS / TEAM_SIZE.count,
  word: 'five',
} as const;

export const INTAKE_SEASONS = ['Summer', 'Winter'] as const;
export type IntakeSeason = (typeof INTAKE_SEASONS)[number];

export const INTAKE_STATUSES = ['Not confirmed', 'Enquiries open', 'Waitlist only', 'Enquiries closed'] as const;
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];

type SectionId = (typeof SECTIONS)[keyof typeof SECTIONS];

/** A later menu may group destinations. Nothing renders a group yet. */
export type NavigationGroup = {
  kind: 'group';
  label: string;
  items: readonly NavigationDestination[];
};

export type NavigationDestination =
  | { kind: 'page'; page: keyof typeof ROUTES }
  | { kind: 'section'; section: SectionId }
  | { kind: 'external'; href: string; target?: '_blank'; rel?: 'noopener' }
  | { kind: 'scroll-top' }
  | NavigationGroup;

type PlacedDestination = Exclude<NavigationDestination, NavigationGroup>;

export function destinationHref(destination: PlacedDestination): string {
  switch (destination.kind) {
    case 'page':
      return ROUTES[destination.page];
    case 'section':
      return hashLink(destination.section);
    case 'external':
      return destination.href;
    case 'scroll-top':
      return hashLink(SECTIONS.top);
  }
}

export const DESTINATIONS = {
  gradeCheck: { kind: 'page', page: 'check' },
  privacy: { kind: 'page', page: 'privacy' },
  ourStory: { kind: 'section', section: SECTIONS.community },
  fees: { kind: 'section', section: SECTIONS.fees },
  journey: { kind: 'section', section: SECTIONS.journey },
  universities: { kind: 'section', section: SECTIONS.universities },
  faq: { kind: 'section', section: SECTIONS.faq },
  contact: { kind: 'section', section: SECTIONS.contact },
  profileReview: { kind: 'section', section: NAV_CTA.id },
  instagram: { kind: 'external', href: CONTACT.instagramUrl, target: '_blank' as const, rel: 'noopener' as const },
  email: { kind: 'external', href: `mailto:${CONTACT.email}`, target: undefined, rel: undefined },
  backToTop: { kind: 'scroll-top' },
} as const satisfies Record<string, PlacedDestination>;

const NAV_ITEMS = [
  { destination: DESTINATIONS.gradeCheck, label: 'Grade check' },
  { destination: DESTINATIONS.ourStory, label: 'Our story' },
  { destination: DESTINATIONS.fees, label: 'Fees' },
  { destination: DESTINATIONS.journey, label: 'Journey' },
  { destination: DESTINATIONS.universities, label: 'Public vs private' },
  { destination: DESTINATIONS.faq, label: 'FAQ' },
  { destination: DESTINATIONS.contact, label: 'Contact' },
] as const;

export const NAV_LINKS = NAV_ITEMS.map((item) => ({
  href: destinationHref(item.destination),
  label: item.label,
}));
