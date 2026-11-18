import { readFile } from 'node:fs/promises';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { STORAGE_KEY } from '../../src/utils/creditMatch/storage';
import { UX_ENDPOINTS } from './endpoints';

const FORBIDDEN_WORDS = /\b(eligible|meets|enough|qualifies)\b/i;

function trackRuntimeErrors(page: Page) {
  const issues: string[] = [];
  page.on('pageerror', (error) => {
    issues.push(`pageerror: ${error.message}`);
  });
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      issues.push(`console.error: ${text}`);
    } else if (type === 'warning' && /hydrat/i.test(text)) {
      issues.push(`hydration warning: ${text}`);
    }
  });
  return issues;
}

test.beforeEach(async ({ page }) => {
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
});

test('credit-match main flow: areas, single and split course mapping, unmapped lists, sources, print and CSV export', async ({
  page,
}) => {
  const issues = trackRuntimeErrors(page);

  await page.goto('/credit-match');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await expect(page.getByRole('heading', { level: 1, name: 'Credit matching', exact: true })).toBeVisible();
  await expect(page.locator('span[lang="de"]', { hasText: 'Modulabgleich' })).toBeVisible();

  // Official sources and link back to the requirements topic
  await expect(page.getByRole('link', { name: 'European Commission: ECTS', exact: true })).toHaveAttribute(
    'target',
    '_blank',
  );
  await expect(
    page.getByRole('link', {
      name: 'RWTH Aachen: Software Systems Engineering admission (example)',
      exact: true,
    }),
  ).toHaveAttribute('rel', 'noopener');
  await expect(
    page.getByRole('link', { name: 'TUM: Informatics master’s (example)', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'Read Subject match and credits in the requirements guide',
      exact: true,
    }),
  ).toHaveAttribute('href', '/requirements#subject-credits');

  // Optional programme context
  await page.getByLabel('University (optional)', { exact: true }).fill('RWTH Aachen University');
  await page
    .getByLabel('Master’s programme (optional)', { exact: true })
    .fill('M.Sc. Software Systems Engineering');
  await page
    .getByLabel('Admission or curriculum page link (optional)', { exact: true })
    .fill('https://sc.informatik.rwth-aachen.de/en/studium/master/sse/application-for-admission/');

  // Validation on empty subject area add
  await page.getByRole('button', { name: 'Add subject area', exact: true }).click();
  await expect(page.getByText('Enter a subject area name.', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Enter required credits above 0 using digits, such as 24 or 7.5.', {
      exact: true,
    }),
  ).toBeVisible();

  // Add three required subject areas
  const addArea = async (name: string, credits: string) => {
    await page.getByLabel('Subject area', { exact: true }).fill(name);
    await page.getByLabel('Required credits', { exact: true }).fill(credits);
    await page.getByRole('button', { name: 'Add subject area', exact: true }).click();
  };

  await addArea('Mathematics', '26');
  await addArea('Theoretical computer science', '12');
  await addArea('Software engineering', '16');

  const unmappedAreas = page.getByTestId('unmapped-areas');
  await expect(unmappedAreas).toContainText('Mathematics (26 required credits)');
  await expect(unmappedAreas).toContainText('Theoretical computer science (12 required credits)');
  await expect(unmappedAreas).toContainText('Software engineering (16 required credits)');

  // Add Course 1 mapped to Mathematics during creation
  await page.getByLabel('Course title', { exact: true }).fill('Linear Algebra');
  await page.getByLabel('Transcript credits', { exact: true }).fill('4');
  await page
    .getByLabel('Module description link or reference (optional)', { exact: true })
    .fill('https://example.edu/catalogue/math101');
  await page
    .getByRole('group', {
      name: 'Map to required subject areas (optional now; you can also map below)',
      exact: true,
    })
    .getByRole('checkbox', { name: 'Mathematics', exact: true })
    .check();
  await page.getByRole('button', { name: 'Add course', exact: true }).click();

  // Add Course 2 with commas and quotes in title/reference, then split across two areas
  await page
    .getByLabel('Course title', { exact: true })
    .fill('Discrete Structures, Logic & Automata');
  await page.getByLabel('Transcript credits', { exact: true }).fill('6');
  await page
    .getByLabel('Module description link or reference (optional)', { exact: true })
    .fill('CS-202, "Part A" syllabus p. 14');
  await page.getByRole('button', { name: 'Add course', exact: true }).click();

  // Add Course 3 left unmapped
  await page.getByLabel('Course title', { exact: true }).fill('Environmental Studies');
  await page.getByLabel('Transcript credits', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Add course', exact: true }).click();

  // Map Course 2 to Mathematics and Theoretical computer science
  const course2Mapping = page.getByRole('group', {
    name: 'Map Discrete Structures, Logic & Automata to required subject areas',
    exact: true,
  });
  await course2Mapping.getByRole('checkbox', { name: 'Mathematics', exact: true }).check();
  await course2Mapping
    .getByRole('checkbox', { name: 'Theoretical computer science', exact: true })
    .check();

  // Default even split: 3 in Mathematics (4 + 3 = 7) and 3 in Theoretical computer science
  const summaryTable = page.getByTestId('area-summary-table');
  await expect(summaryTable.locator('tbody tr').nth(0)).toContainText('Mathematics');
  await expect(summaryTable.locator('tbody tr').nth(0)).toContainText('7');
  await expect(summaryTable.locator('tbody tr').nth(1)).toContainText('3');

  // Custom split: 4 in Mathematics -> remaining 2 goes automatically to Theoretical computer science
  await course2Mapping.getByLabel('Credit share in Mathematics', { exact: true }).fill('4');
  await expect(summaryTable.locator('tbody tr').nth(0)).toContainText('8');
  await expect(summaryTable.locator('tbody tr').nth(0)).toContainText('4 of 6 credits');
  await expect(summaryTable.locator('tbody tr').nth(0)).toContainText(
    'https://example.edu/catalogue/math101',
  );
  await expect(summaryTable.locator('tbody tr').nth(1)).toContainText('2');
  await expect(summaryTable.locator('tbody tr').nth(1)).toContainText('2 of 6 credits');
  await expect(summaryTable.locator('tbody tr').nth(2)).toContainText('Unmapped (0 mapped credits)');

  // Unmapped areas now lists only Software engineering; unmapped courses lists only Environmental Studies
  await expect(unmappedAreas).not.toContainText('Mathematics');
  await expect(unmappedAreas).not.toContainText('Theoretical computer science');
  await expect(unmappedAreas).toContainText('Software engineering (16 required credits)');

  const unmappedCourses = page.getByTestId('unmapped-courses');
  await expect(unmappedCourses).toContainText('Environmental Studies (2 transcript credits)');
  await expect(unmappedCourses).not.toContainText('Linear Algebra');

  // Strict prohibition check on rendered text and aria-labels
  const pageText = await page.locator('main').innerText();
  expect(pageText).not.toMatch(FORBIDDEN_WORDS);
  const ariaLabels = await page
    .locator('main [aria-label]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('aria-label') ?? ''));
  for (const label of ariaLabels) {
    expect(label).not.toMatch(FORBIDDEN_WORDS);
  }

  // CSV download check
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('credit-match-m-sc-software-systems-engineering.csv');
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const csv = await readFile(downloadPath!, 'utf8');

  expect(csv).toContain('University,RWTH Aachen University');
  expect(csv).toContain('Programme,M.Sc. Software Systems Engineering');
  expect(csv).toContain(
    'Mathematics,26,8,"Linear Algebra (4); Discrete Structures, Logic & Automata (4)"',
  );
  expect(csv).toContain('Software engineering,16,0,Unmapped (0 mapped credits)');
  expect(csv).toContain(
    '"Discrete Structures, Logic & Automata",6,Mathematics,4,"CS-202, ""Part A"" syllabus p. 14"',
  );
  expect(csv).toContain('Environmental Studies,2,Unmapped,0,');
  expect(csv).not.toMatch(FORBIDDEN_WORDS);

  // Print stylesheet verification
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('button', { name: 'Download CSV', exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Add subject area', exact: true })).not.toBeVisible();
  await expect(page.getByTestId('area-summary-table')).toBeVisible();
  await expect(page.getByTestId('worksheet-disclaimer')).toBeVisible();
  await expect(unmappedAreas).toBeVisible();
  await expect(unmappedCourses).toBeVisible();
  await page.emulateMedia({ media: 'screen' });

  expect(issues).toEqual([]);
});

test('browser storage survives reload with zero hydration warnings, clears via Clear my entries, and discards invalid shapes', async ({
  page,
}) => {
  const issues = trackRuntimeErrors(page);

  await page.goto('/credit-match');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await page.getByLabel('University (optional)', { exact: true }).fill('Technical University of Munich');
  await page.getByLabel('Subject area', { exact: true }).fill('Informatics foundations');
  await page.getByLabel('Required credits', { exact: true }).fill('18');
  await page.getByRole('button', { name: 'Add subject area', exact: true }).click();

  await page.getByLabel('Course title', { exact: true }).fill('Data Structures and Algorithms');
  await page.getByLabel('Transcript credits', { exact: true }).fill('5');
  await page
    .getByRole('group', {
      name: 'Map to required subject areas (optional now; you can also map below)',
      exact: true,
    })
    .getByRole('checkbox', { name: 'Informatics foundations', exact: true })
    .check();
  await page.getByRole('button', { name: 'Add course', exact: true }).click();

  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY))
    .not.toBeNull();

  // Reload and confirm state survives without hydration warnings
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await expect(page.getByLabel('University (optional)', { exact: true })).toHaveValue(
    'Technical University of Munich',
  );
  await expect(page.getByTestId('area-summary-table')).toContainText('Informatics foundations');
  await expect(page.getByTestId('area-summary-table')).toContainText(
    'Data Structures and Algorithms',
  );
  await expect(page.getByTestId('area-summary-table')).toContainText('5');

  // Clear my entries removes state and localStorage entry
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(page.getByLabel('University (optional)', { exact: true })).toHaveValue('');
  await expect(page.getByTestId('area-summary-table')).toHaveCount(0);
  await expect(
    page.getByText('Cleared all entries from this browser.', { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  // Seed corrupt shape and verify it is discarded cleanly on reload
  await page.evaluate(
    (key) => window.localStorage.setItem(key, JSON.stringify({ version: 99, broken: true })),
    STORAGE_KEY,
  );
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  // Inline editing of added area and course fields
  await page.getByLabel('Subject area', { exact: true }).fill('Maths');
  await page.getByLabel('Required credits', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'Add subject area', exact: true }).click();
  await page.getByLabel('Subject area 1 name', { exact: true }).fill('Applied Mathematics');
  await page.getByLabel('Required credits for Applied Mathematics', { exact: true }).fill('24');

  await page.getByLabel('Course title', { exact: true }).fill('Calculus I');
  await page.getByLabel('Transcript credits', { exact: true }).fill('3');
  await page.getByRole('button', { name: 'Add course', exact: true }).click();
  await page.getByLabel('Course 1 title', { exact: true }).fill('Calculus I & II');
  await page.getByLabel('Transcript credits for Calculus I & II', { exact: true }).fill('6');
  await page
    .getByLabel('Module description link or reference for Calculus I & II', { exact: true })
    .fill('Catalogue p. 8');
  await page
    .getByRole('group', { name: 'Map Calculus I & II to required subject areas', exact: true })
    .getByRole('checkbox', { name: 'Applied Mathematics', exact: true })
    .check();
  await expect(page.getByTestId('area-summary-table')).toContainText('Applied Mathematics');
  await expect(page.getByTestId('area-summary-table')).toContainText('24');
  await expect(page.getByTestId('area-summary-table')).toContainText('Catalogue p. 8');

  expect(issues).toEqual([]);
});

test('blocked localStorage shows plain notice without crashing and still works in memory', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const deny = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Object.defineProperty(window, 'localStorage', { configurable: true, get: deny });
  });
  const page = await context.newPage();
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
  const issues = trackRuntimeErrors(page);

  await page.goto('/credit-match');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  await expect(page.getByRole('alert')).toContainText(
    'Browser storage is unavailable in this window.',
  );
  await page.getByLabel('Subject area', { exact: true }).fill('Systems');
  await page.getByLabel('Required credits', { exact: true }).fill('10');
  await page.getByRole('button', { name: 'Add subject area', exact: true }).click();
  await expect(page.getByTestId('area-summary-table')).toContainText('Systems');

  expect(issues).toEqual([]);
  await context.close();
});

