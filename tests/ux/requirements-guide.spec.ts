import { expect, test } from '@playwright/test';

import { FEE_POLICY, FEE_PROMISE } from '../../src/utils/constants.ts';
import { UX_ENDPOINTS } from './endpoints';

const endpoint = UX_ENDPOINTS.profileReview;

/** The topic anchors, in reading order (`REQUIREMENT_TOPIC_IDS`), with the titles the route and the cards show. */
const TOPICS = [
  ['degree', 'Your degree'],
  ['subject-credits', 'Subject match and credits'],
  ['grades', 'Grades'],
  ['language', 'Language'],
  ['aps-dmat', 'APS and dMAT'],
  ['documents', 'Documents'],
  ['applying', 'How to apply'],
  ['deadlines', 'Deadlines and timeline'],
  ['costs', 'Costs'],
  ['visa-enrolment', 'Visa and enrolment'],
] as const;

test.beforeEach(async ({ page }) => {
  // Never allow test enquiries to leave the browser, even if a fixture is missing.
  await page.route(endpoint, route => route.abort());
});

test('the guide is in the page HTML without answers, and every topic shows an official page with its review date', async ({ page }) => {
  // The prerendered HTML: no JavaScript, no answers.
  const html = await (await page.request.get('/requirements')).text();
  for (const [id, title] of TOPICS) {
    expect(html, `article #${id}`).toContain(`id="${id}"`);
    expect(html, `title of #${id}`).toContain(title);
  }
  // A detail layer is in the HTML, inside its closed disclosure.
  expect(html).toContain('<details');
  expect(html).toContain('Test dates');
  // No answers yet, so the contact form carries no summary.
  expect(html).not.toContain('data-testid="form-snapshot"');

  await page.goto('/requirements');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  // The route card lists every topic as a link to its card.
  const route = page.locator('#route');
  for (const [id, title] of TOPICS) await expect(route.locator(`a[href="#${id}"]`)).toContainText(title);
  // Each topic shows the same parts: who needs it, what to do (so it ends in an action), and at least one
  // official link with its review date (in its panels, table or detail).
  for (const [id] of TOPICS) {
    const card = page.locator(`article#${id}`);
    for (const part of ['Who this applies to', 'What to do']) {
      await expect(card.getByRole('heading', { name: part, exact: true }), `${part} in #${id}`).toBeVisible();
    }
    expect(await card.locator('a[href^="https://"]').count(), `official link in #${id}`).toBeGreaterThan(0);
    await expect(card).toContainText('Last reviewed');
  }
  // The grade check is linked from the grades topic's steps, without opening "More detail".
  await expect(page.locator('#grades').getByRole('link', { name: 'Open the grade check' })).toHaveAttribute('href', /\/check$/);
  // "More detail" opens without leaving the card.
  const more = page.locator('#aps-dmat details');
  await more.locator('summary').click();
  await expect(more).toHaveAttribute('open', '');
  await expect(more).toContainText('Test dates');
  // The test dates are a table named by their heading: one row per test.
  const dates = more.getByRole('table', { name: 'Test dates' });
  await expect(dates.getByRole('columnheader')).toHaveText(['Test date', 'Register by', 'Results']);
  await expect(dates.getByRole('rowheader')).toHaveText(['16 January 2027', '13 March 2027']);
  // Consecutive parts resting on the same page show its source once, after the last of them.
  await expect(more.getByRole('link', { name: 'APS India: dMAT rules' })).toHaveCount(1);
  // The full dMAT rule that Home's FAQ used to carry now lives here.
  for (const text of ['16 January 2027', '13 March 2027', '€150', 'officially confirmed exchange, double-degree or university partnership programmes']) {
    await expect(more).toContainText(text);
  }
  for (const label of ['dMAT fields', 'Who is exempt', 'Earlier APS applications', 'dMAT and APS', 'Test dates', 'Test fee']) {
    await expect(more.getByRole('heading', { name: label, exact: true })).toHaveCount(1);
  }
});

test('the common questions are native disclosures that open one by one and link to their topics on this page', async ({ page }) => {
  // Every answer is in the page HTML, so it can be read without JavaScript.
  const html = await (await page.request.get('/requirements')).text();
  expect(html).toContain('The number of years does not decide it on its own.');

  await page.goto('/requirements');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const items = page.locator('#common-questions details');
  await expect(items).toHaveCount(12);
  for (const item of await items.all()) await expect(item).not.toHaveAttribute('open', /.*/);
  const first = items.first();
  const question = first.locator('summary');
  expect((await question.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await question.click();
  await expect(first).toHaveAttribute('open', '');
  await expect(items.nth(1)).not.toHaveAttribute('open', /.*/);
  await expect(first).toContainText('The number of years does not decide it on its own.');
  // The first answer names two topics and links both.
  const topics = first.locator('a[href^="#"]');
  await expect(topics).toHaveCount(2);
  const target = (await topics.first().getAttribute('href'))!;
  await topics.first().click();
  await expect(page.locator(`article${target}`)).toBeInViewport();
  expect(new URL(page.url()).pathname).toBe('/requirements');
});

test('the costs topic lists every cost group with sources and review dates, and no fee promise', async ({ page }) => {
  await page.goto('/requirements');
  const costs = page.locator('#costs');
  await expect(costs.locator('th[scope="rowgroup"]')).toHaveText(['Provider charges', 'Semester contributions', 'Tuition', 'Blocked-account deposit']);
  // Figures as the official pages state them.
  await expect(costs).toContainText('rising to €4,600 or €6,800 from winter semester 2027/28');
  await expect(costs).toContainText('in force since 1 September 2024');
  await expect(costs).not.toContainText('exemptions may apply');
  // Tuition for public and private programmes stays in the costs, with its source.
  await expect(costs).toContainText('Some institutions and states charge students from outside the EU');
  await expect(costs).toContainText('Private universities set tuition for each programme');
  await expect(costs).toContainText('Last reviewed');
  await expect(costs.getByRole('link', { name: 'TUM: tuition fees' })).toBeVisible();
  // The page's own content carries no Germandians fee wording.
  await expect(costs).not.toContainText(FEE_PROMISE);
  await expect(page.locator('#guide')).not.toContainText(FEE_POLICY.timing);
});
