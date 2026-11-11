import type { Route } from './+types/check';

export const meta: Route.MetaFunction = () => [
  { title: 'German grade & programme requirements | Germandians' },
  {
    name: 'description',
    content:
      'Convert your CGPA or percentage with the Modified Bavarian formula and review the programme-specific requirements still to check. A conversion is not an eligibility decision.',
  },
];

export { default } from '@/pages/Check';
