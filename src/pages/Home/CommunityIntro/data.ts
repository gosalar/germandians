import { COMMUNITY, CONTACT } from '@/utils/constants';

/** The home lead-in to the community page. The origin story stays in the Story section above it. */
export const COMMUNITY_INTRO_COPY = {
  title: 'Our community',
  body: `${COMMUNITY.description} Their questions still shape how we guide students.`,
  pageLink: 'Explore the community',
  instagram: `Follow ${CONTACT.instagramHandle} on Instagram`,
} as const;
