import { INTAKE_SEATS, NAV_CTA, STUDENTS_PER_MENTOR } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

export const HERO_COPY = {
  title: 'Study in Germany with the people already there.',
  lede: `Student mentors living in Germany. Up to ${STUDENTS_PER_MENTOR.word} students per mentor.`,
  summary: 'We guide you from profile evaluation to your housing search and settling in.',
  profileReview: NAV_CTA.label,
  gradeCheck: 'Free grade check',
  paintingAlt: 'Palette-knife painting of the German flag sweeping into the Indian tricolour',
  intakeLabel: `${siteConfig.intake} intake, ${INTAKE_SEATS} students`,
} as const;
