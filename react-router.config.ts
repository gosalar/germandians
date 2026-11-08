import { copyFile, mkdir, rename, rmdir } from 'node:fs/promises';
import path from 'node:path';
import type { Config } from '@react-router/dev/config';
import { siteBase } from './scripts/site-base.ts';

const pages = ['/', '/check', '/privacy'];

export default {
  appDirectory: 'src',
  basename: siteBase,
  buildDirectory: process.env.VISUAL_BUILD ? '.visual-build' : 'build',
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
        ...pages.filter((page) => page !== '/').map((page) => path.join(client, ...base, page)),
        ...base.map((_, i) => path.join(client, ...base.slice(0, base.length - i))),
      ];
      for (const dir of emptied) await rmdir(dir).catch(() => undefined);
    }
    // Static hosts (GitHub Pages, the preview server) answer unknown paths
    // with 404.html; the SPA fallback then renders the not-found route.
    await copyFile(path.join(client, '__spa-fallback.html'), path.join(client, '404.html'));
  },
} satisfies Config;
