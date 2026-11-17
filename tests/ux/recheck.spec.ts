import { expect, test, type Page } from '@playwright/test';

import { PUBLIC_PAGES } from '../../src/utils/publicPages.ts';

const viewports = [[320,568],[360,800],[375,812],[390,844],[412,891],[768,1024],[800,1280],[891,900],[1024,900],[1280,900],[1440,900],[1536,900],[1920,953],[891,412],[1280,585],[1536,730],[1099,900],[1100,900],[1101,900],[1219,900],[1220,900],[1221,900]];
const paths = [...PUBLIC_PAGES.map((entry) => entry.path.replace(/^\//, '')), 'missing-page'];
/** Pages inside the site shell, which have the full header. */
const shellPaths = PUBLIC_PAGES.filter((entry) => entry.shell === 'site').map((entry) => entry.path.replace(/^\//, ''));

async function ready(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
}

for (const [width, height] of viewports) {
  test(`full page sweep ${width}x${height}`, async ({ browser, baseURL }) => {
    test.setTimeout(180_000);
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1100, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && !message.text().includes('404')) errors.push(message.text());
    });
    // Never let a form submission leave the test browser.
    await page.route('https://enquiries.example.test/**', route => route.fulfill({ json: { received: true } }));
    for (const path of paths) {
      const url = `${baseURL!.replace(/\/$/, '')}/${path}`;
      await page.goto(url);
      await ready(page);
      await page.reload();
      await ready(page);
      await noOverflow(page);
      await expect(page.getByRole('main')).toHaveCount(1);
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('main')).toBeFocused();
      if (shellPaths.includes(path)) {
        const row = page.locator('nav').first().locator('[class*="_links_"]');
        if (width === 1219) {
          // Below the header breakpoint the menu button replaces the inline row.
          await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible();
          await expect(row.getByRole('button', { name: 'Admissions', exact: true })).toBeHidden();
        }
        if (width === 1220) {
          // From the breakpoint the inline row holds every entry, the Admissions menu included, on one line.
          await expect(row.getByRole('button', { name: 'Admissions', exact: true })).toBeVisible();
          const lines = await row.evaluate(element => {
            const items = [...element.children].filter(child => child.getBoundingClientRect().width > 0);
            const centres = items.map(child => { const box = child.getBoundingClientRect(); return box.top + box.height / 2; });
            // Each entry's label is one line of text: count the line boxes of its visible text.
            const textLines = items.map(child => {
              const tops = new Set<number>();
              const walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT);
              for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                if (!node.textContent?.trim()) continue;
                const range = document.createRange();
                range.selectNodeContents(node);
                for (const rect of range.getClientRects()) if (rect.width > 0) tops.add(Math.round(rect.top));
              }
              return tops.size;
            });
            return { spread: Math.max(...centres) - Math.min(...centres), maxTextLines: Math.max(...textLines) };
          });
          expect(lines.spread).toBeLessThanOrEqual(2);
          expect(lines.maxTextLines).toBe(1);
        }
        if (width < 1220) {
          const menu = page.getByRole('button', { name: 'Menu', exact: true });
          await menu.click();
          await page.keyboard.press('Tab');
          await expect(page.locator('#mobile-menu a').first()).toBeFocused();
          const last = page.locator('#mobile-menu a').last();
          await last.focus();
          const bounds = await last.boundingBox();
          expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height + 1);
          await page.keyboard.press('Escape');
          await expect(menu).toBeFocused();
        } else {
          // The About group opens inside the window, and the row still fits with it open.
          const about = page.locator('nav').getByRole('button', { name: 'About', exact: true });
          await about.click();
          await expect(about).toHaveAttribute('aria-expanded', 'true');
          const links = await page.locator('nav a:visible').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().toJSON()));
          expect(links.every(box => box.x >= 0 && box.right <= width)).toBe(true);
          await page.keyboard.press('Escape');
          await expect(about).toHaveAttribute('aria-expanded', 'false');
        }
      }
      if (!path) {
        for (let month = 1; month <= 7; month++) {
          await page.getByRole('button', { name: `Month ${month}`, exact: true }).click();
          await expect(page.getByTestId('month-tasks')).toBeVisible();
          await noOverflow(page);
        }
        const slider = page.getByRole('slider');
        await slider.focus();
        await page.keyboard.press('Home');
        await expect(slider).toHaveAttribute('aria-valuenow', '1');
        await page.keyboard.press('End');
        await expect(slider).toHaveAttribute('aria-valuenow', '7');
        const faq = page.locator('#faq button');
        for (const question of await faq.all()) {
          await question.focus();
          if (await question.getAttribute('aria-expanded') === 'false') await page.keyboard.press('Enter');
          await expect(question).toHaveAttribute('aria-expanded', 'true');
        }
        await page.getByRole('button', { name: 'Replay stamp animation' }).click();
        await expect(page.locator('#sop [data-stamped="true"]')).toHaveCount(2);
      }
      if (path === 'check') {
        await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
        await page.locator('#check-score').fill('11');
        await expect(page.locator('#check-input-error')).not.toBeEmpty();
        await page.locator('#check-score').fill('7.4');
        await expect(page.getByTestId('german-grade-value')).toHaveText('2.3');
      }
      await noOverflow(page);
    }
    expect(errors).toEqual([]);
    await context.close();
  });
}
