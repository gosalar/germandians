import { expect, test } from '@playwright/test';

const grades = [
  ['7.4', '10', '4', '2.3'], ['7.4', '10', '5', '2.5'], ['7.1', '10', '4', '2.4'],
  ['8.0', '10', '5', '2.2'], ['72', '100', '40', '2.4'], ['10', '10', '4', '1.0'], ['4', '10', '4', '4.0'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/check');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
});

test('neutral start, unchanged grade table and requirements for every grade', async ({ page }) => {
  const html = await (await page.request.get('/check')).text();
  expect(html).toContain('Start with your marks and your transcript’s grading scale.');
  expect(html).not.toContain('data-testid="form-snapshot"');
  await expect(page.getByTestId('german-grade-value')).toHaveText('—');
  await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
  await expect(page.locator('#check-input-error')).toBeEmpty();
  await expect(page.locator('#check-score')).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await expect(page.locator('#check-score')).toHaveValue('');
  // Choosing a scale alone is not an entry: no error, no invalid field, nothing attached.
  await expect(page.locator('#check-input-error')).toBeEmpty();
  await expect(page.locator('#check-score')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('german-grade-value')).toHaveText('—');
  await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
  const requirements = await page.getByTestId('requirements-list').locator('li').allTextContents();
  expect(await page.getByTestId('requirements-list').locator('li').count()).toBe(6);
  for (const [score, max, min, expected] of grades) {
    await page.locator('#check-max').fill(max);
    await page.locator('#check-min').fill(min);
    await page.locator('#check-score').fill(score);
    await expect(page.getByTestId('german-grade-value')).toHaveText(expected);
    await expect(page.getByTestId('requirements-list').locator('li')).toHaveText(requirements);
    await expect(page.getByTestId('check-headline')).toHaveText('Your grade is one part of the requirements check.');
    await expect(page.getByTestId('check-cta')).toHaveText('Get my profile reviewed');
    await expect(page.locator('main')).not.toContainText(/TU Munich|RWTH Aachen|KIT|TU Berlin|TU Darmstadt|FAU Erlangen|TU Dresden|Passau|TU Dortmund|OVGU Magdeburg|TU Chemnitz|FH Aachen/);
    await expect(page.locator('main')).not.toContainText(/Tier [123]|Competitive|Realistic reach|Strong fit|Selective|Primary target|Low odds|Not a fit this intake|\bBand:/);
    await expect(page.locator('[data-testid^="tier-"]')).toHaveCount(0);
  }
  await expect(page.getByTestId('check-live-region')).not.toContainText(/formula:|Universities may round|Subject credits/);
  await page.locator('nav').getByRole('link', { name: 'Germandians', exact: true }).click();
  await expect(page).toHaveURL(/\/(#top)?$/);
});

test('summary contains only entered marks and answered questions; inputs do not predict eligibility', async ({ page }) => {
  await page.locator('#check-score').fill('8,8');
  await expect(page.getByTestId('form-snapshot')).toContainText('Score entered: 8,8');
  await expect(page.getByTestId('form-snapshot')).not.toContainText(/Active backlogs|Cleared backlogs|Degree duration|APS/);
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await page.getByRole('group', { name: 'Active backlogs', exact: true }).getByRole('button', { name: 'Yes', exact: true }).click();
  await page.getByRole('group', { name: 'Cleared backlogs', exact: true }).getByRole('button', { name: 'Yes', exact: true }).click();
  await page.getByRole('button', { name: '3-year', exact: true }).click();
  await page.getByRole('button', { name: 'Applied, waiting', exact: true }).click();
  await expect(page.getByTestId('form-snapshot')).toHaveText('Attached from your grade checkGerman grade 1.6 (8,8 / 10, pass 4) · Active backlogs: Yes · Cleared backlogs: Yes · Degree duration: 3-year · APS applied, awaiting certificate');
  await expect(page.getByTestId('form-snapshot')).not.toContainText(/ECTS|Band/);
  await expect(page.getByTestId('german-grade-value')).toHaveText('1.6');
  await expect(page.locator('main')).toContainText('You still have exams to clear.');
  await expect(page.locator('main')).toContainText('APS student portal');
  await page.getByRole('button', { name: 'Applied, waiting', exact: true }).click();
  await expect(page.getByTestId('form-snapshot')).not.toContainText('APS');
  await page.getByRole('button', { name: 'Have APS', exact: true }).click();
  await expect(page.locator('main')).toContainText('Keep the original digital certificate');
  await page.getByRole('button', { name: 'Not started yet', exact: true }).click();
  await expect(page.locator('main')).toContainText('requirements quiz');
  await page.getByRole('button', { name: 'Percentage % (Pass 40)', exact: true }).click();
  await expect(page.locator('#check-score')).toHaveValue('8,8');
});

test('invalid marks use a permanent polite error region and clear field associations', async ({ page }) => {
  const error = page.locator('#check-input-error');
  await expect(error).toHaveAttribute('role', 'status');
  await expect(error).toHaveAttribute('aria-live', 'polite');
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await page.locator('#check-score').fill('7.4');
  for (const [field, value, message] of [
    ['min', '0', 'Minimum passing score must be greater than 0'],
    ['min', '10', 'Maximum possible score must be greater'],
    ['score', '11', 'Enter a score between'],
    ['score', 'abc', 'Enter your score'],
  ]) {
    await page.locator('#check-min').fill('4');
    await page.locator(`#check-${field}`).fill(value);
    await expect(error).toContainText(message);
    await expect(page.locator(`#check-${field}`)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`#check-${field}`)).toHaveAttribute('aria-describedby', 'check-input-error');
    await expect(page.getByTestId('german-grade-value')).toHaveText('—');
  }
  await page.locator('#check-score').fill('7.4');
  await expect(error).toBeEmpty();
  await expect(page.locator('#check-score')).not.toHaveAttribute('aria-describedby');
});

for (const [width, height] of [[412,891],[891,412],[800,1280],[1280,800],[1536,730],[1280,585],[1920,953],[320,900],[375,900],[768,900],[1440,900]]) {
  test(`checker layout and grade visibility ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    if (width === 412) {
      const grade = (await page.locator('[class*="mobileScoreBar"]').boundingBox())!;
      const action = (await page.getByRole('link', { name: 'WhatsApp us', exact: true }).boundingBox())!;
      expect(grade.y + grade.height).toBeLessThanOrEqual(action.y - 10);
    }
    await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
    await page.locator('#check-score').fill('7.4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width >= 1100) {
      for (const group of ['Active backlogs','Cleared backlogs',"Bachelor's degree duration",'APS status']) {
        await page.getByRole('group', { name: group, exact: true }).evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const grade = (await page.getByTestId('german-grade-value').boundingBox())!;
        const headline = (await page.getByTestId('check-headline').boundingBox())!;
        const nav = (await page.locator('nav').first().boundingBox())!;
        expect(grade.y).toBeGreaterThanOrEqual(nav.y + nav.height);
        expect(grade.y + grade.height).toBeLessThanOrEqual(height);
        expect(headline.y).toBeGreaterThanOrEqual(nav.y + nav.height);
        expect(headline.y + headline.height).toBeLessThanOrEqual(height);
      }
    } else {
      const bar = page.locator('[class*="mobileScoreBar"]');
      await expect(bar).toBeVisible();
      const score = (await page.locator('#check-score').boundingBox())!;
      const grade = (await bar.boundingBox())!;
      expect(grade.y).toBeGreaterThan(score.y);
      expect(grade.y - score.y).toBeLessThan(height);
      if (width === 412) {
        const action = (await page.getByRole('link', { name: 'WhatsApp us', exact: true }).boundingBox())!;
        expect(grade.y + grade.height).toBeLessThanOrEqual(action.y - 10);
      }
    }
    if (width === 412 || width === 1440) {
      await page.getByRole('group', { name: 'Active backlogs', exact: true }).getByRole('button', { name: 'Yes', exact: true }).click();
      await page.getByRole('group', { name: 'Cleared backlogs', exact: true }).getByRole('button', { name: 'Yes', exact: true }).click();
      await page.getByRole('button', { name: '3-year', exact: true }).click();
      await page.getByRole('button', { name: 'Applied, waiting', exact: true }).click();
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    }
  });
}
