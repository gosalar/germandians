import { expect, test } from '@playwright/test';

const TRACK_RECORD = 'We guided up to 70 students over two years, unpaid, before the paid service began.';
const AUDIENCE_LABEL = 'Community audience on Instagram and WhatsApp';
const APPLICANT_CONTROL = 'You check the facts, approve each submission and keep control of your own accounts, so the confirmations come to you.';
const HOUSING_AVAILABILITY = 'Housing depends on availability, so a room is not guaranteed.';
const COMPLIMENTARY = 'Help finding a temporary stay and guidance on part-time work are complimentary.';

/** Claims the site made before, which nothing on record supports. */
const REMOVED_CLAIMS = [
  '22,000-member',
  'students in the Germandians community',
  'More than 22,000 have joined',
  '22,000 members',
  'Members in the Germandians student community',
  'Why we are different',
  'Many agencies',
  'Many consultancies',
  'many consultancies',
  '100+ students',
  '1,000+ applications',
  'templated or reused',
  'outdated information',
  'reused template',
  'Often upfront',
  'by hand',
  'Standard, non-personalised SOP',
  'written with the student',
  'We write yours',
  'SOP, written with you',
  'Portal applications',
  'submit every application',
  'first week',
  'how your chances look',
];

/** The team's size is held for the capacity calculation, not published. Other uses of "six" are fine. */
const TEAM_COUNT = /\b(six|6)\s+(student\s+)?(mentors|students living in Germany)\b|\bteam of (six|6)\b|\ball (six|6) of us\b/i;

test('unsupported claims are gone from the home page and the grade check', async ({ page }) => {
  for (const path of ['/', '/check']) {
    await page.goto(path);
    const text = await page.locator('body').innerText();
    for (const claim of REMOVED_CLAIMS) expect(text, `${path} still says "${claim}"`).not.toContain(claim);
    expect(text, `${path} states the team's size`).not.toMatch(TEAM_COUNT);
  }
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', /first week/);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', TEAM_COUNT);
  // Closed answers and other months are not in the page text until they are opened.
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  for (const question of await page.locator('#faq').getByRole('button').all()) {
    if ((await question.getAttribute('aria-expanded')) === 'false') await question.click();
  }
  expect(await page.locator('#faq').innerText()).not.toMatch(TEAM_COUNT);
  for (let month = 1; month <= 7; month++) {
    await page.getByRole('button', { name: `Month ${month}`, exact: true }).click();
    expect(await page.locator('#journey').innerText()).not.toMatch(TEAM_COUNT);
  }
});

test('audience size, direct guidance and intake places are told apart', async ({ page }) => {
  await page.goto('/');
  // The audience figure carries one label wherever it appears.
  for (const id of ['#community']) {
    await expect(page.locator(id)).toContainText('22,000+');
    await expect(page.locator(id)).toContainText(AUDIENCE_LABEL);
  }
  await expect(page.locator('#top')).not.toContainText('22,000');
  // Experience stays early; the mentor section focuses on delivery and capacity.
  await expect(page.locator('#top')).toContainText(TRACK_RECORD);
  await expect(page.getByText(TRACK_RECORD)).toHaveCount(1);
  await expect(page.locator('#community')).toContainText('The consultancy grew out of what they kept asking us.');
  await expect(page.locator('#why')).not.toContainText('Up to 70');
  await expect(page.locator('#why')).toContainText('30 places for Winter 2027/28');
  await expect(page.locator('#community')).toContainText('what the questions from our community have taught us since');
});

test('the real case and the invented example are each labelled, without a claimed cause', async ({ page }) => {
  await page.goto('/');
  const sop = page.locator('#sop');
  await expect(sop).toContainText('Illustrative example. The student and details are invented.');
  await expect(sop).toContainText('Real case from the Winter 2025 cycle.');
  await expect(sop).toContainText('CGPA alone did not explain the outcomes.');
  await expect(sop).toContainText('Applicant A');
  await expect(sop).toContainText('Applicant B, mentored by Germandians');
  await expect(sop).toContainText('Nothing is submitted until you’ve approved the final version.');
  await expect(sop).not.toContainText(/same programme|declined|withheld|permission/i);
  // The stamps are in place without motion, and clicking the cards does not hide them.
  for (const verdict of ['REJECTED', 'ADMITTED']) {
    await expect(sop.getByText(verdict, { exact: true })).toHaveAttribute('data-stamped', 'true');
  }
  await sop.getByText('REJECTED', { exact: true }).click();
  await expect(sop.getByText('ADMITTED', { exact: true })).toHaveAttribute('data-stamped', 'true');
});

