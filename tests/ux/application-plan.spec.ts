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

async function expectFocusedControlUnobscured(control: Locator) {
  await expect(control).toBeFocused();
  const visibility = await control.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    return {
      inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth,
      unobscured: hit !== null && (hit === el || el.contains(hit)),
      hitTag: hit?.tagName ?? null,
    };
  });
  expect(visibility.inViewport).toBe(true);
  expect(visibility.unobscured).toBe(true);
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

    // Open the per-programme removal confirmation and check wrapping, overflow, touch targets, and unobscured focus.
    const removeButton = card.getByRole('button', {
      name: 'Remove MSc Computational Mechanics and Long Programme Title at Technical University of Munich',
    });
    await removeButton.click();
    const prompt = card.getByRole('group', {
      name: /Remove MSc Computational Mechanics and Long Programme Title at Technical University of Munich/,
    });
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('1 date and 1 document');

    const cancelButton = prompt.getByRole('button', { name: 'Cancel', exact: true });
    const confirmButton = prompt.getByRole('button', { name: 'Yes, remove', exact: true });
    await expectFocusedControlUnobscured(cancelButton);

    const cardBox = await card.boundingBox();
    const promptBox = await prompt.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(promptBox).not.toBeNull();
    expect(promptBox!.x).toBeGreaterThanOrEqual(cardBox!.x);
    expect(promptBox!.x + promptBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 0.5);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);

    // Every main button and status toggle inside main-content (including confirmation actions) has >= 44px height.
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

    await page.keyboard.press('Tab');
    await expectFocusedControlUnobscured(confirmButton);
    await cancelButton.click();
    await expect(prompt).toHaveCount(0);
    await expectFocusedControlUnobscured(removeButton);

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

