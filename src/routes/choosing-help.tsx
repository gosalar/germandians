import type { Route } from './+types/choosing-help';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.choosingHelp);

export { default } from '@/pages/ChoosingHelp';
