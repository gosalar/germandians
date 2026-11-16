import { EXTERNAL_COSTS, SOURCES } from '@/utils/applicationFacts';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { CostsTopic } from '../types';

/** What is paid to other organisations, read from the same constants as Home. Each row carries its own source. */
export const costs = {
  kind: 'costs',
  id: 'costs',
  title: REQUIREMENT_TOPIC_TITLES.costs,
  german: { word: 'Kosten', meaning: 'costs' },
  summary:
    'What you pay to other organisations along the way, each amount with its source. The money you show for the visa is listed apart: it is your own living money, not a fee.',
  // Instructions only: no amount and no fact that the table's rows do not already state.
  need: 'Which of these you pay depends on how you apply and on your university and programme, as the rows explain.',
  steps: [
    'Before you pay, check the current amount on the provider’s page linked in each row.',
    'Take tuition and the semester contribution from your university’s own fees page, with any exemptions.',
    'For costs without an amount, such as IELTS, health insurance and flights, check the current prices with your chosen providers.',
    'Plan the living money you show for the visa separately from these fees.',
  ],
  sources: [SOURCES.daad],
  detail: [],
  costs: EXTERNAL_COSTS,
} satisfies CostsTopic;
