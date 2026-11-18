import { readFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import type { EquationTask, FigureTask, LatinTask } from '../../src/utils/dmat/types';

const storageKey = 'germandians:dmat-practice';
const historyKey = 'germandians:dmat-history';
const readMock = (section: string, mock = 1): unknown => JSON.parse(readFileSync(
  new URL(`../../src/pages/DmatPractice/bank/${section}-mock${mock === 1 ? '' : `-${mock}`}.json`, import.meta.url), 'utf8',
));
const equations = readMock('equations') as EquationTask[];
const figures = readMock('figures') as FigureTask[];
const latin = readMock('latin') as LatinTask[];
const figuresMock2 = readMock('figures', 2) as FigureTask[];
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

async function endSection(page: Page, name = 'End section') {
  await button(page, name).click();
  await page.getByRole('dialog').getByRole('button', { name, exact: true }).click();
}

async function selectByKeyboard(control: ReturnType<Page['getByRole']>) {
  await control.focus();
  await control.press('Space');
  await expect(control).toBeChecked();
}

async function expectNoSidewaysScroll(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
}

test.beforeEach(async ({ page }) => {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  await page.route('**/*', (route) => new URL(route.request().url()).origin === origin
    ? route.continue()
    : route.abort());
  await page.goto('dmat/practice/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
});

test('a full mock accepts keyboard answers and keeps the record on this device', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const requests: { url: string; method: string; data: string | null }[] = [];
  page.on('request', (request) => requests.push({
    url: request.url(),
    method: request.method(),
    data: request.postData(),
  }));
  await expect(page.getByRole('heading', { level: 1, name: 'dMAT practice' })).toBeVisible();
  await expectNoSidewaysScroll(page);
  await button(page, 'Start the full mock').press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Figure Sequences' })).toBeVisible();
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await expect(page.locator('#contact-form')).toHaveCount(0);
  await expectNoSidewaysScroll(page);

  const matrices = ['Fifth matrix', 'Sixth matrix'];
  for (const [index, group] of matrices.entries()) {
    await selectByKeyboard(page.getByRole('radiogroup', { name: group, exact: true }).getByRole('radio', { name: `Option ${figures[0].answer[index] + 1}`, exact: true }));
  }
  await button(page, 'Next').press('Enter');
  await selectByKeyboard(page.getByRole('radiogroup', { name: 'Fifth matrix', exact: true }).getByRole('radio', { name: `Option ${figures[1].answer[0] + 1}`, exact: true }));
  await endSection(page);
  await expectNoSidewaysScroll(page);
  await button(page, 'Start now').click();

  const fields = page.getByRole('textbox', { name: /^[A-E] =$/ });
  await expect(fields.first()).toBeVisible();
  await expectNoSidewaysScroll(page);
  for (const [letter, value] of Object.entries(equations[0].solution)) {
    await page.getByRole('textbox', { name: `${letter} =`, exact: true }).pressSequentially(String(value));
  }
  await button(page, 'Next').press('Enter');
  const [letter, value] = Object.entries(equations[1].solution)[0];
  await page.getByRole('textbox', { name: `${letter} =`, exact: true }).pressSequentially(String(value));
  await endSection(page);
  await expectNoSidewaysScroll(page);
  await button(page, 'Start now').click();

  const wrongLetter = latin[0].answer === 'A' ? 'B' : 'A';
  await selectByKeyboard(page.getByRole('radiogroup', { name: 'Which letter replaces the question mark?' }).getByRole('radio', { name: wrongLetter, exact: true }));
  await expectNoSidewaysScroll(page);
  await endSection(page);
  await expectNoSidewaysScroll(page);
  await button(page, 'Start the academic module').click();

  const question = page.locator('main details > summary').filter({ hasText: /^Question 1(?!\d)/ }).first();
  await question.press('Enter');
  const firstOption = question.locator('..').getByRole('radio').first();
  await selectByKeyboard(firstOption);
  await expectNoSidewaysScroll(page);
  await endSection(page, 'End module');

  await expect(page.getByRole('heading', { level: 1, name: 'Practice record' })).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByText('Practice record. Not a dMAT result.')).toBeVisible();
  await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
  await expectNoSidewaysScroll(page);
  await expect(page.getByText('1 of 20', { exact: true })).toHaveCount(2);
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(Object.keys(stored.answers)).toHaveLength(6);
  expect(stored.finishedAt).toEqual(expect.any(Number));
  const ids = Object.keys(stored.answers);
  expect(requests.every(({ method, data }) => method === 'GET' && data === null)).toBe(true);
  for (const { url } of requests) {
    expect(new URL(url).search).toBe('');
    expect(ids.some((id) => url.includes(id))).toBe(false);
  }

  await page.locator('main details > summary').filter({ hasText: /^General Academic Module$/ }).click();
  await question.press('Enter');
  const reviewed = question.locator('..');
  await expect(reviewed.getByText('Worked solution', { exact: true })).toHaveCount(1);
  await expect(reviewed.getByRole('link', { name: 'Report a problem with this question' })).toBeVisible();
});

