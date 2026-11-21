import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

import {
  RECOVERY_STORAGE_KEY,
  STORAGE_KEY,
  STORAGE_LOCK_NAME,
} from '../../src/utils/sopPlanner/storage.ts';
import { UX_ENDPOINTS } from './endpoints.ts';

async function waitForHydration(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

async function openSopTab(context: BrowserContext): Promise<Page> {
  const tab = await context.newPage();
  await tab.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await tab.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
  await tab.goto('/sop-planner');
  await waitForHydration(tab);
  return tab;
}

async function holdStorageLock(page: Page): Promise<() => Promise<void>> {
  await page.evaluate(
    (lockName) =>
      new Promise<void>((resolveAcquired) => {
        const w = window as unknown as { __releaseSopTestLock?: () => void };
        void navigator.locks.request(lockName, () => {
          resolveAcquired();
          return new Promise<void>((resolveRelease) => {
            w.__releaseSopTestLock = resolveRelease;
          });
        });
      }),
    STORAGE_LOCK_NAME,
  );
  return async () => {
    await page.evaluate(() => {
      const w = window as unknown as { __releaseSopTestLock?: () => void };
      w.__releaseSopTestLock?.();
      delete w.__releaseSopTestLock;
    });
  };
}

async function waitForPendingLockCount(page: Page, expected: number): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(async (lockName) => {
        const snapshot = await navigator.locks.query();
        return (snapshot.pending ?? []).filter((item) => item.name === lockName).length;
      }, STORAGE_LOCK_NAME),
    )
    .toBe(expected);
}

async function waitForStorageLocksIdle(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(async (lockName) => {
        const snapshot = await navigator.locks.query();
        const held = (snapshot.held ?? []).filter((item) => item.name === lockName).length;
        const pending = (snapshot.pending ?? []).filter((item) => item.name === lockName).length;
        return held + pending;
      }, STORAGE_LOCK_NAME),
    )
    .toBe(0);
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

test('two tabs in one browser context keep edits to different sections', async ({
  context,
  page,
}) => {
  const issuesA = captureConsoleIssues(page);
  const other = await openSopTab(context);
  const issuesB = captureConsoleIssues(other);

  await page.goto('/sop-planner');
  await waitForHydration(page);

  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Sample engineering project');
  await other.getByRole('textbox', { name: 'What comes next' }).fill('Sample research direction');

  await page.reload();
  await waitForHydration(page);

  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Sample engineering project',
  );
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Sample research direction',
  );
  expect(issuesA).toEqual([]);
  expect(issuesB).toEqual([]);
  await other.close();
});

test('near-simultaneous edits to different sections merge cleanly and keep the cursor steady', async ({
  context,
  page,
}) => {
  const issuesA = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);
  const other = await openSopTab(context);
  const issuesB = captureConsoleIssues(other);

  // Hold the named storage lock so both tabs queue edits to different sections concurrently.
  const releaseLock = await holdStorageLock(page);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Concurrent subject notes');
  await waitForPendingLockCount(page, 1);
  await other.getByRole('textbox', { name: "What I've done beyond it" }).fill('Concurrent lab rig');
  await waitForPendingLockCount(page, 2);
  await releaseLock();
  await waitForStorageLocksIdle(page);

  await expect(page.getByRole('textbox', { name: "What I've done beyond it" })).toHaveValue(
    'Concurrent lab rig',
  );
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Concurrent subject notes',
  );

  // Place the cursor inside Part 1 in Tab A, then edit Part 5 in Tab B: Tab A updates Part 5
  // without moving focus or cursor position in Part 1.
  const part1A = page.getByRole('textbox', { name: 'Why this subject' });
  await part1A.focus();
  await part1A.evaluate((el: HTMLTextAreaElement) => {
    el.setSelectionRange(10, 10);
  });

  await other.getByRole('textbox', { name: 'What comes next' }).fill('Industrial fluid testing');
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Industrial fluid testing',
  );

  const cursorAfter = await page.evaluate(() => {
    const active = document.activeElement as HTMLTextAreaElement | null;
    return {
      id: active?.id ?? null,
      start: active?.selectionStart ?? null,
      end: active?.selectionEnd ?? null,
    };
  });
  expect(cursorAfter).toEqual({ id: 'sop-input-why-subject', start: 10, end: 10 });

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Concurrent subject notes',
  );
  await expect(page.getByRole('textbox', { name: "What I've done beyond it" })).toHaveValue(
    'Concurrent lab rig',
  );
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Industrial fluid testing',
  );

  expect(issuesA).toEqual([]);
  expect(issuesB).toEqual([]);
  await other.close();
});

