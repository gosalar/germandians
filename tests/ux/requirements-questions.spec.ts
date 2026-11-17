import { expect, test, type Locator, type Page } from '@playwright/test';

const endpoint = 'https://enquiries.example.test/profile';

const QUESTION = {
  stage: /Where are you in your bachelor’s\?/,
  length: /How long is your degree\?/,
  field: /What did you study\?/,
  language: /Which language will your master’s be taught in\?/,
  aps: /Where are you with APS\?/,
  shortlist: /Do you have a shortlist of programmes\?/,
  semesters: /Have you completed fewer than \d+ semesters\?/,
  confirmedProgramme: /Are you taking part in an officially confirmed exchange, double-degree or university partnership programme\?/,
  apsDate: /register with APS, or send complete documents, before/,
} as const;

type Answers = readonly (readonly [keyof typeof QUESTION, string])[];

const questions = (page: Page) => page.locator('#questions');
const slip = (page: Page) => page.locator('#next-steps');
const option = (page: Page, question: keyof typeof QUESTION, name: string) =>
  questions(page).getByRole('group', { name: QUESTION[question] }).getByRole('button', { name, exact: true });

async function answer(page: Page, answers: Answers) {
  for (const [question, name] of answers) {
    await option(page, question, name).click();
    await expect(option(page, question, name)).toHaveAttribute('aria-pressed', 'true');
  }
}

/** The slip's step whose line contains `phrase`. */
const step = (page: Page, phrase: string | RegExp) => slip(page).getByRole('listitem').filter({ hasText: phrase });

/** The focused element is drawn on top at its centre: no sticky header or action bar covers it. */
async function expectUncovered(target: Locator) {
  await expect(target).toBeInViewport();
  const onTop = await target.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + Math.min(box.height / 2, 20));
    return hit !== null && (hit === element || element.contains(hit));
  });
  expect(onTop, 'a sticky element covers the focused control').toBe(true);
}

test.beforeEach(async ({ page }) => {
  // Never allow test enquiries to leave the browser, even if a fixture is missing.
  await page.route(endpoint, route => route.abort());
  await page.goto('/requirements');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
});

// The dMAT outcome table (plan 10.3): first match wins. Each row: answers, the step's label, a phrase from its line.
const DMAT_ROWS: readonly { row: string; answers: Answers; label: string; phrase: string | RegExp }[] = [
  { row: '1 APS certificate', answers: [['field', 'One of the dMAT fields'], ['aps', 'Certificate received']], label: 'Does not apply', phrase: 'that completed APS procedure does not need dMAT' },
  { row: '2 another field', answers: [['field', 'Something else'], ['aps', 'Applied, waiting']], label: 'Does not apply', phrase: 'If your degree is outside the dMAT fields' },
  { row: '3 registered before the transition date', answers: [['field', 'One of the dMAT fields'], ['aps', 'Applied, waiting'], ['apsDate', 'Yes']], label: 'Does not apply', phrase: /before \d+ \w+ \d{4}, that APS procedure does not need dMAT/ },
  { row: '4 confirmed programme', answers: [['field', 'One of the dMAT fields'], ['confirmedProgramme', 'Yes']], label: 'Check', phrase: 'Confirm with APS that your programme counts' },
  { row: '5 early semesters', answers: [['stage', 'Still studying or exams outstanding'], ['length', '3-year'], ['field', 'One of the dMAT fields'], ['semesters', 'Yes']], label: 'Check', phrase: 'Count your semesters again' },
  { row: '6 a mix', answers: [['field', 'Integrated or dual, partly a dMAT field']], label: 'Check', phrase: 'An integrated or dual degree counts for dMAT' },
  { row: '7 a field on the list', answers: [['field', 'One of the dMAT fields']], label: 'Do next', phrase: 'you may need dMAT' },
  { row: '8 field not sure', answers: [['field', 'Not sure']], label: 'Find out', phrase: 'Find out whether your degree is in one of the dMAT fields' },
  { row: '8 field unanswered, APS answered', answers: [['aps', 'Not started']], label: 'Find out', phrase: 'Find out whether your degree is in one of the dMAT fields' },
];

