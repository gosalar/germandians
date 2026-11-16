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

test('neutral start, unchanged grade table, no profile questions and one link to the requirements page', async ({ page }) => {
  const html = await (await page.request.get('/check')).text();
  expect(html).toContain('Start with your marks and your transcript’s grading scale.');
  expect(html).not.toContain('data-testid="form-snapshot"');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('German grade check');
  await expect(page.getByTestId('german-grade-value')).toHaveText('—');
  await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
  await expect(page.locator('#check-input-error')).toBeEmpty();
  await expect(page.locator('#check-score')).not.toHaveAttribute('aria-invalid', 'true');
  // One input panel: the marks. No profile questions, step labels or requirement list remain.
  await expect(page.getByRole('group', { name: 'Indian grading scale presets', exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Active backlogs', exact: true })).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/Step [12]|What still needs checking|Active backlogs|APS status|dMAT degree field/);
  const link = page.getByTestId('check-requirements-link').getByRole('link', { name: 'See what else programmes check', exact: true });
  await expect(link).toHaveAttribute('href', '/requirements');
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await expect(page.locator('#check-score')).toHaveValue('');
  // Choosing a scale alone is not an entry: no error, no invalid field, nothing to attach.
  await expect(page.locator('#check-input-error')).toBeEmpty();
  await expect(page.locator('#check-score')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('german-grade-value')).toHaveText('—');
  await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
  for (const [score, max, min, expected] of grades) {
    await page.locator('#check-max').fill(max);
    await page.locator('#check-min').fill(min);
    await page.locator('#check-score').fill(score);
    await expect(page.getByTestId('german-grade-value')).toHaveText(expected);
    await expect(page.getByTestId('check-headline')).toHaveText('Your grade is one part of your application.');
    await expect(page.getByTestId('check-cta')).toHaveText('Get my profile reviewed');
    await expect(page.locator('main')).not.toContainText(/TU Munich|RWTH Aachen|KIT|TU Berlin|TU Darmstadt|FAU Erlangen|TU Dresden|Passau|TU Dortmund|OVGU Magdeburg|TU Chemnitz|FH Aachen/);
    await expect(page.locator('main')).not.toContainText(/Tier [123]|Competitive|Realistic reach|Strong fit|Selective|Primary target|Low odds|Not a fit this intake|\bBand:/);
    await expect(page.locator('[data-testid^="tier-"]')).toHaveCount(0);
  }
  await expect(page.getByTestId('check-live-region')).not.toContainText(/formula:|Universities may round|programmes check/);
  await page.locator('nav').getByRole('link', { name: 'Germandians', exact: true }).click();
  await expect(page).toHaveURL(/\/(#top)?$/);
});

test('the summary holds only a valid conversion and is attached only when ticked', async ({ page }) => {
  const summary = page.getByTestId('form-snapshot');
  const include = page.locator('#f-summary');
  const consent = page.locator('label[for="f-consent"]');
  // An incomplete conversion attaches nothing: a score without its scale offers no summary.
  await page.locator('#check-score').fill('8,8');
  await expect(page.locator('#check-input-error')).not.toBeEmpty();
  await expect(summary).toHaveCount(0);
  await expect(consent).not.toContainText('summary');
  // A valid conversion shows the block; only sending needs the tick.
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await expect(summary).toContainText('From your grade check');
  await expect(summary.getByRole('listitem')).toHaveText(['German grade 1.6 (8,8 / 10, pass 4)']);
  await expect(summary).not.toContainText(/ECTS|Band|backlog|APS|Degree duration|Score entered/);
  await expect(include).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Attach this summary to my enquiry' })).toHaveAttribute('id', 'f-summary');
  await expect(consent).not.toContainText('summary');
  await expect(page.getByTestId('german-grade-value')).toHaveText('1.6');
  await include.check();
  await expect(consent).toContainText('any email address I provide and the attached grade-check summary to contact me');
  // An invalid conversion removes the block and the tick; a new summary starts unticked.
  await page.locator('#check-score').fill('11');
  await expect(summary).toHaveCount(0);
  await expect(consent).not.toContainText('summary');
  await page.locator('#check-score').fill('');
  await expect(summary).toHaveCount(0);
  await page.locator('#check-score').fill('8,8');
  await expect(summary.getByRole('listitem')).toHaveText(['German grade 1.6 (8,8 / 10, pass 4)']);
  await expect(include).not.toBeChecked();
  await expect(consent).not.toContainText('summary');
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
      // The grade stays in view while the visitor works through the marks and the result.
      for (const target of [page.locator('#check-score'), page.getByTestId('check-requirements-link')]) {
        await target.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
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
  });
}
