import { test } from '@playwright/test';

import { expectSameScreenshot, openPage, PAGES } from './compare';

// Every layout the design switches between: desktop, the 940px nav switch, the
// 760px mobile switch, two- and one-column journey stages, and small phones.
const HOME_WIDTHS = [1440, 1280, 1024, 900, 768, 700, 600, 480, 390, 320];
const PRIVACY_WIDTHS = [1440, 1024, 768, 390, 320];

// One desktop, one tablet and one phone layout for the fast subset (`npm run test:visual:quick`).
const QUICK_WIDTHS = new Set([1440, 768, 390]);

const CASES = [
  ...HOME_WIDTHS.map((width) => ({ page: 'home' as const, width })),
  ...PRIVACY_WIDTHS.map((width) => ({ page: 'privacy' as const, width })),
];

for (const { page: name, width } of CASES) {
  const tag = QUICK_WIDTHS.has(width) ? '@quick' : [];
  test(`${name} page at ${width}px matches the design`, { tag }, async ({ browser }, testInfo) => {
    const capture = async (url: string) => {
      const page = await openPage(browser, url, { width });
      const shot = await page.screenshot({ fullPage: true });
      await page.context().close();
      return shot;
    };

    const [reference, app] = await Promise.all([capture(PAGES[name].reference), capture(PAGES[name].app)]);
    await expectSameScreenshot(testInfo, reference, app);
  });
}