/** A step's label, in words. */
const labelOf = (item: Locator) => item.locator('[data-label]');

test('each dMAT outcome row gives its label and wording, and "Not sure" on a follow-up is never an exemption', async ({ page }) => {
  for (const { row, answers, label, phrase } of DMAT_ROWS) {
    await test.step(`row ${row}`, async () => {
      await page.reload();
      await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
      await answer(page, answers);
      const dmat = step(page, phrase);
      await expect(dmat).toHaveCount(1);
      await expect(labelOf(dmat)).toHaveText(label);
      await expect(dmat.getByRole('link', { name: 'APS India: dMAT rules' })).toHaveAttribute('target', '_blank');
    });
  }

  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await answer(page, [['field', 'One of the dMAT fields'], ['aps', 'Applied, waiting'], ['apsDate', 'Not sure']]);
  await expect(labelOf(step(page, 'you may need dMAT'))).toHaveText('Do next');
  await expect(slip(page)).not.toContainText('Does not apply');
  await expect(slip(page)).not.toContainText('that APS procedure does not need dMAT');
});

test('answers drive the steps and stamps, and clearing an answer removes both', async ({ page }) => {
  await expect(slip(page)).toContainText('Answer a question and your first step appears here.');
  await expect(page.locator('#guide article[data-stamped]')).toHaveCount(0);

  // An answer adds its step and stamps its topic; pressing it again removes both.
  await answer(page, [['shortlist', 'Yes']]);
  const deadlines = step(page, 'Check each programme’s application and document deadlines');
  await expect(labelOf(deadlines)).toHaveText('Check');
  await expect(deadlines.getByRole('link', { name: /Topic \d+: / })).toHaveAttribute('href', '#deadlines');
  await expect(page.locator('#deadlines')).toHaveAttribute('data-stamped', 'true');
  await option(page, 'shortlist', 'Yes').click();
  await expect(option(page, 'shortlist', 'Yes')).toHaveAttribute('aria-pressed', 'false');
  await expect(deadlines).toHaveCount(0);
  await expect(page.locator('#deadlines')).not.toHaveAttribute('data-stamped', /.*/);

  // "Not sure" (here "Not decided") gives "Find out" and stamps its topic.
  await answer(page, [['language', 'Not decided']]);
  await expect(labelOf(step(page, 'Decide which language you want to study in'))).toHaveText('Find out');
  await expect(page.locator('#language')).toHaveAttribute('data-stamped', 'true');
  await option(page, 'language', 'Not decided').click();

  // A "Does not apply" step does not stamp.
  await answer(page, [['field', 'Something else']]);
  await expect(labelOf(step(page, 'If your degree is outside the dMAT fields'))).toHaveText('Does not apply');
  await expect(page.locator('#aps-dmat')).not.toHaveAttribute('data-stamped', /.*/);

  // Every answered degree length gives the same credits step, so no length is singled out; "Not sure" gives its own.
  const credits = step(page, 'Your degree’s length does not set your credit total');
  for (const length of ['3-year', '4-year', 'Other or integrated']) {
    await answer(page, [['length', length]]);
    await expect(credits).toHaveCount(1);
    await expect(labelOf(credits)).toHaveText('Check');
    await expect(page.locator('#subject-credits')).toHaveAttribute('data-stamped', 'true');
  }
  await answer(page, [['length', 'Not sure']]);
  await expect(credits).toHaveCount(0);
  await expect(labelOf(step(page, 'Find out how many years your degree officially runs for.'))).toHaveText('Find out');
  await answer(page, [['length', '3-year']]);

  // Steps sort by label: Check before Does not apply.
  await expect(labelOf(slip(page).getByRole('listitem').first())).toHaveText('Check');
  await expect(labelOf(slip(page).getByRole('listitem').last())).toHaveText('Does not apply');
});

