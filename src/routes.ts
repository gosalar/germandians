import process from 'node:process';
import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('routes/site-layout.tsx', [
    index('routes/home.tsx'),
    ...(process.argv.includes('dev') ? [route('_theme', 'routes/theme.tsx')] : []),
  ]),
  route('privacy', 'routes/privacy.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
