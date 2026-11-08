import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
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

test('grade check truncates Bavarian grades accurately, adapts selling by band, and attaches band snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/check');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const scoreInput = page.locator('#check-score');
  const maxInput = page.locator('#check-max');
  const minInput = page.locator('#check-min');
  const errorBox = page.locator('#check-input-error');
  const liveRegion = page.getByTestId('check-live-region');
  const gradeValue = page.getByTestId('german-grade-value');
  const headline = page.getByTestId('band-headline');
  const cta = page.getByTestId('band-cta');
  const snapshot = page.getByTestId('form-snapshot');
  const tier1Badge = page.getByTestId('tier-1').locator('[data-tone]');
  const tier2Badge = page.getByTestId('tier-2').locator('[data-tone]');
  const tier3Badge = page.getByTestId('tier-3').locator('[data-tone]');

  // Default state: 7.4 / 10, pass 4 -> 2.3 (Mid band in snapshot, no "band" text outside snapshot)
  await expect(gradeValue).toHaveText('2.3');
  await expect(snapshot).toContainText('Band: Mid · German grade 2.3 (7.4 / 10, pass 4) · 0 backlogs · 4-year (240 ECTS) · No APS yet');

  // Error element exists in the page before any error, empty, and aria-describedby is not set yet
  await expect(errorBox).toBeAttached();
  await expect(errorBox).toHaveText('');
  await expect(minInput).not.toHaveAttribute('aria-describedby');

  // Live region contains only the grade, classification, and band headline (not formula or rounding note)
  await expect(liveRegion).not.toContainText('Modified Bavarian formula:');
  await expect(liveRegion).not.toContainText('Universities may round');

  // At 1440x900, the grade is visible while the backlogs buttons are centred on screen
  await page.getByRole('group', { name: 'Backlogs' }).evaluate((el) =>
    el.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  const gradeBox = (await gradeValue.boundingBox())!;
  const headerBox = (await page.locator('nav').first().boundingBox())!;
  expect(gradeBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  expect(gradeBox.y + gradeBox.height).toBeLessThanOrEqual(900);

  // 4.1 Truncation table verification
  const gradeCases: [string, string, string, string][] = [
    ['7.4', '10', '4', '2.3'],
    ['7.4', '10', '5', '2.5'],
    ['7.1', '10', '4', '2.4'],
    ['8.0', '10', '5', '2.2'],
    ['72', '100', '40', '2.4'],
    ['10', '10', '4', '1.0'],
    ['4', '10', '4', '4.0'],
  ];

  for (const [score, max, min, expected] of gradeCases) {
    await maxInput.fill(max);
    await minInput.fill(min);
    await scoreInput.fill(score);
    await expect(gradeValue).toHaveText(expected);
  }

  // 5.2 & 5.3 Five bands: headline, button label, tier badges, and snapshot band
  await maxInput.fill('10');
  await minInput.fill('4');

  // 1. Top band (9.2 -> 1.4)
  await scoreInput.fill('9.2');
  await expect(gradeValue).toHaveText('1.4');
  await expect(headline).toContainText('most competitive public programmes within reach');
  await expect(cta).toHaveText('Plan my shortlist for top programmes');
  await expect(tier1Badge).toHaveText('Competitive');
  await expect(tier2Badge).toHaveText('Strong fit');
  await expect(tier3Badge).toHaveText('Strong fit');
  await expect(snapshot).toContainText('Band: Top · German grade 1.4');

  // 2. Strong band (8.8 -> 1.6), plus verify 6+ backlogs do NOT lower the band
  await scoreInput.fill('8,8');
  await expect(gradeValue).toHaveText('1.6');
  await page.getByRole('button', { name: '6+ backlogs', exact: true }).click();
  await expect(headline).toContainText('keeps Tier 1 programmes realistic');
  await expect(cta).toHaveText('Build my shortlist');
  await expect(tier1Badge).toHaveText('Realistic reach');
  await expect(tier2Badge).toHaveText('Strong fit');
  await expect(tier3Badge).toHaveText('Strong fit');
  await expect(snapshot).toContainText('Band: Strong · German grade 1.6 (8.8 / 10, pass 4) · 6+ backlogs');
  await expect(page.locator('main')).toContainText('your 1.6 grade still carries you');

  // 3. Mid band (7.4 -> 2.3)
  await scoreInput.fill('7.4');
  await expect(gradeValue).toHaveText('2.3');
  await expect(headline).toContainText('realistic for aptitude-scored and non-NC public universities');
  await expect(cta).toHaveText('See where my profile gets in');
  await expect(tier1Badge).toHaveText('Selective');
  await expect(tier2Badge).toHaveText('Primary target');
  await expect(tier3Badge).toHaveText('Strong fit');
  await expect(snapshot).toContainText('Band: Mid · German grade 2.3');

  // 4. Low band (6.4 -> 2.8)
  await scoreInput.fill('6.4');
  await expect(gradeValue).toHaveText('2.8');
  await expect(headline).toContainText('Strict 2.5 cut-offs are out');
  await expect(cta).toHaveText('Find the public programmes that accept me');
  await expect(tier1Badge).toHaveText('Low odds');
  await expect(tier2Badge).toHaveText('Selective');
  await expect(tier3Badge).toHaveText('Primary target');
  await expect(snapshot).toContainText('Band: Low · German grade 2.8');

  // 5. Very low band (5.0 -> 3.5) — offers only the public route, no "accredited options", and no visible "band" text outside snapshot
  await scoreInput.fill('5.0');
  await expect(gradeValue).toHaveText('3.5');
  await expect(headline).toContainText('route is narrower but real');
  await expect(cta).toHaveText('Check if my route is realistic');
  await expect(tier1Badge).toHaveText('Not a fit this intake');
  await expect(tier2Badge).toHaveText('Low odds');
  await expect(tier3Badge).toHaveText('Check subject credits');
  await expect(snapshot).toContainText('Band: Very low · German grade 3.5');
  await expect(page.locator('main')).not.toContainText('accredited options');

  const textOutsideSnapshot = await page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelector('[data-testid="form-snapshot"]')?.remove();
    return clone.innerText;
  });
  expect(textOutsideSnapshot).not.toMatch(/\bband\b/i);

  // 4.3 Invalid input accessibility: polite status error + aria-invalid / aria-describedby only while invalid
  await minInput.fill('0');
  await expect(gradeValue).toHaveText('—');
  await expect(cta).toHaveCount(0);
  await expect(minInput).toHaveAttribute('aria-invalid', 'true');
  await expect(minInput).toHaveAttribute('aria-describedby', 'check-input-error');
  await expect(errorBox).toHaveAttribute('role', 'status');
  await expect(errorBox).toContainText('Minimum passing score must be greater than 0');

  // Header brand link on /check returns to the home page
  await page.locator('nav').getByRole('link', { name: 'Germandians' }).click();
  await expect(page).toHaveURL(/\/(#top)?$/);
});