test('removing a programme asks first, handles zero/singular/plural counts, cancels safely, and confirms cleanly with reload and export', async ({ page }) => {
  const issues = attachErrorCollector(page);
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await page.getByLabel('Programme name', { exact: true }).fill('Sample A');
  await page.getByLabel('University', { exact: true }).fill('Example University');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  const cardA = page.getByTestId('programme-card').filter({ hasText: 'Sample A' });
  await addDate(cardA, '2027-04-15', 'Application deadline');
  await cardA.getByLabel('Document', { exact: true }).fill('Transcript of records');
  await cardA.getByRole('button', { name: 'Add document', exact: true }).click();
  await expect(cardA.getByLabel('Document', { exact: true })).toBeFocused();

  await page.getByLabel('Programme name', { exact: true }).fill('Sample B');
  await page.getByLabel('University', { exact: true }).fill('North Example Institute');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  await expect(page.getByTestId('programme-card')).toHaveCount(2);

  // Singular prompt (1 date and 1 document), Cancel focuses Remove and preserves saved data across reload.
  const removeA = cardA.getByRole('button', { name: 'Remove Sample A at Example University' });
  await removeA.click();
  await expect(page.getByTestId('programme-card')).toHaveCount(2);

  const promptA = cardA.getByRole('group', { name: /Remove Sample A at Example University/ });
  await expect(promptA).toBeVisible();
  await expect(promptA).toContainText('Remove Sample A at Example University? This will also remove 1 date and 1 document.');
  await expect(promptA).not.toContainText('Transcript of records');
  await expect(promptA).not.toContainText('Application deadline');

  const cancelA = promptA.getByRole('button', { name: 'Cancel', exact: true });
  const confirmA = promptA.getByRole('button', { name: 'Yes, remove', exact: true });
  await expect(cancelA).toHaveAttribute('type', 'button');
  await expect(confirmA).toHaveAttribute('type', 'button');
  await expect(cancelA).toBeFocused();

  await cancelA.click();
  await expect(promptA).toHaveCount(0);
  await expect(removeA).toBeFocused();

  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(page.getByTestId('programme-card')).toHaveCount(2);
  const reloadedCardA = page.getByTestId('programme-card').filter({ hasText: 'Sample A' });
  const reloadedCardB = page.getByTestId('programme-card').filter({ hasText: 'Sample B' });
  await expect(reloadedCardA.getByText('2027-04-15', { exact: true })).toBeVisible();
  await expect(reloadedCardA.getByText('Transcript of records', { exact: true })).toBeVisible();
  await expect(reloadedCardB).toBeVisible();

  // Zero-child prompt (0 dates and 0 documents) on Sample B.
  const removeB = reloadedCardB.getByRole('button', { name: 'Remove Sample B at North Example Institute' });
  await removeB.click();
  const promptB = reloadedCardB.getByRole('group', { name: /Remove Sample B at North Example Institute/ });
  await expect(promptB).toContainText('Remove Sample B at North Example Institute? This will also remove 0 dates and 0 documents.');
  await expect(promptB.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await promptB.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(promptB).toHaveCount(0);
  await expect(removeB).toBeFocused();

  // Plural prompt (2 dates and 2 documents) on Sample A, then confirm removal.
  await addDate(reloadedCardA, '2027-05-01', 'Interview window');
  await reloadedCardA.getByLabel('Document', { exact: true }).fill('Language proof');
  await reloadedCardA.getByRole('button', { name: 'Add document', exact: true }).click();
  await expect(reloadedCardA.getByLabel('Document', { exact: true })).toBeFocused();

  await reloadedCardA.getByRole('button', { name: 'Remove Sample A at Example University' }).click();
  const pluralPromptA = reloadedCardA.getByRole('group', { name: /Remove Sample A at Example University/ });
  await expect(pluralPromptA).toContainText('Remove Sample A at Example University? This will also remove 2 dates and 2 documents.');
  await expect(pluralPromptA).not.toContainText('Transcript of records');
  await expect(pluralPromptA).not.toContainText('Language proof');

  await pluralPromptA.getByRole('button', { name: 'Yes, remove', exact: true }).click();
  await expect(page.getByTestId('programme-card')).toHaveCount(1);
  await expect(page.getByTestId('programme-card-name')).toHaveText(['Sample B']);
  await expect(page.getByRole('status').filter({ hasText: 'Removed Sample A from your application plan.' })).toBeVisible();
  await expectProgrammeNameFocused(page);

  // Reload and export CSV: only Sample B remains, Sample A and its child records are absent.
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(page.getByTestId('programme-card-name')).toHaveText(['Sample B']);

  const [csvDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download CSV', exact: true }).click(),
  ]);
  const csvRaw = await readFile((await csvDownload.path())!, 'utf8');
  expect(csvRaw).toContain('Sample B');
  expect(csvRaw).toContain('North Example Institute');
  expect(csvRaw).not.toContain('Sample A');
  expect(csvRaw).not.toContain('2027-04-15');
  expect(csvRaw).not.toContain('Transcript of records');
  expect(csvRaw).not.toContain('Language proof');

  expect(issues).toEqual([]);
});