test('a hidden follow-up loses its answer, and changing the degree length clears follow-up A', async ({ page }) => {
  const snapshot = page.getByTestId('form-snapshot');

  // Follow-up A answered for a 4-year degree no longer holds once the degree is 3-year: the thresholds differ.
  await answer(page, [
    ['stage', 'Still studying or exams outstanding'],
    ['length', '4-year'],
    ['field', 'One of the dMAT fields'],
    ['semesters', 'Yes'],
  ]);
  // The question and its summary line both name the 4-year number.
  await expect(questions(page).getByRole('group', { name: 'Have you completed fewer than 7 semesters?' })).toBeVisible();
  await expect(snapshot).toContainText('Completed fewer than 7 semesters: Yes');
  await expect(labelOf(step(page, 'Count your semesters again'))).toHaveText('Check');
  await option(page, 'length', '3-year').click();
  await expect(questions(page).getByRole('group', { name: 'Have you completed fewer than 5 semesters?' })).toBeVisible();
  await expect(option(page, 'semesters', 'Yes')).toHaveAttribute('aria-pressed', 'false');
  await expect(slip(page)).not.toContainText('Count your semesters again');
  await expect(labelOf(step(page, 'you may need dMAT'))).toHaveText('Do next');
  await expect(snapshot).not.toContainText('Completed fewer than');

  // Follow-up B hidden by another APS answer starts unanswered when it shows again.
  await answer(page, [['aps', 'Applied, waiting'], ['apsDate', 'Yes']]);
  await expect(labelOf(step(page, 'that APS procedure does not need dMAT'))).toHaveText('Does not apply');
  await answer(page, [['aps', 'Not started']]);
  await expect(questions(page).getByRole('group', { name: QUESTION.apsDate })).toHaveCount(0);
  await answer(page, [['aps', 'Applied, waiting']]);
  await expect(option(page, 'apsDate', 'Yes')).toHaveAttribute('aria-pressed', 'false');
  await expect(slip(page)).not.toContainText('that APS procedure does not need dMAT');
  await expect(labelOf(step(page, 'you may need dMAT'))).toHaveText('Do next');
  await expect(snapshot).not.toContainText('APS registration or complete documents');
});

test('the answers summary is offered with the form and sent only when ticked', async ({ page }) => {
  const payloads: Record<string, unknown>[] = [];
  await page.route(endpoint, async route => {
    payloads.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
  });
  const summary = page.getByTestId('form-snapshot');
  const consent = page.locator('label[for="f-consent"]');
  const fill = async () => {
    await page.locator('#f-name').fill('Test visitor');
    await page.locator('#f-wa').fill('+91 9876543210');
    await page.locator('#f-consent').check();
  };
  const lines = ['Degree length: 3-year', 'APS: Applied, waiting'];

  await expect(summary).toHaveCount(0);
  await answer(page, [['length', '3-year'], ['aps', 'Applied, waiting']]);
  await expect(summary).toContainText('From your answers');
  await expect(summary).not.toContainText(/grade check/i);
  await expect(summary.getByRole('listitem')).toHaveText(lines);

  // Unticked: the plain consent sentence and no summary in the request.
  await fill();
  await expect(page.locator('#f-summary')).not.toBeChecked();
  await expect(consent).not.toContainText('summary');
  await page.getByRole('button', { name: 'Request my profile review' }).click();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
  expect(payloads).toHaveLength(1);
  expect(payloads[0]).not.toHaveProperty('snapshot');

  // Ticked: the consent names the answers, and the request carries them.
  await page.getByRole('button', { name: 'Send another' }).click();
  await fill();
  await page.locator('#f-summary').check();
  await expect(consent).toContainText('any email address I provide and the attached summary of my answers to contact me');
  await page.getByRole('button', { name: 'Request my profile review' }).click();
  await expect(page.locator('#contact-form [role="status"]')).toContainText('Received.');
  expect(payloads).toHaveLength(2);
  expect(payloads[1]).toMatchObject({ name: 'Test visitor', snapshot: lines.join(' · ') });
});

