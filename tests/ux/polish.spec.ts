import { expect, test } from '@playwright/test';

import { PUBLIC_PAGES } from '../../src/utils/publicPages.ts';

test('opening actions and section roles stay distinct', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('header#top');
  await expect(hero.getByRole('link', { name: 'Free grade check', exact: true })).toHaveAttribute('href', '/check');
  await expect(hero.getByRole('link', { name: 'Get my profile reviewed', exact: true })).toBeVisible();
  await expect(hero.getByRole('link', { name: /Instagram/ })).toHaveCount(0);
  // The story section tells the origin and leads to About; the community intro carries the audience figure.
  await expect(page.locator('#story').getByRole('link', { name: 'More about us', exact: true })).toHaveAttribute('href', '/about');
  await expect(page.locator('#story')).not.toContainText('22,000');
  await expect(page.locator('#community')).toContainText('Community audience on Instagram and WhatsApp');
  await expect(page.locator('#why')).not.toContainText('22,000');
  await expect(page.locator('#why')).not.toContainText('Up to 70');
});

for (const route of [...PUBLIC_PAGES.map((page) => page.path), '/missing-page']) {
  test(`skip navigation reaches the single main landmark on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await expect(page.getByRole('main')).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });
}

test('Escape returns focus to the phone menu trigger', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.keyboard.press('Tab');
  await expect(page.locator('#mobile-menu a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
  await expect(page.locator('#mobile-menu')).toHaveCount(0);
});

test('stamp replay works with a keyboard and respects reduced motion', async ({ page }) => {
  await page.goto('/');
  const replay = page.getByRole('button', { name: 'Replay stamp animation' });
  await replay.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sop [data-stamped="true"]')).toHaveCount(2);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // The stamps lift for a fraction of a second, so record the change instead of racing it.
  await page.evaluate(() => {
    const lifted = new Set<Element>();
    new MutationObserver((records) => {
      for (const record of records) {
        const stamp = record.target as Element;
        if (stamp.getAttribute('data-stamped') === 'false') lifted.add(stamp);
      }
      document.documentElement.dataset.stampsLifted = String(lifted.size);
    }).observe(document.querySelector('#sop')!, { subtree: true, attributeFilter: ['data-stamped'] });
  });
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-stamps-lifted', '2');
  await expect(page.locator('#sop [data-stamped="true"]')).toHaveCount(2);
});
