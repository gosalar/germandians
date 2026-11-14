import { GERMAN_LESSONS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import { emailDraftUrl, openEmailDraft, postEnquiry, type SubmitResult } from './enquiry';

/** A German lessons enquiry. Separate from the profile review: its own form, subject and endpoint type. */
export interface GermanLessonsRequest {
  name: string;
  email?: string;
  whatsapp: string;
  /** The language the visitor would like explanations in. */
  language: string;
  /** What they need German for. Omitted when blank. */
  purpose?: string;
  /** Any German they already have. Omitted when blank. */
  experience?: string;
}

export function buildGermanLessonsDraft(request: GermanLessonsRequest): string {
  return [
    `Name: ${request.name}`,
    ...(request.email ? [`Email: ${request.email}`] : []),
    `WhatsApp: ${request.whatsapp}`,
    `Language for explanations: ${request.language}`,
    ...(request.purpose ? [`What I need German for: ${request.purpose}`] : []),
    ...(request.experience ? [`German I already have: ${request.experience}`] : []),
    'Consent to be contacted about German lessons: yes',
    '',
    'I would like to ask about German lessons.',
  ].join('\n');
}

export function buildGermanLessonsDraftUrl(request: GermanLessonsRequest): string {
  return emailDraftUrl(GERMAN_LESSONS.enquiry.subject, buildGermanLessonsDraft(request));
}

/** Sends the enquiry to the form endpoint, marked as German lessons, or opens it as an email draft. */
export async function submitGermanLessons(request: GermanLessonsRequest): Promise<SubmitResult> {
  if (!siteConfig.formEndpoint) return openEmailDraft(buildGermanLessonsDraftUrl(request));
  return postEnquiry({ enquiry: 'german-lessons', ...request });
}
