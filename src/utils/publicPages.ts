import { FEE_PROMISE, TEAM_SIZE } from './constants.ts';
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
    description: `${TEAM_SIZE.sentence} students living in Germany guide Indian students from profile evaluation to their arrival here. ${FEE_PROMISE}`,
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
