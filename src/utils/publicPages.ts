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
  budget: {
    title: 'Study budget planner | Germandians',
    description: 'Plan your own monthly living costs and one-off study expenses in euros and convert them to rupees at an exchange rate you enter, alongside official visa and application figures.',
    image: 'social/budget.png',
    imageTitle: 'Budget planner',
    imageSubtitle: 'Your own living and one-off study costs',
    imageAlt: 'Germandians: plan your monthly living and one-off study costs in Germany',
  },
  sopPlanner: {
    title: 'SOP planner | Germandians',
    description: 'Plan a Statement of Purpose in five parts in your own words, with word counts and a check for common stock phrases. Stored in your browser only.',
    image: 'social/sop-planner.png',
    imageTitle: 'SOP planner',
    imageSubtitle: 'Five parts in your own words',
    imageAlt: 'Germandians: plan your Statement of Purpose in five parts in your own words',
  },
  germanWords: {
    title: 'German words | Germandians',
    description: 'Everyday study, paperwork, housing, money and daily-life German words for students in Germany, with articles, plurals, examples and links to the requirements guide.',
    image: 'social/german-words.png',
    imageTitle: 'German words',
    imageSubtitle: 'Study, paperwork and daily-life German',
    imageAlt: 'Germandians: glossary of everyday study, paperwork and daily-life German',
  },
  applicationPlan: {
    title: 'Application plan | Germandians',
    description: 'Track your German master’s programmes, their application routes, the dates published on each programme’s page, and your document checklists in your browser.',
    image: 'social/application-plan.png',
    imageTitle: 'Application plan',
    imageSubtitle: 'Your programmes, routes, dates and documents',
    imageAlt: 'Germandians: application plan for tracking your programmes, routes, dates and documents',
  },
  creditMatch: {
    title: 'Credit matching (Modulabgleich) | Germandians',
    description: 'List a programme’s required subject areas and credits, map the courses and credits on your transcript, and export or print your own Modulabgleich worksheet. The programme assesses your credits.',
    image: 'social/credit-match.png',
    imageTitle: 'Credit matching',
    imageSubtitle: 'Map your courses to required subject areas',
    imageAlt: 'Germandians: map your completed courses to a programme’s required subject areas',
  },
  arrival: {
    title: 'Arrival checklist | Germandians',
    description: 'Interactive arrival checklist for Indian master’s students settling in Germany: landlord confirmation, city registration, tax ID, enrolment, bank accounts, campus setup, broadcasting fee, residence permit and student work rules, each with official sources.',
    image: 'social/arrival.png',
    imageTitle: 'Arrival checklist',
    imageSubtitle: 'Steps after you land in Germany',
    imageAlt: 'Germandians: arrival checklist for steps after you land in Germany',
  },
  parents: {
    title: 'For parents | Germandians',
    description: 'Plain answers for parents on public university and visa costs in Germany, how a blocked account works, what Germandians helps with, when our service fee is due, and how student details are handled.',
    image: 'social/parents.png',
    imageTitle: 'For parents',
    imageSubtitle: 'Costs, the blocked account and how our mentoring works',
    imageAlt: 'Germandians: plain guide for parents on study costs, the blocked account and mentoring',
  },
  choosingHelp: {
    title: 'Before you pay anyone | Germandians',
    description: 'Six questions to ask any admissions adviser before paying for help with German university applications, with what to check and how Germandians answers each one.',
    image: 'social/choosing-help.png',
    imageTitle: 'Before you pay anyone',
    imageSubtitle: 'Six questions to ask an admissions adviser',
    imageAlt: 'Germandians: six questions to ask any admissions adviser before paying',
  },
} as const satisfies Record<PageKey, Sharing>;

/** Prerendering, metadata, the sitemap and social labels read this registry. */
export const PUBLIC_PAGES = PAGE_REGISTRY.map((page) => ({
  ...page,
  ...METADATA[page.key],
}));
