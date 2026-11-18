import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { ARRIVAL_SUPPORT } from '../../src/utils/constants.ts';

const STORAGE_KEY = 'germandians:arrival';

const EXPECTED_ITEMS = [
  ['moving-in', 'Moving in and landlord confirmation', 'Wohnungsgeberbestätigung'],
  ['city-registration', 'City registration', 'Anmeldung'],
  ['tax-id', 'Tax identification number', 'Steueridentifikationsnummer'],
  ['health-insurance-enrolment', 'Health insurance confirmation and university enrolment', 'Immatrikulation'],
  ['bank-accounts', 'Current bank account and blocked account', 'Girokonto und Sperrkonto'],
  ['campus-setup', 'Semester contribution, student card and campus orientation', 'Semesterbeitrag und Semesterticket'],
  ['broadcasting-fee', 'Public broadcasting fee', 'Rundfunkbeitrag'],
  ['residence-permit', 'Residence permit for studies', 'Aufenthaltserlaubnis'],
  ['student-work-rules', 'Rules on student part-time work', 'Nebenjob'],
] as const;

async function ready(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}

function trackRuntimeIssues(page: Page): string[] {
  const issues: string[] = [];
  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    if (type === 'error') {
      issues.push(`console.error: ${text}`);
    } else if (type === 'warning' && /hydrat|did not match|server-rendered/i.test(text)) {
      issues.push(`hydration: ${text}`);
    }
  });
  return issues;
}

test.beforeEach(async ({ page }) => {
  await page.route('https://script.google.com/**', (route) => route.abort());
});

test('prerenders all nine arrival steps with official source notes, review dates and exact ARRIVAL_SUPPORT copy', async ({
  page,
}) => {
  const issues = trackRuntimeIssues(page);

  const html = await (await page.request.get('/arrival')).text();
  expect(html).toContain('Arrival checklist');
  expect(html).toContain('Ankommen');
  for (const [id, title, german] of EXPECTED_ITEMS) {
    expect(html, `prerendered #${id}`).toContain(`id="${id}"`);
    expect(html, `prerendered title for #${id}`).toContain(title);
    expect(html, `prerendered German term for #${id}`).toContain(german);
  }
  expect(html).toContain('0 of 9 steps ticked');
  expect(html).not.toContain('data-testid="ticked-badge-');

  await page.goto('/arrival');
  await ready(page);

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Arrival checklist');

  for (const [id, title] of EXPECTED_ITEMS) {
    const card = main.locator(`article#${id}`);
    await expect(card.getByRole('heading', { level: 2 })).toHaveText(title);
    for (const heading of ['What it is', 'What to bring', 'Where it is done', 'Official sources']) {
      await expect(card.getByRole('heading', { level: 3, name: heading, exact: true })).toBeVisible();
    }

    const sourceNotes = card.getByText(/Last reviewed \d{1,2} \w+ \d{4}/);
    expect(await sourceNotes.count(), `sources in #${id}`).toBeGreaterThan(0);
    for (const note of await sourceNotes.all()) {
      const link = note.getByRole('link');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener');
    }
  }

  // Exact owner-approved ARRIVAL_SUPPORT wording on the steps Germandians helps with.
  const movingInSupport = main.getByTestId('support-moving-in');
  await expect(movingInSupport).toContainText(ARRIVAL_SUPPORT.availability);
  await expect(movingInSupport).toContainText(ARRIVAL_SUPPORT.complimentary);
  await expect(movingInSupport).toContainText(ARRIVAL_SUPPORT.quote);
  await expect(movingInSupport.getByRole('link', { name: 'Read about housing and settling-in help' })).toHaveAttribute(
    'href',
    '/#housing',
  );

  for (const id of ['city-registration', 'bank-accounts', 'campus-setup']) {
    const support = main.getByTestId(`support-${id}`);
    await expect(support).toContainText(ARRIVAL_SUPPORT.settling);
    await expect(support).toContainText(ARRIVAL_SUPPORT.quote);
  }

  const workSupport = main.getByTestId('support-student-work-rules');
  await expect(workSupport).toContainText(ARRIVAL_SUPPORT.settling);
  await expect(workSupport).toContainText(ARRIVAL_SUPPORT.complimentary);
  await expect(workSupport).toContainText(ARRIVAL_SUPPORT.quote);

  // Steps outside the owner-described settling support carry no invented service claims.
  for (const id of ['tax-id', 'health-insurance-enrolment', 'broadcasting-fee', 'residence-permit']) {
    await expect(main.getByTestId(`support-${id}`)).toHaveCount(0);
  }

  // Cross-links to the Requirements guide visa and enrolment topic.
  await expect(
    main.locator('article#health-insurance-enrolment').getByRole('link', {
      name: 'Visa and enrolment in the requirements guide',
    }),
  ).toHaveAttribute('href', '/requirements#visa-enrolment');

  expect(issues).toEqual([]);
});

