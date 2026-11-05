import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
});

test('play all starts at one, pause resumes, and leaving the explorer pauses', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Journey month' });
  await page.getByRole('button', { name: 'Month 5', exact: true }).click();
  await page.getByRole('button', { name: 'Play all 7 months', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '1');
  await expect(slider).toHaveAttribute('aria-valuenow', '2', { timeout: 3000 });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const month = await slider.getAttribute('aria-valuenow');
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', month!);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeAttached();
  await slider.scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeVisible();
  await slider.focus();
  await page.keyboard.press('End');
  await page.getByRole('button', { name: 'Replay', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '1');
});

for (const width of [390, 1440]) {
  test(`invalid form focuses fields in order below the header at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const submit = page.getByRole('button', { name: 'Request my profile review' });
    for (const [id, value] of [['f-name', 'Priya Sharma'], ['f-email', 'priya@example.com'], ['f-wa', '+91 9876543210'], ['f-consent', '']]) {
      await submit.click();
      const input = page.locator(`#${id}`);
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      const top = (await input.boundingBox())!.y;
      const header = (await page.locator('nav').first().boundingBox())!;
      expect(top).toBeGreaterThan(header.y + header.height);
      expect(await input.getAttribute('aria-describedby')).toBeTruthy();
      if (value) await input.fill(value);
    }
  });
}

test('wiped touch canvas restores and only blocks scrolling while wiped', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  // This test opens its own page, so it misses the hydration wait in beforeEach.
  // A tap before the client handler is attached does nothing, and a font-driven
  // resize after the tap clears the wipe.
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  const canvas = page.locator('[data-wiped]');
  await expect(canvas).toHaveCSS('touch-action', 'pan-y');
  const wipe = page.getByRole('button', { name: 'Wipe and repaint' });
  await wipe.scrollIntoViewIfNeeded();
  await wipe.tap();
  await expect(canvas).toHaveAttribute('data-wiped', 'true');
  await expect(canvas).toHaveCSS('touch-action', 'none');
  const cdp = await context.newCDPSession(page);
  const swipe = async () => {
    const box = (await canvas.boundingBox())!;
    const start = { x: box.x + box.width / 2, y: box.y + box.height * 0.7 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let step = 1; step <= 8; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x, y: start.y - step * 12 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const pixelsBefore = await canvas.locator('canvas').evaluate((el: HTMLCanvasElement) => el.toDataURL());
  const scrollBefore = await page.evaluate(() => scrollY);
  await swipe();
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  expect(await canvas.locator('canvas').evaluate((el: HTMLCanvasElement) => el.toDataURL())).not.toBe(pixelsBefore);
  await expect(canvas).toHaveAttribute('data-wiped', 'false', { timeout: 8000 });
  await expect(canvas).toHaveCSS('touch-action', 'pan-y');
  await swipe();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore);
  await context.close();
});

test('normal-motion painting restores smoothly and can be wiped again', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const canvas = page.locator('[data-wiped]');
  await page.getByRole('button', { name: 'Wipe and repaint' }).click();
  await expect(canvas).toHaveCSS('cursor', 'crosshair');
  await expect(canvas).toHaveAttribute('data-restoring', 'true', { timeout: 6000 });
  await expect(canvas.locator('canvas')).toHaveCSS('transition-duration', '0.7s');
  await expect(canvas).toHaveAttribute('data-wiped', 'false');
  await page.getByRole('button', { name: 'Wipe and repaint' }).click();
  await expect(canvas).toHaveAttribute('data-wiped', 'true');
  await expect(canvas).toHaveAttribute('data-wiped', 'false', { timeout: 8000 });
});
