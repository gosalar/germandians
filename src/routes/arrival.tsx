import type { Route } from './+types/arrival';
import { ROUTES } from '@/utils/constants';
import { pageMetadata } from '@/utils/metadata';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.arrival);

export { default } from '@/pages/Arrival';
