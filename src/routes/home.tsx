import type { Route } from './+types/home';
import { pageMetadata } from '@/utils/metadata';

export const meta: Route.MetaFunction = () => pageMetadata('/');

export { default } from '@/pages/Home';
