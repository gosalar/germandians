import { copyFile, mkdir, rename, rmdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Config } from '@react-router/dev/config';
import { siteBase } from './scripts/site-base.ts';
import { loadEnv } from 'vite';
import { PUBLIC_PAGES } from './src/utils/publicPages.ts';
import { publicUrl, toSiteOrigin } from './src/utils/publicSite.ts';

const pages = PUBLIC_PAGES.filter((page) => page.prerender).map((page) => page.path);
const sitemapPages = PUBLIC_PAGES.filter((page) => page.sitemap).map((page) => page.path);
const homePath = PUBLIC_PAGES.find((page) => page.key === 'home')!.path;

export default {
  appDirectory: 'src',
  basename: siteBase,
  buildDirectory: process.env.UX_BUILD === 'endpoint' || process.env.UX_BUILD === 'email'
    ? `test-results/ux-builds/${process.env.UX_BUILD}` : 'build',
  ssr: false,
  prerender: pages,
  routeDiscovery: { mode: 'initial' },
  async buildEnd({ reactRouterConfig }) {
    const client = path.join(reactRouterConfig.buildDirectory, 'client');
    if (siteBase !== '/') {
      // Router 8 writes prerenders under the basename, but Pages mounts the
      // entire artifact there. Assets already live at the correct artifact root.
      await rename(path.join(client, 'index.html'), path.join(client, '__spa-fallback.html'));
      for (const page of pages) {
        const destination = path.join(client, page);
        await mkdir(destination, { recursive: true });
        await rename(path.join(client, siteBase, page, 'index.html'), path.join(destination, 'index.html'));
      }
      // Remove the emptied basename folders, deepest first. rmdir refuses
      // non-empty folders, so nothing unexpected is ever deleted.
      const base = siteBase.split('/').filter(Boolean);
      const emptied = [
        ...pages.filter((page) => page !== homePath).map((page) => path.join(client, ...base, page)),
        ...base.map((_, i) => path.join(client, ...base.slice(0, base.length - i))),
      ];
      for (const dir of emptied) await rmdir(dir).catch(() => undefined);
    }
    // Static hosts (GitHub Pages, the preview server) answer unknown paths
    // with 404.html; the SPA fallback then renders the not-found route.
    await copyFile(path.join(client, '__spa-fallback.html'), path.join(client, '404.html'));
    const env = loadEnv('production', 'config', 'VITE_');
    const origin = toSiteOrigin(process.env.VITE_SITE_ORIGIN ?? env.VITE_SITE_ORIGIN);
    const absolute = (suffix: string) => publicUrl(origin, siteBase, suffix);
    const entries = sitemapPages.map((page) => `<url><loc>${absolute(page === homePath ? '' : `${page}/`)}</loc></url>`).join('\n');
    await writeFile(path.join(client, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
    await writeFile(path.join(client, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);
  },
} satisfies Config;
