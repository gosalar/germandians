import { CONTACT } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

export interface ProfileReviewRequest {
  name: string;
  email?: string;
  whatsapp: string;
  snapshot?: string;
}

export type SubmitResult = 'sent' | 'error' | 'timeout' | 'mailto';
export const SUBMISSION_TIMEOUT_MS = 15_000;

export function buildEmailDraft(request: ProfileReviewRequest): string {
  return [
    `Name: ${request.name}`,
    ...(request.email ? [`Email: ${request.email}`] : []),
    `WhatsApp: ${request.whatsapp}`,
    ...(request.snapshot ? [`Grade-check summary: ${request.snapshot}`] : []),
    'Consent to be contacted about this profile review: yes',
    '',
    'I would like a profile review.',
  ].join('\n');
}

export function buildEmailDraftUrl(request: ProfileReviewRequest): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent('Profile review request')}&body=${encodeURIComponent(buildEmailDraft(request))}`;
}

/**
 * Endpoint contract: 2xx JSON { received: true }, returned only after durable
 * acceptance. Error bodies, redirects, empty bodies and bare 2xx are failures.
 * A chosen provider must implement this contract through an adapter if needed;
 * its raw HTTP status is not evidence that the request was received. See README.
 */
export async function submitProfileReview(request: ProfileReviewRequest): Promise<SubmitResult> {
  if (!siteConfig.formEndpoint) {
    try { window.location.href = buildEmailDraftUrl(request); } catch { /* The visible draft remains available. */ }
    return 'mailto';
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);
  try {
    const response = await fetch(siteConfig.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
      body: JSON.stringify({
        ...request,
        consent: true,
        consentAt: new Date().toISOString(),
        source: 'germandians-website',
      }),
    });
    if (!response.ok) return 'error';
    const body: unknown = await response.json();
    return body !== null && typeof body === 'object' && 'received' in body && body.received === true
      && !('error' in body) && !('errors' in body) ? 'sent' : 'error';
  } catch {
    return controller.signal.aborted ? 'timeout' : 'error';
  } finally {
    clearTimeout(timeout);
  }
}
