import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { STORAGE_KEY } from '../../src/utils/sopPlanner/storage.ts';
import { UX_ENDPOINTS } from './endpoints.ts';

async function waitForHydration(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

function captureConsoleIssues(page: Page): string[] {
  const issues: string[] = [];
  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    if (type === 'error') {
      issues.push(`error: ${text}`);
    } else if (type === 'warning' && /hydrat|mismatch|did not match/i.test(text)) {
      issues.push(`hydration: ${text}`);
    }
  });
  return issues;
}

test.beforeEach(async ({ page }) => {
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
});

test('prerendered HTML and sitemap include the SOP planner without JavaScript', async ({
  browser,
  request,
}) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/sop-planner/</loc>');

  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/sop-planner');
  await expect(page.getByRole('heading', { level: 1, name: 'SOP planner' })).toBeVisible();
  for (const title of [
    'Why this subject',
    'What my record shows (including the hard semesters)',
    "What I've done beyond it",
    'Why this programme',
    'What comes next',
  ]) {
    await expect(page.getByRole('heading', { level: 3, name: title, exact: true })).toBeVisible();
  }
  await context.close();
});

test('main flow: five parts, live word counts, case-insensitive stock-phrase check, and links', async ({
  page,
}) => {
  const issues = captureConsoleIssues(page);
  const externalRequests: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith('http://localhost:') && !url.startsWith('http://127.0.0.1:') && !url.startsWith('data:')) {
      externalRequests.push(url);
    }
  });

  await page.goto('/sop-planner');
  await waitForHydration(page);

  await expect(page.getByTestId('sop-total-words')).toHaveText('0 words');

  const part1 = page.getByLabel('Why this subject', { exact: true });
  const part2 = page.getByLabel('What my record shows (including the hard semesters)', {
    exact: true,
  });
  const part3 = page.getByLabel("What I've done beyond it", { exact: true });
  const part4 = page.getByLabel('Why this programme', { exact: true });
  const part5 = page.getByLabel('What comes next', { exact: true });

  await part1.fill('Since MY Childhood I have been PASSIONATE ABOUT fluid machinery.');
  await expect(page.getByTestId('word-count-why-subject')).toHaveText('10 words');
  await expect(page.getByTestId('sop-total-words')).toHaveText('10 words');

  // Stock-phrase matches in Part 1: case-insensitive, highlighted with numbered marks, with why + prompt.
  const part1Matches = page.getByTestId('stock-matches-why-subject');
  await expect(part1Matches).toBeVisible();
  const marks = part1Matches.locator('mark');
  await expect(marks).toHaveCount(2);
  await expect(marks.nth(0)).toContainText('Since MY Childhood');
  await expect(marks.nth(0)).toContainText('[1]');
  await expect(marks.nth(1)).toContainText('PASSIONATE ABOUT');
  await expect(marks.nth(1)).toContainText('[2]');
  await expect(part1Matches).toContainText('Starts too far back and says nothing about your degree');
  await expect(part1Matches).toContainText('Names a feeling without showing any work you have done');
  await expect(part1Matches).toContainText('Write what happened instead:');

  await part2.fill('Due to some personal reasons I failed four exams in semester four, then cleared all four.');
  await part3.fill('Built a centrifugal pump test rig for my final-year project.');
  await part4.fill('This course at my dream university covers turbomachinery and cutting-edge research.');
  await part5.fill('Work in industrial pump testing after graduation.');

  await expect(page.getByTestId('word-count-record')).toHaveText('16 words');
  await expect(page.getByTestId('word-count-beyond')).toHaveText('10 words');
  await expect(page.getByTestId('word-count-why-programme')).toHaveText('11 words');
  await expect(page.getByTestId('word-count-next')).toHaveText('7 words');
  await expect(page.getByTestId('sop-total-words')).toHaveText('54 words');
  await expect(page.getByTestId('sop-stock-summary')).toContainText('5 stock phrases flagged');

  // Revising Part 1 in the visitor's own concrete words removes its stock-phrase warning.
  await part1.fill('Diagnosing hydraulic faults at a repair workshop led me to pump design.');
  await expect(page.getByTestId('stock-matches-why-subject')).toHaveCount(0);
  await expect(page.getByTestId('sop-stock-summary')).toContainText('3 stock phrases flagged');

  // Accessibility check while stock-phrase highlights are active.
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(axe.violations).toEqual([]);

  // Cross-links to Requirements Documents topic and Home SOP section.
  await expect(
    page.getByRole('link', { name: /Documents in the requirements guide/ }),
  ).toHaveAttribute('href', /\/requirements#documents$/);

  const sopLink = page.getByRole('link', { name: /See how we work on your SOP/ });
  await expect(sopLink).toHaveAttribute('href', /\/#sop$/);
  await sopLink.click();
  await expect(page).toHaveURL(/\/#sop$/);
  await expect(page.locator('#sop')).toBeVisible();

  expect(externalRequests).toEqual([]);
  expect(issues).toEqual([]);
});

test('browser storage survives reload, discards invalid data, and clears on request', async ({
  page,
}) => {
  const issues = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);

  const part1 = page.getByLabel('Why this subject', { exact: true });
  const part3 = page.getByLabel("What I've done beyond it", { exact: true });

  await part1.fill('Studied control systems in semester five and built a PID temperature loop.');
  await part3.fill('Six-month internship testing PLC panels.');

  const rawStored = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  expect(rawStored).not.toBeNull();

  await page.reload();
  await waitForHydration(page);

  await expect(part1).toHaveValue(
    'Studied control systems in semester five and built a PID temperature loop.',
  );
  await expect(part3).toHaveValue('Six-month internship testing PLC panels.');
  await expect(page.getByTestId('sop-total-words')).toHaveText('17 words');

  // Clear my entries wipes the outline and removes the localStorage key.
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(part1).toHaveValue('');
  await expect(part3).toHaveValue('');
  await expect(page.getByTestId('sop-total-words')).toHaveText('0 words');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  await page.reload();
  await waitForHydration(page);
  await expect(part1).toHaveValue('');

  // Invalid stored shapes are discarded cleanly on mount without errors.
  await page.evaluate((key) => {
    window.localStorage.setItem(key, '{"version":99,"unexpected":true}');
  }, STORAGE_KEY);
  await page.reload();
  await waitForHydration(page);
  await expect(part1).toHaveValue('');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  expect(issues).toEqual([]);
});

