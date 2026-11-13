import process from 'node:process';
import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';
import { SHELL_FILES, pathFor } from './utils/pageRegistry.ts';
import { PUBLIC_PAGES } from './utils/publicPages.ts';

const homePath = pathFor('home');

const routeEntry = (page: (typeof PUBLIC_PAGES)[number]) =>
  page.path === homePath ? index(page.file) : route(page.path.replace(/^\//, ''), page.file);

const sitePages = PUBLIC_PAGES.filter((page) => page.shell === 'site');
const minimalPages = PUBLIC_PAGES.filter((page) => page.shell === 'minimal');

export default [
  layout(SHELL_FILES.site, [
    ...sitePages.map(routeEntry),
    ...(process.argv.includes('dev') ? [route('_theme', 'routes/theme.tsx')] : []),
  ]),
  ...minimalPages.map(routeEntry),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
