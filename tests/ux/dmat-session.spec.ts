import { readFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { createSession, endSection, startNext } from '../../src/utils/dmat/session';
import type { Session } from '../../src/utils/dmat/session';
import { STORAGE_KEY } from '../../src/utils/dmat/storage';
import { UX_ENDPOINTS } from './endpoints';

const endpoint = UX_ENDPOINTS.profileReview;
const now = new Date('2026-11-17T10:00:00Z');
const minute = 60_000;

async function seed(page: Page, session: Session) {
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: STORAGE_KEY, value: session });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}

async function startFull(page: Page) {
  await page.getByRole('radio', { name: 'Full mock', exact: true }).check();
  await page.getByRole('button', { name: 'Start the full mock', exact: true }).click();
  await expect(page.getByRole('timer')).toHaveText('25:00');
}

test.beforeEach(async ({ page }) => {
  // Even a future form change must never send an enquiry from these tests.
  await page.route(endpoint, route => route.abort());
  await page.clock.install({ time: new Date(now.getTime() - minute) });
  await page.goto('/dmat/practice');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.clock.pauseAt(now);
});

test('a Core deadline ends the section and its pause starts the next full clock', async ({ page }) => {
  await startFull(page);
  await page.clock.fastForward(25 * minute - 1000);
  await expect(page.getByRole('timer')).toHaveText('00:01');
  await page.clock.fastForward(1000);
  await expect(page.getByRole('button', { name: 'Start now', exact: true })).toBeVisible();
  await expect(page.getByRole('timer')).toHaveText('02:00');
  await page.clock.fastForward(2 * minute);
  await expect(page.getByRole('timer')).toHaveText('25:00');
  await expect(page.getByRole('button', { name: 'Start now', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'A =', exact: true })).toBeVisible();
});

test('Start now skips only the pause and gives the next section its full time', async ({ page }) => {
  await startFull(page);
  await page.clock.fastForward(25 * minute);
  await page.getByRole('button', { name: 'Start now', exact: true }).click();
  await expect(page.getByRole('timer')).toHaveText('25:00');
  await page.clock.fastForward(minute);
  await expect(page.getByRole('timer')).toHaveText('24:00');
});

test('the break counts down, stays at zero, and waits for the academic start', async ({ page }) => {
  await startFull(page);
  await page.clock.fastForward(79 * minute);
  await expect(page.getByRole('timer')).toHaveText('30:00');
  await page.clock.fastForward(30 * minute);
  await expect(page.getByRole('timer')).toHaveText('00:00');
  await page.clock.fastForward(60 * minute);
  await expect(page.getByRole('timer')).toHaveText('00:00');
  await page.getByRole('button', { name: 'Start the academic module', exact: true }).click();
  await expect(page.getByRole('timer')).toHaveText('90:00');
});

test('reloading keeps the current task and accounts for time while away', async ({ page }) => {
  await startFull(page);
  const fourthTask = page.getByRole('group', { name: 'Tasks in this section', exact: true })
    .getByRole('button', { name: /^Task 4(?:,|$)/ });
  await fourthTask.click();
  const option = page.getByRole('radiogroup', { name: 'Fifth matrix', exact: true })
    .getByRole('radio', { name: 'Option 2', exact: true });
  await option.check();
  await page.clock.fastForward(5 * minute);
  await expect(page.getByRole('timer')).toHaveText('20:00');
  // Change wall time without running callbacks: this models a closed/background page.
  await page.clock.setFixedTime(new Date(now.getTime() + 10 * minute));
  await page.reload();
  await expect(page.getByRole('timer')).toHaveText('15:00');
  await expect(option).toBeChecked();
  await expect(fourthTask).toHaveAttribute('aria-current', 'step');
});

