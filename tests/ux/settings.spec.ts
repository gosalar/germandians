import { expect, test } from '@playwright/test';

import { toFormEndpoint, toWhatsAppNumber } from '../../src/utils/contactSettings';

test('contact settings reject implausible numbers and preserve international destinations', () => {
  for (const value of [undefined, '', 'not configured', '123456789', '01234567890', '1234567890123456']) {
    expect(toWhatsAppNumber(value)).toBe('');
  }
  expect(toWhatsAppNumber('+91 98765 43210')).toBe('919876543210');
  expect(toWhatsAppNumber('123456789012345')).toBe('123456789012345');
});

test('endpoint settings reject insecure, relative and credential-bearing destinations', () => {
  for (const value of [undefined, '', '/profile', 'http://example.test', 'javascript:alert(1)', 'https://user:secret@example.test']) {
    expect(toFormEndpoint(value)).toBe('');
  }
  expect(toFormEndpoint(' https://enquiries.example.test/profile ')).toBe('https://enquiries.example.test/profile');
});
