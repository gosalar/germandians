import type { Route } from './+types/home';
import { FEE_PROMISE } from '@/utils/constants';

export const meta: Route.MetaFunction = () => [
  { title: 'Germandians | Student-led guidance for studying in Germany' },
  { name: 'description', content: `Six students living in Germany guide Indian students from profile evaluation to their first week here. ${FEE_PROMISE}` },
];

export { default } from '@/pages/Home';
