import { expect, test } from '@playwright/test';

import { UX_ENDPOINTS } from './endpoints';

const parts = [
  'Do I need it?',
  'What is in the test',
  'Registering',
  'Dates and fee',
  'On the day',
  'Results',
  'Prepare',
] as const;

test.beforeEach(async ({ page }) => {
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.goto('/dmat');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
});

test('the dMAT guide presents the official steps in order with reviewed source links', async ({ page }) => {
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(['dMAT guide']);
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    ...parts,
    'Try dMAT practice',
    'Stuck on a question, or on anything else about studying in Germany? Ask in the community.',
    'The dMAT is one step. We can help with the rest.',
    'Get your profile reviewed',
  ]);
  for (const part of parts) {
    const section = main.getByRole('region', { name: part, exact: true });
    const sources = section.getByText(/Last reviewed \d{1,2} \w+ \d{4}/);
    expect(await sources.count()).toBeGreaterThan(0);
    for (const source of await sources.all()) {
      const link = source.getByRole('link');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener');
    }
  }
});

test('the practice call to action leads to practice and the contact form has no summary', async ({ page }) => {
  const main = page.getByRole('main');
  await expect(main.locator('#contact').getByRole('checkbox', {
    name: 'Attach this summary to my enquiry',
  })).toHaveCount(0);
  await expect(main.locator('#contact form')).toBeVisible();
  // REMOVED_CLAIMS is checked on this route by the registry-driven test in trust.spec.ts.
  await expect(main).not.toContainText(/\bguaranteed\b|!/i);
  const practice = main.getByRole('region', { name: 'Try dMAT practice' }).getByRole('link', {
    name: 'Open dMAT practice',
  });
  await expect(practice).toHaveAttribute('href', '/dmat/practice');
  await practice.click();
  await expect(page).toHaveURL(/\/dmat\/practice\/?$/);
});

test('the eligibility link takes you to the APS and dMAT requirements topic', async ({ page }) => {
  const need = page.getByRole('region', { name: 'Do I need it?' });
  const link = need.getByRole('link', { name: 'Check the fields and exemptions' });
  await expect(link).toHaveAttribute('href', '/requirements#aps-dmat');
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/requirements\/?#aps-dmat$/);
  const topic = page.getByRole('article', { name: 'APS and dMAT', exact: true });
  await expect(topic.getByRole('heading', { name: 'APS and dMAT' })).toBeInViewport();
  const details = topic.locator('details');
  await details.locator('summary').click();
  await expect(details.getByRole('heading', { name: 'Who is exempt' })).toBeVisible();
});
