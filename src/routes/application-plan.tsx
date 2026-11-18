import type { Route } from './+types/application-plan';
import { ROUTES } from '@/utils/constants';
import { pageMetadata } from '@/utils/metadata';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.applicationPlan);

export { default } from '@/pages/ApplicationPlan';