test('keyboard-only flow, WCAG audit, placeholder contrast and responsive widths (320 to 1440px)', async ({
  page,
}) => {
  const issues = trackRuntimeErrors(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/credit-match');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  // Keyboard-only entry of an area, a course, and checkbox mapping
  await page.locator('#cm-new-area-name').focus();
  await page.keyboard.type('Algorithms');
  await page.keyboard.press('Tab');
  await page.keyboard.type('12');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Subject area 1 name', { exact: true })).toHaveValue('Algorithms');

  await page.locator('#cm-new-course-title').focus();
  await page.keyboard.type('Graph Theory and URL https://very-long-university-example.edu/courses/modules/2026/semester-4/graph-theory-syllabus');
  await page.keyboard.press('Tab');
  await page.keyboard.type('4.5');
  await page.keyboard.press('Tab');
  await page.keyboard.type('https://very-long-university-example.edu/courses/modules/2026/semester-4/graph-theory-syllabus');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('area-summary-table')).toContainText('4.5');

  // Placeholder contrast check (>= 4.5:1)
  const ratios = await page.locator('input[placeholder]').evaluateAll((inputs) => {
    const luminance = (colour: string) => {
      const [r, g, b] = colour
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map((value) => {
          const channel = Number(value) / 255;
          return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return inputs.map((input) => {
      const text = luminance(getComputedStyle(input, '::placeholder').color);
      const field = luminance(getComputedStyle(input).backgroundColor);
      return (Math.max(text, field) + 0.05) / (Math.min(text, field) + 0.05);
    });
  });
  expect(ratios.length).toBeGreaterThan(0);
  for (const ratio of ratios) {
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  }

  // Responsive sweep at 320, 390, 768, 1024 and 1440px + Axe audit at 390 and 1440px
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(fits, `no horizontal overflow at ${width}px`).toBe(true);

    if (width === 390 || width === 1440) {
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
        .analyze();
      expect(axe.violations, `axe clean at ${width}px`).toEqual([]);

      // Verify keyboard Tab focus stays unobscured by sticky header or mobile action bar
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      const covered: string[] = [];
      for (let index = 0; index < 80; index++) {
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const r = el.getBoundingClientRect();
          const label =
            el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 55) || el.id;
          const hit = document.elementFromPoint(
            Math.max(0, Math.min(window.innerWidth - 1, r.x + r.width / 2)),
            Math.max(0, Math.min(window.innerHeight - 1, r.y + r.height / 2)),
          );
          return {
            label,
            skip: el.textContent === 'Skip to content',
            body: el === document.body,
            covered:
              r.top < 0 ||
              r.bottom > window.innerHeight + 1 ||
              !hit ||
              !(el.contains(hit) || hit.contains(el)),
          };
        });
        if (index > 0 && (focus.skip || focus.body)) break;
        if (focus.covered) covered.push(focus.label ?? 'unnamed');
      }
      expect(covered, `unobscured focus at ${width}px`).toEqual([]);
    }
  }

  expect(issues).toEqual([]);
});

