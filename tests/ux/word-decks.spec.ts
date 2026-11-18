import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'germandians:word-decks';

const EXPECTED_DECKS = [
  {
    id: 'uni',
    label: /Uni\s*·?\s*University/,
    words: ['Mensa', 'Vorlesung', 'Kommilitone', 'Hörsaal', 'Sprechstunde', 'Klausur'],
  },
  {
    id: 'wohnung',
    label: /Wohnung\s*·?\s*Housing/,
    words: ['Wohngemeinschaft', 'Mitbewohner', 'Wohnheim', 'Mietvertrag', 'Warmmiete', 'Kaution'],
  },
  {
    id: 'behoerde',
    label: /Behörde\s*·?\s*Public offices/,
    words: ['Termin', 'Bürgeramt', 'Anmeldung', 'Meldebescheinigung', 'Ausländerbehörde', 'Aufenthaltstitel'],
  },
  {
    id: 'einkaufen',
    label: /Einkaufen\s*·?\s*Shopping/,
    words: ['Pfand', 'Kassenbon', 'Bargeld', 'Drogerie', 'Wochenmarkt', 'doch'],
  },
  {
    id: 'arbeit',
    label: /Arbeit\s*·?\s*Work/,
    words: ['Werkstudent', 'Lebenslauf', 'Arbeitsvertrag', 'Praktikum', 'Gehaltsabrechnung', 'Feierabend'],
  },
] as const;

