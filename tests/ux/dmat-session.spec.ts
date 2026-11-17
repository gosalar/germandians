import { expect, test, type Page } from '@playwright/test';

import { createSession, endSection, startNext } from '../../src/utils/dmat/session';
import type { Session } from '../../src/utils/dmat/session';
import { STORAGE_KEY } from '../../src/utils/dmat/storage';

const endpoint = 'https://enquiries.example.test/profile';
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
