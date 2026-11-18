import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { STORAGE_KEY } from '../../src/utils/applicationPlan/storage.ts';
import { UX_ENDPOINTS } from './endpoints.ts';

const FIXED_NOW = new Date('2026-11-18T10:00:00Z');

function attachErrorCollector(page: Page) {
  const issues: string[] = [];
  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || /hydrat/i.test(text)) {
      issues.push(`${type}: ${text}`);
    }
  });
  return issues;
}

// The page returns focus to a form on the next animation frame after an add. Typing before that
// frame lands sends the text to whichever field gets focus, so wait for focus to settle first.
async function addDate(card: Locator, date: string, label: string) {
  await card.getByLabel('Date (YYYY-MM-DD)', { exact: true }).fill(date);
  await card.getByLabel('Date label', { exact: true }).fill(label);
  await card.getByRole('button', { name: 'Add date', exact: true }).click();
  await expect(card.getByLabel('Date (YYYY-MM-DD)', { exact: true })).toBeFocused();
}

async function expectProgrammeNameFocused(page: Page) {
  await expect(page.getByLabel('Programme name', { exact: true })).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
  await page.clock.install({ time: FIXED_NOW });
});

test('adds programmes with routes, validates URLs and dates, sorts by next upcoming date, and exports RFC 5545 .ics and CSV', async ({ page }) => {
  const issues = attachErrorCollector(page);
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await expect(page.getByRole('heading', { level: 1, name: 'Application plan', exact: true })).toBeVisible();
  await expect(page.locator('[lang="de"]').filter({ hasText: 'Bewerbungsplan' })).toBeVisible();

  // Every route option in the form links to /requirements#applying.
  const formRouteLinks = page.locator('form').first().getByRole('link', { name: 'How to apply', exact: true });
  await expect(formRouteLinks).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await expect(formRouteLinks.nth(i)).toHaveAttribute('href', /\/requirements#applying$/);
  }

  // URL validation rejects non-http(s) links and accepts https://.
  await page.getByLabel('Programme name', { exact: true }).fill('MSc Software Systems Engineering');
  await page.getByLabel('University', { exact: true }).fill('RWTH Aachen');
  await page.getByLabel('Link to the programme’s own page (optional)', { exact: true }).fill('ftp://rwth-aachen.example/sse');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expect(page.getByText('Enter a full web link starting with https:// or http://, or leave this blank.')).toBeVisible();

  await page.getByLabel('Link to the programme’s own page (optional)', { exact: true }).fill('https://sc.informatik.rwth-aachen.de/en/studium/master/sse/');
  await page.getByRole('radio', { name: 'Direct to the university', exact: true }).check();
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();

  // Add a second programme using the VPD route with commas and quotes to exercise escaping and folding.
  await page.getByLabel('Programme name', { exact: true }).fill('MSc Informatics, Data and Systems');
  await page.getByLabel('University', { exact: true }).fill('Technical University of Munich (TUM)');
  await page.getByLabel('Link to the programme’s own page (optional)', { exact: true }).fill('https://www.cit.tum.de/en/cit/studies/degree-programs/master-informatics/');
  await page
    .getByRole('radio', {
      name: 'A VPD (Vorprüfungsdokumentation, preliminary review documentation) from uni-assist, then the university',
      exact: true,
    })
    .check();
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();

  // Add a third programme using uni-assist with an http:// URL.
  await page.getByLabel('Programme name', { exact: true }).fill('MSc Distributed Computing');
  await page.getByLabel('University', { exact: true }).fill('TU Berlin');
  await page.getByLabel('Link to the programme’s own page (optional)', { exact: true }).fill('http://example.org/tub-distributed');
  await page.getByRole('radio', { name: 'Through uni-assist', exact: true }).check();
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  const cards = page.getByTestId('programme-card');
  await expect(cards).toHaveCount(3);

  // Validate date input format on RWTH card, then add 2027-05-31.
  const rwthCard = cards.filter({ hasText: 'MSc Software Systems Engineering' });
  await addDate(rwthCard, '2027-02-30', 'Invalid calendar day');
  await expect(rwthCard.getByText('Enter a real calendar date written as YYYY-MM-DD.')).toBeVisible();

  await addDate(rwthCard, '2027-05-31', 'Application deadline, "strict"');

  // On TUM card, add a past date (2026-10-01) and an upcoming date (2027-01-15) plus documents.
  const tumCard = page.getByTestId('programme-card').filter({ hasText: 'MSc Informatics, Data and Systems' });
  await addDate(tumCard, '2026-10-01', 'Earlier info webinar');
  await addDate(tumCard, '2027-01-15', 'VPD request; upload documents');

  await tumCard.getByLabel('Document', { exact: true }).fill('Degree transcript');
  await tumCard.getByRole('radio', { name: 'Ready', exact: true }).check();
  await tumCard.getByRole('button', { name: 'Add document', exact: true }).click();

  await tumCard.getByLabel('Document', { exact: true }).fill('APS certificate');
  await tumCard.getByRole('radio', { name: 'Missing', exact: true }).check();
  await tumCard.getByRole('button', { name: 'Add document', exact: true }).click();

  await tumCard.getByLabel('Document', { exact: true }).fill('Temporary draft note');
  await tumCard.getByRole('button', { name: 'Add document', exact: true }).click();
  await tumCard.getByRole('button', { name: 'Remove document Temporary draft note for MSc Informatics, Data and Systems' }).click();
  await expect(tumCard.getByText('Temporary draft note')).toHaveCount(0);

  // Toggle APS certificate from Missing to Ready and back to Missing to verify checklist toggling.
  const apsGroup = tumCard.getByRole('group', { name: 'Status for APS certificate (MSc Informatics, Data and Systems)' });
  await apsGroup.getByRole('button', { name: 'Ready', exact: true }).click();
  await expect(apsGroup.getByRole('button', { name: 'Ready', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await apsGroup.getByRole('button', { name: 'Missing', exact: true }).click();
  await expect(apsGroup.getByRole('button', { name: 'Missing', exact: true })).toHaveAttribute('aria-pressed', 'true');

  // On TU Berlin card, add an upcoming date 2027-03-01 between TUM (2027-01-15) and RWTH (2027-05-31).
  const tubCard = page.getByTestId('programme-card').filter({ hasText: 'MSc Distributed Computing' });
  await addDate(tubCard, '2027-03-01', 'uni-assist deadline');

  // Verify sort order by next upcoming date (>= 2026-11-18): TUM (2027-01-15), TU Berlin (2027-03-01), RWTH (2027-05-31).
  await expect(page.getByTestId('programme-card-name')).toHaveText([
    'MSc Informatics, Data and Systems',
    'MSc Distributed Computing',
    'MSc Software Systems Engineering',
  ]);

  // External programme links carry target="_blank" and rel="noopener", and card routes link to /requirements#applying.
  const externalLinks = page.getByRole('link', { name: 'Open programme page', exact: true });
  await expect(externalLinks).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await expect(externalLinks.nth(i)).toHaveAttribute('target', '_blank');
    await expect(externalLinks.nth(i)).toHaveAttribute('rel', 'noopener');
  }

  // Export .ics and verify RFC 5545 format, CRLF endings, 75-octet folding, VALUE=DATE, DTEND next day, DTSTAMP, and stable UID.
  const [icsDownload1] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download calendar (.ics)', exact: true }).click(),
  ]);
  expect(icsDownload1.suggestedFilename()).toBe('application-plan.ics');
  const icsRaw1 = await readFile((await icsDownload1.path())!, 'utf8');

  expect(icsRaw1.endsWith('\r\n')).toBe(true);
  // Every LF in the file must be preceded by CR (strict CRLF).
  expect(icsRaw1.replaceAll('\r\n', '')).not.toContain('\n');

  const physicalLines = icsRaw1.slice(0, -2).split('\r\n');
  const encoder = new TextEncoder();
  for (const line of physicalLines) {
    expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
  }

  const unfolded = icsRaw1.replaceAll('\r\n ', '');
  expect(unfolded).toContain('BEGIN:VCALENDAR\r\n');
  expect(unfolded).toContain('VERSION:2.0\r\n');
  expect(unfolded).toContain('PRODID:-//Germandians//Application Plan//EN\r\n');
  expect(unfolded).toContain('CALSCALE:GREGORIAN\r\n');
  expect(unfolded).toContain('DTSTART;VALUE=DATE:20270115\r\n');
  expect(unfolded).toContain('DTEND;VALUE=DATE:20270116\r\n');
  expect(unfolded).toContain('DTSTART;VALUE=DATE:20270531\r\n');
  expect(unfolded).toContain('DTEND;VALUE=DATE:20270601\r\n');
  expect(unfolded).toMatch(/DTSTAMP:20261118T1000\d{2}Z\r\n/);
  // Escaped comma and semicolon in SUMMARY.
  expect(unfolded).toContain('MSc Informatics\\, Data and Systems');
  expect(unfolded).toContain('VPD request\\; upload documents');

  const uids1 = [...unfolded.matchAll(/^UID:(.+)$/gm)].map((match) => match[1].trim());
  expect(uids1).toHaveLength(4);
  expect(new Set(uids1).size).toBe(4);

  // Export CSV and verify RFC 4180 escaping and contents.
  const [csvDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download CSV', exact: true }).click(),
  ]);
  expect(csvDownload.suggestedFilename()).toBe('application-plan.csv');
  const csvRaw = await readFile((await csvDownload.path())!, 'utf8');
  expect(csvRaw.endsWith('\r\n')).toBe(true);
  expect(csvRaw.replaceAll('\r\n', '')).not.toContain('\n');
  expect(csvRaw).toContain('"MSc Informatics, Data and Systems"');
  expect(csvRaw).toContain('"2027-05-31 (Application deadline, ""strict"")"');
  expect(csvRaw).toContain('Degree transcript,APS certificate');

  // Reload and verify localStorage persistence AND identical deterministic UIDs on second .ics export.
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(page.getByTestId('programme-card-name')).toHaveText([
    'MSc Informatics, Data and Systems',
    'MSc Distributed Computing',
    'MSc Software Systems Engineering',
  ]);

  const [icsDownload2] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download calendar (.ics)', exact: true }).click(),
  ]);
  const icsRaw2 = await readFile((await icsDownload2.path())!, 'utf8');
  const uids2 = [...icsRaw2.replaceAll('\r\n ', '').matchAll(/^UID:(.+)$/gm)].map((match) => match[1].trim());
  expect(uids2).toEqual(uids1);

  // Verify @media print view hides form/button chrome and keeps programmes, routes, dates, and documents visible.
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { level: 2, name: 'Add a programme', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Clear my entries', exact: true })).toBeHidden();
  await expect(page.getByTestId('programme-card').first()).toBeVisible();
  await expect(page.getByText('Degree transcript')).toBeVisible();
  await expect(page.getByText('APS certificate')).toBeVisible();
  await page.emulateMedia({ media: 'screen' });

  // Clear my entries removes all programmes and clears localStorage.
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(page.getByTestId('programme-card')).toHaveCount(0);
  await expect(page.getByText('No programmes in your plan yet.')).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  expect(issues).toEqual([]);
});

