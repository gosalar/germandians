import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import {
  ADMISSION_DECISION,
  APPLICANT_CONTROL,
  EXTERNAL_COSTS_GUIDE_LEAD,
  EXTERNAL_COSTS_SEPARATE,
  FEE_POLICY,
  FEE_PROMISE,
  MENTORING,
  MENTOR_INTRO,
  QUOTE_TOPICS,
  SETBACKS_POLICY,
  SOP_INTRO,
  feeQuoteText,
} from '../../src/utils/constants.ts';
import { UX_ENDPOINTS } from './endpoints';

const QUESTION_TITLES = [
  'Are the terms in writing before I pay?',
  'Who exactly advises me, and how many students do they have?',
  "What happens if I'm not admitted, or my visa is refused?",
  'Do I keep my own portal logins?',
  'Is my SOP my own?',
  'Which costs go to other organisations?',
] as const;

const TEAM_COUNT = /\b(six|6)\s+(student\s+)?(mentors|students living in Germany)\b|\bteam of (six|6)\b|\ball (six|6) of us\b/i;

async function ready(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(async ({ page }) => {
  await page.route(UX_ENDPOINTS.profileReview, (route) => route.abort());
  await page.route(UX_ENDPOINTS.germanLessons, (route) => route.abort());
});

test('choosing-help loads cleanly with metadata, social preview image and Home contact routing', async ({
  page,
  request,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });

  for (const suffix of ['', '/']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/choosing-help${suffix}`);
    await ready(page);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Before you pay anyone');
    await expect(page.locator('#top')).toHaveCount(1);
  }

  const origin =
    testInfo.project.name === 'endpoint' ? 'https://germandians.example.test' : 'https://gosalar.github.io';
  const canonical = `${origin}/choosing-help/`;
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toBe(`${origin}/social/choosing-help.png`);
  const imageRes = await request.get('/social/choosing-help.png');
  expect(imageRes.ok()).toBe(true);
  expect(imageRes.headers()['content-type']).toContain('image/png');

  const nav = page.locator('nav').first();
  await expect(nav.getByRole('link', { name: 'Get my profile reviewed', exact: true })).toHaveAttribute(
    'href',
    '/#contact-form',
  );
  await page.getByRole('main').getByRole('link', { name: 'Get my profile reviewed', exact: true }).click();
  await expect(page).toHaveURL(/\/#contact-form$/);
  await expect(page.locator('#contact-form')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('all six questions and Germandians constant-backed answers render for the configured and fallback variants', async ({
  page,
  baseURL,
}) => {
  const endpointUrl = baseURL!.replace(/\/$/, '');
  const parsed = new URL(endpointUrl);
  const emailUrl = `${parsed.protocol}//${parsed.hostname}:${Number(parsed.port) + 1}`;

  const variants = [
    {
      name: 'endpoint',
      origin: endpointUrl,
      canonicalOrigin: 'https://germandians.example.test',
      intake: 'Winter 2027/28',
      feeText: feeQuoteText('Test quote'),
    },
    {
      name: 'email',
      origin: emailUrl,
      canonicalOrigin: 'https://gosalar.github.io',
      intake: 'Summer 2027',
      feeText: feeQuoteText(''),
    },
  ] as const;

  for (const variant of variants) {
    const errors: string[] = [];
    const onPageError = (error: Error) => errors.push(error.message);
    const onConsole = (message: { type: () => string; text: () => string }) => {
      if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
    };
    page.on('pageerror', onPageError);
    page.on('console', onConsole);

    await page.goto(`${variant.origin}/choosing-help`);
    await ready(page);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${variant.canonicalOrigin}/choosing-help/`,
    );

    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 2 })).toHaveText([
      ...QUESTION_TITLES,
      'Check the official rules first, or ask for a written quote',
    ]);

    for (const title of QUESTION_TITLES) {
      const section = main.getByRole('region', { name: title, exact: true });
      await expect(section.getByRole('heading', { level: 3 })).toHaveText([
        'What to ask and check',
        'How Germandians answers',
      ]);
      expect(await section.locator('ul').first().locator('li').count()).toBeGreaterThanOrEqual(3);
    }

    // Question 1: written terms and quote topics
    const q1 = main.getByRole('region', { name: QUESTION_TITLES[0], exact: true });
    await expect(q1).toContainText(FEE_PROMISE);
    await expect(q1).toContainText(variant.feeText);
    await expect(q1).toContainText(FEE_POLICY.exception);
    await expect(q1).toContainText(QUOTE_TOPICS.lead);
    for (const topic of QUOTE_TOPICS.items) await expect(q1).toContainText(topic);

    // Question 2: mentor ratio and intake cap (never team size)
    const q2 = main.getByRole('region', { name: QUESTION_TITLES[1], exact: true });
    await expect(q2).toContainText(MENTOR_INTRO);
    await expect(q2).toContainText(MENTORING.places(variant.intake));

    // Question 3: admission decisions, setbacks and cancellation governed by the written quote
    const q3 = main.getByRole('region', { name: QUESTION_TITLES[2], exact: true });
    await expect(q3).toContainText(ADMISSION_DECISION);
    await expect(q3).toContainText(FEE_POLICY.due);
    await expect(q3).toContainText(FEE_POLICY.exception);
    await expect(q3).toContainText(SETBACKS_POLICY);

    // Question 4: applicant portal control
    const q4 = main.getByRole('region', { name: QUESTION_TITLES[3], exact: true });
    await expect(q4).toContainText(APPLICANT_CONTROL);

    // Question 5: SOP drafted in the student's own words and approved before submission
    const q5 = main.getByRole('region', { name: QUESTION_TITLES[4], exact: true });
    for (const line of SOP_INTRO) await expect(q5).toContainText(line);

    // Question 6: external costs linked to /requirements#costs
    const q6 = main.getByRole('region', { name: QUESTION_TITLES[5], exact: true });
    await expect(q6).toContainText(EXTERNAL_COSTS_GUIDE_LEAD);
    await expect(q6).toContainText(EXTERNAL_COSTS_SEPARATE);
    const costsLink = q6.getByRole('link', { name: 'Costs in the requirements guide', exact: true });
    await expect(costsLink).toHaveAttribute('href', '/requirements#costs');

    // Strict copy prohibitions on the page
    const bodyText = await main.innerText();
    expect(bodyText).not.toContain('!');
    expect(bodyText).not.toMatch(/\bguarantees?\b|\bguaranteed\b/i);
    expect(bodyText).not.toMatch(TEAM_COUNT);

    // Following the Question 6 link opens the Costs topic on /requirements
    await costsLink.click();
    await expect(page).toHaveURL(/\/requirements\/?#costs$/);
    await expect(page.getByRole('article', { name: 'Costs', exact: true })).toBeVisible();

    expect(errors, `runtime errors on ${variant.name}`).toEqual([]);
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
  }
});

test('Home sections retain the exact shared wording after constant extraction', async ({ page }, testInfo) => {
  const isEndpoint = testInfo.project.name === 'endpoint';
  await page.goto('/');
  await ready(page);

  await expect(page.locator('#why')).toContainText(MENTOR_INTRO);
  await expect(page.locator('#why')).toContainText(APPLICANT_CONTROL);
  for (const line of SOP_INTRO) await expect(page.locator('#sop')).toContainText(line);

  const faq = page.locator('#faq');
  await expect(faq).toContainText(ADMISSION_DECISION);
  await faq.getByRole('button', { name: 'When do I get the terms in writing?' }).click();
  await expect(faq).toContainText(feeQuoteText(isEndpoint ? 'Test quote' : ''));
  await expect(faq).toContainText(QUOTE_TOPICS.lead);
  await faq.getByRole('button', { name: 'What if I’m not admitted, or my visa is refused?' }).click();
  await expect(faq).toContainText(SETBACKS_POLICY);
  await faq.getByRole('button', { name: 'Do you help with funding?' }).click();
  await expect(faq).toContainText(EXTERNAL_COSTS_GUIDE_LEAD);
  await expect(faq).toContainText(EXTERNAL_COSTS_SEPARATE);
});

test('keyboard navigation, focus visibility, print view and axe audit pass cleanly', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/choosing-help');
    await ready(page);

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(axe.violations).toEqual([]);

    // Skip link lands on main
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    // Every focusable control stays unobscured by sticky chrome
    const covered: string[] = [];
    for (let index = 0; index < 80; index++) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const r = el.getBoundingClientRect();
        const label = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 55) || el.id;
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

  // Jump link and print button work by keyboard, and print media hides interactive chrome
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/choosing-help');
  await ready(page);

  await page.evaluate(() => {
    (window as unknown as { __printed?: number }).__printed = 0;
    window.print = () => {
      (window as unknown as { __printed: number }).__printed += 1;
    };
  });
  const printBtn = page.getByRole('button', { name: 'Print these questions', exact: true });
  await printBtn.focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);

  const jumpNav = page.getByRole('navigation', { name: 'The six questions', exact: true });
  const q4Jump = jumpNav.getByRole('link', { name: /Do I keep my own portal logins\?/ });
  await q4Jump.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#portal-logins$/);
  await expect(page.getByRole('heading', { level: 2, name: QUESTION_TITLES[3] })).toBeInViewport();

  await page.emulateMedia({ media: 'print' });
  await expect(printBtn).toBeHidden();
  await expect(jumpNav).toBeHidden();
  for (const title of QUESTION_TITLES) {
    await expect(page.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
  }
});

for (const [width, height] of [
  [320, 568],
  [390, 844],
  [768, 1024],
  [1024, 900],
  [1440, 900],
] as const) {
  test(`responsive layout and touch targets hold at ${width}x${height}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: width < 1024,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
    });

    await page.goto(`${baseURL!.replace(/\/$/, '')}/choosing-help`);
    await ready(page);
    await page.reload();
    await ready(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    if (width < 1024) {
      // Touch targets inside main meet the 44px minimum height (including ::after touch-area expansion).
      const heights = await page
        .getByRole('main')
        .locator('a, button')
        .evaluateAll((elements) =>
          elements.map((el) => {
            const box = el.getBoundingClientRect();
            const after = Number.parseFloat(getComputedStyle(el, '::after').height) || 0;
            return Math.max(box.height, after);
          }),
        );
      expect(heights.length).toBeGreaterThan(0);
      for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
    }

    expect(errors).toEqual([]);
    await context.close();
  });
}