test('same-section conflict surfaces both copyable versions, survives reload and unrelated edits, and resolves both ways', async ({
  context,
  page,
}) => {
  const issuesA = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);

  // Start both editors from identical persisted text plus an unrelated section.
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Shared starting text');
  await page
    .getByRole('textbox', { name: 'What my record shows (including the hard semesters)' })
    .fill('Unrelated record notes');
  await waitForStorageLocksIdle(page);

  const other = await openSopTab(context);
  const issuesB = captureConsoleIssues(other);
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Shared starting text',
  );
  await expect(
    other.getByRole('textbox', { name: 'What my record shows (including the hard semesters)' }),
  ).toHaveValue('Unrelated record notes');

  // Hold lock so Tab A saves first and Tab B hits a conflict on the same section.
  const releaseFirst = await holdStorageLock(page);
  await waitForPendingLockCount(page, 0);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Version saved in tab A');
  await waitForPendingLockCount(page, 1);
  await other.getByRole('textbox', { name: 'Why this subject' }).fill('Version typed in tab B');
  await waitForPendingLockCount(page, 2);
  await releaseFirst();
  await waitForStorageLocksIdle(page);

  const conflictB = other.getByTestId('conflict-why-subject');
  await expect(conflictB).toBeVisible();
  await expect(conflictB.getByLabel('Your text (this tab)')).toHaveValue('Version typed in tab B');
  await expect(conflictB.getByLabel('Text from the other tab')).toHaveValue(
    'Version saved in tab A',
  );
  await expect(
    other.getByRole('textbox', { name: 'What my record shows (including the hard semesters)' }),
  ).toHaveValue('Unrelated record notes');

  // Conflict UI passes axe accessibility checks.
  const axe = await new AxeBuilder({ page: other })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(axe.violations).toEqual([]);

  // Pending conflict survives typing in a different section.
  await other.getByRole('textbox', { name: 'What comes next' }).fill('Thermal systems R&D');
  await waitForStorageLocksIdle(other);
  await expect(conflictB).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Thermal systems R&D',
  );

  // Reloading Tab B preserves both versions durably until resolved.
  await other.reload();
  await waitForHydration(other);
  const conflictAfterReload = other.getByTestId('conflict-why-subject');
  await expect(conflictAfterReload).toBeVisible();
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Version typed in tab B',
  );
  await expect(conflictAfterReload.getByLabel('Your text (this tab)')).toHaveValue(
    'Version typed in tab B',
  );
  await expect(conflictAfterReload.getByLabel('Text from the other tab')).toHaveValue(
    'Version saved in tab A',
  );

  // Resolution 1: "Use my text" saves Tab B's version, clears recovery, and keeps unrelated fields.
  await conflictAfterReload.getByRole('button', { name: 'Use my text', exact: true }).click();
  await expect(conflictAfterReload).toHaveCount(0);
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toBeFocused();
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Version typed in tab B',
  );
  expect(
    await other.evaluate((key) => window.localStorage.getItem(key), RECOVERY_STORAGE_KEY),
  ).toBeNull();

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Version typed in tab B',
  );
  await expect(
    page.getByRole('textbox', { name: 'What my record shows (including the hard semesters)' }),
  ).toHaveValue('Unrelated record notes');
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Thermal systems R&D',
  );

  // Resolution 2: "Use text from the other tab" adopts the saved version cleanly.
  const releaseSecond = await holdStorageLock(page);
  await waitForPendingLockCount(page, 0);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Second round in tab A');
  await waitForPendingLockCount(page, 1);
  await other.getByRole('textbox', { name: 'Why this subject' }).fill('Second round in tab B');
  await waitForPendingLockCount(page, 2);
  await releaseSecond();
  await waitForStorageLocksIdle(page);

  const secondConflict = other.getByTestId('conflict-why-subject');
  await expect(secondConflict).toBeVisible();
  await expect(secondConflict.getByLabel('Your text (this tab)')).toHaveValue(
    'Second round in tab B',
  );
  await expect(secondConflict.getByLabel('Text from the other tab')).toHaveValue(
    'Second round in tab A',
  );

  await secondConflict
    .getByRole('button', { name: 'Use text from the other tab', exact: true })
    .click();
  await expect(secondConflict).toHaveCount(0);
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toBeFocused();
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Second round in tab A',
  );
  await expect(
    other.getByRole('textbox', { name: 'What my record shows (including the hard semesters)' }),
  ).toHaveValue('Unrelated record notes');
  await expect(other.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Thermal systems R&D',
  );
  expect(
    await other.evaluate((key) => window.localStorage.getItem(key), RECOVERY_STORAGE_KEY),
  ).toBeNull();

  expect(issuesA).toEqual([]);
  expect(issuesB).toEqual([]);
  await other.close();
});

