import { CONTACT } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

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
