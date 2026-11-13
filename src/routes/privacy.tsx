import type { Route } from './+types/privacy';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.privacy);
export { default } from '@/pages/Privacy';
