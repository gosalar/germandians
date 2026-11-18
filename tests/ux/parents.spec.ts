import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import {
  APPLICANT_CONTROL,
  ARRIVAL_SUPPORT,
  CONTACT,
  FEE_POLICY,
  FEE_PROMISE,
  GERMAN_LESSONS,
  MENTORING,
  feeQuoteText,
} from '../../src/utils/constants';
import { UX_ENDPOINTS } from './endpoints';

const SECTION_HEADINGS = [
  'What a master’s at a public German university costs',
  'What a blocked account (Sperrkonto) is',
  'What Germandians helps with — and what it does not',
  'When the service fee is due',
  'What happens to the details a student sends',
] as const;

const TEAM_COUNT =
  /\b(six|6)\s+(student\s+)?(mentors|students living in Germany)\b|\bteam of (six|6)\b|\ball (six|6) of us\b/i;

function attachErrorGuards(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydrat/i.test(message.text())) {
      errors.push(`${message.type()}: ${message.text()}`);
    }
  });
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
});

test('prerenders all five parent sections with official figures, SourceNote citations and no unsupported claims', async ({
  page,
  request,
}) => {
  const errors = attachErrorGuards(page);

  const html = await (await request.get('/parents')).text();
  for (const heading of SECTION_HEADINGS) {
    expect(html).toContain(heading);
  }
  expect(html).toContain(FEE_PROMISE);
  expect(html).toContain('€992 per month');
  expect(html).toContain('₹18,000');

  await page.goto('/parents');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(['For parents']);
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    ...SECTION_HEADINGS,
    'Next steps for you and your child',
  ]);

  // Section 1: official public-university and external costs + SourceNote review dates.
  const costsSection = main.getByRole('region', {
    name: SECTION_HEADINGS[0],
    exact: true,
  });
  await expect(costsSection).toContainText('Baden-Württemberg');
  await expect(costsSection).toContainText('Technical University of Munich (TUM)');
  await expect(costsSection).toContainText('Semesterbeitrag');
  await expect(costsSection).toContainText('€70–€430');
  await expect(costsSection).toContainText('₹18,000');
  await expect(costsSection).toContainText('€150');
  await expect(costsSection).toContainText('€75 / €30');
  await expect(costsSection).toContainText('€75');
  await expect(costsSection).toContainText('€4,000 or €6,000');
  await expect(costsSection).toContainText('Check the current amount and payment instructions with each provider');

  const costSources = costsSection.getByText(/Last reviewed \d{1,2} \w+ \d{4}/);
  expect(await costSources.count()).toBeGreaterThanOrEqual(7);
  for (const source of await costSources.all()) {
    const link = source.getByRole('link');
    await expect(link).toHaveAttribute('href', /^https:\/\//);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener');
  }
  await expect(
    costsSection.getByRole('link', { name: 'Read Costs in the requirements guide' }),
  ).toHaveAttribute('href', '/requirements#costs');

  // Section 2: blocked account figures, alternatives and topic links.
  const blockedSection = main.getByRole('region', {
    name: SECTION_HEADINGS[1],
    exact: true,
  });
  await expect(blockedSection).toContainText('Sperrkonto (blocked account)');
  await expect(blockedSection.getByTestId('blocked-account-figure')).toContainText('€992 per month');
  await expect(blockedSection.getByTestId('blocked-account-figure')).toContainText('€11,904');
  await expect(blockedSection).toContainText('one way to show proof of living funds');
  await expect(blockedSection).toContainText('several ways to show proof of funds');
  await expect(blockedSection).toContainText(
    'The German Missions accept blocked accounts from several banks and have no preference between providers. An education loan is additional to the blocked account.',
  );
  for (const card of await blockedSection.locator('[class*="noteCard"]').all()) {
    await expect(card).not.toContainText('Germandians');
  }
  const blockedSources = blockedSection.getByText(/Last reviewed \d{1,2} \w+ \d{4}/);
  expect(await blockedSources.count()).toBeGreaterThanOrEqual(3);
  await expect(
    blockedSection.getByRole('link', { name: 'Read Visa and enrolment in the requirements guide' }),
  ).toHaveAttribute('href', '/requirements#visa-enrolment');
  await expect(
    blockedSection.getByRole('link', { name: 'Read Costs in the requirements guide' }),
  ).toHaveAttribute('href', '/requirements#costs');

  // Section 3: mentoring scope, capacity, decision-makers, applicant control, arrival limits and German lessons.
  const helpSection = main.getByRole('region', {
    name: SECTION_HEADINGS[2],
    exact: true,
  });
  await expect(helpSection).toContainText(MENTORING.mentoring);
  await expect(helpSection).toContainText(MENTORING.community);
  await expect(helpSection).toContainText('Up to 5 students per mentor');
  await expect(helpSection).toContainText(APPLICANT_CONTROL);
  await expect(helpSection).toContainText(ARRIVAL_SUPPORT.availability);
  await expect(helpSection).toContainText(ARRIVAL_SUPPORT.settling);
  await expect(helpSection).toContainText(ARRIVAL_SUPPORT.complimentary);
  await expect(helpSection).toContainText(ARRIVAL_SUPPORT.quote);
  await expect(helpSection).toContainText('Universities make every admission decision themselves');
  await expect(helpSection).toContainText('German Missions in India');
  await expect(helpSection).toContainText(GERMAN_LESSONS.offer);
  await expect(helpSection).toContainText(GERMAN_LESSONS.separate);
  await expect(helpSection).toContainText(GERMAN_LESSONS.charges);
  await expect(helpSection).toContainText(GERMAN_LESSONS.certificate);
  await expect(helpSection.getByRole('link', { name: 'Learn German' })).toHaveAttribute(
    'href',
    '/learn-german',
  );

  // Copy prohibitions across the entire page.
  const bodyText = await main.innerText();
  expect(bodyText).not.toContain('!');
  expect(bodyText).not.toMatch(TEAM_COUNT);

  expect(errors).toEqual([]);
});

