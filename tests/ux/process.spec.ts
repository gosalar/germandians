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
  // The quote terms and payment timing are answered in the FAQ; closed answers are not in the page text until opened.
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const faq = page.locator('#faq');
  await faq.getByRole('button', { name: 'When do I get the terms in writing?' }).click();
  const terms = faq.getByRole('region', { name: 'When do I get the terms in writing?' });
  await expect(terms).toContainText('conditional, private and backup offers');
  await expect(terms).toContainText('visa refusal');
  await expect(terms.getByRole('listitem')).toHaveCount(8);
  await faq.getByRole('button', { name: 'When is payment due?' }).click();
  await expect(faq.getByRole('region', { name: 'When is payment due?' })).toHaveText(
    'Under the standard arrangement, the service fee becomes due after a university admits you. Your written quote states what triggers payment.',
  );
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
});

test('the fees section links to the FAQ fee questions and the costs topic', async ({ page }) => {
  // Without smooth scrolling the jump is immediate, so the landing position can be measured.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const fees = page.locator('#fees');
  // The outside costs are on /requirements now; the section keeps the headline, receipt and actions.
  await expect(fees).not.toContainText('Paid separately');
  await expect(fees.getByRole('link', { name: 'Other costs to plan for' })).toHaveAttribute('href', '/requirements#costs');
  await fees.getByRole('link', { name: 'How the quote works' }).click();
  await expect(page).toHaveURL(/#faq-fees$/);
  const group = page.locator('#faq').getByRole('heading', { level: 3, name: 'Fees and terms' });
  await expect(group).toBeInViewport();
  // The group title lands below the sticky header, not under it.
  const header = (await page.locator('nav').first().boundingBox())!;
  expect((await group.boundingBox())!.y).toBeGreaterThanOrEqual(header.y + header.height);
});

test('the FAQ gives the one-line dMAT rule with its source and links to the guide topic', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Do I need dMAT for APS?' }).click();
  const answer = page.locator('#faq').getByRole('region', { name: 'Do I need dMAT for APS?' });
  await expect(answer).toContainText('Exemptions apply.');
  await expect(answer).toContainText('Last reviewed 18 November 2026');
  await expect(answer.getByRole('link', { name: 'APS India: dMAT rules' })).toBeVisible();
  // The full rule, its dates and the fee are in the guide topic, not in the answer.
  for (const detail of ['16 January 2027', '13 March 2027', '€150', 'officially confirmed exchange']) {
    await expect(answer).not.toContainText(detail);
  }
  for (const label of ['dMAT fields:', 'Who is exempt:', 'Earlier APS applications:', 'dMAT and APS:', 'Test dates:', 'Test fee:']) {
    await expect(answer).not.toContainText(label);
  }
  await expect(answer.getByRole('link', { name: 'APS and dMAT in the requirements guide' })).toHaveAttribute('href', '/requirements#aps-dmat');
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
