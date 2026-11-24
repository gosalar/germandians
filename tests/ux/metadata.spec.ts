import { expect, test } from '@playwright/test';

import { PUBLIC_PAGES } from '../../src/utils/publicPages.ts';

/** Every registered page. The requirements, about, community and German pages are also checked by name. */
const ROUTES = PUBLIC_PAGES.map((page) => page.path);
const NEW_PAGES = ['/requirements', '/about', '/community', '/learn-german'];

test('the registry lists the requirements, about, community and German pages', () => {
  expect(ROUTES).toEqual(expect.arrayContaining(NEW_PAGES));
});

for (const route of ROUTES) {
  test(`public metadata and local share assets for ${route}`, async ({ page, request }, testInfo) => {
    await page.goto(route);
    const origin = testInfo.project.name === 'endpoint' ? 'https://germandians.example.test' : 'https://gosalar.github.io';
    const canonical = `${origin}${route === '/' ? '/' : `${route}/`}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length).toBeGreaterThan(30);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description!);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image).toMatch(new RegExp(`^${origin}/social/`));
    await expect(page.locator('meta[property="og:image:secure_url"]')).toHaveAttribute('content', image!);
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/png');
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    const imageAlt = await page.locator('meta[property="og:image:alt"]').getAttribute('content');
    expect(imageAlt?.length).toBeGreaterThan(15);
    const response = await request.get(new URL(image!).pathname);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
    const body = await response.body();
    expect(body.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
    expect(body.byteLength).toBeGreaterThan(10_000);
    expect(body.byteLength).toBeLessThan(300_000);
    const icon = await page.locator('link[rel="icon"]').getAttribute('href');
    expect((await request.get(icon!)).ok()).toBe(true);
    const html = await (await request.get(route)).text();
    expect(html).toContain(canonical);
    expect(html).toContain('og:image');
  });
}

test('sitemap and robots list only public pages and unknown routes stay noindex', async ({ page, request }, testInfo) => {
  const origin = testInfo.project.name === 'endpoint' ? 'https://germandians.example.test' : 'https://gosalar.github.io';
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const expected = [
    '/', '/check/', '/requirements/', '/dmat/', '/dmat/practice/', '/about/', '/community/', '/learn-german/',
    '/privacy/', '/budget/', '/sop-planner/', '/german-words/', '/application-plan/', '/credit-match/',
    '/arrival/', '/choosing-help/', '/parents/',
  ];
  for (const path of expected) expect(sitemap).toContain(`<loc>${origin}${path}</loc>`);
  expect(sitemap.match(/<loc>/g)).toHaveLength(expected.length);
  expect(sitemap).not.toMatch(/_theme|_dmat|404/);
  expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  await page.goto('/missing-page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  // The static fallback is the generic app shell; the HTTP 404 status keeps it out of search results.
  expect((await request.get('/missing-page')).status()).toBe(404);
});