test('a failed save or a failed clear is reported, never shown as success', async ({ page }) => {
  const issues = trackRuntimeErrors(page);
  await page.goto('/credit-match');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const addArea = async (name: string) => {
    await page.getByLabel('Subject area', { exact: true }).fill(name);
    await page.getByLabel('Required credits', { exact: true }).fill('10');
    await page.getByRole('button', { name: 'Add subject area', exact: true }).click();
  };

  await addArea('Systems');
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();
  await expect(page.getByRole('alert')).toHaveCount(0);

  // A blocked save keeps the entry on screen and shows the storage notice.
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name: string, value: string) {
      if (name === 'germandians:credit-match') throw new DOMException('Full', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  });
  await addArea('Mathematics');
  await expect(page.getByTestId('area-summary-table')).toContainText('Mathematics');
  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable in this window.');

  // A blocked removal clears the screen but says the saved data is still there.
  await page.evaluate(() => {
    Storage.prototype.removeItem = function (name: string) {
      if (name === 'germandians:credit-match') throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.getByRole('button', { name: 'Clear my entries', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, clear', exact: true }).click();
  await expect(page.getByTestId('area-summary-table')).toHaveCount(0);
  await expect(
    page.getByText('Cleared this worksheet on screen. Saved browser data could not be cleared.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Cleared all entries from this browser.', { exact: true })).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();

  expect(issues).toEqual([]);
});

test('clearing asks first, moves focus to Yes and back to the button on Cancel, and keeps the entries', async ({ page }) => {
  await page.goto('/credit-match');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const university = page.getByLabel('University (optional)', { exact: true });
  await university.fill('RWTH Aachen');

  const clear = page.getByRole('button', { name: 'Clear my entries', exact: true });
  await clear.click();
  const group = page.getByRole('group', { name: 'Clear all entries?' });
  await expect(group).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes, clear', exact: true })).toBeFocused();

  await group.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(group).toHaveCount(0);
  await expect(clear).toBeFocused();
  await expect(university).toHaveValue('RWTH Aachen');

  // The credit-sum explanation is a closed details element whose text is still in the page.
  const rules = page.locator('details', { hasText: 'How this worksheet sums mapped credits' });
  await expect(rules).not.toHaveAttribute('open', '');
  await expect(rules).toContainText('credit multiplier');
});
