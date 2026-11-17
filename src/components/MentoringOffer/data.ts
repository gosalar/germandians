import { MENTORING } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';
import { siteConfig } from '@/utils/siteConfig';

const [review, perMentor, fee] = MENTORING.facts;
const nextTopics = ['aps-dmat', 'documents', 'applying', 'visa-enrolment'] as const;

export const MENTORING_OFFER_COPY = {
  title: 'The dMAT is one step. We can help with the rest.',
  current: 'dMAT',
  links: nextTopics.map((id) => ({ label: REQUIREMENT_TOPIC_TITLES[id], href: requirementsHref(id) })),
  description: MENTORING.mentoring,
  facts: [review, perMentor, MENTORING.places(siteConfig.intake), fee],
} as const;
