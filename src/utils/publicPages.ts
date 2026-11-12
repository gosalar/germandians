import { FEE_PROMISE, ROUTES } from './constants.ts';

/** Both prerendering and the sitemap use this list. Keep route modules thin. */
export const PUBLIC_PAGES = [
  {
    path: ROUTES.home,
    title: 'Germandians | Student-led guidance for studying in Germany',
    description: `Six students living in Germany guide Indian students from profile evaluation to their arrival here. ${FEE_PROMISE}`,
    image: 'social/home.png',
    imageTitle: 'Study in Germany',
    imageSubtitle: 'Student-led guidance',
    imageAlt: 'Germandians: student-led guidance for studying in Germany',
  },
  {
    path: ROUTES.check,
    title: 'German grade & programme requirements | Germandians',
    description: 'Convert your CGPA or percentage with the Modified Bavarian formula and review the programme-specific requirements still to check. A conversion is not an eligibility decision.',
    image: 'social/check.png',
    imageTitle: 'German grade check',
    imageSubtitle: 'Conversion and programme requirements',
    imageAlt: 'Germandians: German grade conversion and programme requirements check',
  },
  {
    path: ROUTES.privacy,
    title: 'Privacy note | Germandians',
    description: 'How Germandians uses the details you send through this website or when you contact us, and how to ask about or delete your information.',
    image: 'social/privacy.png',
    imageTitle: 'Privacy note',
    imageSubtitle: 'Your details and how we use them',
    imageAlt: 'Germandians: privacy note about your details and how we use them',
  },
] as const;
