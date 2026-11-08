import type { Route } from './+types/check';

export const meta: Route.MetaFunction = () => [
  { title: 'German grade & profile check | Germandians' },
  {
    name: 'description',
    content:
      'Convert your CGPA or percentage to the German grading scale with the Modified Bavarian Formula and check how German public universities read your profile.',
  },
];

export { default } from '@/pages/Check';
