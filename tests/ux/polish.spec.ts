import { expect, test, type Page } from '@playwright/test';

import { PUBLIC_PAGES } from '../../src/utils/publicPages.ts';

async function focusedElementHit(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) {
      return { tag: el?.tagName.toLowerCase() ?? null, label: null, hitLabel: null, covered: true };
    }
    const r = el.getBoundingClientRect();
    const label = el.getAttribute('aria-label') || el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 55) || el.id;
    const hit = document.elementFromPoint(
      Math.max(0, Math.min(innerWidth - 1, r.x + r.width / 2)),
      Math.max(0, Math.min(innerHeight - 1, r.y + r.height / 2)),
    );
    const hitLabel = hit
      ? hit.getAttribute('aria-label') || hit.textContent?.trim().replace(/\s+/g, ' ').slice(0, 55) || hit.id || hit.tagName.toLowerCase()
      : null;
    return {
      tag: el.tagName.toLowerCase(),
      label,
      hitLabel,
      covered: r.top < 0 || r.bottom > innerHeight + 1 || !hit || !(el.contains(hit) || hit.contains(el)),
    };
  });
}

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

test('tabbing past the expanded phone menu closes it and reveals the focused element', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const lastMenuLink = page.locator('#mobile-menu a').last();
  await expect(lastMenuLink).toHaveAccessibleName('Get my profile reviewed');
  await lastMenuLink.focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#mobile-menu')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('main a[href="#fees"]').first()).toBeFocused();
  expect((await focusedElementHit(page)).covered).toBe(false);
});

test('following a footer link to another page moves focus into main content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.getByRole('navigation', { name: 'Footer' })
    .getByRole('link', { name: 'Budget planner' }).press('Enter');
  await expect(page).toHaveURL(/\/budget\/?$/);
  await expect(page.getByRole('main')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press('Tab');
  expect(await page.locator('main').evaluate((el) => el.contains(document.activeElement))).toBe(true);
  expect((await focusedElementHit(page)).covered).toBe(false);
});

test('phone menu supports Shift+Tab, short-screen scrolling, same-page hashes, outside clicks and touch taps', async ({ browser, baseURL }) => {
  // Short screen: Shift+Tab order, scrolling inside the menu, and activating a same-page hash link.
  const desktopCtx = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
  const page = await desktopCtx.newPage();
  await page.goto(`${baseURL}/`);
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const openTrigger = page.getByRole('button', { name: 'Menu', exact: true });
  const closeTrigger = page.getByRole('button', { name: 'Close', exact: true });
  const menu = page.locator('#mobile-menu');

  await openTrigger.click();
  await page.keyboard.press('Tab');
  await expect(menu.locator('a').first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(closeTrigger).toBeFocused();
  await expect(menu).toHaveCount(1);
  // Leaving the nav backwards to the skip link closes the menu without stealing focus back.
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('nav').first().locator('a').first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await expect(menu).toHaveCount(0);
  expect((await focusedElementHit(page)).covered).toBe(false);

  // Clicking a non-focusable group label and scrolling the short-screen menu keeps it open until a link is chosen.
  await openTrigger.click();
  await expect(menu).toHaveCount(1);
  await menu.getByText('Admissions', { exact: true }).click();
  await expect(menu).toHaveCount(1);
  const scrolled = await menu.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    return el.scrollTop;
  });
  expect(scrolled).toBeGreaterThan(0);
  await expect(menu).toHaveCount(1);
  await menu.getByRole('link', { name: 'Fees', exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.locator('#fees')).toBeInViewport();
  await desktopCtx.close();

  // Outside clicks on a tablet viewport close the menu and keep both non-interactive and interactive targets usable.
  const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 }, reducedMotion: 'reduce' });
  const tablet = await tabletCtx.newPage();
  await tablet.goto(`${baseURL}/`);
  await tablet.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await tablet.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(tablet.locator('#mobile-menu')).toHaveCount(1);
  await tablet.getByRole('heading', { level: 1 }).click();
  await expect(tablet.locator('#mobile-menu')).toHaveCount(0);
  // Click an outside interactive link visible below the open menu: the link activates and the menu closes.
  await tablet.setViewportSize({ width: 768, height: 1200 });
  await tablet.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(tablet.locator('#mobile-menu')).toHaveCount(1);
  await tablet.locator('header#top').getByRole('link', { name: 'Free grade check', exact: true }).click();
  await expect(tablet).toHaveURL(/\/check\/?$/);
  await expect(tablet.locator('#mobile-menu')).toHaveCount(0);
  await tabletCtx.close();

  // Touch tap on a menu link does not collapse the panel before activating the link, and Back closes an open menu.
  const touchCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
  const touch = await touchCtx.newPage();
  await touch.goto(`${baseURL}/`);
  await touch.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await touch.getByRole('button', { name: 'Menu', exact: true }).tap();
  await expect(touch.locator('#mobile-menu')).toHaveCount(1);
  await touch.locator('#mobile-menu').getByRole('link', { name: 'Learn German', exact: true }).tap();
  await expect(touch).toHaveURL(/\/learn-german\/?$/);
  await expect(touch.locator('#mobile-menu')).toHaveCount(0);
  await expect(touch.getByRole('main')).toBeFocused();
  await touch.getByRole('button', { name: 'Menu', exact: true }).tap();
  await expect(touch.locator('#mobile-menu')).toHaveCount(1);
  await touch.goBack();
  await expect(touch).toHaveURL(/\/$/);
  await expect(touch.locator('#mobile-menu')).toHaveCount(0);
  await touchCtx.close();
});