test('keyboard-only programme removal cancels safely on second Enter or Escape, isolates prompts, and passes WCAG', async ({ page }) => {
  const issues = attachErrorCollector(page);
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await page.getByLabel('Programme name', { exact: true }).fill('Keyboard Alpha');
  await page.getByLabel('University', { exact: true }).fill('Alpha Tech');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  const cardAlpha = page.getByTestId('programme-card').filter({ hasText: 'Keyboard Alpha' });
  await addDate(cardAlpha, '2027-06-01', 'Portal deadline');
  await cardAlpha.getByLabel('Document', { exact: true }).fill('Motivation letter');
  await cardAlpha.getByRole('button', { name: 'Add document', exact: true }).click();
  await expect(cardAlpha.getByLabel('Document', { exact: true })).toBeFocused();

  await page.getByLabel('Programme name', { exact: true }).fill('Keyboard Beta');
  await page.getByLabel('University', { exact: true }).fill('Beta University');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  const cardBeta = page.getByTestId('programme-card').filter({ hasText: 'Keyboard Beta' });
  const removeAlpha = cardAlpha.getByRole('button', { name: 'Remove Keyboard Alpha at Alpha Tech' });
  const removeBeta = cardBeta.getByRole('button', { name: 'Remove Keyboard Beta at Beta University' });

  // First Enter opens prompt with focus on Cancel; immediate second Enter cancels safely without deleting.
  await removeAlpha.focus();
  await page.keyboard.press('Enter');
  const promptAlpha = cardAlpha.getByRole('group', { name: /Remove Keyboard Alpha at Alpha Tech/ });
  await expect(promptAlpha).toBeVisible();
  await expect(promptAlpha.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(promptAlpha).toHaveCount(0);
  await expect(page.getByTestId('programme-card')).toHaveCount(2);
  await expect(removeAlpha).toBeFocused();

  // Reopen with Space, then press Escape to close and restore focus.
  await page.keyboard.press('Space');
  await expect(promptAlpha).toBeVisible();
  await expect(promptAlpha.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(promptAlpha).toHaveCount(0);
  await expect(removeAlpha).toBeFocused();

  // Open prompts on both cards and on whole-plan Clear; Escape closes only the active prompt and leaves unrelated forms alone.
  await page.keyboard.press('Enter');
  await expect(promptAlpha).toBeVisible();

  await removeBeta.focus();
  await page.keyboard.press('Enter');
  const promptBeta = cardBeta.getByRole('group', { name: /Remove Keyboard Beta at Beta University/ });
  await expect(promptBeta).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(promptBeta).toHaveCount(0);
  await expect(removeBeta).toBeFocused();
  await expect(promptAlpha).toBeVisible();

  const clearButton = page.getByRole('button', { name: 'Clear my entries', exact: true });
  await clearButton.click();
  const clearGroup = page.getByRole('group', { name: 'Clear all entries?' });
  await expect(clearGroup).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(clearGroup).toHaveCount(0);
  await expect(clearButton).toBeFocused();
  await expect(promptAlpha).toBeVisible();

  // Pressing Escape in an unrelated form field does not close the open card prompt.
  const nameInput = page.getByLabel('Programme name', { exact: true });
  await nameInput.focus();
  await page.keyboard.press('Escape');
  await expect(promptAlpha).toBeVisible();

  // Individual date controls remain independently usable while the card prompt is open and update the prompt counts.
  await cardAlpha.getByRole('button', { name: 'Remove date 2027-06-01 (Portal deadline) for Keyboard Alpha' }).click();
  await expect(promptAlpha).toContainText('0 dates and 1 document');

  // WCAG scan with card removal confirmation open.
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(axe.violations).toEqual([]);

  // Complete keyboard-only confirm: Cancel -> Tab -> Yes, remove -> Enter.
  await promptAlpha.getByRole('button', { name: 'Cancel', exact: true }).focus();
  await page.keyboard.press('Tab');
  const confirmAlpha = promptAlpha.getByRole('button', { name: 'Yes, remove', exact: true });
  await expect(confirmAlpha).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('programme-card')).toHaveCount(1);
  await expect(page.getByTestId('programme-card-name')).toHaveText(['Keyboard Beta']);
  await expect(page.getByRole('status').filter({ hasText: 'Removed Keyboard Alpha from your application plan.' })).toBeVisible();
  await expectProgrammeNameFocused(page);

  expect(issues).toEqual([]);
});

test('programme removal stays keyed through date reordering and preserves storage failure warnings', async ({ page }) => {
  const issues = attachErrorCollector(page);
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await page.getByLabel('Programme name', { exact: true }).fill('Late Programme');
  await page.getByLabel('University', { exact: true }).fill('Example South');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  await page.getByLabel('Programme name', { exact: true }).fill('Early Programme');
  await page.getByLabel('University', { exact: true }).fill('Example North');
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  await expect(page.getByTestId('programme-card-name')).toHaveText(['Late Programme', 'Early Programme']);

  // Open removal confirmation on the first card (Late Programme), then add an upcoming date to Early Programme so they reorder.
  const lateCard = page.getByTestId('programme-card').filter({ hasText: 'Late Programme' });
  const earlyCard = page.getByTestId('programme-card').filter({ hasText: 'Early Programme' });
  await lateCard.getByRole('button', { name: 'Remove Late Programme at Example South' }).click();
  await expect(lateCard.getByRole('group', { name: /Remove Late Programme at Example South/ })).toBeVisible();

  await addDate(earlyCard, '2027-02-01', 'Early deadline');
  await expect(page.getByTestId('programme-card-name')).toHaveText(['Early Programme', 'Late Programme']);

  // Confirmation stays attached to Late Programme (now second) and is absent on Early Programme (now first).
  const latePromptAfterReorder = lateCard.getByRole('group', { name: /Remove Late Programme at Example South/ });
  await expect(latePromptAfterReorder).toBeVisible();
  await expect(earlyCard.getByRole('group', { name: /Remove Early Programme/ })).toHaveCount(0);
  await expect(earlyCard.getByRole('button', { name: 'Remove Early Programme at Example North' })).toBeVisible();

  await latePromptAfterReorder.getByRole('button', { name: 'Yes, remove', exact: true }).click();
  await expect(page.getByTestId('programme-card-name')).toHaveText(['Early Programme']);
  await expect(page.getByRole('status').filter({ hasText: 'Removed Late Programme from your application plan.' })).toBeVisible();
  await expectProgrammeNameFocused(page);

  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(page.getByTestId('programme-card-name')).toHaveText(['Early Programme']);

  const [icsDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download calendar (.ics)', exact: true }).click(),
  ]);
  const icsRaw = await readFile((await icsDownload.path())!, 'utf8');
  expect(icsRaw).toContain('Early Programme');
  expect(icsRaw).not.toContain('Late Programme');

  // If browser storage fails during confirmed single-programme removal, status and storage warning are preserved.
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name: string, value: string) {
      if (name === 'germandians:application-plan') throw new DOMException('Full', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  });

  const remainingCard = page.getByTestId('programme-card').filter({ hasText: 'Early Programme' });
  await remainingCard.getByRole('button', { name: 'Remove Early Programme at Example North' }).click();
  await remainingCard
    .getByRole('group', { name: /Remove Early Programme at Example North/ })
    .getByRole('button', { name: 'Yes, remove', exact: true })
    .click();

  await expect(page.getByTestId('programme-card')).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Removed Early Programme from your application plan.' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Browser storage is unavailable' })).toBeVisible();
  await expectProgrammeNameFocused(page);

  expect(issues).toEqual([]);
});

