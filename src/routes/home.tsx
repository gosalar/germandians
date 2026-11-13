import type { Route } from './+types/home';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.home);

export { default } from '@/pages/Home';