test('renders accurate fee terms and privacy summary across both endpoint and email UX variants', async ({
  page,
  browser,
  baseURL,
}) => {
  const errors = attachErrorGuards(page);
  await page.goto('/parents');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const main = page.getByRole('main');
  const feeSection = main.getByRole('region', { name: SECTION_HEADINGS[3], exact: true });
  await expect(feeSection).toContainText(FEE_PROMISE);
  await expect(feeSection).toContainText(FEE_POLICY.due);
  await expect(feeSection).toContainText(FEE_POLICY.exception);
  await expect(feeSection.getByRole('link', { name: 'See the Fees section on Home' })).toHaveAttribute(
    'href',
    '/#fees',
  );
  await expect(feeSection.getByRole('link', { name: 'Read the FAQ on Home' })).toHaveAttribute(
    'href',
    '/#faq',
  );

  const privacySection = main.getByRole('region', { name: SECTION_HEADINGS[4], exact: true });
  await expect(privacySection).toContainText(
    'no tracking or advertising cookies, loads no third-party analytics scripts',
  );
  await expect(privacySection.getByRole('link', { name: CONTACT.email })).toHaveAttribute(
    'href',
    `mailto:${CONTACT.email}`,
  );
  const privacyLink = privacySection.getByRole('link', { name: 'Read the full privacy note' });
  await expect(privacyLink).toHaveAttribute('href', '/privacy');

  // Configured endpoint variant checks.
  await expect(main).toContainText('30 places for the Winter 2027/28 intake.');
  await expect(feeSection).toContainText('Our service fee is Test quote.');
  await expect(privacySection).toContainText('Test Operator Example, Test Street 1, 00000 Testville');
  await expect(privacySection).toContainText(
    'Google receives the forms submitted on this site and keeps them in our Google Sheets',
  );

  await privacyLink.click();
  await expect(page).toHaveURL(/\/privacy\/?$/);
  expect(errors).toEqual([]);

  // Fallback email variant checks (served on portBase + 1 by playwright.ux.config.ts).
  const currentUrl = new URL(baseURL!);
  const emailOrigin = `${currentUrl.protocol}//${currentUrl.hostname}:${Number(currentUrl.port) + 1}`;
  const emailContext = await browser.newContext({ reducedMotion: 'reduce' });
  const emailPage = await emailContext.newPage();
  const emailErrors = attachErrorGuards(emailPage);

  await emailPage.goto(`${emailOrigin}/parents`);
  await emailPage.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const emailMain = emailPage.getByRole('main');
  await expect(emailMain).toContainText('30 places for the Summer 2027 intake.');
  await expect(emailMain.getByTestId('parents-fee-banner')).toContainText('Written quote');
  await expect(emailMain).toContainText(feeQuoteText(''));
  await expect(emailMain).not.toContainText('Test Operator Example');
  await expect(emailMain).toContainText(
    'open an email draft addressed to us rather than sending details from the page. Nothing is sent until the student presses send in their email app',
  );
  expect(emailErrors).toEqual([]);
  await emailContext.close();
});

test('supports keyboard navigation, passes axe accessibility audit and formats cleanly for print', async ({
  page,
}) => {
  const errors = attachErrorGuards(page);

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/parents');
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(axe.violations).toEqual([]);

    // Skip link reaches the main landmark.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    // Every focusable element stays visible and unobscured by sticky chrome.
    await page.goto('/parents');
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    const covered: string[] = [];
    for (let index = 0; index < 90; index++) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const r = el.getBoundingClientRect();
        const label =
          el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 55) || el.id;
        const hit = document.elementFromPoint(
          Math.max(0, Math.min(innerWidth - 1, r.x + r.width / 2)),
          Math.max(0, Math.min(innerHeight - 1, r.y + r.height / 2)),
        );
        return {
          label,
          skip: el.textContent === 'Skip to content',
          body: el === document.body,
          covered:
            r.top < 0 ||
            r.bottom > innerHeight + 1 ||
            !hit ||
            !(el.contains(hit) || hit.contains(el)),
        };
      });
      if (index > 0 && (focus.skip || focus.body)) break;
      if (focus.covered) covered.push(focus.label ?? 'unnamed');
    }
    expect(covered).toEqual([]);
  }

  // In-page navigation by keyboard and print action / @media print rules.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/parents');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const blockedJump = page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: SECTION_HEADINGS[1] });
  await blockedJump.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#blocked-account$/);

  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printed = 'true';
    };
  });
  await page.getByRole('button', { name: 'Print or save as PDF' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-printed', 'true');

  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('navigation', { name: 'On this page' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeHidden();
  for (const heading of SECTION_HEADINGS) {
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(0);

  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive layout has no overflow or errors at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: width < 1024,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = attachErrorGuards(page);

    await page.goto(`${baseURL!.replace(/\/$/, '')}/parents`);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    await page.reload();
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'For parents' })).toBeVisible();

    expect(errors).toEqual([]);
    await context.close();
  });
}
