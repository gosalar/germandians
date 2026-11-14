import { expect, test, type Page } from '@playwright/test';

const endpoint = 'https://enquiries.example.test/profile';
async function fill(page: Page) {
  await page.locator('#f-name').fill('Test visitor');
  await page.locator('#f-wa').fill('+91 9876543210');
  await page.locator('#f-consent').check();
}

test.beforeEach(async ({ page }) => {
  // Never allow test enquiries to leave the browser, even if a fixture is missing.
  await page.route(endpoint, route => route.abort());
  await page.goto('/check');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
});

test('sending is locked, one request includes the summary, and receipt needs explicit acknowledgement', async ({ page }) => {
  let count = 0;
  let payload: Record<string, unknown> = {};
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(endpoint, async route => {
    count++;
    payload = route.request().postDataJSON();
    await gate;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
  });
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await page.locator('#check-score').fill('7.4');
  await page.getByRole('button', { name: 'Applied, waiting', exact: true }).click();
  await fill(page);
  await page.locator('#f-email').fill('visitor@example.test');
  await page.locator('#f-wa').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#contact-form')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('button', { name: 'Sending…', exact: true })).toBeDisabled();
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
  expect(payload).toMatchObject({ name: 'Test visitor', email: 'visitor@example.test', whatsapp: '+91 9876543210', consent: true, source: 'germandians-website', snapshot: 'German grade 2.3 (7.4 / 10, pass 4) · APS applied, awaiting certificate' });
  expect(Number.isFinite(Date.parse(String(payload.consentAt)))).toBe(true);
});

for (const failure of ['http', 'body', 'malformed', 'empty', 'network']) {
  test(`${failure} failure retains values and permits a successful retry with optional email omitted`, async ({ page }) => {
    let attempt = 0;
    await page.route(endpoint, async route => {
      attempt++;
      const body = route.request().postDataJSON();
      expect(body).not.toHaveProperty('email');
      expect(body).not.toHaveProperty('snapshot');
      if (attempt > 1) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
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
    expect(attempt).toBe(2);
  });
}

test('a stalled response times out, keeps the form editable and allows retry', async ({ page }) => {
  let count = 0;
  let release!: () => void;
  const stalled = new Promise<void>(resolve => { release = resolve; });
  await page.route(endpoint, async route => {
    count++;
    if (count === 1) { await stalled; await route.abort().catch(() => undefined); return; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
  });
  await fill(page);
  await page.getByRole('button', { name: 'Request my profile review' }).click();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('within 15 seconds', { timeout: 20_000 });
  release();
  await expect(page.locator('#f-name')).toBeEnabled();
  await page.getByRole('button', { name: 'Request my profile review' }).click();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
  expect(count).toBe(2);
});

test('"Teach me German" adds the interest to the review, with the lesson terms and a link to the lessons form', async ({ page }) => {
  let payload: Record<string, unknown> = {};
  await page.route(endpoint, async route => {
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
  expect(payload).not.toHaveProperty('enquiry');
});
