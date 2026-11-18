import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { STORAGE_KEY } from '../../src/utils/budget/storage';
import { UX_ENDPOINTS } from './endpoints';

async function ready(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

function trackRuntimeIssues(page: Page): string[] {
  const issues: string[] = [];
  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error') {
      issues.push(`console.error: ${text}`);
    } else if (
      message.type() === 'warning' &&
      /hydrat|did not match|server-rendered/i.test(text)
    ) {
      issues.push(`hydration: ${text}`);
    }
  });
  page.on('request', (request) => {
    const url = request.url();
    if (
      url.startsWith('http://127.0.0.1') ||
      url.startsWith('http://localhost') ||
      url.startsWith('data:')
    ) {
      return;
    }
    issues.push(`external-request: ${url}`);
  });
  return issues;
}

test.beforeEach(async ({ page }) => {
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
});

test('starts blank with sourced official figures, calculates EUR and INR totals, and prints cleanly', async ({
  page,
}) => {
  const issues = trackRuntimeIssues(page);
  await page.goto('/budget');
  await ready(page);

  await expect(page.getByRole('heading', { level: 1, name: 'Study budget planner' })).toBeVisible();
  await expect(page.getByLabel('Number of months')).toHaveValue('');
  await expect(page.getByLabel('Exchange rate to plan with (₹ per €1)')).toHaveValue('');
  await expect(page.getByLabel('Monthly rent and utilities (€)')).toHaveValue('');
  await expect(page.getByLabel('Monthly health insurance (€)')).toHaveValue('');
  await expect(page.getByLabel('Other monthly living costs (€)')).toHaveValue('');

  await expect(page.getByTestId('budget-monthly-eur')).toHaveText('€0');
  await expect(page.getByTestId('budget-monthly-inr')).toHaveText(
    'Enter your ₹ per €1 rate to see rupees',
  );
  await expect(page.getByTestId('budget-period-eur')).toHaveText('—');
  await expect(page.getByTestId('budget-period-inr')).toHaveText(
    'Enter the number of months to calculate the period total',
  );

  // Official blocked-account reference is distinct from personal costs and carries its SourceNote.
  const blockedRef = page.getByTestId('budget-blocked-reference');
  await expect(blockedRef).toContainText('€992');
  await expect(blockedRef).toContainText('€11,904');
  await expect(
    blockedRef.getByRole('link', { name: 'German Missions: visa FAQs' }),
  ).toHaveAttribute('target', '_blank');
  await expect(blockedRef).toContainText('Last reviewed 18 November 2026');

  // Guide topic cross-links use requirementsHref.
  await expect(page.getByRole('link', { name: 'Read the Costs guide' })).toHaveAttribute(
    'href',
    '/requirements#costs',
  );
  await expect(
    page.getByRole('link', { name: 'Read the Visa and enrolment guide' }),
  ).toHaveAttribute('href', '/requirements#visa-enrolment');

  // Select 12 months and enter monthly costs (no rate yet: EUR updates, INR prompts for rate).
  const twelveMonths = page.getByRole('button', { name: '12 months (1 year)', exact: true });
  await twelveMonths.click();
  await expect(twelveMonths).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Number of months')).toHaveValue('12');

  await page.getByLabel('Monthly rent and utilities (€)').fill('480');
  await page.getByLabel('Monthly health insurance (€)').fill('130');
  await page.getByLabel('Other monthly living costs (€)').fill('290');

  await expect(page.getByTestId('budget-monthly-eur')).toHaveText('€900');
  await expect(page.getByTestId('budget-period-eur')).toHaveText('€10,800');
  await expect(page.getByTestId('budget-period-inr')).toHaveText(
    'Enter your ₹ per €1 rate to see rupees',
  );

  // Enter visitor one-off costs plus a custom item.
  await page.getByLabel('Semester contributions for the period (€)').fill('620');
  await page.getByLabel('Housing deposit and initial setup (€)').fill('960');
  await page.getByLabel('Flights and travel (€)').fill('600');

  await page.getByRole('button', { name: 'Add another one-off cost', exact: true }).click();
  await page.getByLabel('Item 1 description').fill('Winter bedding and cookware');
  await page.getByLabel('Item 1 amount (€)').fill('220');
  await expect(page.getByTestId('budget-period-eur')).toHaveText('€13,200');

  // Toggle official fixed fees from applicationFacts.ts.
  await page
    .getByRole('button', { name: 'Include dMAT, where required (€150) in one-off costs' })
    .click();
  await page
    .getByRole('button', { name: 'Include uni-assist (€75 / €30) in one-off costs' })
    .click();
  await page.getByLabel('Additional uni-assist courses in the same semester').fill('2');
  await page
    .getByRole('button', { name: 'Include National visa (€75) in one-off costs' })
    .click();
  await expect(page.getByTestId('budget-period-eur')).toHaveText('€13,560');

  // Include rupee APS fee before typing exchange rate: shown alongside EUR until rate is entered.
  await page.getByRole('button', { name: 'Include APS (₹18,000) in one-off costs' }).click();
  await expect(page.getByTestId('budget-live-summary')).toContainText(
    '+ ₹18,000 in rupee fees (enter an exchange rate to combine)',
  );

  // Enter visitor's typed exchange rate (₹90 per €1).
  await page.getByLabel('Exchange rate to plan with (₹ per €1)').fill('90');
  await expect(page.getByTestId('budget-monthly-eur')).toHaveText('€900');
  await expect(page.getByTestId('budget-monthly-inr')).toHaveText('₹81,000');
  await expect(page.getByTestId('budget-period-eur')).toHaveText('€13,760');
  await expect(page.getByTestId('budget-period-inr')).toHaveText('₹12,38,400');

  // Blocked-account reference also converts at the typed rate.
  await expect(blockedRef).toContainText('₹89,280');
  await expect(blockedRef).toContainText('₹10,71,360');

  // Check print view hides interactive toolbar/presets/CTA and keeps summary + breakdown visible.
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('button', { name: 'Clear my entries' })).toBeHidden();
  await expect(twelveMonths).toBeHidden();
  await expect(page.getByTestId('budget-period-eur')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Cost breakdown' })).toBeVisible();
  await page.emulateMedia({ media: 'screen' });

  expect(issues).toEqual([]);
});

