import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const evidence = 'test-results/review-actions/phase-1';

for (const path of ['/', '/check']) for (const width of [390, 1440]) {
  test(`contact destinations and visibility ${path} at ${width}`, async ({ page }, testInfo) => {
    const configured = testInfo.project.name === 'endpoint';
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    const actionBar = page.locator('a').filter({ hasText: configured ? /^WhatsApp us$/ : /^Open review form$/ });
    await expect(page.locator('#contact').getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', 'https://instagram.com/germandians');
    if (configured) {
      const links = page.locator('a[href^="https://wa.me/"]');
      expect(await links.count()).toBe(2);
      for (const link of await links.all()) {
        const url = new URL((await link.getAttribute('href'))!);
        expect(url.pathname).toBe('/4915123456789');
        expect(url.searchParams.get('text')).toBe("Hi Germandians, I'd like a profile review.");
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener');
      }
    } else {
      await expect(page.getByRole('link', { name: /WhatsApp/ })).toHaveCount(0);
      await expect(page.locator('#contact').getByRole('link', { name: /Profile review/ })).toHaveAttribute('href', '#contact-form');
    }
    if (width === 390) {
      if (path === '/') {
        await expect(actionBar).not.toBeVisible();
        await page.locator('#universities').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
      } else {
        await page.locator('#check-score').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      }
      await expect(actionBar).toBeVisible();
      await mkdir(evidence, { recursive: true });
      await page.screenshot({ path: `${evidence}/bar-${testInfo.project.name}-${path === '/' ? 'home' : 'check'}.png` });
      await page.locator('nav').getByRole('button', { name: 'Menu', exact: true }).click();
      await expect(actionBar).not.toBeVisible();
      await page.locator('nav').getByRole('button', { name: 'Close', exact: true }).click();
      if (!configured) {
        await actionBar.click();
        await expect(page.locator('#contact-form')).toBeInViewport();
      }
    }
    await page.locator('#f-name').focus();
    await page.locator('#f-name').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(actionBar).not.toBeVisible();
    await page.locator('footer').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(actionBar).not.toBeVisible();
  });
}

for (const path of ['/', '/check', '/privacy', '/not-a-real-page']) {
  test(`no console errors or hydration warnings ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(message.text());
      if (/hydrat/i.test(message.text())) errors.push(message.text());
    });
    await page.goto(path);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    expect(errors).toEqual([]);
  });
}

test('the footer and privacy note name the business only when it is configured', async ({ page }, testInfo) => {
  const operator = 'Test Operator Example, Test Street 1, 00000 Testville';
  for (const path of ['/', '/check']) {
    await page.goto(path);
    const footer = page.locator('footer');
    // The year is fixed when the site is built; the suite builds it moments before it runs.
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Germandians`);
    if (testInfo.project.name === 'endpoint') {
      await expect(footer.getByTestId('business-operator')).toHaveText(`Operated by ${operator}`);
    } else {
      await expect(footer.getByTestId('business-operator')).toHaveCount(0);
      await expect(footer).not.toContainText('Operated by');
    }
  }
  await page.goto('/privacy');
  if (testInfo.project.name === 'endpoint') {
    await expect(page.locator('main')).toContainText(`Germandians is operated by ${operator}.`);
  } else {
    await expect(page.locator('main')).not.toContainText('operated by');
  }
});

test('production privacy text follows the transport and has no placeholders', async ({ page }, testInfo) => {
  await page.goto('/privacy');
  await expect(page.locator('main')).not.toContainText(/\[|\]/);
  await expect(page.locator('main')).toContainText('any email address you choose to provide');
  await expect(page.locator('main')).toContainText('Unanswered questions are omitted');
  await expect(page.locator('main')).toContainText('Last updated 11 November 2026');
  if (testInfo.project.name === 'endpoint') {
    await expect(page.locator('main')).toContainText('Test enquiry receiver receives the form on our behalf');
    await expect(page.locator('main')).not.toContainText('The form opens an email draft');
  } else {
    await expect(page.locator('main')).toContainText('Nothing is sent until you press send in your email app');
    await expect(page.locator('main')).not.toContainText('receives the form on our behalf');
  }
});