test('answers and a valid grade survive client-side navigation and clear on reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const nav = page.locator('nav').first();
  // A marker on the window shows the page was not reloaded between routes.
  await page.evaluate(() => { (window as unknown as { visitMarker: boolean }).visitMarker = true; });
  await answer(page, [['length', '3-year']]);

  await nav.getByRole('link', { name: 'Grade check', exact: true }).click();
  await expect(page).toHaveURL(/\/check$/);
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await page.locator('#check-score').fill('7.4');
  await expect(page.getByTestId('german-grade-value')).toHaveText('2.3');

  // The requirements guide and the dMAT pages share one header menu.
  await nav.getByRole('button', { name: 'Admissions', exact: true }).click();
  await nav.getByRole('link', { name: 'Requirements guide', exact: true }).click();
  await expect(page).toHaveURL(/\/requirements$/);
  expect(await page.evaluate(() => (window as unknown as { visitMarker?: boolean }).visitMarker)).toBe(true);
  await expect(option(page, 'length', '3-year')).toHaveAttribute('aria-pressed', 'true');
  await expect(step(page, 'Check each programme’s degree and credit rules')).toHaveCount(1);
  await expect(page.getByTestId('form-snapshot').getByRole('listitem')).toHaveText([
    'Degree length: 3-year',
    'German grade 2.3 (7.4 / 10, pass 4)',
  ]);

  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await expect(option(page, 'length', '3-year')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('form-snapshot')).toHaveCount(0);
  await expect(slip(page)).toContainText('Answer a question and your first step appears here.');
});

test('the phone flow works by keyboard and nothing covers the focused control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const stepper = questions(page).getByRole('group', { name: 'Move between questions' });
  const back = stepper.getByRole('button', { name: 'Back' });
  const forward = stepper.getByRole('button').last();
  const group = (question: keyof typeof QUESTION) => questions(page).getByRole('group', { name: QUESTION[question] });

  await expect(stepper).toContainText('Question 1 of 6');
  await expect(group('length')).toBeHidden();
  await expect(forward).toHaveText('Skip');

  // An answer moves on and focus follows to the next question.
  await option(page, 'stage', 'Still studying or exams outstanding').press('Enter');
  await expect(stepper).toContainText('Question 2 of 6');
  await expect(group('stage')).toBeHidden();
  await expect(group('length')).toBeFocused();
  await expectUncovered(group('length'));
  await page.keyboard.press('Tab');
  await expect(option(page, 'length', '3-year')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(stepper).toContainText('Question 3 of 6');
  await expect(group('field')).toBeFocused();
  await expect(group('field')).toContainText('B.Tech/B.Eng');

  // An answer that opens follow-ups stays, until they are answered.
  await option(page, 'field', 'One of the dMAT fields').press('Enter');
  await expect(stepper).toContainText('Question 3 of 6');
  await expect(group('semesters')).toBeVisible();
  await expect(group('semesters')).toContainText('Have you completed fewer than 5 semesters?');
  await expect(group('semesters')).toContainText('Below this number, dMAT does not apply under the current rules.');
  await expect(group('confirmedProgramme')).toBeVisible();
  await option(page, 'semesters', 'No').press('Enter');
  await expect(stepper).toContainText('Question 3 of 6');
  await option(page, 'confirmedProgramme', 'No').press('Enter');
  await expect(stepper).toContainText('Question 4 of 6');
  await expect(group('language')).toBeFocused();

  // Back, then Next (answered) and Skip (unanswered).
  await back.press('Enter');
  await expect(stepper).toContainText('Question 3 of 6');
  await expect(back).toBeFocused();
  await expect(forward).toHaveText('Next');
  await forward.press('Enter');
  await expect(stepper).toContainText('Question 4 of 6');
  await expect(forward).toHaveText('Skip');
  await forward.press('Enter');
  await expect(stepper).toContainText('Question 5 of 6');
  await expect(forward).toBeFocused();
  await expectUncovered(forward);
  await forward.press('Enter');
  await expect(stepper).toContainText('Question 6 of 6');

  // The last forward button reaches the slip.
  await expect(forward).toHaveText('See my steps');
  await forward.press('Enter');
  await expect(slip(page)).toBeFocused();
  await expectUncovered(slip(page).getByRole('heading', { name: /Your next steps/ }));
  await expect(step(page, 'you may need dMAT')).toContainText('Do next');

  // Tabbing through the slip, no link or button is covered.
  for (const control of await slip(page).locator('a, button').all()) {
    await control.focus();
    await expectUncovered(control);
  }
});