test('return after the final started section expires offers the finished record', async ({ page }) => {
  const began = now.getTime() - 180 * minute;
  let session = createSession('full', {}, began, false);
  for (const elapsed of [1, 2, 3]) {
    session = endSection(session, began + elapsed * minute);
    session = startNext(session, began + elapsed * minute);
  }
  await seed(page, session);
  const banner = page.getByRole('region', { name: 'Unfinished practice', exact: true });
  await expect(banner).toBeVisible();
  await expect(page.getByRole('timer')).toHaveCount(0);
  await banner.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Practice record', exact: true })).toBeVisible();
});

test('an entry older than seven days is removed before the start page offers it', async ({ page }) => {
  await seed(page, createSession('full', {}, now.getTime() - 8 * 24 * 60 * minute, false));
  await expect(page.getByRole('button', { name: 'Start the full mock', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Unfinished practice', exact: true })).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
});

test('a session saved before mock numbers existed loads as Mock 1', async ({ page }) => {
  const base = createSession('full', {}, now.getTime() - 3 * minute, false);
  const legacyFull = {
    ...base,
    sections: base.sections.map(({ id, setId, startedAt, endedAt, endedBy }) => ({
      id, setId, startedAt, endedAt, endedBy,
    })),
  };
  delete legacyFull.mock;

  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: STORAGE_KEY,
    value: legacyFull,
  });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await expect(page.getByRole('timer')).toHaveText('22:00');
  await expect(page.getByText('Mock 1 · Core Module · part 1 of 3', { exact: true })).toBeVisible();

  await page.getByRole('radiogroup', { name: 'Fifth matrix', exact: true })
    .getByRole('radio', { name: 'Option 1', exact: true })
    .check();
  const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(persisted.mock).toBe(1);
});

test('a saved v1 figure session replays its original choice, explanation and marking, while a new attempt uses revised figures', async ({ page }) => {
  // Baseline v1 fixture captured before regenerating figures: Mock 1 Figure Sequences, partly completed
  // (Task 1 mock-F-l2 right; Task 7 mock-F-m25 wrong on fifth matrix at index 1; figureRevision omitted).
  const began = now.getTime() - 5 * minute;
  const legacyFixture = {
    version: 1,
    mode: 'section',
    mock: 1,
    sections: [
      { id: 'figures', setId: 'mock', mock: 1, startedAt: began, endedAt: null, endedBy: null },
    ],
    breakStartedAt: null,
    practiceTag: null,
    practiceIds: null,
    answers: {
      'mock-F-l2': { kind: 'figures', picks: [0, 2] },
      'mock-F-m25': { kind: 'figures', picks: [1, 0] },
    },
    marked: [],
    checked: [],
    position: { figures: 6 },
    timeOn: {},
    shownAt: began,
    textSize: 0,
    createdAt: began,
    finishedAt: null,
    returning: false,
  };

  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: STORAGE_KEY,
    value: legacyFixture,
  });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  // Active clock, task position, saved wrong option and original legacy frame description survive intact.
  await expect(page.getByRole('timer')).toHaveText('20:00');
  await expect(page.getByRole('heading', { level: 2, name: 'Task 7 of 20', exact: true })).toBeVisible();
  const fifthGroup = page.getByRole('radiogroup', { name: 'Fifth matrix', exact: true });
  const option2 = fifthGroup.getByRole('radio', { name: 'Option 2', exact: true });
  await expect(option2).toBeChecked();
  await expect(option2).toHaveAccessibleDescription(
    'black trapezoid in row 2, column 2, pointing up; black hexagon in row 3, column 1, pointing right',
  );
  expect(requests.some((url) => url.includes('legacy-v1-figures-mock'))).toBe(true);
  expect(requests.some((url) => url.includes('legacy-v1-figures-mock-2'))).toBe(false);

  // Finish the legacy section and verify marking + original legacy explanation in the review.
  await page.getByRole('button', { name: 'End section', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'End section', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Practice record', exact: true })).toBeVisible();
  await expect(page.getByText('1 of 20', { exact: true })).toBeVisible();

  await page.locator('main details > summary').filter({ hasText: /^Figure Sequences$/ }).click();
  const task7Review = page.locator('article').filter({ has: page.getByRole('heading', { level: 3, name: 'Task 7', exact: true }) });
  await expect(task7Review).toContainText('Your answer: Option 2');
  await expect(task7Review).toContainText('Correct answer: Option 1');
  await expect(task7Review).toContainText('Fifth matrix: the hexagon bounces back at the corner instead of going round it');

  // "Practise my mistakes" from this legacy record preserves revision 1 so the missed item reflects that record.
  await page.getByRole('button', { name: 'Practise my mistakes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Task 1 of 1', exact: true })).toBeVisible();
  const mistakesStored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(mistakesStored.figureRevision).toBe(1);
  await page.getByRole('radiogroup', { name: 'Fifth matrix', exact: true }).getByRole('radio', { name: 'Option 2', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Sixth matrix', exact: true }).getByRole('radio', { name: 'Option 1', exact: true }).check();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Worked solution', exact: true })).toContainText(
    'Fifth matrix: the hexagon bounces back at the corner instead of going round it',
  );
  await page.getByRole('button', { name: 'Finish practising', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Practice record', exact: true })).toBeVisible();

  // In the same browser, starting a new attempt uses revision 2 (revised figures) without fetching legacy chunks.
  await page.getByRole('button', { name: 'Start another', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Discard and start another', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'dMAT practice', exact: true })).toBeVisible();

  requests.length = 0;
  await page.getByRole('radio', { name: 'One section', exact: true }).check();
  await page.getByRole('radio', { name: 'Figure Sequences', exact: true }).check();
  await page.getByRole('button', { name: 'Start the section', exact: true }).click();
  await page.clock.fastForward(1000);
  await expect(page.getByRole('heading', { level: 1, name: 'Figure Sequences', exact: true })).toBeVisible();

  const revisedStored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(revisedStored.figureRevision).toBe(2);
  expect(requests.filter((url) => url.includes('legacy-v1'))).toEqual([]);

  await page.getByRole('group', { name: 'Tasks in this section', exact: true })
    .getByRole('button', { name: /^Task 7(?:,|$)/ })
    .click();
  // The current bank's choices differ from the legacy ones the saved session showed.
  const currentFigures = JSON.parse(readFileSync(
    new URL('../../src/pages/DmatPractice/bank/figures-mock.json', import.meta.url), 'utf8',
  )) as { id: string; options5: { mistake: string | null }[] }[];
  const revisedMistake = currentFigures.find((task) => task.id === 'mock-F-m25')!.options5[1].mistake!;
  const revisedOption2 = page.getByRole('radiogroup', { name: 'Fifth matrix', exact: true })
    .getByRole('radio', { name: 'Option 2', exact: true });
  await expect(revisedOption2).not.toHaveAccessibleDescription(
    'black trapezoid in row 2, column 2, pointing up; black hexagon in row 3, column 1, pointing right',
  );
  await revisedOption2.check();
  await page.getByRole('radiogroup', { name: 'Sixth matrix', exact: true }).getByRole('radio', { name: 'Option 1', exact: true }).check();
  await page.getByRole('button', { name: 'End section', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'End section', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Practice record', exact: true })).toBeVisible();

  await page.locator('main details > summary').filter({ hasText: /^Figure Sequences$/ }).click();
  const revisedTask7 = page.locator('article').filter({ has: page.getByRole('heading', { level: 3, name: 'Task 7', exact: true }) });
  await expect(revisedTask7).toContainText(`Fifth matrix: ${revisedMistake}`);
});

test('an invalid figureRevision is rejected and an expired legacy v1 session is removed', async ({ page }) => {
  const badRevision = { ...createSession('full', {}, now.getTime() - minute, false), figureRevision: 99 };
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: STORAGE_KEY,
    value: badRevision,
  });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(page.getByRole('button', { name: 'Start the full mock', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  const expiredLegacy = createSession('full', {}, now.getTime() - 8 * 24 * 60 * minute, false);
  delete expiredLegacy.figureRevision;
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: STORAGE_KEY,
    value: expiredLegacy,
  });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(page.getByRole('region', { name: 'Unfinished practice', exact: true })).toHaveCount(0);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
});
