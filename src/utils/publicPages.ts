import { FEE_PROMISE, GERMAN_LESSONS } from './constants.ts';
import { PAGE_REGISTRY, type PageKey } from './pageRegistry.ts';

type Sharing = {
  title: string;
  description: string;
  image: string;
  imageTitle: string;
  imageSubtitle: string;
  imageAlt: string;
};

const METADATA = {
  home: {
    title: 'Germandians | Student-led guidance for studying in Germany',
    description: `Students living in Germany guide Indian students from profile evaluation to the housing search and settling in. ${FEE_PROMISE}`,
    image: 'social/home.png',
    imageTitle: 'Study in Germany',
    imageSubtitle: 'Student-led guidance',
    imageAlt: 'Germandians: student-led guidance for studying in Germany',
  },
  check: {
    title: 'German grade & programme requirements | Germandians',
    description: 'Convert your CGPA or percentage with the Modified Bavarian formula and review the programme-specific requirements still to check. A conversion is not an eligibility decision.',
    image: 'social/check.png',
    imageTitle: 'German grade check',
    imageSubtitle: 'Conversion and programme requirements',
    imageAlt: 'Germandians: German grade conversion and programme requirements check',
  },
  about: {
    title: 'About us | Germandians',
    description: 'How Germandians began, and the Indian students living in Germany who guide applicants through steps they took themselves.',
    image: 'social/about.png',
    imageTitle: 'About us',
    imageSubtitle: 'The people behind Germandians',
    imageAlt: 'Germandians: about the people behind Germandians',
  },
  community: {
    title: 'Community | Germandians',
    description: 'Where to find the Germandians community on Instagram and WhatsApp, and how it differs from our paid mentoring.',
    image: 'social/community.png',
    imageTitle: 'Community',
    imageSubtitle: 'Where Germandians began',
    imageAlt: 'Germandians: the community where Germandians began',
  },
  learnGerman: {
    title: 'Learn German | Germandians',
    description: `${GERMAN_LESSONS.offer} ${GERMAN_LESSONS.charges} ${GERMAN_LESSONS.certificate}`,
    image: 'social/learn-german.png',
    imageTitle: 'Learn German',
    imageSubtitle: 'Explanations in your own language',
    imageAlt: 'Germandians: learn German with explanations in your own language',
  },
  privacy: {
    title: 'Privacy note | Germandians',
    description: 'How Germandians uses the details you send through this website or when you contact us, and how to ask about or delete your information.',
    image: 'social/privacy.png',
    imageTitle: 'Privacy note',
    imageSubtitle: 'Your details and how we use them',
    imageAlt: 'Germandians: privacy note about your details and how we use them',
  },
} as const satisfies Record<PageKey, Sharing>;

/** Prerendering, metadata, the sitemap and social labels read this registry. */
export const PUBLIC_PAGES = PAGE_REGISTRY.map((page) => ({
  ...page,
  ...METADATA[page.key],
}));