test('route focus handles minimal layout transitions, explicit hashes, history and interactive controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  // Same-page fee anchor keeps keyboard use at the section without stealing focus back to main.
  await page.locator('header#top a[href="#fees"]').press('Enter');
  await expect(page).toHaveURL(/\/#fees$/);
  await expect(page.locator('#fees')).toBeInViewport();
  await expect(page.getByRole('main')).not.toBeFocused();

  // Deep link to /requirements#costs scrolls to the costs topic instead of focusing main at the top.
  await page.locator('#fees').getByRole('link', { name: /Other costs to plan for/ }).press('Enter');
  await expect(page).toHaveURL(/\/requirements#costs$/);
  await expect(page.locator('#costs')).toBeInViewport();
  await expect(page.getByRole('main')).not.toBeFocused();

  // Transitions into and out of the minimal layout (/privacy) move focus into main content.
  await page.getByRole('navigation', { name: 'Footer' })
    .getByRole('link', { name: 'Privacy', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/privacy\/?$/);
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('link', { name: 'Back to the site', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('main')).toBeFocused();

  // Returning from the 404 minimal layout to Home also focuses main.
  await page.goto('/missing-page');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.getByRole('link', { name: 'Back to the site', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('main')).toBeFocused();

  // Back/Forward (POP) from a page scrolled partway down preserves history scroll instead of jumping.
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(800);
  await page.getByRole('navigation', { name: 'Footer' })
    .getByRole('link', { name: 'German words', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/german-words\/?$/);
  await expect(page.getByRole('main')).toBeFocused();

  // Typing in a search input stays focused on the field and does not jump the page.
  const search = page.locator('#german-words-search');
  await search.click();
  await search.fill('Anmeldung');
  await expect(search).toBeFocused();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('main')).not.toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(700);
  await page.goForward();
  await expect(page).toHaveURL(/\/german-words\/?$/);
  await expect(page.getByRole('main')).not.toBeFocused();
});

test('route focus does not steal focus from the immersive dMAT runner', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.locator('#dmat').getByRole('link', { name: 'Open dMAT practice', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/dmat\/practice\/?$/);
  await expect(page.getByRole('main')).toBeFocused();

  await page.getByRole('button', { name: 'Start the full mock', exact: true }).press('Enter');
  const sectionHeading = page.getByRole('heading', { level: 1, name: 'Figure Sequences' });
  await expect(sectionHeading).toBeVisible();
  await expect(sectionHeading).toBeFocused();
  await expect(page.getByRole('main')).not.toBeFocused();
  await expect(page.getByRole('radiogroup', { name: 'Fifth matrix', exact: true })).toBeVisible();
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
