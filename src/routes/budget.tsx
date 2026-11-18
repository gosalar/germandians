import type { Route } from './+types/budget';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.budget);

export { default } from '@/pages/Budget';
