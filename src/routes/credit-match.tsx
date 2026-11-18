import type { Route } from './+types/credit-match';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.creditMatch);

export { default } from '@/pages/CreditMatch';