test('ticking, unticking, keyboard toggling, reload persistence and Clear my entries work cleanly', async ({ page }) => {
  const issues = trackRuntimeIssues(page);

  await page.goto('/arrival');
  await ready(page);

  const summary = page.getByTestId('arrival-progress-summary');
  await expect(summary).toContainText('0/9');
  await expect(summary).toContainText('0 of 9 steps ticked · 9 left');

  const movingInCheck = page.getByRole('checkbox', {
    name: 'Mark as done: Moving in and landlord confirmation',
  });
  const anmeldungCheck = page.getByRole('checkbox', {
    name: 'Mark as done: City registration',
  });
  const taxIdCheck = page.getByRole('checkbox', {
    name: 'Mark as done: Tax identification number',
  });

  // Pointer tick
  await movingInCheck.check();
  await expect(movingInCheck).toBeChecked();
  await expect(page.getByTestId('ticked-badge-moving-in')).toHaveText('Ticked');
  await expect(summary).toContainText('1/9');
  await expect(summary).toContainText('1 of 9 steps ticked · 8 left');

  // Keyboard toggle via focus + Space
  await anmeldungCheck.focus();
  await page.keyboard.press('Space');
  await expect(anmeldungCheck).toBeChecked();

  await taxIdCheck.focus();
  await page.keyboard.press('Space');
  await expect(taxIdCheck).toBeChecked();
  await expect(summary).toContainText('3/9');
  await expect(summary).toContainText('3 of 9 steps ticked · 6 left');

  // Untick one by keyboard
  await page.keyboard.press('Space');
  await expect(taxIdCheck).not.toBeChecked();
  await expect(summary).toContainText('2/9');
  await expect(summary).toContainText('2 of 9 steps ticked · 7 left');

  // Verify stored JSON shape under germandians:arrival
  const storedRaw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  expect(JSON.parse(storedRaw ?? 'null')).toEqual({
    version: 1,
    ticked: ['moving-in', 'city-registration'],
  });

  // Reload preserves ticked items
  await page.reload();
  await ready(page);
  await expect(movingInCheck).toBeChecked();
  await expect(anmeldungCheck).toBeChecked();
  await expect(taxIdCheck).not.toBeChecked();
  await expect(summary).toContainText('2/9');
  await expect(summary).toContainText('2 of 9 steps ticked · 7 left');

  // Clear my entries asks first: Cancel keeps the ticks and returns focus to the button.
  const clearButton = page.getByRole('button', { name: 'Clear my entries', exact: true });
  await clearButton.click();
  await expect(page.getByText('Clear all entries?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes, clear' })).toBeFocused();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Clear all entries?')).toBeHidden();
  await expect(clearButton).toBeFocused();
  await expect(movingInCheck).toBeChecked();

  // Confirming resets state, removes localStorage key, and announces status
  await clearButton.click();
  await page.getByRole('button', { name: 'Yes, clear' }).click();
  await expect(movingInCheck).not.toBeChecked();
  await expect(anmeldungCheck).not.toBeChecked();
  await expect(summary).toContainText('0/9');
  await expect(summary).toContainText('0 of 9 steps ticked · 9 left');
  await expect(page.getByRole('status')).toContainText('All checklist entries cleared.');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  expect(issues).toEqual([]);
});

