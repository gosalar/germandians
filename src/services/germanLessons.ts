import { GERMAN_LESSONS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import {
  createSubmissionAttempt,
  emailDraftUrl,
  openEmailDraft,
  postEnquiry,
  type SubmissionAttempt,
  type SubmitResult,
} from './enquiry';

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

/** What the endpoint receives, in a fixed field order with optional blanks omitted. */
export function germanLessonsPayload(request: GermanLessonsRequest) {
  return {
    enquiry: 'german-lessons' as const,
    name: request.name,
    ...(request.email ? { email: request.email } : {}),
    whatsapp: request.whatsapp,
    language: request.language,
    ...(request.purpose ? { purpose: request.purpose } : {}),
    ...(request.experience ? { experience: request.experience } : {}),
  };
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

/**
 * Sends the enquiry, marked as German lessons, to the German lessons sheet, or opens it as an email
 * draft when that sheet isn't configured. The mark lets the sheet's script turn away a profile review
 * sent to the wrong address.
 */
export async function submitGermanLessons(
  request: GermanLessonsRequest,
  attempt?: SubmissionAttempt,
): Promise<SubmitResult> {
  if (!siteConfig.germanLessonsEndpoint) return openEmailDraft(buildGermanLessonsDraftUrl(request));
  return postEnquiry(
    siteConfig.germanLessonsEndpoint,
    germanLessonsPayload(request),
    attempt ?? createSubmissionAttempt(),
  );
}