test('conflict resolution catches a third edit before overwriting and recovers orphaned drafts after tab close', async ({
  context,
  page,
}) => {
  const issuesA = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Initial shared version');
  await waitForStorageLocksIdle(page);

  const other = await openSopTab(context);
  const issuesB = captureConsoleIssues(other);
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Initial shared version',
  );

  // Trigger a conflict in Tab B (Tab A saves Version A, Tab B types Version B).
  const releaseFirst = await holdStorageLock(page);
  await waitForPendingLockCount(page, 0);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Version A');
  await waitForPendingLockCount(page, 1);
  await other.getByRole('textbox', { name: 'Why this subject' }).fill('Version B');
  await waitForPendingLockCount(page, 2);
  await releaseFirst();
  await waitForStorageLocksIdle(page);

  const conflictB = other.getByTestId('conflict-why-subject');
  await expect(conflictB).toBeVisible();
  await expect(conflictB.getByLabel('Text from the other tab')).toHaveValue('Version A');

  // Hold the lock again so a third edit ("Version C") lands right before Tab B's resolution runs.
  const releaseThird = await holdStorageLock(page);
  await waitForPendingLockCount(page, 0);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Version C');
  await waitForPendingLockCount(page, 1);
  await conflictB.getByRole('button', { name: 'Use my text', exact: true }).click();
  await waitForPendingLockCount(page, 2);
  await releaseThird();
  await waitForStorageLocksIdle(page);

  // Resolution must not overwrite Version C silently: conflict stays open showing Version C.
  await expect(conflictB).toBeVisible();
  await expect(conflictB).toContainText(
    'Another tab saved a newer version while you were reviewing this section.',
  );
  await expect(conflictB.getByLabel('Your text (this tab)')).toHaveValue('Version B');
  await expect(conflictB.getByLabel('Text from the other tab')).toHaveValue('Version C');

  const storedBeforeConfirm = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw).entries['why-subject'] : null;
  }, STORAGE_KEY);
  expect(storedBeforeConfirm).toBe('Version C');

  // Close Tab B while the conflict is still unresolved, then open a fresh Tab C to verify
  // the unsaved draft from the closed tab can still be recovered.
  await other.close();

  const thirdTab = await openSopTab(context);
  const issuesC = captureConsoleIssues(thirdTab);
  const recoveredPanel = thirdTab.getByTestId('conflict-why-subject');
  await expect(recoveredPanel).toBeVisible();
  await expect(thirdTab.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Version C',
  );
  await expect(recoveredPanel.getByLabel('Your text (this tab)')).toHaveValue('Version C');
  await expect(recoveredPanel.getByLabel('Text from the other tab')).toHaveValue('Version B');

  await recoveredPanel
    .getByRole('button', { name: 'Use text from the other tab', exact: true })
    .click();
  await expect(recoveredPanel).toHaveCount(0);
  await expect(thirdTab.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Version B',
  );
  expect(
    await thirdTab.evaluate((key) => window.localStorage.getItem(key), RECOVERY_STORAGE_KEY),
  ).toBeNull();

  expect(issuesA).toEqual([]);
  expect(issuesB).toEqual([]);
  expect(issuesC).toEqual([]);
  await thirdTab.close();
});

