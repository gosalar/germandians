import type { Route } from './+types/not-found';

export const meta: Route.MetaFunction = () => [
  { title: 'Page not found | Germandians' },
  { name: 'robots', content: 'noindex' },
];
export { default } from '@/pages/ErrorPage';
