import type { Route } from './+types/parents';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.parents);

export { default } from '@/pages/Parents';
