import { expect, test, type Page } from '@playwright/test';

import { expectSameScreenshot, openPage, PAGES, settle } from './compare';

interface Scenario {
  name: string;
  width: number;
  /** Let animations play instead of rendering their final state. */
  motion?: boolean;
  /** Same steps run on the design and on the site. */
  act: (page: Page) => Promise<unknown>;
  /** CSS selector to screenshot, or the visible viewport. */
  shot: string | 'viewport';
  /** Part of the fast subset (`npm run test:visual:quick`). */
  quick?: boolean;
}

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

const scrollTo = (page: Page, id: string, block: ScrollLogicalPosition = 'start') =>
  page.evaluate(([target, position]) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'instant', block: position as ScrollLogicalPosition });
  }, [id, block]);

/** Scroll-triggered animations start a moment after the scroll; wait for one to begin. */
const animationStarted = (page: Page) => page.waitForFunction(() => document.getAnimations().length > 0);

const SCENARIOS: Scenario[] = [
  // Navigation
  {
    name: 'mobile menu open (390px)',
    width: 390,
    act: (p) => button(p, 'Menu').click(),
    shot: 'viewport',
    quick: true,
  },
  { name: 'tablet menu open (800px)', width: 800, act: (p) => button(p, 'Menu').click(), shot: 'viewport' },
  {
    name: 'nav link hover',
    width: 1440,
    act: (p) => p.getByRole('link', { name: /^(Universities|Public vs private)$/ }).hover(),
    shot: 'nav',
  },
  {
    name: 'hero CTA hover',
    width: 1440,
    act: (p) => p.getByRole('link', { name: 'Get my profile reviewed' }).nth(1).hover(),
    shot: 'header',
  },

  // Month explorer
  {
    name: 'nav CTA hover', width: 1440, quick: true,
    act: (p) => p.locator('nav').getByRole('link', { name: 'Get my profile reviewed' }).hover(), shot: 'nav',
  },
  {
    name: 'fees CTA hover', width: 1440,
    act: (p) => p.locator('#fees a[href="#contact-form"]').hover(), shot: '#fees',
  },
  {
    name: 'play button hover', width: 1440,
    act: (p) => button(p, 'Play all 7 months').hover(), shot: '#journey',
  },
  {
    name: 'next month hover', width: 1440,
    act: (p) => button(p, 'Next month').hover(), shot: '#journey',
  },
  {
    name: 'previous month disabled at month one', width: 1440,
    act: async (p) => { await expect(button(p, 'Previous month')).toBeDisabled(); }, shot: '#journey',
  },
  {
    name: 'form submit hover', width: 1440,
    act: (p) => button(p, 'Open email draft').hover(), shot: '#contact',
  },
  {
    name: 'form input focus', width: 1440, quick: true,
    act: (p) => p.locator('#f-name').focus(), shot: '#contact',
  },
  { name: 'month 5 selected', width: 1440, act: (p) => button(p, 'Month 5').click(), shot: '#journey', quick: true },
  {
    name: 'next month, then month 7 (1024px)',
    width: 1024,
    act: async (p) => {
      await button(p, 'Next month').click();
      await button(p, 'Month 7').click();
    },
    shot: '#journey',
  },
  { name: 'phase legend: Arrival (390px)', width: 390, act: (p) => button(p, 'Arrival').click(), shot: '#journey' },
  {
    name: 'month track keyboard',
    width: 1440,
    act: async (p) => {
      await p.getByRole('slider').focus();
      for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
    },
    shot: '#journey',
  },

  // FAQ
  {
    name: 'FAQ toggles',
    width: 1440,
    act: async (p) => {
      await button(p, 'Can you guarantee admission?').click();
      await button(p, 'Can I apply only to public universities?').click();
      await button(p, 'When do I get the terms in writing?').click();
    },
    shot: '#faq',
    quick: true,
  },

  // Contact form
  {
    name: 'form errors',
    width: 1440,
    act: (p) => button(p, 'Open email draft').click(),
    shot: '#contact',
    quick: true,
  },
  {
    name: 'form errors (390px)',
    width: 390,
    act: (p) => button(p, 'Open email draft').click(),
    shot: '#contact',
  },
  {
    name: 'form errors clear as fields are edited',
    width: 1440,
    act: async (p) => {
      await button(p, 'Open email draft').click();
      await p.locator('#f-name').fill('Priya Sharma');
      await p.locator('#f-wa').fill('+91 98765');
    },
    shot: '#contact',
  },

  // Scroll-driven
  {
    name: 'mobile action bar after scrolling (390px)',
    width: 390,
    act: async (p) => {
      await scrollTo(p, 'universities');
      // The bar appears once the hero buttons leave the screen.
      await p.waitForFunction(() =>
        [...document.querySelectorAll('a')].some(
          (a) => a.textContent === 'Open review form' && getComputedStyle(a).visibility === 'visible',
        ),
      );
    },
    shot: 'viewport',
    quick: true,
  },
  {
    name: 'receipt prints on scroll',
    width: 1440,
    motion: true,
    act: async (p) => {
      await scrollTo(p, 'fees');
      await animationStarted(p);
    },
    shot: '#fees',
    quick: true,
  },
  {
    name: 'SOP stamps land on scroll',
    width: 1440,
    motion: true,
    act: async (p) => {
      await scrollTo(p, 'sop', 'end');
      await animationStarted(p);
    },
    shot: '#sop',
    quick: true,
  },
];

for (const scenario of SCENARIOS) {
  test(`${scenario.name} matches the design`, { tag: scenario.quick ? '@quick' : [] }, async ({ browser }, testInfo) => {
    const capture = async (url: string) => {
      const page = await openPage(browser, url, {
        width: scenario.width,
        motion: scenario.motion,
        unstickNav: true,
      });
      await scenario.act(page);
      await settle(page);
      const shot =
        scenario.shot === 'viewport'
          ? await page.screenshot()
          : await page.locator(scenario.shot).first().screenshot({ animations: 'allow' });
      await page.context().close();
      return shot;
    };

    const [reference, app] = await Promise.all([capture(PAGES.home.reference), capture(PAGES.home.app)]);
    await expectSameScreenshot(testInfo, reference, app);
  });
}
