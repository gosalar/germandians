import { expect, test } from '@playwright/test';

import { postEnquiry, resolveSubmissionAttempt, submissionPayloadKey } from '../../src/services/enquiry';
import { toFormEndpoint, toWhatsAppCommunityUrl, toWhatsAppNumber } from '../../src/utils/contactSettings';
import { UX_ENDPOINTS } from './endpoints';

test('contact settings reject implausible numbers and preserve international destinations', () => {
  for (const value of [undefined, '', 'not configured', '123456789', '01234567890', '1234567890123456']) {
    expect(toWhatsAppNumber(value)).toBe('');
  }
  expect(toWhatsAppNumber('+91 98765 43210')).toBe('919876543210');
  expect(toWhatsAppNumber('123456789012345')).toBe('123456789012345');
});

test('community invitations must be WhatsApp group, community or channel links', () => {
  for (const value of [undefined, '', 'not set', 'http://chat.whatsapp.com/Abc', 'https://chat.whatsapp.com/', 'https://wa.me/4915123456789',
    'https://whatsapp.com/', 'https://example.test/chat.whatsapp.com/Abc', 'https://chat.whatsapp.com.example.test/Abc']) {
    expect(toWhatsAppCommunityUrl(value)).toBe('');
  }
  expect(toWhatsAppCommunityUrl(' https://chat.whatsapp.com/Abc123 ')).toBe('https://chat.whatsapp.com/Abc123');
  expect(toWhatsAppCommunityUrl('https://www.whatsapp.com/channel/0029Abc')).toBe('https://www.whatsapp.com/channel/0029Abc');
});

test('enquiry endpoints must be deployed Apps Script web apps', () => {
  for (const value of [undefined, '', '/profile', 'http://example.test', 'javascript:alert(1)', 'https://enquiries.example.test/profile',
    // Plain HTTP, the editor's test URL, a query, credentials, a look-alike host, and the spreadsheet's own address.
    'http://script.google.com/macros/s/AKfycbTest/exec', 'https://script.google.com/macros/s/AKfycbTest/dev',
    'https://script.google.com/macros/s/AKfycbTest/exec?x=1', 'https://user:secret@script.google.com/macros/s/AKfycbTest/exec',
    'https://script.google.com.example.test/macros/s/AKfycbTest/exec', 'https://docs.google.com/spreadsheets/d/AKfycbTest/edit']) {
    expect(toFormEndpoint(value)).toBe('');
  }
  expect(toFormEndpoint(' https://script.google.com/macros/s/AKfycb-Test_1/exec ')).toBe('https://script.google.com/macros/s/AKfycb-Test_1/exec');
  // A Google Workspace account's web app.
  expect(toFormEndpoint('https://script.google.com/a/macros/example.com/s/AKfycbTest/exec')).toBe('https://script.google.com/a/macros/example.com/s/AKfycbTest/exec');
});

// Apps Script answers no CORS preflight, and answers through a redirect to script.googleusercontent.com.
// The browser can't stage that redirect here (Playwright doesn't intercept the request a fulfilled
// redirect leads to), so the request is checked with a stand-in fetch.
test('enquiries go to Apps Script as plain text and follow its redirect to the acknowledgement', async () => {
  const original = globalThis.fetch;
  const requests: { url: string; init: RequestInit }[] = [];
  const attempt = {
    submissionId: '123e4567-e89b-42d3-a456-426614174000',
    consentAt: '2026-11-20T12:00:00.000Z',
  };
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init: init ?? {} });
    return Response.json({ received: true });
  }) as typeof fetch;
  try {
    expect(await postEnquiry(UX_ENDPOINTS.profileReview, { name: 'Test visitor' }, attempt)).toBe('sent');
  } finally {
    globalThis.fetch = original;
  }
  expect(requests).toHaveLength(1);
  const [{ url, init }] = requests;
  expect(url).toBe(UX_ENDPOINTS.profileReview);
  expect(init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, credentials: 'omit', redirect: 'follow' });
  expect(JSON.parse(String(init.body))).toEqual({
    name: 'Test visitor',
    submissionId: attempt.submissionId,
    consent: true,
    consentAt: attempt.consentAt,
    source: 'germandians-website',
  });
});

test('submission identity reuses one UUID and timestamp for matching normalised payloads and rotates on change', () => {
  const firstKey = submissionPayloadKey({ whatsapp: '+91 9876543210', name: 'Test visitor', email: undefined });
  const sameKey = submissionPayloadKey({
    name: 'Test visitor',
    whatsapp: '+91 9876543210',
    consent: true,
    consentAt: '2026-11-20T12:00:00.000Z',
    source: 'germandians-website',
    submissionId: '123e4567-e89b-42d3-a456-426614174000',
  });
  expect(sameKey).toBe(firstKey);

  const first = resolveSubmissionAttempt(null, { name: 'Test visitor', whatsapp: '+91 9876543210' });
  const retry = resolveSubmissionAttempt(first, { whatsapp: '+91 9876543210', name: 'Test visitor' });
  expect(retry).toBe(first);

  const changed = resolveSubmissionAttempt(first, { name: 'Test visitor', whatsapp: '+91 9876543210', germanLessons: true });
  expect(changed.attempt.submissionId).not.toBe(first.attempt.submissionId);
});