test('a duplicated tab keeps its own identity, so the original tab never claims its unsaved text', async ({
  context,
  page,
}) => {
  const issues = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Base text');
  await waitForStorageLocksIdle(page);

  // "Duplicate tab" opens a new tab with a copy of this tab's sessionStorage.
  const copied = await page.evaluate(() => Object.entries(window.sessionStorage));
  const duplicate = await context.newPage();
  await duplicate.addInitScript((entries) => {
    for (const [key, value] of entries) window.sessionStorage.setItem(key, value);
  }, copied);
  await duplicate.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await duplicate.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
  await duplicate.goto('/sop-planner');
  await waitForHydration(duplicate);
  await expect(duplicate.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('Base text');

  const release = await holdStorageLock(page);
  await waitForPendingLockCount(page, 0);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Text from the original');
  await waitForPendingLockCount(page, 1);
  await duplicate.getByRole('textbox', { name: 'Why this subject' }).fill('Text from the duplicate');
  await waitForPendingLockCount(page, 2);
  await release();
  await waitForStorageLocksIdle(page);
  await expect(duplicate.getByTestId('conflict-why-subject')).toBeVisible();

  // The duplicate closes with its conflict open. The original keeps its own saved text and offers
  // the duplicate's draft as the other tab's text.
  await duplicate.close();
  await page.reload();
  await waitForHydration(page);
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('Text from the original');
  const recovered = page.getByTestId('conflict-why-subject');
  await expect(recovered).toBeVisible();
  await expect(recovered.getByLabel('Your text (this tab)')).toHaveValue('Text from the original');
  await expect(recovered.getByLabel('Text from the other tab')).toHaveValue('Text from the duplicate');
  expect(issues).toEqual([]);
});

test('rapid typing preserves order and full text across reload', async ({ page }) => {
  const issues = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);

  const rapidText =
    'Built a test bench for measuring pump cavitation across four impeller geometries.';
  const part1 = page.getByRole('textbox', { name: 'Why this subject' });
  await part1.click();
  await part1.pressSequentially(rapidText, { delay: 0 });
  await expect(part1).toHaveValue(rapidText);

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(rapidText);
  expect(issues).toEqual([]);
});

