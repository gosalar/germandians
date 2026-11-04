import type { Route } from './+types/home';

export const meta: Route.MetaFunction = () => [
  { title: 'Germandians | Student-led guidance for studying in Germany' },
  { name: 'description', content: "Six students living in Germany guide Indian students from profile evaluation to their first week here. No service fee until you're admitted." },
];

export { default } from '@/pages/Home';
