import type { Route } from './+types/check';
import { pageMetadata } from '@/utils/metadata';
import barlowBoldLatin from '@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-700-normal.woff2?url';

export const links: Route.LinksFunction = () => [
  { rel: 'preload', href: barlowBoldLatin, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
];

export const meta: Route.MetaFunction = () => pageMetadata('/check');

export { default } from '@/pages/Check';