test('persists entries in localStorage across reload, clears cleanly, and discards invalid shapes', async ({
  page,
}) => {
  const issues = trackRuntimeIssues(page);
  await page.goto('/budget');
  await ready(page);

  await page.getByRole('button', { name: '6 months (1 semester)', exact: true }).click();
  await page.getByLabel('Monthly rent and utilities (€)').fill('500');
  await page.getByLabel('Exchange rate to plan with (₹ per €1)').fill('92');
  await page.getByRole('button', { name: 'Include National visa (€75) in one-off costs' }).click();

  await expect(page.getByTestId('budget-period-eur')).toHaveText('€3,075');
  await expect(page.getByTestId('budget-period-inr')).toHaveText('₹2,82,900');
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
    .not.toBeNull();

  // Survives a full reload with zero hydration warnings.
  await page.reload();
  await ready(page);
  await expect(page.getByLabel('Number of months')).toHaveValue('6');
  await expect(page.getByLabel('Monthly rent and utilities (€)')).toHaveValue('500');
  await expect(page.getByLabel('Exchange rate to plan with (₹ per €1)')).toHaveValue('92');
  await expect(
    page.getByRole('button', { name: 'Include National visa (€75) in one-off costs' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('budget-period-eur')).toHaveText('€3,075');
  await expect(page.getByTestId('budget-period-inr')).toHaveText('₹2,82,900');

  // "Clear my entries" asks first: Cancel keeps the entries and returns focus to the button.
  const clearButton = page.getByRole('button', { name: 'Clear my entries', exact: true });
  await clearButton.click();
  await expect(page.getByText('Clear all entries?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes, clear' })).toBeFocused();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Clear all entries?')).toBeHidden();
  await expect(clearButton).toBeFocused();
  await expect(page.getByLabel('Number of months')).not.toHaveValue('');

  // Confirming resets state and removes storage key.
  await clearButton.click();
  await page.getByRole('button', { name: 'Yes, clear' }).click();
  await expect(page.getByLabel('Number of months')).toHaveValue('');
  await expect(page.getByLabel('Monthly rent and utilities (€)')).toHaveValue('');
  await expect(page.getByLabel('Exchange rate to plan with (₹ per €1)')).toHaveValue('');
  await expect(page.getByTestId('budget-monthly-eur')).toHaveText('€0');
  await expect(page.getByTestId('budget-period-eur')).toHaveText('—');
  await expect(page.getByText('All budget entries cleared.')).toBeVisible();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  // Corrupt or wrong-shape storage entry is discarded cleanly on reload.
  await page.evaluate(
    (key) => localStorage.setItem(key, JSON.stringify({ version: 1, months: 12, broken: true })),
    STORAGE_KEY,
  );
  await page.reload();
  await ready(page);
  await expect(page.getByLabel('Number of months')).toHaveValue('');
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  expect(issues).toEqual([]);
});

test('keeps every entry the inputs accept after reload, and stops adding at the item limit', async ({ page }) => {
  await page.goto('/budget');
  await ready(page);
  const addButton = page.getByRole('button', { name: 'Add another one-off cost' });
  for (let i = 0; i < 30; i += 1) {
    await addButton.click();
  }
  await expect(page.getByText('You can add up to 30 extra items. Remove one to add another.')).toBeVisible();
  await addButton.click();
  await expect(page.getByLabel('Item 31 description')).toHaveCount(0);

  // The inputs cap what can be typed, so whatever was typed is what gets saved.
  await page.getByLabel('Item 1 description').fill('a'.repeat(130));
  await expect(page.getByLabel('Item 1 description')).toHaveValue('a'.repeat(120));
  await page.getByLabel('Item 30 amount (€)').fill('1'.repeat(40));
  await expect(page.getByLabel('Item 30 amount (€)')).toHaveValue('1'.repeat(30));
  await page.getByLabel('Number of months').fill('9'.repeat(40));
  await expect(page.getByLabel('Number of months')).toHaveValue('9'.repeat(30));
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
    .toContain('a'.repeat(120));
  await page.reload();
  await ready(page);
  await expect(page.getByLabel('Item 1 description')).toHaveValue('a'.repeat(120));
  await expect(page.getByLabel('Item 30 amount (€)')).toHaveValue('1'.repeat(30));
  await expect(page.getByLabel('Number of months')).toHaveValue('9'.repeat(30));
});

test('discards stored entries longer than the inputs allow', async ({ page }) => {
  await page.goto('/budget');
  await ready(page);
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          months: '9'.repeat(31),
          monthly: { rent: '', healthInsurance: '', otherMonthly: '' },
          oneOff: { semesterContribution: '', tuition: '', deposit: '', flight: '' },
          customOneOffs: [],
          officialFees: { aps: false, dmat: false, uniAssist: false, visa: false },
          extraUniAssistCourses: '',
          exchangeRate: '',
        }),
      ),
    STORAGE_KEY,
  );
  await page.reload();
  await ready(page);
  await expect(page.getByLabel('Number of months')).toHaveValue('');
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
});

