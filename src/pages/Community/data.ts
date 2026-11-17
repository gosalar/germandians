import { COMMUNITY, MENTORING, NAV_CTA } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

export { CHANNELS, type ChannelTone } from '@/utils/communityChannels';

/**
 * Copy for the community page. The audience figure and its label come from `COMMUNITY`; the full origin
 * story belongs to the About page, so this page links there instead of retelling it.
 */
export const PAGE_COPY = {
  title: 'Our community',
  introduction: `${COMMUNITY.description} This page explains what the community is, where to find it and how it differs from our mentoring.`,
  audienceNote: 'An audience across our Instagram followers and WhatsApp community members.',
} as const;

export const CHANNELS_COPY = {
  title: 'Where to find the community',
} as const;

export const ORIGIN_COPY = {
  title: 'How the community shaped Germandians',
  lede: 'The community came before the consultancy.',
  /** Three bubbles, from the first questions to the mentoring that grew out of them. */
  steps: [
    {
      id: 'asked',
      mark: '?',
      title: 'You asked',
      text: 'Indian students planning to study in Germany brought us their questions.',
    },
    {
      id: 'answered',
      mark: '!',
      title: 'We answered',
      text: 'Answering them showed us what students needed help with.',
    },
    {
      id: 'mentoring',
      mark: '→',
      title: 'Mentoring grew',
      text: 'Our mentoring grew out of those questions, and they still shape how our mentors guide students.',
    },
  ],
  aboutLink: 'How Germandians began',
} as const;

const [start, perMentor, feePromise] = MENTORING.facts;

/** The community beside the paid service, with the service's limits stated next to it. The sentences are shared (`MENTORING`). */
export const MENTORING_COPY = {
  title: 'The community and our mentoring',
  communityTitle: { de: 'Die Community', en: 'The community' },
  communityPoint: 'Open conversation',
  community: MENTORING.community,
  communityStamp: { de: 'Offen', en: 'Open' },
  mentoringTitle: 'Our mentoring',
  mentoring: MENTORING.mentoring,
  facts: [start, perMentor, MENTORING.places(siteConfig.intake), feePromise],
  profileReview: NAV_CTA.label,
  gradeCheck: 'Free German grade check',
} as const;
