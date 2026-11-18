import { readFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import type { EquationTask, FigureTask, LatinTask } from '../../src/utils/dmat/types';

const storageKey = 'germandians:dmat-practice';
const readMock = (section: string): unknown => JSON.parse(readFileSync(
  new URL(`../../src/pages/DmatPractice/bank/${section}-mock.json`, import.meta.url), 'utf8',
));
const equations = readMock('equations') as EquationTask[];
const figures = readMock('figures') as FigureTask[];
const latin = readMock('latin') as LatinTask[];
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
