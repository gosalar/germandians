import { COMMUNITY, CONTACT, FEE_PROMISE, INTAKE_SEATS, NAV_CTA, STUDENTS_PER_MENTOR } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

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

export const CHANNEL_TONES = ['instagram', 'whatsapp'] as const;
export type ChannelTone = (typeof CHANNEL_TONES)[number];

/** The WhatsApp community invitation, when the owners have published one (`VITE_WHATSAPP_COMMUNITY_URL`). */
const communityInvite = siteConfig.whatsappCommunityUrl;

/**
 * The places the community is. Instagram is public. The WhatsApp row offers a join link only when an
 * invitation is configured; otherwise it sends visitors to Instagram to ask about it.
 */
export const CHANNELS: readonly {
  tone: ChannelTone;
  platform: string;
  title: string;
  body: string;
  action: string;
  href: string;
  emphasis: 'primary' | 'secondary';
}[] = [
  {
    tone: 'instagram',
    platform: 'Instagram',
    title: CONTACT.instagramHandle,
    body: 'Our public page, and where the community started. Follow it to see what we post, or message us there with a question.',
    action: `Follow ${CONTACT.instagramHandle} on Instagram`,
    href: CONTACT.instagramUrl,
    emphasis: 'primary',
  },
  {
    tone: 'whatsapp',
    platform: 'WhatsApp',
    title: 'Our WhatsApp community',
    body: 'We also have a community on WhatsApp, alongside the Instagram page.',
    action: communityInvite ? 'Join the WhatsApp community' : 'Ask about the WhatsApp community on Instagram',
    href: communityInvite || CONTACT.instagramUrl,
    emphasis: 'secondary',
  },
];

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

/** The community beside the paid service, with the service's limits stated next to it. */
export const MENTORING_COPY = {
  title: 'The community and our mentoring',
  communityTitle: { de: 'Die Community', en: 'The community' },
  communityPoint: 'Open conversation',
  community: 'The community is open conversation. Following us or asking a question does not sign you up for our mentoring.',
  communityStamp: { de: 'Offen', en: 'Open' },
  mentoringTitle: 'Our mentoring',
  mentoring: 'Mentoring is a separate, paid service. A mentor checks your programme requirements, reviews your documents and works on your SOP with you.',
  facts: [
    'It starts with a profile review, then a written quote.',
    `Each mentor works with up to ${STUDENTS_PER_MENTOR.word} students at a time.`,
    `${INTAKE_SEATS} places for the ${siteConfig.intake} intake.`,
    FEE_PROMISE,
  ],
  profileReview: NAV_CTA.label,
  gradeCheck: 'Free German grade check',
} as const;
