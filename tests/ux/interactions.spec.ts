import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
});

test('play all starts at one, pause resumes, and leaving the explorer pauses', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Journey month' });
  await page.getByRole('button', { name: 'Month 5', exact: true }).click();
  await page.getByRole('button', { name: 'Play all 7 months', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '1');
  await expect(slider).toHaveAttribute('aria-valuenow', '2', { timeout: 3000 });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const month = await slider.getAttribute('aria-valuenow');
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', month!);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeAttached();
  await slider.scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeVisible();
  await slider.focus();
  await page.keyboard.press('End');
  await page.getByRole('button', { name: 'Replay', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '1');
});

for (const width of [390, 1440]) {
  test(`invalid form focuses fields in order below the header at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const submit = page.getByRole('button', { name: 'Request my profile review' });
    await submit.click();
    await mkdir('test-results/review-actions/phase-1', { recursive: true });
    await page.locator('#contact-form').screenshot({ path: `test-results/review-actions/phase-1/form-invalid-${width}.png` });
    // A filled invalid optional email must be checked, in visual field order.
    await page.locator('#f-email').fill('invalid');
    for (const [id, value] of [['f-name', 'Priya Sharma'], ['f-email', 'priya@example.com'], ['f-wa', '+91 9876543210'], ['f-consent', '']]) {
      await submit.click();
      const input = page.locator(`#${id}`);
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      const top = (await input.boundingBox())!.y;
      const header = (await page.locator('nav').first().boundingBox())!;
      expect(top).toBeGreaterThan(header.y + header.height);
      expect(await input.getAttribute('aria-describedby')).toBeTruthy();
      if (value) await input.fill(value);
    }
  });
}

test('WhatsApp numbers may start with a prefix zero, and the consent sentence names what is collected', async ({ page }) => {
  const submit = page.getByRole('button', { name: 'Request my profile review' });
  const wa = page.locator('#f-wa');
  await expect(page.locator('label[for="f-consent"]')).toContainText(
    'my name, WhatsApp number and any email address I provide to contact me',
  );
  await page.locator('#f-name').fill('Priya Sharma');
  for (const value of ['09876543210', '0091 98765 43210', '+91 98765 43210']) {
    await wa.fill(value);
    await submit.click();
    // Consent is still unticked, so focus moves past the number when it is accepted.
    await expect(page.locator('#f-consent')).toBeFocused();
    await expect(wa).not.toHaveAttribute('aria-invalid', 'true');
  }
  for (const value of ['12345', '000000000000']) {
    await wa.fill(value);
    await submit.click();
    await expect(wa).toBeFocused();
    await expect(wa).toHaveAttribute('aria-invalid', 'true');
  }
});
