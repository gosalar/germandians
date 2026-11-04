import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, type Browser, type BrowserContext, type Page, type TestInfo } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { APP_PORT, REFERENCE_PORT } from './ports';

export const PAGES = {
  home: {
    reference: `http://localhost:${REFERENCE_PORT}/Germandians%20v4.dc.html`,
    app: `http://localhost:${APP_PORT}/`,
  },
  privacy: {
    reference: `http://localhost:${REFERENCE_PORT}/Germandians%20Privacy.dc.html`,
    app: `http://localhost:${APP_PORT}/privacy`,
  },
} as const;

/**
 * Pixels allowed to differ per screenshot. Sub-pixel anti-aliasing on link
 * underlines and highlight edges accounts for up to ~50; a real layout or
 * colour change touches thousands.
 */
export const MAX_DIFF_PIXELS = 64;

/** pixelmatch colour sensitivity (0–1, lower is stricter). */
const COLOR_THRESHOLD = 0.1;

// The design runtime pulls React and Babel from unpkg and fonts from Google.
// They're cached on disk after the first run; delete .visual-cache to refresh.
const CACHE_DIR = path.resolve('.visual-cache');
const CDN = /^https:\/\/(unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

async function serveCdnFromCache(context: BrowserContext) {
  await context.route(CDN, async (route) => {
    const key = path.join(CACHE_DIR, createHash('sha1').update(route.request().url()).digest('hex'));
    try {
      const headers = JSON.parse(await readFile(`${key}.json`, 'utf8'));
      return await route.fulfill({ status: 200, headers, body: await readFile(key) });
    } catch {
      // Not cached yet.
    }
    const response = await route.fetch();
    const body = await response.body();
    if (response.ok()) {
      const headers = { ...response.headers() };
      delete headers['content-encoding'];
      delete headers['content-length'];
      await mkdir(CACHE_DIR, { recursive: true });
      // Write-then-rename so parallel workers never read a half-written file.
      const tmp = `${key}.${process.pid}.tmp`;
      await writeFile(tmp, body);
      await rename(tmp, key);
      await writeFile(`${key}.json`, JSON.stringify(headers));
    }
    return route.fulfill({ response, body });
  });
}

/** Resolves once fonts are loaded, images are decoded, transitions are done and two frames have painted. */
export async function settle(page: Page) {
  await page.waitForFunction(
    () =>
      document.fonts.status === 'loaded' &&
      [...document.images].every((img) => img.complete && img.naturalWidth > 0) &&
      document.getAnimations().every((a) => a.playState !== 'running'),
  );
  await page.evaluate(async () => {
    // CSS background images (the flag badge, flag bands) aren't in document.images.
    const backgrounds = new Set<string>();
    for (const el of document.querySelectorAll('*')) {
      for (const [, url] of getComputedStyle(el).backgroundImage.matchAll(/url\("?(.*?)"?\)/g)) backgrounds.add(url);
    }
    const backgroundImages = [...backgrounds].map((url) => Object.assign(new Image(), { src: url }));
    // Loaded isn't painted: images marked decoding="async" can still be blank for a few frames.
    await Promise.all(
      [...document.images, ...backgroundImages].map((img) => img.decode().catch(() => undefined)),
    );
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  });
}

export interface OpenOptions {
  width: number;
  height?: number;
  /** Animations play when true; otherwise prefers-reduced-motion is on and everything is in its final state. */
  motion?: boolean;
  /** Turns off the sticky nav (see UNSTICK_NAV). */
  unstickNav?: boolean;
}

/**
 * The prototype's preview wrapper is only one viewport tall, so its "sticky"
 * nav stops sticking after the first screen while the site's keeps sticking,
 * as the design's CSS intends. Element screenshots turn stickiness off on both
 * sides so they compare content rather than whether the nav overlaps it.
 */
const UNSTICK_NAV = 'nav { position: static !important; }';

export async function openPage(browser: Browser, url: string, options: OpenOptions) {
  const context = await browser.newContext({
    viewport: { width: options.width, height: options.height ?? 900 },
    reducedMotion: options.motion ? 'no-preference' : 'reduce',
  });
  await serveCdnFromCache(context);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });
  // The prototype renders itself after compiling in the browser; wait for real content.
  await page.locator('nav').first().waitFor();
  // Lazy images would otherwise only load when scrolled to.
  await page.evaluate(() => document.querySelectorAll('img').forEach((img) => (img.loading = 'eager')));
  if (options.unstickNav) await page.addStyleTag({ content: UNSTICK_NAV });
  await settle(page);
  return page;
}

function crop(source: PNG, width: number, height: number) {
  const target = new PNG({ width, height });
  PNG.bitblt(source, target, 0, 0, width, height, 0, 0);
  return target;
}

/**
 * Asserts two screenshots are the same size and differ by no more than
 * MAX_DIFF_PIXELS. On failure the reference, app and diff images are attached
 * to the report.
 */
export async function expectSameScreenshot(testInfo: TestInfo, reference: Buffer, app: Buffer) {
  // Identical pixels encode to identical PNGs, so most comparisons end here.
  if (reference.equals(app)) return;

  const a = PNG.sync.read(reference);
  const b = PNG.sync.read(app);
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(crop(a, width, height).data, crop(b, width, height).data, diff.data, width, height, {
    threshold: COLOR_THRESHOLD,
  });
  const sameSize = a.width === b.width && a.height === b.height;

  if (!sameSize || diffPixels > MAX_DIFF_PIXELS) {
    // Saved next to the test's results and attached to the HTML report.
    const images = { reference, app, diff: PNG.sync.write(diff) };
    for (const [name, body] of Object.entries(images)) {
      const file = testInfo.outputPath(`${name}.png`);
      await writeFile(file, body);
      await testInfo.attach(name, { path: file, contentType: 'image/png' });
    }
  }

  expect(`${b.width}x${b.height}`, 'screenshot size').toBe(`${a.width}x${a.height}`);
  expect(diffPixels, `pixels differing from the design (max ${MAX_DIFF_PIXELS})`).toBeLessThanOrEqual(
    MAX_DIFF_PIXELS,
  );
}
