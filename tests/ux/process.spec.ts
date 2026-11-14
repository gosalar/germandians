import { expect, test } from '@playwright/test';

test.describe('touch source links', () => {
  test.use({ hasTouch: true });
  test('official source links have a 44px touch target', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const source = page.locator('#story a[href="https://aps-india.de/dmat/"]');
    expect((await source.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
});

test('fee conditions and intake readiness agree across pages and metadata', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /standard arrangement/);
  await expect(page.locator('#top')).toContainText('standard arrangement');
  await expect(page.locator('#fees')).toContainText('Any exception');
  await expect(page.locator('#fees')).toContainText('conditional, private and backup offers');
  await expect(page.locator('#fees')).toContainText('visa refusal');
  await expect(page.locator('#top')).toContainText('visa lead time');
  await expect(page.locator('#why').getByText('2,000+', { exact: true })).toHaveCount(0);
  await expect(page.locator('#top')).toContainText('Winter 2027/28');
  await expect(page.locator('#fees')).toContainText('Test quote');
  // The receipt lists the service; the readiness sentence is stated once, beside the intake in the opening.
  await expect(page.locator('#fees').getByText('Included', { exact: true })).toHaveCount(10);
  await expect(page.locator('#fees')).toContainText('Due now, as standard');
  await expect(page.getByText('visa lead time')).toHaveCount(1);
  await expect(page.locator('#top')).toContainText('Your profile review tells you whether the service fits your degree goal and stage, and which intake you can target.');
  for (const id of ['#story', '#community', '#fees', '#why']) await expect(page.locator(id)).not.toContainText('Your profile review tells you whether');
  await page.goto('/check');
  await expect(page.locator('main')).toContainText('standard arrangement');
  await expect(page.locator('main')).toContainText('visa lead time');
});

test('dMAT guidance distinguishes affected degrees, other fields and completed APS', async ({ page }) => {
  await page.goto('/check');
  const guidance = page.getByTestId('dmat-guidance');
  // Undecided: the one-line rule and its source, without dates or the fee.
  await expect(guidance).toContainText('Check whether dMAT applies');
  await expect(guidance).toContainText('exemptions apply');
  await expect(guidance).not.toContainText('16 January 2027');
  // Affected: the full rule. The fields are listed once, beside the question.
  await page.getByRole('group', { name: 'dMAT degree field' }).getByRole('button', { name: 'Affected field' }).click();
  await expect(guidance).toContainText('may need dMAT');
  await expect(guidance).toContainText('officially confirmed exchange, double-degree or university partnership programmes');
  await expect(guidance).toContainText('29 June 2026');
  await expect(guidance).toContainText('before the dMAT certificate');
  await expect(guidance).toContainText('16 January 2027');
  await expect(guidance).toContainText('€150');
  await expect(guidance).not.toContainText('Affected degree fields');
  // A completed APS procedure or a degree outside the fields: no test dates and no fee.
  await page.getByRole('button', { name: 'Have APS', exact: true }).click();
  await expect(guidance).toContainText('does not require dMAT');
  await expect(guidance).not.toContainText('may need dMAT');
  await expect(guidance).not.toContainText('€150');
  await page.getByRole('button', { name: 'Have APS', exact: true }).click();
  await page.getByRole('group', { name: 'dMAT degree field' }).getByRole('button', { name: 'Outside these fields' }).click();
  await expect(guidance).toContainText('outside the affected fields');
  await expect(guidance).not.toContainText('16 January 2027');
  await expect(guidance).not.toContainText('€150');
  await expect(guidance.getByRole('link', { name: 'APS India: dMAT rules' })).toBeVisible();
  await expect(page.getByTestId('form-snapshot')).toContainText('Outside these fields');
  await page.getByRole('group', { name: 'dMAT degree field' }).getByRole('button', { name: 'Outside these fields' }).click();
  await expect(guidance).toContainText('Check whether dMAT applies');
});

test('dMAT dates and sourced costs are visible with review dates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Do I need dMAT for APS?' }).click();
  const faq = page.locator('#faq');
  await expect(faq).toContainText('16 January 2027');
  await expect(faq).toContainText('13 March 2027');
  await expect(faq).toContainText('€150');
  await expect(faq).toContainText('officially confirmed exchange, double-degree or university partnership programmes');
  await expect(faq).toContainText('Last reviewed 12 November 2026');
  for (const label of ['Affected degree fields:', 'Who is exempt:', 'Earlier APS applications:', 'dMAT and APS:', 'Test dates:', 'Test fee:']) {
    await expect(faq).toContainText(label);
  }
  const fees = page.locator('#fees');
  for (const name of ['Provider charges', 'Semester contributions', 'Tuition', 'Blocked-account deposit']) {
    await expect(fees).toContainText(name);
  }
  // Figures as the official pages state them.
  await expect(fees).toContainText('rising to €4,600 or €6,800 from winter semester 2027/28');
  await expect(fees).toContainText('in force since 1 September 2024');
  await expect(fees).not.toContainText('exemptions may apply');
  // Tuition for public and private programmes stays in the costs, with its source.
  await expect(fees).toContainText('non-EU');
  await expect(fees).toContainText('Private universities charge programme-specific tuition');
  await expect(fees).toContainText('Last reviewed');
});

for (const width of [390, 768, 1440]) {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    test(`overlapping journey preserves pointer and keyboard controls at ${width}, ${reducedMotion}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion });
      await page.goto('/');
      const journey = page.locator('#journey');
      await expect(journey).toContainText('one example');
      await expect(journey).toContainText('Programme research');
      await expect(journey).toContainText('Waiting on');
      // The stages say what the mentors do, and nothing is phrased as a disclaimer.
      await expect(journey).toContainText('We shortlist universities with you');
      await expect(journey).toContainText('You approve every submission.');
      await expect(journey).toContainText('Official sources for these stages');
      for (let month = 1; month <= 7; month++) {
        await page.getByRole('button', { name: `Month ${month}`, exact: true }).click();
        await expect(page.getByRole('slider', { name: 'Journey month' })).toHaveAttribute('aria-valuenow', String(month));
        await expect(journey.getByTestId('month-tasks')).toContainText('What we work on');
        await expect(journey.getByTestId('month-tasks')).not.toContainText(/does not promise|do not assume|not fixed to/);
      }
      const slider = page.getByRole('slider', { name: 'Journey month' });
      await slider.scrollIntoViewIfNeeded();
      const track = (await slider.boundingBox())!;
      await page.mouse.move(track.x + track.width / 14, track.y + track.height / 2);
      await page.mouse.down();
      for (let month = 1; month <= 7; month++) {
        await page.mouse.move(track.x + track.width * (month - 0.5) / 7, track.y + track.height / 2);
        await expect(slider).toHaveAttribute('aria-valuenow', String(month));
        await expect(slider).toHaveAttribute('aria-valuetext', new RegExp(`Month ${month} of 7`));
      }
      await page.mouse.up();
      await slider.focus();
      await slider.press('Home');
      await expect(slider).toHaveAttribute('aria-valuenow', '1');
      await slider.press('ArrowRight');
      await expect(slider).toHaveAttribute('aria-valuenow', '2');
      await expect(journey).toContainText('Housing');
      await slider.press('End');
      await expect(slider).toHaveAttribute('aria-valuenow', '7');
      await page.getByRole('button', { name: 'Replay', exact: true }).click();
      await page.getByRole('button', { name: 'Pause', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Resume', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Replay', exact: true })).toBeVisible({ timeout: 15000 });
    });
  }
}
