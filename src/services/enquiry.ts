import { CONTACT } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

/**
 * How the site's enquiry forms send: to the form endpoint when one is configured, or as a draft in the
 * visitor's email app. The profile review and the German lessons enquiry both go through here.
 */
export type SubmitResult = 'sent' | 'error' | 'timeout' | 'mailto';
export const SUBMISSION_TIMEOUT_MS = 15_000;

/** A draft to the business address. The visitor's email app sends it, or nothing is sent. */
export function emailDraftUrl(subject: string, body: string): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Opens the draft. The page sends nothing itself; the draft also stays visible on the form. */
export function openEmailDraft(url: string): 'mailto' {
  try { window.location.href = url; } catch { /* The visible draft remains available. */ }
  return 'mailto';
}

/**
 * Endpoint contract: 2xx JSON { received: true }, returned only after durable
 * acceptance. Error bodies, redirects, empty bodies and bare 2xx are failures.
 * A chosen provider must implement this contract through an adapter if needed;
 * its raw HTTP status is not evidence that the request was received. See README.
 */
export async function postEnquiry(fields: Record<string, unknown>): Promise<Exclude<SubmitResult, 'mailto'>> {
  if (!siteConfig.formEndpoint) return 'error';
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
        ...fields,
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
