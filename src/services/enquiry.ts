import { CONTACT } from '@/utils/constants';

/**
 * How the site's enquiry forms send: to the form's own Google Sheet when its endpoint is configured, or
 * as a draft in the visitor's email app. The profile review and the German lessons enquiry both go
 * through here, each to its own endpoint.
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
 * Sends an enquiry to a Google Apps Script web app (scripts/google-sheets/). Contract: the script
 * answers 2xx JSON { received: true } only after it has written the row. Error bodies, empty or
 * malformed bodies and bare 2xx are failures; its raw HTTP status is not evidence that the row was
 * written. See README, "Google Sheets".
 *
 * Apps Script answers no CORS preflight, so the JSON goes as plain text, which keeps the request a
 * simple one. It answers from script.googleusercontent.com after a redirect, so redirects are followed;
 * the answer must still be the JSON acknowledgement.
 */
export async function postEnquiry(endpoint: string, fields: Record<string, unknown>): Promise<Exclude<SubmitResult, 'mailto'>> {
  if (!endpoint) return 'error';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      credentials: 'omit',
      redirect: 'follow',
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
