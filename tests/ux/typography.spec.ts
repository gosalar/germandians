import { expect, test, type Page } from '@playwright/test';

// Inspect the fonts that painted the glyphs. A computed font-family stack can
// look correct even when a broken URL makes the browser render a system font.
async function renderedFonts(page: Page, selector: string) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    expect(nodeId, `element exists: ${selector}`).toBeGreaterThan(0);
    const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(fonts.length, `painted glyphs: ${selector}`).toBeGreaterThan(0);
    expect(fonts.every(font => font.isCustomFont), `self-hosted glyphs: ${selector}`).toBe(true);
    return fonts.map(font => font.postScriptName);
  } finally {
    await session.detach();
  }
}

async function typography(page: Page, selector: string) {
  return page.locator(selector).first().evaluate(el => {
    const css = getComputedStyle(el);
    return { family: css.fontFamily, weight: css.fontWeight, stretch: css.fontStretch };
  });
}

for (const [width, height] of [[320, 900], [412, 891], [800, 1280], [1440, 900]]) {
  test(`font roles survive loading, navigation and resizing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const failedFonts: string[] = [];
    page.on('requestfailed', request => {
      if (request.resourceType() === 'font') failedFonts.push(request.url());
    });
    page.on('response', response => {
      if (response.request().resourceType() === 'font' && !response.ok()) failedFonts.push(response.url());
    });

    await page.goto('/');
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    const heading = await typography(page, 'h1');
    const lead = await typography(page, 'h1 + p');
    expect((await renderedFonts(page, 'h1')).every(font => font.startsWith('Archivo'))).toBe(true);
    expect((await renderedFonts(page, 'h1 + p')).every(font => font.startsWith('Hanken'))).toBe(true);
    expect(await renderedFonts(page, '[class*="channelName"]')).toEqual(['Hanken-Grotesk-ExtraBold']);
    expect(await renderedFonts(page, '[aria-label="Month 1"]')).toEqual(['BarlowSemiCondensed-ExtraBold']);
    if (width < 1100) {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      expect(await typography(page, '[class*="menuLink"]')).toEqual(await typography(page, 'nav [class*="_links_"] > a'));
      expect(await renderedFonts(page, '[class*="menuLink"]')).toEqual(['Hanken-Grotesk-SemiBold']);
      await page.getByRole('button', { name: 'Close', exact: true }).click();
    }
    expect(await typography(page, '[class*="legendItem"]')).toEqual(await typography(page, '[class*="_segment_"]'));
    if (width < 640) expect(await renderedFonts(page, '[class*="legendItem"]')).toEqual(['BarlowSemiCondensed-Bold']);

    await page.goto('/check');
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
    await page.locator('#check-score').fill('7.4');
    await page.evaluate(() => document.fonts.ready);
    expect(await typography(page, 'h1')).toEqual(heading);
    expect(await typography(page, 'h1 + p')).toEqual(lead);
    const preset = '[class*="presetButton"]';
    const answer = '[class*="_pill_"]';
    expect(await typography(page, preset)).toEqual(await typography(page, answer));
    expect(await renderedFonts(page, preset)).toEqual(['BarlowSemiCondensed-Bold']);
    expect(await renderedFonts(page, answer)).toEqual(['BarlowSemiCondensed-Bold']);
    const full = '[class*="_scoreClass_"]';
    const compact = '[class*="mobileScoreClass"]';
    expect(await typography(page, compact)).toEqual(await typography(page, full));
    expect(await renderedFonts(page, full)).toEqual(['BarlowSemiCondensed-Bold']);
    if (width < 1100) expect(await renderedFonts(page, compact)).toEqual(['BarlowSemiCondensed-Bold']);
    await page.setViewportSize({ width: width < 1100 ? 1440 : 412, height });
    expect(await typography(page, compact)).toEqual(await typography(page, full));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    for (const path of ['/privacy', '/missing-typography-page']) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(await typography(page, 'h1')).toEqual(heading);
      expect((await renderedFonts(page, 'h1')).every(font => font.startsWith('Archivo'))).toBe(true);
    }
    expect(failedFonts).toEqual([]);
  });
}