async function ready(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

function attachRuntimeMonitors(page: Page) {
  const errors: string[] = [];
  const externalRequests: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('request', (req) => {
    const url = req.url();
    if (/^https?:\/\//i.test(url) && !url.startsWith('http://127.0.0.1:')) {
      externalRequests.push(url);
    }
  });

  return { errors, externalRequests };
}

test('prerenders the default Uni deck cleanly with zero console, hydration or external-request issues', async ({
  page,
  request,
}) => {
  const res = await request.get('/learn-german/');
  expect(res.status()).toBe(200);
  const html = await res.text();
  for (const deckName of ['Uni', 'Wohnung', 'Behörde', 'Einkaufen', 'Arbeit']) {
    expect(html).toContain(deckName);
  }
  for (const starter of ['Mensa', 'Vorlesung', 'Kommilitone']) {
    expect(html).toContain(starter);
  }

  const { errors, externalRequests } = attachRuntimeMonitors(page);
  await page.goto('/learn-german');
  await ready(page);

  await expect(page.locator('audio')).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('switches across all five themed decks by pointer and keyboard, preserving starter words', async ({
  page,
}) => {
  const { errors } = attachRuntimeMonitors(page);
  await page.goto('/learn-german');
  await ready(page);

  const section = page.getByRole('region', { name: 'Everyday words by theme' });
  const chooser = section.getByRole('group', { name: 'Choose a word deck' });
  await expect(chooser.getByRole('button')).toHaveCount(5);

  for (let index = 0; index < EXPECTED_DECKS.length; index++) {
    const deck = EXPECTED_DECKS[index];
    const trigger = chooser.getByRole('button', { name: deck.label });

    if (index === 0) {
      await expect(trigger).toHaveAttribute('aria-pressed', 'true');
    } else if (index % 2 === 1) {
      await trigger.click();
    } else {
      await trigger.focus();
      await page.keyboard.press(index === 2 ? 'Enter' : 'Space');
    }

    await expect(trigger).toHaveAttribute('aria-pressed', 'true');
    for (const other of EXPECTED_DECKS) {
      if (other.id !== deck.id) {
        await expect(chooser.getByRole('button', { name: other.label })).toHaveAttribute(
          'aria-pressed',
          'false',
        );
      }
    }

    for (const word of deck.words) {
      const card = section.getByRole('button', {
        name: new RegExp(`^(?:(?:der|die|das)\\s+)?${word}\\b`),
      });
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute('aria-pressed', 'false');
    }
  }

  // Merely switching decks without marking cards leaves localStorage empty.
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  expect(errors).toEqual([]);
});

test('flips cards by pointer and keyboard while keeping both faces readable to screen readers', async ({
  page,
}) => {
  const { errors } = attachRuntimeMonitors(page);
  await page.goto('/learn-german');
  await ready(page);

  const section = page.getByRole('region', { name: 'Everyday words by theme' });
  const mensaCard = section.getByRole('button', { name: /Mensa/ });

  // Both faces are part of the accessible name before and after turning the card over.
  await expect(mensaCard).toHaveAttribute('aria-pressed', 'false');
  await expect(mensaCard).toHaveAccessibleName(/die\s+Mensa/);
  await expect(mensaCard).toHaveAccessibleName(/Plural: die Mensen/);
  await expect(mensaCard).toHaveAccessibleName(/the university canteen/);
  await expect(mensaCard).toHaveAccessibleName(/We’ll meet in the canteen\./);

  const hiddenFaces = await mensaCard.evaluate((button) => {
    const spans = [...button.querySelectorAll('span')];
    return spans.some((span) => {
      const css = getComputedStyle(span);
      return (
        css.display === 'none' ||
        css.visibility === 'hidden' ||
        (span.getAttribute('aria-hidden') === 'true' && !span.textContent?.includes('Tap to turn'))
      );
    });
  });
  expect(hiddenFaces).toBe(false);

  // Pointer flip and unflip.
  await mensaCard.click();
  await expect(mensaCard).toHaveAttribute('aria-pressed', 'true');
  await expect(mensaCard).toHaveAccessibleName(/die\s+Mensa/);
  await expect(mensaCard).toHaveAccessibleName(/the university canteen/);

  await mensaCard.click();
  await expect(mensaCard).toHaveAttribute('aria-pressed', 'false');

  // Keyboard flip with Enter and Space.
  await mensaCard.focus();
  await page.keyboard.press('Enter');
  await expect(mensaCard).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Space');
  await expect(mensaCard).toHaveAttribute('aria-pressed', 'false');

  expect(errors).toEqual([]);
});

test('persists "again" and "got it" progress in germandians:word-decks across reloads and clears via "Clear my entries"', async ({
  page,
}) => {
  const { errors } = attachRuntimeMonitors(page);
  await page.goto('/learn-german');
  await ready(page);

  const section = page.getByRole('region', { name: 'Everyday words by theme' });
  const statusLine = section.locator('[data-deck-progress]');
  await expect(statusLine).toContainText('0 of 6 marked in this deck');

  const mensaGroup = section.getByRole('group', { name: /die\s+Mensa/ });
  const vorlesungGroup = section.getByRole('group', { name: /die\s+Vorlesung/ });

  await mensaGroup.getByRole('button', { name: 'Got it', exact: true }).click();
  await vorlesungGroup.getByRole('button', { name: 'Again', exact: true }).click();

  await expect(mensaGroup.getByRole('button', { name: 'Got it', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(mensaGroup.getByRole('button', { name: 'Again', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(vorlesungGroup.getByRole('button', { name: 'Again', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(statusLine).toContainText('1 of 6 got it · 1 again in this deck');
  await expect(statusLine).toContainText('2 of 30 cards marked across all decks');

  // Switch to Wohnung and mark Warmmiete as "Got it".
  await section
    .getByRole('group', { name: 'Choose a word deck' })
    .getByRole('button', { name: /Wohnung/ })
    .click();
  const warmmieteGroup = section.getByRole('group', { name: /die\s+Warmmiete/ });
  await warmmieteGroup.getByRole('button', { name: 'Got it', exact: true }).focus();
  await page.keyboard.press('Enter');

  await expect(statusLine).toContainText('1 of 6 got it · 0 again in this deck');
  await expect(statusLine).toContainText('3 of 30 cards marked across all decks');

  const storedBeforeReload = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
  expect(storedBeforeReload).toEqual({
    version: 1,
    deck: 'wohnung',
    cards: {
      mensa: 'got it',
      vorlesung: 'again',
      warmmiete: 'got it',
    },
  });

  // Reload and confirm deck + card marks survive.
  await page.reload();
  await ready(page);

  await expect(
    section
      .getByRole('group', { name: 'Choose a word deck' })
      .getByRole('button', { name: /Wohnung/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    section
      .getByRole('group', { name: /die\s+Warmmiete/ })
      .getByRole('button', { name: 'Got it', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(statusLine).toContainText('1 of 6 got it · 0 again in this deck');
  await expect(statusLine).toContainText('3 of 30 cards marked across all decks');

  // Clear my entries removes storage and resets progress.
  await section.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await expect(statusLine).toContainText('0 of 6 marked in this deck');
  await expect(statusLine).toContainText('Saved only in this browser. Nothing is sent anywhere.');
  await expect(
    section
      .getByRole('group', { name: /die\s+Warmmiete/ })
      .getByRole('button', { name: 'Got it', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  expect(errors).toEqual([]);
});

test('drops an unknown stored card id and keeps progress on the known cards', async ({ page }) => {
  const { errors } = attachRuntimeMonitors(page);
  await page.goto('/learn-german');
  await ready(page);
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key, value),
    [
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        deck: 'uni',
        cards: { mensa: 'got it', nonexistent_word: 'got it' },
      }),
    ],
  );
  await page.reload();
  await ready(page);
  const section = page.getByRole('region', { name: 'Everyday words by theme' });
  await expect(section.locator('[data-deck-progress]')).toContainText(
    '1 of 6 got it · 0 again in this deck',
  );
  await expect(section.locator('[data-deck-progress]')).toContainText('1 of 30 cards marked across all decks');
  expect(errors).toEqual([]);
});

test('discards invalid stored shapes and handles unavailable storage gracefully', async ({
  browser,
  baseURL,
}) => {
  const invalidPayloads = [
    '{not-json',
    JSON.stringify({ version: 2, deck: 'uni', cards: { mensa: 'got it' } }),
    JSON.stringify({ version: 1, deck: 'invalid-deck', cards: { mensa: 'got it' } }),
    JSON.stringify({ version: 1, deck: 'uni', cards: { mensa: 'wrong-status' } }),
    JSON.stringify({ version: 1, deck: 'uni', cards: ['mensa'] }),
    JSON.stringify({ version: 1, deck: 'uni' }),
    JSON.stringify(['array']),
  ];

  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const { errors } = attachRuntimeMonitors(page);

  await page.goto('/learn-german');
  await ready(page);

  for (const bad of invalidPayloads) {
    await page.evaluate(
      ([key, value]) => {
        window.localStorage.setItem(key, value);
      },
      [STORAGE_KEY, bad],
    );
    await page.reload();
    await ready(page);
    expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
    await expect(page.locator('[data-deck-progress]')).toContainText('0 of 6 marked in this deck');
  }
  expect(errors).toEqual([]);
  await context.close();

  // Blocked localStorage falls back cleanly to in-memory state and announces the note.
  const blockedContext = await browser.newContext({ baseURL });
  await blockedContext.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Blocked storage', 'SecurityError');
      },
    });
  });
  const blockedPage = await blockedContext.newPage();
  const blockedMonitor = attachRuntimeMonitors(blockedPage);
  await blockedPage.goto('/learn-german');
  await ready(blockedPage);

  await expect(blockedPage.getByRole('alert')).toContainText('Browser storage is unavailable');
  const section = blockedPage.getByRole('region', { name: 'Everyday words by theme' });
  await section
    .getByRole('group', { name: /die\s+Mensa/ })
    .getByRole('button', { name: 'Got it', exact: true })
    .click();
  await expect(section.locator('[data-deck-progress]')).toContainText(
    '1 of 6 got it · 0 again in this deck',
  );
  expect(blockedMonitor.errors).toEqual([]);
  await blockedContext.close();
});

test('warns when clearing saved progress fails', async ({ page }) => {
  await page.goto('/learn-german');
  await ready(page);
  const section = page.getByRole('region', { name: 'Everyday words by theme' });
  await section.getByRole('group', { name: /die\s+Mensa/ }).getByRole('button', { name: 'Got it' }).click();
  await page.evaluate(() => {
    Storage.prototype.removeItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await section.getByRole('button', { name: 'Clear my entries' }).click();
  await expect(section.getByRole('alert')).toContainText('may not be saved or cleared');
  await expect(section.locator('[data-deck-progress]')).toContainText('0 of 6 marked');
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();
});

test('switches card faces by keyboard without animation under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learn-german');
  await ready(page);
  const card = page.getByRole('region', { name: 'Everyday words by theme' }).getByRole('button', { name: /Mensa/ });
  const faces = card.locator(':scope > span > span');
  await expect(faces.nth(0)).toHaveCSS('opacity', '1');
  await expect(faces.nth(1)).toHaveCSS('opacity', '0');
  await card.focus();
  await page.keyboard.press('Space');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await expect(faces.nth(0)).toHaveCSS('opacity', '0');
  await expect(faces.nth(1)).toHaveCSS('opacity', '1');
  await expect(card.locator(':scope > span')).toHaveCSS('transition-duration', '0s');
  await expect(card).toHaveAccessibleName(/the university canteen/);
});

for (const [width, height] of [
  [320, 720],
  [390, 844],
  [768, 1024],
  [1024, 900],
  [1440, 900],
] as const) {
  test(`responsive layout, ≥44px touch targets and axe accessibility at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: width <= 1024,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const { errors } = attachRuntimeMonitors(page);

    await page.goto('/learn-german');
    await ready(page);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);

    const section = page.getByRole('region', { name: 'Everyday words by theme' });
    const buttons = section.getByRole('button');
    const count = await buttons.count();
    expect(count).toBe(5 + 1 + 6 * 3); // 5 decks + Clear my entries + 6 cards * (flip + Again + Got it)

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box, `button ${i} at ${width}px`).not.toBeNull();
      expect(box!.width, `button ${i} width at ${width}px`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `button ${i} height at ${width}px`).toBeGreaterThanOrEqual(44);
      expect(box!.x, `button ${i} left edge at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, `button ${i} right edge at ${width}px`).toBeLessThanOrEqual(
        width + 0.5,
      );
    }

    const axe = await new AxeBuilder({ page })
      .include('[aria-labelledby="learn-german-words"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(axe.violations).toEqual([]);

    expect(errors).toEqual([]);
    await context.close();
  });
}

test('print media hides deck controls and shows both faces of every card on paper', async ({
  page,
}) => {
  await page.goto('/learn-german');
  await ready(page);
  await page.emulateMedia({ media: 'print' });

  const section = page.getByRole('region', { name: 'Everyday words by theme' });
  await expect(section.getByRole('group', { name: 'Choose a word deck' })).toBeHidden();
  await expect(section.getByRole('button', { name: 'Clear my entries', exact: true })).toBeHidden();
  await expect(section.getByText('Mensa', { exact: true })).toBeVisible();
  await expect(section.getByText('the university canteen', { exact: true })).toBeVisible();
  const thirdFrontBg = await section
    .locator('[data-word="kommilitone"] > span > span')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(thirdFrontBg).toBe('rgba(0, 0, 0, 0)');
});
