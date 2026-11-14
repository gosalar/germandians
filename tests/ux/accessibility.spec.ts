import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { PUBLIC_PAGES } from '../../src/utils/publicPages.ts';

const ROUTES = [...PUBLIC_PAGES.map((page) => page.path), '/missing-page'];

for (const width of [390, 1440]) for (const route of ROUTES) {
  test(`accessibility audit ${route} at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
    expect(results.violations).toEqual([]);
  });
}

// The audit above does not look at placeholder text, so its contrast is measured here.
for (const route of ['/', '/check']) {
  test(`placeholder text meets 4.5:1 on ${route}`, async ({ page }) => {
    await page.goto(route);
    const ratios = await page.locator('input[placeholder]').evaluateAll((inputs) => {
      const luminance = (colour: string) => {
        const [r, g, b] = colour.match(/[\d.]+/g)!.slice(0, 3).map((value) => {
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
    for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
}

for (const width of [390, 1440]) for (const route of ROUTES) {
  test(`keyboard focus is visible and unobscured ${route} at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(route);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    const covered: string[] = [];
    for (let index = 0; index < 160; index++) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const r = el.getBoundingClientRect();
        const label = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 55) || el.id;
        const hit = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, r.x + r.width / 2)), Math.max(0, Math.min(innerHeight - 1, r.y + r.height / 2)));
        return { label, skip: el.textContent === 'Skip to content', body: el === document.body,
          covered: r.top < 0 || r.bottom > innerHeight + 1 || !hit || !(el.contains(hit) || hit.contains(el)) };
      });
      if (index > 0 && (focus.skip || focus.body)) break;
      if (focus.covered) covered.push(focus.label ?? 'unnamed');
    }
    expect(covered).toEqual([]);
  });
}
