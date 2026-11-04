export const ROUTES = {
  home: '/',
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
} as const;

export const hashLink = (id: string) => `#${id}`;

export const CONTACT = {
  email: 'thegermandians@gmail.com',
  instagramHandle: '@germandians',
  instagramUrl: 'https://instagram.com/germandians',
  whatsappGreeting: "Hi Germandians, I'd like a profile review.",
} as const;

export const INTAKE_SEATS = 30;

export const INTAKE_STATUSES = ['Not confirmed', 'Enquiries open', 'Waitlist only', 'Enquiries closed'] as const;
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];
