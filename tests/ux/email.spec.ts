import { expect, test } from '@playwright/test';

for (const path of ['/', '/check']) for (const width of [390, 1440]) {
  test(`email handoff is explained and leaves a complete visible draft ${path} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const posts: string[] = [];
    page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
    await page.goto(path);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    const form = page.locator('#contact-form');
    await expect(form).toContainText('Nothing is sent until you press send there');
    await expect(form).toContainText('thegermandians@gmail.com');
    await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
    await page.getByRole('button', { name: 'Open email draft', exact: true }).click();
    await expect(page.locator('#f-name')).toBeFocused();
    await page.locator('#f-name').fill('Test visitor');
    await page.getByRole('button', { name: 'Open email draft', exact: true }).click();
    await expect(page.locator('#f-wa')).toBeFocused();
    await page.locator('#f-wa').fill('+91 9876543210');
    await page.locator('#f-consent').check();
    if (path === '/check') {
      await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
      await page.locator('#check-score').fill('7.4');
      await expect(page.locator('label[for="f-consent"]')).toContainText('attached grade-check summary');
    }
    await page.getByRole('button', { name: 'Open email draft', exact: true }).click();
    await expect(form.locator('[role="status"]')).toContainText('Nothing has been sent by this page');
    await expect(form.locator('[role="status"]')).not.toContainText('Received');
    const draft = await page.locator('#email-draft').inputValue();
    expect(draft).toContain('Name: Test visitor');
    expect(draft).not.toContain('Email:');
    if (path === '/check') expect(draft).toContain('German grade 2.3 (7.4 / 10, pass 4)');
    const url = new URL((await page.getByRole('link', { name: 'Open the draft again' }).getAttribute('href'))!);
    expect(url.searchParams.get('body')).toBe(draft);
    expect(posts).toEqual([]);
  });
}
