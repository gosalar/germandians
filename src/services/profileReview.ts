import { siteConfig } from '@/utils/siteConfig';

import { emailDraftUrl, openEmailDraft, postEnquiry, type SubmitResult } from './enquiry';

export interface ProfileReviewRequest {
  name: string;
  email?: string;
  whatsapp: string;
  snapshot?: string;
  /** Present, and true, only when the visitor ticked "Teach me German". */
  germanLessons?: true;
}

export function buildEmailDraft(request: ProfileReviewRequest): string {
  return [
    `Name: ${request.name}`,
    ...(request.email ? [`Email: ${request.email}`] : []),
    `WhatsApp: ${request.whatsapp}`,
    ...(request.snapshot ? [`Grade-check summary: ${request.snapshot}`] : []),
    ...(request.germanLessons ? ['German lessons: interested'] : []),
    'Consent to be contacted about this profile review: yes',
    '',
    'I would like a profile review.',
  ].join('\n');
}

export function buildEmailDraftUrl(request: ProfileReviewRequest): string {
  return emailDraftUrl('Profile review request', buildEmailDraft(request));
}

/** Sends the request to the form endpoint, or opens it as an email draft when none is configured. */
export async function submitProfileReview(request: ProfileReviewRequest): Promise<SubmitResult> {
  if (!siteConfig.formEndpoint) return openEmailDraft(buildEmailDraftUrl(request));
  return postEnquiry({ ...request });
}
