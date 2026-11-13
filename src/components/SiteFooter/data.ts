import { CONTACT, DESTINATIONS } from '@/utils/constants';

export const FOOTER_COPY = {
  tagline: 'Guidance for Indian students heading to Germany, from students who are already there.',
  copyright: (year: string) => `© ${year} Germandians`,
  operatedBy: (operator: string) => `Operated by ${operator}`,
  placesOpen: (intake: string, seatsLeft: number, seats: number) =>
    `${intake}: ${seatsLeft} of ${seats} places open`,
} as const;

export const FOOTER_LINKS = [
  { destination: DESTINATIONS.instagram, label: 'Instagram' },
  { destination: DESTINATIONS.email, label: CONTACT.email },
  { destination: DESTINATIONS.gradeCheck, label: 'Grade check' },
  { destination: DESTINATIONS.privacy, label: 'Privacy' },
  { destination: DESTINATIONS.backToTop, label: 'Back to top' },
] as const;