test('clearing in one tab clears untouched tabs, protects an active field in another tab, and cancels queued pre-clear writes', async ({
  context,
  page,
}) => {
  const issuesA = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);

  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Outline subject to clear');
  await page.getByRole('textbox', { name: 'What comes next' }).fill('Outline direction to clear');
  await waitForStorageLocksIdle(page);

  // Case 1: untouched Tab B clears cleanly when Tab A confirms clear.
  const untouchedB = await openSopTab(context);
  const issuesB = captureConsoleIssues(untouchedB);
  await expect(untouchedB.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Outline subject to clear',
  );

  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('');
  await expect(untouchedB.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('');
  await expect(untouchedB.getByRole('textbox', { name: 'What comes next' })).toHaveValue('');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), RECOVERY_STORAGE_KEY),
  ).toBeNull();

  // Case 2: Tab B has an actively focused field when Tab A confirms clear.
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Shared before clear');
  await expect(untouchedB.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Shared before clear',
  );
  await untouchedB.getByRole('textbox', { name: 'What comes next' }).fill('Active draft in tab B');
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Active draft in tab B',
  );

  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), RECOVERY_STORAGE_KEY),
  ).toBeNull();

  // Untouched Part 1 in Tab B clears, while focused Part 5 stays recoverable via conflict UI.
  await expect(untouchedB.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('');
  await expect(untouchedB.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    'Active draft in tab B',
  );
  const clearConflict = untouchedB.getByTestId('conflict-next');
  await expect(clearConflict).toBeVisible();
  await expect(clearConflict).toContainText('Empty (cleared in the other tab)');
  await clearConflict
    .getByRole('button', { name: 'Use text from the other tab', exact: true })
    .click();
  await expect(clearConflict).toHaveCount(0);
  await expect(untouchedB.getByRole('textbox', { name: 'What comes next' })).toHaveValue('');

  // Case 3: A queued pre-clear write behind a held lock cannot recreate the cleared outline.
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Before queued clear');
  await expect(untouchedB.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Before queued clear',
  );

  const releaseHold = await holdStorageLock(untouchedB);
  await waitForPendingLockCount(untouchedB, 0);
  await page.getByRole('textbox', { name: 'Why this subject' }).fill('Pre-clear queued edit');
  await waitForPendingLockCount(untouchedB, 1);
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await releaseHold();
  await waitForStorageLocksIdle(page);

  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), RECOVERY_STORAGE_KEY),
  ).toBeNull();

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue('');

  expect(issuesA).toEqual([]);
  expect(issuesB).toEqual([]);
  await untouchedB.close();
});

test('seeded version-1 draft survives with whitespace and line breaks across multi-tab edits', async ({
  context,
  page,
}) => {
  const issues = captureConsoleIssues(page);
  const v1Draft = {
    version: 1,
    entries: {
      'why-subject': '  Leading spaces line 1\n\nSecond paragraph.\n  Indented line  ',
      record: 'Semester 3:\n- Fluid mechanics\n- Heat transfer\n',
      beyond: '',
      'why-programme': 'Module A\n\nModule B',
      next: 'Turbomachinery design  ',
    },
  };

  await page.goto('/sop-planner');
  await waitForHydration(page);
  await page.evaluate(
    ([key, payload]) => {
      window.localStorage.setItem(key, JSON.stringify(payload));
    },
    [STORAGE_KEY, v1Draft] as const,
  );

  await page.reload();
  await waitForHydration(page);

  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    v1Draft.entries['why-subject'],
  );
  await expect(
    page.getByRole('textbox', { name: 'What my record shows (including the hard semesters)' }),
  ).toHaveValue(v1Draft.entries.record);
  await expect(page.getByRole('textbox', { name: 'Why this programme' })).toHaveValue(
    v1Draft.entries['why-programme'],
  );
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    v1Draft.entries.next,
  );

  // Edit the empty section in a second tab and confirm seeded whitespace/line breaks remain exact.
  const other = await openSopTab(context);
  await expect(other.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    v1Draft.entries['why-subject'],
  );
  await other
    .getByRole('textbox', { name: "What I've done beyond it" })
    .fill('Added lab work in second tab');
  await expect(page.getByRole('textbox', { name: "What I've done beyond it" })).toHaveValue(
    'Added lab work in second tab',
  );

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    v1Draft.entries['why-subject'],
  );
  await expect(
    page.getByRole('textbox', { name: 'What my record shows (including the hard semesters)' }),
  ).toHaveValue(v1Draft.entries.record);
  await expect(page.getByRole('textbox', { name: "What I've done beyond it" })).toHaveValue(
    'Added lab work in second tab',
  );
  await expect(page.getByRole('textbox', { name: 'Why this programme' })).toHaveValue(
    v1Draft.entries['why-programme'],
  );
  await expect(page.getByRole('textbox', { name: 'What comes next' })).toHaveValue(
    v1Draft.entries.next,
  );

  expect(issues).toEqual([]);
  await other.close();
});

