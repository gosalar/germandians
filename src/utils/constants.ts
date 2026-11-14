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
  /** What the community is, without saying who is in it: the figure counts an audience, not students. */
  description: 'On Instagram and in our WhatsApp community, people ask us about studying in Germany.',
} as const;

/** How Germandians began, as the owners tell it. The home story section and the About page read it. */
export const ORIGIN_STORY = 'Germandians began as a page where we answered questions from Indian students who wanted to study in Germany. The consultancy grew out of what they kept asking us.';

/** The unpaid guidance that came before the paid service. Stated once on Home, in the opening. */
export const TRACK_RECORD = {
  sentence: 'We guided up to 70 students over two years, unpaid, before the paid service began.',
  /** The same fact as a sticker: the figure, then what it counts. */
  figure: 'Up to 70',
  short: 'students guided, unpaid, before we charged',
} as const;

/** Who checks, approves and holds the accounts. Stated in full once, in the commitments table. */
export const APPLICANT_CONTROL = 'You check the facts, approve each submission and keep control of your own accounts, so the confirmations come to you.';

/**
 * Help with housing and settling in, as the owners describe the service. Official housing facts and their
 * sources stay in applicationFacts. The home section lists this help in full; the journey, the commitments
 * table and the FAQ read these sentences rather than retyping them.
 */
export const ARRIVAL_SUPPORT = {
  availability: 'Housing depends on availability, so a room is not guaranteed.',
  settling: 'After you arrive, we take you through city registration (Anmeldung) and opening a bank account, help you find your way around and introduce you to seniors. We also guide you on finding part-time work and help you understand the rules for international students, and where to check them.',
  /** Not part of the standard service, so not on the receipt. The subject is the help, never the stay. */
  complimentary: 'Help finding a temporary stay and guidance on part-time work are complimentary.',
  quote: 'Your written quote sets out what this support covers.',
} as const;

export const CONTACT = {
  email: 'thegermandians@gmail.com',
  instagramHandle: '@germandians',
  instagramUrl: 'https://instagram.com/germandians',
  whatsappGreeting: "Hi Germandians, I'd like a profile review.",
} as const;

/**
 * German lessons, as the owners describe them: help learning German, explained in the student's native
 * language. Separate from the admissions service and its fee promise, with its own enquiry form on the
 * Learn German page. The profile-review form can only note an interest ("Teach me German") and links to
 * that form. The home intro, the page, its form and the tick box read these sentences, and each shows the
 * charge and certificate terms beside its action. The languages taught are not published until the
 * owners confirm them.
 */
export const GERMAN_LESSONS = {
  offer: 'We can help you learn German, with explanations in your native language.',
  separate: 'German lessons are separate from our admissions service.',
  languages: 'Ask us whether we can teach in your language.',
  charges: 'Additional charges may apply.',
  certificate: 'We do not provide a certificate for these lessons.',
  enquiry: {
    /** The email subject when the enquiry goes as a draft. */
    subject: 'German lessons',
  },
  /** The tick box in the profile-review form, and its link to the German lessons form. */
  interest: {
    label: 'Teach me German',
    more: 'Know more',
    moreLabel: 'Know more about German lessons (opens in a new tab)',
  },
} as const;

/**
 * Stated facts: team size and intake places.
 * Derived: students per mentor is intake places divided by team size.
 * Team size is held for that calculation only. The site publishes the cap per mentor and the intake places, not the size of the team.
 * `word` is the per-mentor figure in a sentence, not a separate fact.
 */
const TEAM_SIZE = {
  count: 6,
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

export type NavigationDestination =
  | { kind: 'page'; page: keyof typeof ROUTES }
  | { kind: 'section'; section: SectionId }
  | { kind: 'external'; href: string; target?: '_blank'; rel?: 'noopener' }
  | { kind: 'scroll-top' };

export function destinationHref(destination: NavigationDestination): string {
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
  about: { kind: 'page', page: 'about' },
  community: { kind: 'page', page: 'community' },
  learnGerman: { kind: 'page', page: 'learnGerman' },
  privacy: { kind: 'page', page: 'privacy' },
  fees: { kind: 'section', section: SECTIONS.fees },
  journey: { kind: 'section', section: SECTIONS.journey },
  faq: { kind: 'section', section: SECTIONS.faq },
  contact: { kind: 'section', section: SECTIONS.contact },
  profileReview: { kind: 'section', section: NAV_CTA.id },
  instagram: { kind: 'external', href: CONTACT.instagramUrl, target: '_blank' as const, rel: 'noopener' as const },
  email: { kind: 'external', href: `mailto:${CONTACT.email}`, target: undefined, rel: undefined },
  backToTop: { kind: 'scroll-top' },
} as const satisfies Record<string, NavigationDestination>;

/** A destination with the words that link to it. The header, the phone menu and the footer share these. */
export type NavigationLink = { destination: NavigationDestination; label: string };

/** Related links behind one disclosure button in the header, and under one label in the phone menu. */
export type NavigationGroup = { kind: 'group'; id: string; label: string; links: readonly NavigationLink[] };

export const PAGE_LINKS = {
  gradeCheck: { destination: DESTINATIONS.gradeCheck, label: 'Grade check' },
  about: { destination: DESTINATIONS.about, label: 'About us' },
  community: { destination: DESTINATIONS.community, label: 'Community' },
  learnGerman: { destination: DESTINATIONS.learnGerman, label: 'Learn German' },
  privacy: { destination: DESTINATIONS.privacy, label: 'Privacy' },
} as const satisfies Record<string, NavigationLink>;

/**
 * Header order. The row has no room for another top-level link at 1100px, the narrowest inline
 * layout, so the two pages about the people and the community share the About group.
 */
const NAV_ENTRIES: readonly (NavigationLink | NavigationGroup)[] = [
  PAGE_LINKS.gradeCheck,
  { kind: 'group', id: 'nav-about', label: 'About', links: [PAGE_LINKS.about, PAGE_LINKS.community] },
  PAGE_LINKS.learnGerman,
  { destination: DESTINATIONS.fees, label: 'Fees' },
  { destination: DESTINATIONS.journey, label: 'Journey' },
  { destination: DESTINATIONS.faq, label: 'FAQ' },
  { destination: DESTINATIONS.contact, label: 'Contact' },
];

type NavMenuLink = { kind: 'link'; href: string; label: string };
export type NavMenuEntry = NavMenuLink | { kind: 'group'; id: string; label: string; links: NavMenuLink[] };

const toMenuLink = (link: NavigationLink): NavMenuLink => ({ kind: 'link', href: destinationHref(link.destination), label: link.label });

export const NAV_MENU: readonly NavMenuEntry[] = NAV_ENTRIES.map((entry) =>
  'kind' in entry ? { kind: 'group', id: entry.id, label: entry.label, links: entry.links.map(toMenuLink) } : toMenuLink(entry),
);