test('warns when saved notes could not be removed', async ({ page }) => {
  await page.goto('/sop-planner');
  await waitForHydration(page);
  await page.getByLabel('Why this subject', { exact: true }).fill('Private notes');
  await page.evaluate(() => {
    Storage.prototype.removeItem = () => { throw new Error('Storage removal blocked'); };
  });
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(page.getByText('The notes were cleared on screen, but the saved outline could not be removed from this browser.')).toBeVisible();
  await expect(page.getByText('Cleared all five parts and removed the saved outline from this browser.')).toBeHidden();
});

test('clearing asks first, moves focus to Yes and back to the button on Cancel, and leaves the notes alone', async ({ page }) => {
  await page.goto('/sop-planner');
  await waitForHydration(page);
  const part1 = page.getByLabel('Why this subject', { exact: true });
  await part1.fill('Keep these notes');

  const clear = page.getByRole('button', { name: 'Clear my entries', exact: true });
  await clear.click();
  const group = page.getByRole('group', { name: 'Clear all entries?' });
  await expect(group).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes, clear', exact: true })).toBeFocused();
  await expect(part1).toHaveValue('Keep these notes');

  await group.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(group).toHaveCount(0);
  await expect(clear).toBeFocused();
  await expect(part1).toHaveValue('Keep these notes');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();

  // Escape also cancels.
  await clear.click();
  await page.keyboard.press('Escape');
  await expect(group).toHaveCount(0);
  await expect(clear).toBeFocused();
});

test('keyboard navigation, skip link, and print layout work cleanly', async ({ page }) => {
  const issues = captureConsoleIssues(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/sop-planner');
  await waitForHydration(page);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  const part1 = page.getByLabel('Why this subject', { exact: true });
  await part1.focus();
  await page.keyboard.type('Thermal analysis module in semester six.');
  await expect(page.getByTestId('word-count-why-subject')).toHaveText('6 words');

  // Print stylesheet displays the full notes text and hides interactive controls.
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('p', { hasText: 'Thermal analysis module in semester six.' })).toBeVisible();
  await expect(part1).toBeHidden();
  await expect(page.getByRole('button', { name: 'Clear my entries', exact: true })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);

  await page.emulateMedia({ media: 'screen' });
  const clearButton = page.getByRole('button', { name: 'Clear my entries', exact: true });
  await clearButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Yes, clear', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(part1).toHaveValue('');
  await expect(clearButton).toBeFocused();

  expect(issues).toEqual([]);
});

for (const [width, height] of [
  [320, 640],
  [390, 844],
  [768, 1024],
  [1024, 900],
  [1440, 900],
] as const) {
  test(`responsive layout, touch targets, and zero overflow at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: width < 1024,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const issues = captureConsoleIssues(page);

    await page.goto(`${baseURL!.replace(/\/$/, '')}/sop-planner`);
    await waitForHydration(page);

    await page
      .getByLabel('Why this subject', { exact: true })
      .fill('Since my childhood I was hardworking, dedicated and sincere.');
    await expect(page.getByTestId('stock-matches-why-subject')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    // Action buttons meet the 44px minimum target height.
    for (const name of ['Print outline', 'Clear my entries']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    expect(issues).toEqual([]);
    await context.close();
  });
}