test('one section can end early and its record can be discarded', async ({ page }) => {
  await page.getByRole('radio', { name: 'One section', exact: true }).check();
  await page.getByRole('radio', { name: 'Latin Squares', exact: true }).check();
  await button(page, 'Start the section').click();
  await button(page, 'Leave test').click();
  await button(page, 'Leave and see my record').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Practice record' })).toBeVisible();
  await page.reload();
  const waiting = page.getByRole('region', { name: 'Unfinished practice' });
  await waiting.getByRole('button', { name: 'Discard', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(waiting).toHaveCount(0);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
});

test('untimed practice checks an answer and advances to a different task', async ({ page }) => {
  await page.getByRole('radio', { name: 'Practice', exact: true }).check();
  await page.getByRole('radio', { name: 'Latin Squares', exact: true }).check();
  await button(page, 'Start practising').click();
  await expect(page.getByRole('timer')).toHaveCount(0);
  await selectByKeyboard(page.getByRole('radiogroup', { name: 'Which letter replaces the question mark?' }).getByRole('radio', { name: 'A', exact: true }));
  await button(page, 'Check answer').click();
  await expect(button(page, 'Next task')).toBeVisible();
  await button(page, 'Next task').click();
  await expect(button(page, 'Check answer')).toBeVisible();
});

test('a test screen that fails to load offers Try again, which loads it', async ({ page }) => {
  let offline = true;
  await page.route('**/assets/Runner-*.js', (route) => offline ? route.abort() : route.fallback());
  await button(page, 'Start the full mock').click();
  await expect(page.getByRole('alert')).toHaveText('The tasks did not load. Check your connection and try again.');
  offline = false;
  await button(page, 'Try again').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Figure Sequences' })).toBeVisible();
});

test('finishing a section records history, runs mistakes untimed with explanations, keeps history on restart, and clears it', async ({ page }) => {
  await page.getByRole('radio', { name: 'One section', exact: true }).check();
  await page.getByRole('radio', { name: 'Latin Squares', exact: true }).check();
  await button(page, 'Start the section').click();

  await selectByKeyboard(
    page.getByRole('radiogroup', { name: 'Which letter replaces the question mark?' })
      .getByRole('radio', { name: latin[0].answer, exact: true }),
  );
  await button(page, 'Next').click();

  const wrongLetter = latin[1].answer === 'A' ? 'B' : 'A';
  await selectByKeyboard(
    page.getByRole('radiogroup', { name: 'Which letter replaces the question mark?' })
      .getByRole('radio', { name: wrongLetter, exact: true }),
  );
  await endSection(page);

  await expect(page.getByRole('heading', { level: 1, name: 'Practice record' })).toBeVisible();
  const historyRegion = page.getByRole('region', { name: 'Past attempts' });
  await expect(historyRegion).toBeVisible();
  await expect(historyRegion.getByRole('heading', { level: 3, name: 'Mock 1' })).toBeVisible();
  await expect(historyRegion.getByRole('heading', { level: 4, name: 'Latin Squares' })).toBeVisible();
  await expect(historyRegion.getByText('1 right of 2 done', { exact: true })).toBeVisible();

  const storedHistory = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), historyKey);
  expect(storedHistory).toHaveLength(1);
  expect(storedHistory[0]).toMatchObject({
    mode: 'section',
    mock: 1,
    section: 'latin',
    right: 1,
    done: 2,
  });

  await button(page, 'Practise my mistakes').click();
  await expect(page.getByRole('timer')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: 'Task 1 of 1', exact: true })).toBeVisible();

  await selectByKeyboard(
    page.getByRole('radiogroup', { name: 'Which letter replaces the question mark?' })
      .getByRole('radio', { name: latin[1].answer, exact: true }),
  );
  await button(page, 'Check answer').click();
  await expect(page.getByRole('region', { name: 'Worked solution' })).toBeVisible();
  await expect(page.getByText('1 right so far', { exact: true })).toBeVisible();
  await button(page, 'Finish practising').click();

  await expect(page.getByRole('heading', { level: 1, name: 'Practice record' })).toBeVisible();
  await button(page, 'Start another').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Discard and start another', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Past attempts' })).toBeVisible();

  await button(page, 'Start the full mock').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Figure Sequences' })).toBeVisible();
  const historyDuringNewMock = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), historyKey);
  expect(historyDuringNewMock.length).toBeGreaterThanOrEqual(2);

  await button(page, 'Leave test').click();
  await button(page, 'Leave and see my record').click();
  await expect(page.getByRole('region', { name: 'Past attempts' })).toBeVisible();

  await button(page, 'Clear my practice history').click();
  await expect(page.getByRole('region', { name: 'Past attempts' })).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Your practice history has been cleared' })).toBeFocused();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), historyKey)).toBeNull();
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.getByRole('region', { name: 'Unfinished practice' }).getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Practice record' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Past attempts' })).toHaveCount(0);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), historyKey)).toBeNull();
});