test('the mentor section lists commitments as a table, and as cards on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const section = page.locator('#why');
  await expect(section.getByRole('heading', { level: 3, name: 'What we commit to' })).toBeVisible();
  const table = section.getByRole('table', { name: 'What we commit to' });
  await expect(table.getByRole('columnheader')).toHaveText(['Part of the service', 'Our commitment']);
  await expect(table.getByRole('rowheader')).toHaveCount(7);
  await expect(table.getByRole('cell')).toHaveCount(7);
  // Applicant control is stated in full once: in the table, and in its card version on a phone.
  await expect(table.getByRole('row', { name: /Your applications/ }).getByRole('cell')).toHaveText(APPLICANT_CONTROL);
  await expect(page.getByText(APPLICANT_CONTROL).filter({ visible: true })).toHaveCount(1);
  // Requirement and credit checks come before SOP support.
  const points = section.locator('ul').first().locator('li');
  await expect(points).toHaveCount(3);
  await expect(points.nth(0)).toContainText('admission requirements');
  await expect(points.nth(1)).toContainText('subject credits');
  await expect(points.nth(2)).toContainText('SOP');
  // The diagram shows the cap in numbers for the pinned intake.
  await expect(section).toContainText('Up to 5 students per mentor');
  await expect(section).toContainText('30 places for Winter 2027/28');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(table).toBeHidden();
  await expect(page.getByText(APPLICANT_CONTROL).filter({ visible: true })).toHaveCount(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('the receipt, journey and FAQ describe drafting and approval the same way', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#fees')).toContainText('SOP drafting and review');
  await expect(page.locator('#fees')).toContainText('Applications, approved by you');
  await expect(page.locator('#journey')).toContainText('help you draft and revise your SOP');
  await page.getByRole('button', { name: 'Month 4', exact: true }).click();
  await expect(page.getByTestId('month-tasks')).toContainText('once you have approved each one');
  await expect(page.locator('#universities')).toContainText('We only shortlist accredited, reputable ones.');
});

test('housing help names temporary stays with its availability limit beside the offer', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#housing');
  await expect(section.getByRole('heading', { level: 2, name: 'Housing and settling in' })).toBeVisible();
  const offer = section.getByTestId('housing-offer');
  await expect(offer).toContainText('temporary stay');
  await expect(offer).toContainText(HOUSING_AVAILABILITY);
  await expect(section).toContainText('Anmeldung');
  await expect(section).toContainText('Part-time work');
  await expect(section).toContainText(COMPLIMENTARY);
  // The commitments and the FAQ state the same limit and charge terms in the same words.
  for (const terms of [HOUSING_AVAILABILITY, COMPLIMENTARY]) await expect(page.locator('#why')).toContainText(terms);
  const faq = page.locator('#faq');
  await faq.getByRole('button', { name: 'What help do you give with housing and settling in?' }).click();
  for (const terms of [HOUSING_AVAILABILITY, COMPLIMENTARY]) await expect(faq).toContainText(terms);
  // Complimentary help is outside the standard service, so the receipt does not list it.
  await expect(page.locator('#fees')).not.toContainText(/temporary stay|part-time/i);
});

test('the FAQ groups thirteen questions, opens each on its own and works by keyboard', async ({ page }) => {
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const faq = page.locator('#faq');
  await expect(faq.getByRole('heading', { level: 3 })).toHaveText(['The service', 'Fees and terms', 'Requirements']);
  const questions = faq.getByRole('button');
  await expect(questions).toHaveCount(13);
  // Every question points at its own answer panel, and the panel is named by its question.
  const links = await questions.evaluateAll((buttons) =>
    buttons.map((button) => {
      const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
      return Boolean(panel) && !/\s/.test(button.id) && panel?.getAttribute('aria-labelledby') === button.id;
    }),
  );
  expect(links).toEqual(Array(13).fill(true));
  // Only the first answer starts open.
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'true');
  for (let i = 1; i < 13; i++) await expect(questions.nth(i)).toHaveAttribute('aria-expanded', 'false');
  await expect(faq).toContainText('Universities make every admission decision themselves.');

  // Keyboard: Enter opens one answer and leaves the others as they were.
  const backlogs = faq.getByRole('button', { name: 'Can I apply with backlogs?' });
  await backlogs.focus();
  await page.keyboard.press('Enter');
  await expect(backlogs).toHaveAttribute('aria-expanded', 'true');
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'true');
  await expect(faq).toContainText('whether it accepts a degree with exams still to clear');
  await page.keyboard.press('Enter');
  await expect(backlogs).toHaveAttribute('aria-expanded', 'false');

  // Requirement answers stay programme-specific; none states a general rule.
  for (const name of ['Can I apply with backlogs?', 'Is a three-year bachelor’s degree enough?', 'Does a gap year matter?', 'Which language certificate do I need?']) {
    await faq.getByRole('button', { name }).click();
  }
  await expect(faq.getByText('That depends on the programme', { exact: false })).toHaveCount(4);

  // Payment edge cases and partial support point to the quote, in the fee section's words.
  await faq.getByRole('button', { name: 'What if I’m not admitted, or my visa is refused?' }).click();
  await expect(faq).toContainText('an unsuccessful intake, a visa refusal or a funding failure');
  await faq.getByRole('button', { name: 'Is the service right for my degree and stage?' }).click();
  await expect(faq).toContainText('your written quote states what partial support includes');
  await faq.getByRole('button', { name: 'Are you connected to any university?' }).click();
  await expect(faq).toContainText('none of them pay us');

  await faq.getByRole('link', { name: 'See what to check for each programme' }).click();
  await expect(page).toHaveURL(/\/check\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('German grade and requirements check');
});
