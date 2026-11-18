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
    title: 'German grade check | Germandians',
    description: 'Convert your CGPA or percentage to the German grading scale with the Modified Bavarian formula. A conversion is not an eligibility decision.',
    image: 'social/check.png',
    imageTitle: 'German grade check',
    imageSubtitle: 'Convert CGPA or percentage marks',
    imageAlt: 'Germandians: convert your CGPA or percentage to a German grade',
  },
  requirements: {
    title: 'Requirements for a master’s in Germany | Germandians',
    description: 'For Indian students applying for a master’s in Germany: degree recognition, subject credits, grades, language, APS and dMAT, documents, applying, deadlines, costs and the visa, each with the official page to check.',
    image: 'social/requirements.png',
    imageTitle: 'Master’s requirements',
    imageSubtitle: 'What you need to apply in Germany',
    imageAlt: 'Germandians: what you need for a master’s in Germany',
  },
  dmat: {
    title: 'dMAT guide | Germandians',
    description: 'What the official sources say about the dMAT for Indian master’s applicants: what is in the test, registering, the test day and results, each with the page to check.',
    image: 'social/dmat.png',
    imageTitle: 'dMAT guide',
    imageSubtitle: 'The test, registering and the test day',
    imageAlt: 'Germandians: a guide to the dMAT for master’s applicants',
  },
  dmatPractice: {
    title: 'dMAT practice | Germandians',
    description: 'Practise the dMAT’s task types against the clock: a full mock, one section or untimed practice, with worked explanations. Independent practice material, not affiliated with g.a.s.t.',
    image: 'social/dmat-practice.png',
    imageTitle: 'dMAT practice',
    imageSubtitle: 'A full mock, one section or untimed practice',
    imageAlt: 'Germandians: dMAT practice with a full mock, one section or untimed practice',
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
  sopPlanner: {
    title: 'SOP planner | Germandians',
    description: 'Plan a Statement of Purpose in five parts in your own words, with word counts and a check for common stock phrases. Stored in your browser only.',
    image: 'social/sop-planner.png',
    imageTitle: 'SOP planner',
    imageSubtitle: 'Five parts in your own words',
    imageAlt: 'Germandians: plan your Statement of Purpose in five parts in your own words',
  },
} as const satisfies Record<PageKey, Sharing>;

/** Prerendering, metadata, the sitemap and social labels read this registry. */
export const PUBLIC_PAGES = PAGE_REGISTRY.map((page) => ({
  ...page,
  ...METADATA[page.key],
}));
