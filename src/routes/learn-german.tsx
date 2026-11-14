import type { Route } from './+types/learn-german';
import { pageMetadata } from '@/utils/metadata';
import { ROUTES } from '@/utils/constants';

export const meta: Route.MetaFunction = () => pageMetadata(ROUTES.learnGerman);

export { default } from '@/pages/LearnGerman';