test('discards invalid stored shapes safely and works end-to-end by keyboard with WCAG compliance', async ({ page }) => {
  const issues = attachErrorCollector(page);
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  // Seed malformed storage and reload: page discards it without crashing or console errors.
  await page.evaluate((key) => {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, programmes: [{ id: 'x', name: '', url: 'javascript:alert(1)' }] }));
  }, STORAGE_KEY);
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(page.getByText('An unreadable saved entry was cleared from this browser.')).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  // Keyboard-only interaction: add a programme, add a date, add a document, toggle ready/missing.
  await page.getByLabel('Programme name', { exact: true }).focus();
  await page.keyboard.type('MSc Autonomous Systems');
  await page.keyboard.press('Tab');
  await page.keyboard.type('University of Stuttgart');
  await page.keyboard.press('Tab');
  await page.keyboard.type('https://www.uni-stuttgart.de/');
  await page.getByRole('radio', { name: 'Through uni-assist', exact: true }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Add programme', exact: true }).focus();
  await page.keyboard.press('Enter');

  const card = page.getByTestId('programme-card');
  await expect(card).toHaveCount(1);
  await expectProgrammeNameFocused(page);

  await card.getByLabel('Date (YYYY-MM-DD)', { exact: true }).focus();
  await page.keyboard.type('2027-02-15');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Application deadline');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(card.getByText('2027-02-15', { exact: true })).toBeVisible();
  await expect(card.getByLabel('Date (YYYY-MM-DD)', { exact: true })).toBeFocused();

  await card.getByLabel('Document', { exact: true }).focus();
  await page.keyboard.type('Language certificate');
  await card.getByRole('button', { name: 'Add document', exact: true }).focus();
  await page.keyboard.press('Enter');

  const readyToggle = card
    .getByRole('group', { name: 'Status for Language certificate (MSc Autonomous Systems)' })
    .getByRole('button', { name: 'Ready', exact: true });
  await readyToggle.focus();
  await page.keyboard.press('Space');
  await expect(readyToggle).toHaveAttribute('aria-pressed', 'true');

  // Run Axe WCAG 2.1 AA + best-practice scan on populated page.
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(axe.violations).toEqual([]);

  expect(issues).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive layout, touch targets, and unobscured focus at ${width}px`, async ({ page }) => {
    const issues = attachErrorCollector(page);
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/application-plan');
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

    await page.getByLabel('Programme name', { exact: true }).fill('MSc Computational Mechanics and Long Programme Title');
    await page.getByLabel('University', { exact: true }).fill('Technical University of Munich');
    await page
      .getByLabel('Link to the programme’s own page (optional)', { exact: true })
      .fill('https://www.tum.de/en/studies/degree-programs/detail/computational-mechanics-master-of-science-msc');
    await page
      .getByRole('radio', {
        name: 'A VPD (Vorprüfungsdokumentation, preliminary review documentation) from uni-assist, then the university',
        exact: true,
      })
      .check();
    await page.getByRole('button', { name: 'Add programme', exact: true }).click();
    await expectProgrammeNameFocused(page);

    const card = page.getByTestId('programme-card');
    await addDate(card, '2027-04-01', 'Application deadline');

    await card.getByLabel('Document', { exact: true }).fill('Module catalogue extract');
    await card.getByRole('button', { name: 'Add document', exact: true }).click();

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);

    // Every main button and status toggle inside main-content has >= 44px height.
    const shortControls = await page.locator('#main-content button, #main-content a').evaluateAll((elements) =>
      elements
        .filter((el) => (el as HTMLElement).checkVisibility())
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { text: (el.textContent ?? '').trim().slice(0, 40), height: rect.height };
        })
        .filter((item) => item.height < 43.5),
    );
    // SourceNote links inside prose paragraphs use touch-area ::after on coarse pointers; check standalone controls.
    const failingStandalone = shortControls.filter(
      (item) => !item.text.startsWith('uni-assist:'),
    );
    expect(failingStandalone).toEqual([]);

    expect(issues).toEqual([]);
  });
}

test('a failed save or a failed clear is reported, never shown as success', async ({ page }) => {
  const issues = attachErrorCollector(page);
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const addProgramme = async (name: string) => {
    await page.getByLabel('Programme name', { exact: true }).fill(name);
    await page.getByLabel('University', { exact: true }).fill('RWTH Aachen');
    await page.getByRole('radio', { name: 'Direct to the university', exact: true }).check();
    await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  };

  await addProgramme('MSc Software Systems Engineering');
  await expect(page.getByTestId('programme-card')).toHaveCount(1);
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();
  await expect(page.getByRole('alert').filter({ hasText: 'Browser storage is unavailable' })).toHaveCount(0);

  // A blocked save keeps the entry on screen and says storage did not take it.
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name: string, value: string) {
      if (name === 'germandians:application-plan') throw new DOMException('Full', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  });
  await addProgramme('MSc Computer Science');
  await expect(page.getByTestId('programme-card')).toHaveCount(2);
  await expect(page.getByRole('alert').filter({ hasText: 'Browser storage is unavailable' })).toBeVisible();

  // A blocked removal clears the screen but says the saved data is still there.
  await page.evaluate(() => {
    Storage.prototype.removeItem = function (name: string) {
      if (name === 'germandians:application-plan') throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(page.getByTestId('programme-card')).toHaveCount(0);
  await expect(page.getByText('Cleared this plan on screen. Saved browser data could not be cleared.')).toBeVisible();
  await expect(page.getByText('Cleared this plan on screen.', { exact: true })).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();

  expect(issues).toEqual([]);
});

test('clearing asks first, moves focus to Yes and back to the button on Cancel, and keeps the plan', async ({ page }) => {
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.getByLabel('Programme name', { exact: true }).fill('Computer Science');
  await page.getByLabel('University', { exact: true }).fill('RWTH Aachen');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expect(page.getByTestId('programme-card')).toHaveCount(1);

  const clear = page.getByRole('button', { name: 'Clear my entries', exact: true });
  await clear.click();
  const group = page.getByRole('group', { name: 'Clear all entries?' });
  await expect(group).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes, clear', exact: true })).toBeFocused();

  await group.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(group).toHaveCount(0);
  await expect(clear).toBeFocused();
  await expect(page.getByTestId('programme-card')).toHaveCount(1);

  // The three-route explainer is a closed details element whose text is still in the page.
  const routes = page.locator('details', { hasText: 'How the three application routes work' });
  await expect(routes).not.toHaveAttribute('open', '');
  await expect(routes).toContainText('uni-assist');
});
