import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const SITE_CORE_WORDS = [
  'Fragebogen',
  'Laufzettel',
  'Steckbrief',
  'Übungsschein',
  'Anmeldung',
  'Sperrkonto',
  'Abschluss',
  'Leistungspunkte',
  'Noten',
  'Sprachnachweis',
  'Prüfstelle',
  'Unterlagen',
  'Bewerbung',
  'Antrag auf Erstberatung',
  'Hinweis',
];

const LEARN_GERMAN_DECK_WORDS = ['Mensa', 'Vorlesung', 'Kommilitone', 'Termin', 'Feierabend', 'doch'];

const PAGE_SIZE = 24;

/** Press "Show more words" until every entry is on the page. */
async function showAll(page: Page) {
  const more = page.getByRole('button', { name: 'Show more words', exact: true });
  while (await more.isVisible()) {
    await more.click();
  }
}

async function ready(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

function trackRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    if (type === 'error' || /hydrat/i.test(text)) {
      errors.push(`${type}: ${text}`);
    }
  });
  return errors;
}

test('prerenders the first 24 words and shows 100 to 150 once every word is revealed, including every core site word and Learn German deck word', async ({
  page,
  request,
}) => {
  const errors = trackRuntimeErrors(page);

  // The first 24 cards are in the HTML before any script runs.
  const rawHtml = await (await request.get('/german-words')).text();
  expect(rawHtml.match(/data-entry="/g)).toHaveLength(PAGE_SIZE);
  expect(rawHtml).toMatch(/Showing 24 of \d+ words/);
  expect(rawHtml).toContain('Show more words');

  await page.goto('/german-words');
  await ready(page);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('German words');

  const cards = page.locator('[data-testid="german-words-list"] > li[data-entry]');
  await expect(cards).toHaveCount(PAGE_SIZE);
  await showAll(page);
  const total = await cards.count();
  expect(total).toBeGreaterThanOrEqual(100);
  expect(total).toBeLessThanOrEqual(150);
  await expect(page.getByTestId('german-words-count')).toHaveText(`Showing all ${total} words`);

  const main = page.getByRole('main');
  for (const word of [...SITE_CORE_WORDS, ...LEARN_GERMAN_DECK_WORDS]) {
    await expect(main).toContainText(word);
  }

  // Every noun entry shows its exact grammatical article; only the modal particle `doch` uses the particle label.
  const headings = await cards.locator('h3').allTextContents();
  expect(headings.length).toBe(total);
  for (const heading of headings) {
    if (heading === 'doch') continue;
    expect(heading).toMatch(/^(der|die|das) \S/);
  }

  // Definitions and examples explain words, never fees, exclamation marks or guarantees.
  const listText = await page.getByTestId('german-words-list').innerText();
  expect(listText).not.toContain('!');
  expect(listText).not.toContain('€');
  expect(listText).not.toMatch(/\bguaranteed?\b/i);

  expect(errors).toEqual([]);
});

test('filters by German word, ASCII umlaut spelling, English meaning and area, and clears cleanly', async ({
  page,
}) => {
  const errors = trackRuntimeErrors(page);
  await page.goto('/german-words');
  await ready(page);

  const search = page.getByLabel('Filter by German or English word');
  const cards = page.locator('[data-testid="german-words-list"] > li[data-entry]');
  await expect(cards).toHaveCount(PAGE_SIZE);
  await showAll(page);
  const total = await cards.count();
  await page.reload();
  await ready(page);
  await expect(cards).toHaveCount(PAGE_SIZE);

  await search.fill('Sperrkonto');
  await expect(cards).toHaveCount(1);
  await expect(cards.first().locator('h3')).toHaveText('das Sperrkonto');
  await expect(page.getByRole('status')).toHaveText(`1 of ${total} words match`);

  // ASCII umlaut spelling ("ue") matches German umlauts ("Ü").
  await search.fill('Uebungsschein');
  await expect(cards).toHaveCount(1);
  await expect(cards.first().locator('h3')).toHaveText('der Übungsschein');

  // English meaning filtering.
  await search.fill('tenancy agreement');
  await expect(cards.filter({ hasText: 'der Mietvertrag' })).toHaveCount(1);

  // Empty state and reset button.
  await search.fill('unmatchedglossarywordxyz');
  await expect(cards).toHaveCount(0);
  const empty = page.getByTestId('german-words-empty');
  await expect(empty).toBeVisible();
  await expect(empty.getByRole('heading', { name: 'No matching words' })).toBeVisible();
  await empty.getByRole('button', { name: 'Show all words', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(cards).toHaveCount(PAGE_SIZE);

  // Area filter chips narrow by area and Clear filter restores the first 24 entries.
  const areaGroup = page.getByRole('group', { name: 'Filter by area' });
  const housingChip = areaGroup.getByRole('button', { name: /^Housing \(\d+\)$/ });
  await housingChip.click();
  await expect(housingChip).toHaveAttribute('aria-pressed', 'true');
  await showAll(page);
  const housingCount = await cards.count();
  expect(housingCount).toBeGreaterThan(15);
  expect(housingCount).toBeLessThan(total);
  await expect(cards.locator('xpath=self::*[@data-area!="housing"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Clear filter', exact: true }).click();
  await expect(cards).toHaveCount(PAGE_SIZE);
  await expect(search).toBeFocused();

  expect(errors).toEqual([]);
});

test('shows more words 24 at a time, moves focus to the first new card and resets when filtering', async ({
  page,
}) => {
  const errors = trackRuntimeErrors(page);
  await page.goto('/german-words');
  await ready(page);

  const cards = page.locator('[data-testid="german-words-list"] > li[data-entry]');
  const count = page.getByTestId('german-words-count');
  const more = page.getByRole('button', { name: 'Show more words', exact: true });

  await expect(cards).toHaveCount(PAGE_SIZE);
  await expect(count).toHaveText(/^Showing 24 of \d+ words$/);

  // Keyboard: Enter on the button reveals the next 24 and focus lands on the first of them.
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(cards).toHaveCount(PAGE_SIZE * 2);
  await expect(count).toHaveText(/^Showing 48 of \d+ words$/);
  await expect(cards.nth(PAGE_SIZE).locator('h3')).toBeFocused();

  // Searching starts again from the first 24 of the results.
  await page.getByLabel('Filter by German or English word').fill('a');
  await expect(cards).toHaveCount(PAGE_SIZE);
  await expect(count).toHaveText(/^Showing 24 of \d+ words$/);

  await page.getByRole('button', { name: 'Clear filter', exact: true }).click();
  await expect(cards).toHaveCount(PAGE_SIZE);

  // Revealing everything removes the button.
  await showAll(page);
  await expect(more).toHaveCount(0);

  // Print shows only the cards that are on screen.
  await page.reload();
  await ready(page);
  await page.emulateMedia({ media: 'print' });
  await expect(cards).toHaveCount(PAGE_SIZE);
  await expect(more).toBeHidden();
  await page.emulateMedia({ media: 'screen' });

  expect(errors).toEqual([]);
});

test('links entries to their matching topics on the requirements page', async ({ page }) => {
  await page.goto('/german-words');
  await ready(page);
  await showAll(page);

  const expectedLinks: Array<[string, string]> = [
    ['abschluss', '/requirements#degree'],
    ['leistungspunkte', '/requirements#subject-credits'],
    ['noten', '/requirements#grades'],
    ['sprachnachweis', '/requirements#language'],
    ['pruefstelle', '/requirements#aps-dmat'],
    ['unterlagen', '/requirements#documents'],
    ['bewerbung', '/requirements#applying'],
    ['fristen', '/requirements#deadlines'],
    ['sperrkonto', '/requirements#costs'],
    ['anmeldung', '/requirements#visa-enrolment'],
    ['fragebogen', '/requirements#questions'],
    ['laufzettel', '/requirements#next-steps'],
  ];

  for (const [entryId, href] of expectedLinks) {
    const link = page.locator(`li[data-entry="${entryId}"] a`);
    await expect(link).toHaveAttribute('href', href);
  }

  await page.locator('li[data-entry="abschluss"] a').click();
  await expect(page).toHaveURL(/\/requirements\/?#degree$/);
});

test('supports keyboard navigation, passes axe and hides filter chrome in print', async ({ page }) => {
  const errors = trackRuntimeErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/german-words');
  await ready(page);

  // Skip link reaches main content, then Tab reaches the filter input.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#german-words-search')).toBeFocused();

  // Keyboard filtering and keyboard activation of area chip.
  await page.keyboard.type('Anmeldung');
  await expect(page.locator('li[data-entry="anmeldung"]')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Clear filter', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#german-words-search')).toBeFocused();

  const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(axeResults.violations).toEqual([]);

  // Print stylesheet hides filter controls while keeping glossary cards visible.
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#german-words-search')).toBeHidden();
  await expect(page.locator('li[data-entry="abschluss"]')).toBeVisible();
  await page.emulateMedia({ media: 'screen' });

  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive layout without horizontal overflow or covered focus at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: width < 1024,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = trackRuntimeErrors(page);

    await page.goto(`${baseURL!.replace(/\/$/, '')}/german-words`);
    await ready(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    // Check touch targets on coarse pointer widths.
    if (width < 1024) {
      const chipBoxes = await page
        .getByRole('group', { name: 'Filter by area' })
        .getByRole('button')
        .evaluateAll((buttons) => buttons.map((btn) => btn.getBoundingClientRect().height));
      for (const height of chipBoxes) {
        expect(height).toBeGreaterThanOrEqual(44);
      }
    }

    // Verify first 25 Tab stops are never covered by sticky header or mobile action bar.
    const covered: string[] = [];
    for (let step = 0; step < 25; step++) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el || el === document.body) return { skip: false, covered: false, label: '' };
        const r = el.getBoundingClientRect();
        const label = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || el.id;
        const hit = document.elementFromPoint(
          Math.max(0, Math.min(window.innerWidth - 1, r.x + r.width / 2)),
          Math.max(0, Math.min(window.innerHeight - 1, r.y + r.height / 2)),
        );
        return {
          skip: el.textContent === 'Skip to content',
          label,
          covered:
            r.top < 0 ||
            r.bottom > window.innerHeight + 1 ||
            !hit ||
            !(el.contains(hit) || hit.contains(el)),
        };
      });
      if (step > 0 && state.skip) break;
      if (state.covered) covered.push(state.label);
    }
    expect(covered).toEqual([]);
    expect(errors).toEqual([]);

    await context.close();
  });
}
