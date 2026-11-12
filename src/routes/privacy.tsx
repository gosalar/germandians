import type { Route } from './+types/privacy';
import { pageMetadata } from '@/utils/metadata';

export const meta: Route.MetaFunction = () => pageMetadata('/privacy');
export { default } from '@/pages/Privacy';
