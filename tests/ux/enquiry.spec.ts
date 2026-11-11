import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const endpoint = 'https://enquiries.example.test/profile';
const evidence = 'test-results/review-actions/phase-1';
async function fill(page: Page) {
  await page.locator('#f-name').fill('Test visitor');
  await page.locator('#f-wa').fill('+91 9876543210');
  await page.locator('#f-consent').check();
}
async function screenshot(page: Page, name: string) {
  await mkdir(evidence, { recursive: true });
  await page.locator('#contact-form').screenshot({ path: `${evidence}/form-${name}.png` });
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
  await screenshot(page, 'sending');
  release();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('Received. An admin will message you on WhatsApp.');
  expect(count).toBe(1);
  expect(payload).toMatchObject({ name: 'Test visitor', email: 'visitor@example.test', whatsapp: '+91 9876543210', consent: true, source: 'germandians-website', snapshot: 'German grade 2.3 (7.4 / 10, pass 4) · APS applied, awaiting certificate' });
  expect(Number.isFinite(Date.parse(String(payload.consentAt)))).toBe(true);
  await screenshot(page, 'received');
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
    if (failure === 'body') await screenshot(page, 'failure');
    await page.getByRole('button', { name: 'Request my profile review' }).click();
    await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
    expect(attempt).toBe(2);
    if (failure === 'body') await screenshot(page, 'retry-received');
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
  await screenshot(page, 'timeout');
  await page.getByRole('button', { name: 'Request my profile review' }).click();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
  expect(count).toBe(2);
});
