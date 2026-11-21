import { expect, test, type Page } from '@playwright/test';

import { UX_ENDPOINTS } from './endpoints';

const profileEndpoint = UX_ENDPOINTS.profileReview;
const lessonsEndpoint = UX_ENDPOINTS.germanLessons;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fill(page: Page) {
  await page.locator('#f-name').fill('Test visitor');
  await page.locator('#f-wa').fill('+91 9876543210');
  await page.locator('#f-consent').check();
}

async function fillLessons(page: Page) {
  await page.locator('#g-name').fill('Test visitor');
  await page.locator('#g-wa').fill('+91 9876543210');
  await page.locator('#g-language').fill('Test language');
  await page.locator('#g-consent').check();
}

test.describe('profile review enquiries', () => {
  test.beforeEach(async ({ page }) => {
    // Never allow test enquiries to leave the browser, even if a fixture is missing.
    await page.route(profileEndpoint, route => route.abort());
    await page.route(lessonsEndpoint, route => route.abort());
    await page.goto('/check');
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
  });

  test('sending is locked, one request includes the ticked summary, and receipt needs explicit acknowledgement', async ({ page }) => {
    let count = 0;
    let payload: Record<string, unknown> = {};
    let contentType = '';
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route(profileEndpoint, async route => {
      count++;
      payload = route.request().postDataJSON();
      contentType = route.request().headers()['content-type'] ?? '';
      await gate;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
    });
    await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
    await page.locator('#check-score').fill('7.4');
    await fill(page);
    await page.locator('#f-summary').check();
    await page.locator('#f-email').fill('visitor@example.test');
    await page.locator('#f-wa').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#contact-form')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('button', { name: 'Sending…', exact: true })).toBeDisabled();
    // While sending, the block shows what was sent and cannot be changed.
    await expect(page.locator('#f-summary')).toBeChecked();
    await expect(page.locator('#f-summary')).toBeDisabled();
    await expect(page.locator('#contact-form [role="status"]')).toContainText('Sending your enquiry');
    await page.keyboard.press('Enter');
    await page.locator('#contact-form').evaluate(form => {
      (form as HTMLFormElement).requestSubmit();
      (form as HTMLFormElement).requestSubmit();
    });
    await expect.poll(() => count).toBe(1);
    release();
    await expect(page.locator('#contact-form [role="status"]')).toContainText('Received. An admin will message you on WhatsApp.');
    expect(count).toBe(1);
    // Apps Script answers no CORS preflight, so the JSON must travel as plain text.
    expect(contentType).toBe('text/plain;charset=utf-8');
    expect(payload).toMatchObject({ name: 'Test visitor', email: 'visitor@example.test', whatsapp: '+91 9876543210', consent: true, source: 'germandians-website', snapshot: 'German grade 2.3 (7.4 / 10, pass 4)' });
    expect(String(payload.submissionId)).toMatch(UUID_PATTERN);
    expect(Number.isFinite(Date.parse(String(payload.consentAt)))).toBe(true);
    await expect(page.getByTestId('form-snapshot').getByRole('listitem')).toHaveText(['German grade 2.3 (7.4 / 10, pass 4)']);
  });

  test('an unticked summary is shown but not sent', async ({ page }) => {
    let payload: Record<string, unknown> = {};
    await page.route(profileEndpoint, async route => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
    });
    await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
    await page.locator('#check-score').fill('7.4');
    await expect(page.getByTestId('form-snapshot')).toContainText('German grade 2.3 (7.4 / 10, pass 4)');
    await fill(page);
    await expect(page.locator('#f-summary')).not.toBeChecked();
    await page.getByRole('button', { name: 'Request my profile review' }).click();
    await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
    expect(payload).toMatchObject({ name: 'Test visitor', whatsapp: '+91 9876543210', consent: true });
    expect(String(payload.submissionId)).toMatch(UUID_PATTERN);
    expect(payload).not.toHaveProperty('snapshot');
    // Nothing was attached, so after receipt no summary is shown as sent.
    await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
  });

  for (const failure of ['http', 'body', 'malformed', 'empty', 'network']) {
    test(`${failure} failure retains values and permits a successful retry with optional email omitted`, async ({ page }) => {
      const requests: Record<string, unknown>[] = [];
      await page.route(profileEndpoint, async route => {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        requests.push(body);
        expect(body).not.toHaveProperty('email');
        expect(body).not.toHaveProperty('snapshot');
        if (requests.length > 1) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
        if (failure === 'network') return route.abort();
        return route.fulfill({ status: failure === 'http' ? 503 : 200, contentType: 'application/json', body: failure === 'malformed' ? '<html>error</html>' : failure === 'empty' ? '' : '{"received":true,"errors":["rejected"]}' });
      });
      await fill(page);
      await page.getByRole('button', { name: 'Request my profile review' }).click();
      await expect(page.locator('#contact-form [role="status"]')).toContainText('We could not confirm receipt');
      await expect(page.locator('#f-name')).toHaveValue('Test visitor');
      await expect(page.locator('#f-wa')).toHaveValue('+91 9876543210');
      await expect(page.locator('#f-consent')).toBeChecked();
      await expect(page.locator('#contact-form [role="status"]')).toContainText('thegermandians@gmail.com');
      await page.getByRole('button', { name: 'Request my profile review' }).click();
      await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
      expect(requests).toHaveLength(2);
      expect(String(requests[0].submissionId)).toMatch(UUID_PATTERN);
      expect(requests[1].submissionId).toBe(requests[0].submissionId);
      expect(requests[1].consentAt).toBe(requests[0].consentAt);
    });
  }

  test('a stalled response times out, keeps the form editable and reuses the submission identity on retry', async ({ page }) => {
    const requests: Record<string, unknown>[] = [];
    const savedRows = new Map<string, Record<string, unknown>>();
    let release!: () => void;
    const stalled = new Promise<void>(resolve => { release = resolve; });
    await page.route(profileEndpoint, async route => {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      requests.push(body);
      const key = typeof body.submissionId === 'string' ? body.submissionId : `row-${requests.length}`;
      if (!savedRows.has(key)) savedRows.set(key, body);
      if (requests.length === 1) {
        await stalled;
        await route.abort().catch(() => undefined);
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
    });
    await fill(page);
    await page.getByRole('button', { name: 'Request my profile review' }).click();
    await expect(page.locator('#contact-form [role="status"]')).toContainText('within 15 seconds', { timeout: 20_000 });
    release();
    await expect(page.locator('#f-name')).toBeEnabled();
    await page.getByRole('button', { name: 'Request my profile review' }).click();
    await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
    expect(requests).toHaveLength(2);
    expect(String(requests[0].submissionId)).toMatch(UUID_PATTERN);
    expect(requests[1].submissionId).toBe(requests[0].submissionId);
    expect(requests[1].consentAt).toBe(requests[0].consentAt);
    expect(savedRows.size).toBe(1);
  });

  test('changing fields, summary attachment, summary content, German interest or starting another enquiry creates a fresh submission identity', async ({ page }) => {
    const requests: Record<string, unknown>[] = [];
    let shouldSucceed = false;
    await page.route(profileEndpoint, async route => {
      requests.push(route.request().postDataJSON() as Record<string, unknown>);
      if (!shouldSucceed) {
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{"received":false}' });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
    });

    await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
    await page.locator('#check-score').fill('7.4');
    await fill(page);

    const submit = page.getByRole('button', { name: 'Request my profile review' });
    const status = page.locator('#contact-form [role="status"]');

    // 1. Initial send (summary unticked) fails.
    await submit.click();
    await expect(status).toContainText('We could not confirm receipt');

    // 2. Ticking the summary box changes the outgoing payload -> fresh ID.
    await page.locator('#f-summary').check();
    await submit.click();
    await expect(status).toContainText('We could not confirm receipt');

    // 3. Changing the grade updates the attached summary without editing any contact field -> fresh ID.
    await page.locator('#check-score').fill('8.5');
    await submit.click();
    await expect(status).toContainText('We could not confirm receipt');

    // 4. Ticking "Teach me German" changes the outgoing payload -> fresh ID.
    await page.getByRole('checkbox', { name: 'Teach me German' }).check();
    await submit.click();
    await expect(status).toContainText('We could not confirm receipt');

    // 5. Editing a contact field after failure -> fresh ID.
    await page.locator('#f-name').fill('Updated visitor');
    await submit.click();
    await expect(status).toContainText('We could not confirm receipt');

    // 6. Retrying with the same normalised payload (trailing whitespace only) reuses the identity and succeeds.
    await page.locator('#f-name').fill('Updated visitor   ');
    shouldSucceed = true;
    await submit.click();
    await expect(status).toContainText('Received.');

    // 7. Choosing "Send another" discards the old identity even when identical details are sent again.
    await page.getByRole('button', { name: 'Send another', exact: true }).click();
    await page.locator('#f-name').fill('Updated visitor');
    await page.locator('#f-wa').fill('+91 9876543210');
    await page.locator('#f-summary').check();
    await page.getByRole('checkbox', { name: 'Teach me German' }).check();
    await page.locator('#f-consent').check();
    await submit.click();
    await expect(status).toContainText('Received.');

    expect(requests).toHaveLength(7);
    for (const req of requests) {
      expect(String(req.submissionId)).toMatch(UUID_PATTERN);
      expect(Number.isFinite(Date.parse(String(req.consentAt)))).toBe(true);
    }

    expect(requests[0]).not.toHaveProperty('snapshot');
    expect(requests[1].snapshot).toBe('German grade 2.3 (7.4 / 10, pass 4)');
    expect(requests[2].snapshot).toBe('German grade 1.7 (8.5 / 10, pass 4)');
    expect(requests[3].germanLessons).toBe(true);
    expect(requests[4].name).toBe('Updated visitor');
    expect(requests[5].name).toBe('Updated visitor');

    // Distinct identities for each payload change and after "Send another".
    expect(requests[1].submissionId).not.toBe(requests[0].submissionId);
    expect(requests[2].submissionId).not.toBe(requests[1].submissionId);
    expect(requests[3].submissionId).not.toBe(requests[2].submissionId);
    expect(requests[4].submissionId).not.toBe(requests[3].submissionId);
    // Exact same identity on normalised retry.
    expect(requests[5].submissionId).toBe(requests[4].submissionId);
    expect(requests[5].consentAt).toBe(requests[4].consentAt);
    // Fresh identity after "Send another" with identical details.
    expect(requests[6].submissionId).not.toBe(requests[5].submissionId);

    // Neither the comparison key nor submission IDs are persisted to storage or URLs.
    const stored = await page.evaluate(() => ({
      local: Object.entries(localStorage),
      session: Object.entries(sessionStorage),
      href: window.location.href,
    }));
    const serialized = JSON.stringify(stored);
    for (const req of requests) {
      expect(serialized).not.toContain(String(req.submissionId));
    }
    expect(serialized).not.toContain('Updated visitor');
  });

  test('"Teach me German" adds the interest to the review, with the lesson terms and a link to the lessons form', async ({ page }) => {
    let payload: Record<string, unknown> = {};
    await page.route(profileEndpoint, async route => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
    });
    const form = page.locator('#contact-form');
    const more = form.getByRole('link', { name: /^Know more about German lessons/ });
    await expect(more).toHaveAttribute('href', '/learn-german#german-lessons-form');
    await expect(more).toHaveAttribute('target', '_blank');
    await expect(more).toHaveAttribute('rel', 'noopener');
    await expect(form).toContainText('Additional charges may apply. We do not provide a certificate for these lessons.');
    const consent = page.locator('label[for="f-consent"]');
    await expect(consent).not.toContainText('German lessons');
    await fill(page);
    await page.getByRole('checkbox', { name: 'Teach me German' }).check();
    await expect(consent).toContainText('about my profile review and German lessons');
    await page.getByRole('button', { name: 'Request my profile review' }).click();
    await expect(form.locator('[role="status"]')).toContainText('Received.');
    expect(payload).toMatchObject({ name: 'Test visitor', whatsapp: '+91 9876543210', germanLessons: true, consent: true });
    expect(String(payload.submissionId)).toMatch(UUID_PATTERN);
    expect(payload).not.toHaveProperty('enquiry');
  });
});