test('choosing Mock 2 loads Mock 2 tasks on demand without fetching Mock 1', async ({ page }) => {
  const assetUrls: string[] = [];
  page.on('request', (request) => assetUrls.push(request.url()));

  await expect(page.getByText('There are four full academic sections, one per mock. If you take a full mock, you will have seen its academic section.')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Mock 3', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Mock 4', exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Mock 2', exact: true }).check();
  await button(page, 'Start the full mock').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Figure Sequences' })).toBeVisible();
  await expect(page.getByText('Mock 2 · Core Module · part 1 of 3', { exact: true })).toBeVisible();
  expect(assetUrls.some((url) => url.includes('figures-mock-2'))).toBe(true);
  // Mock 1's chunks are named `<section>-mock-<hash>`; the other mocks carry their number before the hash.
  expect(assetUrls.filter((url) => /(?:figures|equations|latin|academic)-mock(?!-2[-.])/.test(url))).toEqual([]);

  const matrices = ['Fifth matrix', 'Sixth matrix'];
  for (const [index, group] of matrices.entries()) {
    await selectByKeyboard(
      page.getByRole('radiogroup', { name: group, exact: true })
        .getByRole('radio', { name: `Option ${figuresMock2[0].answer[index] + 1}`, exact: true }),
    );
  }
  await button(page, 'Leave test').click();
  await button(page, 'Leave and see my record').click();

  await expect(page.getByRole('heading', { level: 1, name: 'Practice record' })).toBeVisible();
  await expect(page.getByText('Full mock · Mock 2', { exact: true })).toBeVisible();
  const historyRegion = page.getByRole('region', { name: 'Past attempts' });
  await expect(historyRegion.getByRole('heading', { level: 3, name: 'Mock 2' })).toBeVisible();
  await expect(historyRegion.getByText('1 right of 1 done', { exact: true })).toBeVisible();
});

test('a blocked history deletion leaves the saved attempts visible and reports the failure', async ({ page }) => {
  const attempt = {
    id: 'saved-attempt', mode: 'section', mock: 1, section: 'latin',
    date: '2026-11-18T00:00:00.000Z', right: 1, done: 2,
    sections: [{ section: 'latin', right: 1, done: 2 }],
  };
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify([value])), { key: historyKey, value: attempt });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate((key) => {
    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (name) {
      if (name === key) throw new DOMException('Blocked', 'SecurityError');
      return original.call(this, name);
    };
  }, historyKey);
  await button(page, 'Clear my practice history').click();
  await expect(page.getByRole('region', { name: 'Past attempts' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Your practice history could not be cleared');
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).length, historyKey)).toBe(1);
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await button(page, 'Clear my practice history').click();
  await expect(page.getByRole('region', { name: 'Past attempts' })).toHaveCount(0);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), historyKey)).toBeNull();
});

test('corrupted history is discarded, mock controls fit across widths, and history caps at 50 attempts', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, '{"broken":true}'), historyKey);
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), historyKey)).toBeNull();

  const fiftyFive = Array.from({ length: 55 }, (_item, index) => ({
    id: `seed-${index}`,
    mode: 'section',
    mock: 1,
    section: 'figures',
    date: new Date(Date.UTC(2026, 10, 18, 0, index)).toISOString(),
    right: 5,
    done: 10,
    sections: [{ section: 'figures', right: 5, done: 10 }],
  }));
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: historyKey,
    value: fiftyFive,
  });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await page.getByRole('radio', { name: 'One section', exact: true }).check();
  await page.getByRole('radio', { name: 'Mock 2', exact: true }).check();

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 840 });
    await expectNoSidewaysScroll(page);
    if (width <= 768) {
      for (const name of ['Mock 1', 'Mock 4']) {
        const optionBox = await page.getByRole('radio', { name, exact: true }).locator('xpath=..').boundingBox();
        expect(optionBox).not.toBeNull();
        expect(optionBox!.height).toBeGreaterThanOrEqual(44);
      }
      const clearBox = await button(page, 'Clear my practice history').boundingBox();
      expect(clearBox).not.toBeNull();
      expect(clearBox!.height).toBeGreaterThanOrEqual(44);
    }
  }

  await button(page, 'Start the section').click();
  // An attempt with no task done is not recorded, so answer one task before leaving.
  for (const [index, group] of ['Fifth matrix', 'Sixth matrix'].entries()) {
    await selectByKeyboard(
      page.getByRole('radiogroup', { name: group, exact: true })
        .getByRole('radio', { name: `Option ${figuresMock2[0].answer[index] + 1}`, exact: true }),
    );
  }
  await button(page, 'Leave test').click();
  await button(page, 'Leave and see my record').click();

  // The stored list starts at 55 entries; recording the new attempt keeps the newest 50.
  await expect.poll(() => page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!)[0].mock,
    historyKey,
  )).toBe(2);
  const capped = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), historyKey);
  expect(capped).toHaveLength(50);
  expect(capped[0]).toMatchObject({ mode: 'section', mock: 2, section: 'figures', right: 1, done: 1 });
});