test('storage write exception keeps in-memory text and surfaces the save warning', async ({
  page,
}) => {
  const issues = captureConsoleIssues(page);
  await page.goto('/sop-planner');
  await waitForHydration(page);

  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });

  const part1 = page.getByRole('textbox', { name: 'Why this subject' });
  await part1.fill('Keep these words visible despite storage error');

  await expect(part1).toHaveValue('Keep these words visible despite storage error');
  await expect(page.getByTestId('word-count-why-subject')).toHaveText('7 words');
  await expect(
    page.getByText(
      'Browser storage is unavailable right now. Your latest changes may not be saved.',
    ),
  ).toBeVisible();
  expect(issues).toEqual([]);
});

test('missing Web Locks API warns before first edit while keeping editing and printing usable', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'locks', {
      value: undefined,
      configurable: true,
    });
  });

  const page = await context.newPage();
  const issues = captureConsoleIssues(page);
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());

  // Seed an existing v1 draft before opening so we also verify reading still works and unlocked
  // edits do not silently overwrite the persisted record.
  const url = `${baseURL!.replace(/\/$/, '')}/sop-planner`;
  await page.goto(url);
  await waitForHydration(page);
  await page.evaluate((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        entries: {
          'why-subject': 'Existing saved draft',
          record: '',
          beyond: '',
          'why-programme': '',
          next: '',
        },
      }),
    );
  }, STORAGE_KEY);

  await page.reload();
  await waitForHydration(page);

  // Warning must appear before the first edit.
  await expect(
    page.getByText(
      'Automatic saving is unavailable in this browser session. You can still write and print your outline, but changes here are not saved automatically.',
    ),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Why this subject' })).toHaveValue(
    'Existing saved draft',
  );

  // Editor and printing remain fully usable in memory without racy writes to localStorage.
  await page
    .getByRole('textbox', { name: 'What comes next' })
    .fill('Print-ready direction without locks.');
  await expect(page.getByTestId('word-count-next')).toHaveText('4 words');
  await expect(page.getByTestId('sop-total-words')).toHaveText('7 words');

  const storedAfterEdit = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw).entries : null;
  }, STORAGE_KEY);
  expect(storedAfterEdit).toEqual({
    'why-subject': 'Existing saved draft',
    record: '',
    beyond: '',
    'why-programme': '',
    next: '',
  });

  await page.emulateMedia({ media: 'print' });
  await expect(
    page.locator('p', { hasText: 'Print-ready direction without locks.' }),
  ).toBeVisible();

  expect(issues).toEqual([]);
  await context.close();
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

    // Trigger a same-section conflict while Part 1 is focused, verify conflict layout, target
    // sizes, zero sideways overflow, and keyboard resolution at this viewport width.
    const other = await context.newPage();
    await other.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
    await other.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
    await other.goto(`${baseURL!.replace(/\/$/, '')}/sop-planner`);
    await waitForHydration(other);
    await other
      .getByLabel('Why this subject', { exact: true })
      .fill('Alternative version saved from another tab.');
    await waitForStorageLocksIdle(other);

    const conflictPanel = page.getByTestId('conflict-why-subject');
    await expect(conflictPanel).toBeVisible();

    const conflictOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    );
    expect(conflictOverflow).toBeLessThanOrEqual(0);

    for (const name of ['Use my text', 'Use text from the other tab']) {
      const button = conflictPanel.getByRole('button', { name, exact: true });
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }

    const useMine = conflictPanel.getByRole('button', { name: 'Use my text', exact: true });
    await useMine.focus();
    await page.keyboard.press('Enter');
    await expect(conflictPanel).toHaveCount(0);
    await expect(page.getByLabel('Why this subject', { exact: true })).toBeFocused();

    await other.close();
    expect(issues).toEqual([]);
    await context.close();
  });
}