test.describe('German lessons enquiries', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(profileEndpoint, route => route.abort());
    await page.route(lessonsEndpoint, route => route.abort());
    await page.goto('/learn-german');
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
  });

  test('a stalled German lessons response times out and reuses the submission identity on retry', async ({ page }) => {
    const requests: Record<string, unknown>[] = [];
    const savedRows = new Map<string, Record<string, unknown>>();
    let admissionsCalls = 0;
    let release!: () => void;
    const stalled = new Promise<void>(resolve => { release = resolve; });

    await page.route(profileEndpoint, async route => {
      admissionsCalls++;
      await route.abort();
    });
    await page.route(lessonsEndpoint, async route => {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      requests.push(body);
      const key = typeof body.submissionId === 'string' ? body.submissionId : `row-${requests.length}`;
      if (!savedRows.has(key)) savedRows.set(key, body);
      if (requests.length === 1) {
        await stalled;
        await route.abort().catch(() => undefined);
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
    });

    const form = page.locator('#german-lessons-form');
    await fillLessons(page);
    await page.locator('#g-purpose').fill('University');
    await form.getByRole('button', { name: 'Send my enquiry', exact: true }).click();
    await expect(form.getByRole('status')).toContainText('within 15 seconds', { timeout: 20_000 });
    release();
    await expect(page.locator('#g-name')).toBeEnabled();
    await form.getByRole('button', { name: 'Send my enquiry', exact: true }).click();
    await expect(form.getByRole('status')).toContainText('Received. An admin will message you on WhatsApp.');

    expect(admissionsCalls).toBe(0);
    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({
      enquiry: 'german-lessons',
      name: 'Test visitor',
      whatsapp: '+91 9876543210',
      language: 'Test language',
      purpose: 'University',
      consent: true,
      source: 'germandians-website',
    });
    expect(String(requests[0].submissionId)).toMatch(UUID_PATTERN);
    expect(requests[1].submissionId).toBe(requests[0].submissionId);
    expect(requests[1].consentAt).toBe(requests[0].consentAt);
    expect(savedRows.size).toBe(1);
  });

  test('German lessons retries reuse the identity until details change or "Send another" resets the form', async ({ page }) => {
    const requests: Record<string, unknown>[] = [];
    let shouldSucceed = false;
    await page.route(lessonsEndpoint, async route => {
      requests.push(route.request().postDataJSON() as Record<string, unknown>);
      if (!shouldSucceed) {
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{"received":false}' });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
    });

    const form = page.locator('#german-lessons-form');
    const send = form.getByRole('button', { name: 'Send my enquiry', exact: true });
    const status = form.getByRole('status');

    // 1. First send fails.
    await fillLessons(page);
    await send.click();
    await expect(status).toContainText('We could not confirm receipt.');

    // 2. Retry without changing normalised values -> same identity.
    await page.locator('#g-language').fill('  Test language  ');
    await send.click();
    await expect(status).toContainText('We could not confirm receipt.');

    // 3. Adding an optional answer changes outgoing payload -> fresh identity.
    await page.locator('#g-experience').fill('A few words');
    await send.click();
    await expect(status).toContainText('We could not confirm receipt.');

    // 4. Retry unchanged succeeds with that new identity.
    shouldSucceed = true;
    await send.click();
    await expect(status).toContainText('Received.');

    // 5. "Send another" with identical details creates a fresh identity.
    await form.getByRole('button', { name: 'Send another', exact: true }).click();
    await fillLessons(page);
    await page.locator('#g-experience').fill('A few words');
    await send.click();
    await expect(status).toContainText('Received.');

    expect(requests).toHaveLength(5);
    for (const req of requests) {
      expect(String(req.submissionId)).toMatch(UUID_PATTERN);
      expect(Number.isFinite(Date.parse(String(req.consentAt)))).toBe(true);
    }
    expect(requests[1].submissionId).toBe(requests[0].submissionId);
    expect(requests[1].consentAt).toBe(requests[0].consentAt);
    expect(requests[2].submissionId).not.toBe(requests[1].submissionId);
    expect(requests[3].submissionId).toBe(requests[2].submissionId);
    expect(requests[3].consentAt).toBe(requests[2].consentAt);
    expect(requests[4].submissionId).not.toBe(requests[3].submissionId);
  });
});
