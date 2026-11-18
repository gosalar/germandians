import type { Route } from './+types/german-words';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.germanWords);

export { default } from '@/pages/GermanWords';
