import { siteConfig } from '@/utils/siteConfig';

import {
  createSubmissionAttempt,
  emailDraftUrl,
  openEmailDraft,
  postEnquiry,
  type SubmissionAttempt,
  type SubmitResult,
} from './enquiry';

/** The pages that can offer a summary of the visitor's answers with a profile review. */
export const SUMMARY_SOURCES = ['grade-check', 'requirements'] as const;
export type SummarySource = (typeof SUMMARY_SOURCES)[number];

/** A page's summary of what the visitor entered: where it came from and one line per answer. */
export interface EnquirySummary {
  source: SummarySource;
  lines: string[];
}

/** Joins a summary's lines in the payload and the email draft. */
export const SUMMARY_SEPARATOR = ' · ';

const DRAFT_SUMMARY_LABELS: Record<SummarySource, string> = {
  'grade-check': 'Grade-check summary',
  requirements: 'Requirements summary',
};

export interface ProfileReviewRequest {
  name: string;
  email?: string;
  whatsapp: string;
  /** Present only when the visitor ticked the box to attach the page's summary. */
  summary?: EnquirySummary;
  /** Present, and true, only when the visitor ticked "Teach me German". */
  germanLessons?: true;
}

export function summaryText(summary: EnquirySummary): string {
  return summary.lines.join(SUMMARY_SEPARATOR);
}

/**
 * What the endpoint receives, in a fixed field order with optional blanks omitted. An attached
 * summary travels as `snapshot`, its lines joined, so the endpoint contract is unchanged.
 */
export function profileReviewPayload(request: ProfileReviewRequest) {
  return {
    name: request.name,
    ...(request.email ? { email: request.email } : {}),
    whatsapp: request.whatsapp,
    ...(request.summary ? { snapshot: summaryText(request.summary) } : {}),
    ...(request.germanLessons ? { germanLessons: true as const } : {}),
  };
}

export function buildEmailDraft(request: ProfileReviewRequest): string {
  return [
    `Name: ${request.name}`,
    ...(request.email ? [`Email: ${request.email}`] : []),
    `WhatsApp: ${request.whatsapp}`,
    ...(request.summary ? [`${DRAFT_SUMMARY_LABELS[request.summary.source]}: ${summaryText(request.summary)}`] : []),
    ...(request.germanLessons ? ['German lessons: interested'] : []),
    'Consent to be contacted about this profile review: yes',
    '',
    'I would like a profile review.',
  ].join('\n');
}

export function buildEmailDraftUrl(request: ProfileReviewRequest): string {
  return emailDraftUrl('Profile review request', buildEmailDraft(request));
}

/** Sends the request to the admissions sheet, or opens it as an email draft when that sheet isn't configured. */
export async function submitProfileReview(
  request: ProfileReviewRequest,
  attempt?: SubmissionAttempt,
): Promise<SubmitResult> {
  if (!siteConfig.profileReviewEndpoint) return openEmailDraft(buildEmailDraftUrl(request));
  return postEnquiry(
    siteConfig.profileReviewEndpoint,
    profileReviewPayload(request),
    attempt ?? createSubmissionAttempt(),
  );
}
