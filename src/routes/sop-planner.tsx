import type { Route } from './+types/sop-planner';
import { ROUTES } from '@/utils/constants';
import { pageMetadata } from '@/utils/metadata';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.sopPlanner);

export { default } from '@/pages/SopPlanner';