test('warns when clearing saved budget entries fails', async ({ page }) => {
  await page.goto('/budget');
  await ready(page);
  await page.getByLabel('Monthly rent and utilities (€)').fill('500');
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();
  await page.evaluate(() => {
    Storage.prototype.removeItem = () => { throw new Error('Storage removal blocked'); };
  });
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear' }).click();
  await expect(page.getByText('The entries were cleared on screen, but saved budget entries could not be removed from this browser.')).toBeVisible();
  await expect(page.getByText('All budget entries cleared.')).toBeHidden();
});

test('compact total includes an unconverted APS fee', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/budget');
  await ready(page);
  await page.getByRole('button', { name: '6 months (1 semester)', exact: true }).click();
  await page.getByRole('button', { name: /Include APS/ }).click();
  await expect(page.locator('[class*="mobileTotalsBar"]')).toContainText('+ ₹18,000');
});

test('supports keyboard use, announces validation errors, and passes axe audit', async ({
  page,
}) => {
  const issues = trackRuntimeIssues(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/budget');
  await ready(page);

  // Skip link reaches main#main-content.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  // Keyboard toggle of period preset and official fee.
  const preset24 = page.getByRole('button', { name: '24 months (4 semesters)', exact: true });
  await preset24.focus();
  await page.keyboard.press('Space');
  await expect(preset24).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Number of months')).toHaveValue('24');

  const dmatToggle = page.getByRole('button', {
    name: 'Include dMAT, where required (€150) in one-off costs',
  });
  await dmatToggle.focus();
  await page.keyboard.press('Enter');
  await expect(dmatToggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('budget-period-eur')).toHaveText('€150');

  // Invalid inputs announce clear non-colour text errors.
  await page.getByLabel('Number of months').fill('0');
  await page.getByLabel('Monthly rent and utilities (€)').fill('-100');
  await page.getByLabel('Exchange rate to plan with (₹ per €1)').fill('0');

  await expect(page.getByText('Enter a whole number of months from 1 to 60.')).toBeVisible();
  await expect(
    page.getByText('Enter a non-negative amount up to 1,000,000 (up to two decimal places).'),
  ).toBeVisible();
  await expect(
    page.getByText('Enter a number greater than 0 and up to 10,000 for ₹ per €1.'),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Check the highlighted fields. Invalid entries are left out of the totals until corrected.',
    ),
  ).toBeVisible();

  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(audit.violations).toEqual([]);
  expect(issues).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive layout, touch targets and unobscured focus at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const isTouch = width < 1024;
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: isTouch,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const issues = trackRuntimeIssues(page);
    await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
    await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());

    await page.goto(`${baseURL!.replace(/\/$/, '')}/budget`);
    await ready(page);

    await page.getByRole('button', { name: '12 months (1 year)', exact: true }).click();
    await page.getByLabel('Monthly rent and utilities (€)').fill('520');
    await page.getByLabel('Exchange rate to plan with (₹ per €1)').fill('91.5');
    await expect(page.getByTestId('budget-period-inr')).toHaveText('₹5,70,960');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    if (isTouch) {
      const smallControls = await page
        .locator('main a:visible, main button:visible, main input:visible')
        .evaluateAll((elements) =>
          elements
            .map((el) => ({
              label: el.getAttribute('aria-label') || el.textContent?.trim() || el.id,
              height: el.getBoundingClientRect().height,
            }))
            .filter((item) => item.height < 43.5),
        );
      expect(smallControls).toEqual([]);
    }

    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator('body').focus();
      const covered: string[] = [];
      for (let step = 0; step < 120; step += 1) {
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const r = el.getBoundingClientRect();
          const label =
            el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 50) || el.id;
          const hit = document.elementFromPoint(
            Math.max(0, Math.min(window.innerWidth - 1, r.x + r.width / 2)),
            Math.max(0, Math.min(window.innerHeight - 1, r.y + r.height / 2)),
          );
          return {
            label,
            skip: el.textContent === 'Skip to content',
            body: el === document.body,
            covered:
              r.top < 0 ||
              r.bottom > window.innerHeight + 1 ||
              !hit ||
              !(el.contains(hit) || hit.contains(el)),
          };
        });
        if (step > 0 && (focus.skip || focus.body)) break;
        if (focus.covered) covered.push(focus.label ?? 'unnamed');
      }
      expect(covered).toEqual([]);
    }

    expect(issues).toEqual([]);
    await context.close();
  });
}