test('320px removal prompt wraps very long unbroken programme names without overflow and keeps focus visible', async ({ page }) => {
  const issues = attachErrorCollector(page);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/application-plan');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const longProgramme = 'MSc InterdisciplinaryComputationalEngineeringAndAppliedMathematicsSpecialisationTrack2027';
  const longUniversity = 'Example University of Applied Sciences and Engineering Sciences';
  await page.getByLabel('Programme name', { exact: true }).fill(longProgramme);
  await page.getByLabel('University', { exact: true }).fill(longUniversity);
  await page.getByRole('button', { name: 'Add programme', exact: true }).click();
  await expectProgrammeNameFocused(page);

  const card = page.getByTestId('programme-card').filter({ hasText: longProgramme });
  const remove = card.getByRole('button', { name: `Remove ${longProgramme} at ${longUniversity}` });
  await remove.click();

  const prompt = card.getByRole('group', { name: new RegExp(`Remove ${longProgramme} at ${longUniversity}`) });
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText('0 dates and 0 documents');

  const cancel = prompt.getByRole('button', { name: 'Cancel', exact: true });
  await expectFocusedControlUnobscured(cancel);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);

  await cancel.click();
  await expect(prompt).toHaveCount(0);
  await expectFocusedControlUnobscured(remove);

  expect(issues).toEqual([]);
});