test('discards invalid or corrupted localStorage entries on load without errors', async ({ page }) => {
  const issues = trackRuntimeIssues(page);

  const invalidPayloads = [
    '{not-valid-json',
    JSON.stringify({ version: 2, ticked: ['moving-in'] }),
    JSON.stringify({ version: 1, ticked: ['not-a-real-step'] }),
    JSON.stringify({ version: 1, ticked: ['moving-in', 'moving-in'] }),
  ];

  for (const payload of invalidPayloads) {
    await page.goto('/arrival');
    await ready(page);
    await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [STORAGE_KEY, payload] as const);
    await page.reload();
    await ready(page);
    await expect(page.getByTestId('arrival-progress-summary')).toContainText('0/9');
    expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  }

  expect(issues).toEqual([]);
});

test('handles blocked localStorage gracefully without throwing and keeps on-screen ticking working', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const deny = () => {
      throw new DOMException('Storage disabled', 'SecurityError');
    };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: deny,
    });
  });
  const page = await context.newPage();
  const issues = trackRuntimeIssues(page);

  await page.goto('/arrival');
  await ready(page);

  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable right now.');
  const firstCheck = page.getByRole('checkbox', {
    name: 'Mark as done: Moving in and landlord confirmation',
  });
  await firstCheck.check();
  await expect(firstCheck).toBeChecked();
  await expect(page.getByTestId('arrival-progress-summary')).toContainText('1 of 9 steps ticked · 8 left');

  // A clear the browser could not carry out is never announced as done.
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear' }).click();
  await expect(page.getByText('All checklist entries cleared.')).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable right now.');

  expect(issues).toEqual([]);
  await context.close();
});

test('passes axe WCAG audit, keeps keyboard focus unobscured and renders a clean print view', async ({ page }) => {
  const issues = trackRuntimeIssues(page);

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/arrival');
    await ready(page);

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
    expect(axe.violations).toEqual([]);

    // Skip link moves focus to main
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    // Tab through controls inside main and verify sticky header / phone bar never cover focused elements
    for (let step = 0; step < 18; step += 1) {
      await page.keyboard.press('Tab');
      const obscured = await page.evaluate(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement) || !active.closest('main')) return null;
        active.scrollIntoView({ block: 'nearest' });
        const rect = active.getBoundingClientRect();
        // The sticky site navigation (not the page's own heading block).
        const stickyNav = Array.from(document.querySelectorAll('nav')).find(
          (node) => getComputedStyle(node).position === 'sticky',
        );
        const headerBottom = stickyNav ? stickyNav.getBoundingClientRect().bottom : 0;
        const mobileBar = document.querySelector('[data-testid="mobile-action-bar"], nav[aria-label*="Quick"]');
        const barTop =
          mobileBar && getComputedStyle(mobileBar).display !== 'none'
            ? mobileBar.getBoundingClientRect().top
            : window.innerHeight;
        if (rect.top < headerBottom - 1) return `covered by header (${rect.top} < ${headerBottom})`;
        if (rect.bottom > barTop + 1) return `covered by bottom bar (${rect.bottom} > ${barTop})`;
        return null;
      });
      expect(obscured, `step ${step} at ${width}px`).toBeNull();
    }
  }

  // Print media hides interactive buttons and navigation chrome while keeping checklist items visible
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { level: 1, name: 'Arrival checklist' })).toBeVisible();
  await expect(page.locator('article#moving-in')).toBeVisible();
  await expect(page.locator('article#student-work-rules')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear my entries', exact: true })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Steps on this checklist' })).toBeHidden();

  expect(issues).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive layout has zero horizontal overflow and touch-ready controls at ${width}px`, async ({ browser }) => {
    const isTouch = width < 1024;
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: isTouch,
      isMobile: isTouch && width < 768,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const issues = trackRuntimeIssues(page);

    await page.goto('/arrival');
    await ready(page);
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    if (isTouch) {
      const heights = await page
        .locator('main button, main nav a, main [class*="checkboxLabel"], main [class*="inlineActionLink"]')
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
      expect(heights.length).toBeGreaterThan(0);
      for (const height of heights) {
        expect(height).toBeGreaterThanOrEqual(44);
      }
    }

    expect(issues).toEqual([]);
    await context.close();
  });
}
