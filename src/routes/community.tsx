import type { Route } from './+types/community';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.community);

export { default } from '@/pages/Community';
