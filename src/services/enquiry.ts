import { CONTACT } from '@/utils/constants';

/**
 * How the site's enquiry forms send: to the form's own Google Sheet when its endpoint is configured, or
 * as a draft in the visitor's email app. The profile review and the German lessons enquiry both go
 * through here, each to its own endpoint.
 */
export type SubmitResult = 'sent' | 'error' | 'timeout' | 'mailto';
export const SUBMISSION_TIMEOUT_MS = 15_000;

/**
 * Identity for one logical sheet submission. Frozen on the first attempt and reused when retrying
 * the same normalised outbound fields, so the sheet records one row if an acknowledgement is lost.
 */
export interface SubmissionAttempt {
  submissionId: string;
  consentAt: string;
}

/** Pending in-memory attempt paired with the comparison key of its normalised outbound fields. */
export interface PendingSubmission {
  payloadKey: string;
  attempt: SubmissionAttempt;
}

const TRANSPORT_KEYS = new Set(['consent', 'consentAt', 'source', 'submissionId']);

function createSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Generates a fresh submission UUID and consent timestamp for a sheet request. */
export function createSubmissionAttempt(): SubmissionAttempt {
  return {
    submissionId: createSubmissionId(),
    consentAt: new Date().toISOString(),
  };
}

/**
 * Deterministic comparison key over normalised outbound fields, excluding transport metadata.
 * Kept in memory only because it holds visitor details: never store it or put it in URLs or logs.
 */
export function submissionPayloadKey(fields: Record<string, unknown>): string {
  const ordered: Record<string, unknown> = {};
  for (const key of Object.keys(fields).sort()) {
    if (TRANSPORT_KEYS.has(key)) continue;
    const value = fields[key];
    if (value !== undefined) ordered[key] = value;
  }
  return JSON.stringify(ordered);
}

/** Reuses the pending submission identity when normalised outbound fields are unchanged, else creates a new pair. */
export function resolveSubmissionAttempt(
  current: PendingSubmission | null,
  payload: Record<string, unknown>,
): PendingSubmission {
  const payloadKey = submissionPayloadKey(payload);
  if (current && current.payloadKey === payloadKey) return current;
  return { payloadKey, attempt: createSubmissionAttempt() };
}

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
export async function postEnquiry(
  endpoint: string,
  fields: Record<string, unknown>,
  attempt: SubmissionAttempt,
): Promise<Exclude<SubmitResult, 'mailto'>> {
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
        submissionId: attempt.submissionId,
        consent: true,
        consentAt: attempt.consentAt,
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
