import DmatNote from '@/components/DmatNote';
import SourceNote from '@/components/SourceNote';
import { HOUSING, SOURCES } from '@/utils/applicationFacts';
import { FEE_POLICY } from '@/utils/constants';

export const QUESTIONS = [
  {
    q: 'Can you guarantee admission?',
    a: `No. Universities make every admission decision themselves. Our standard payment model is ${FEE_POLICY.amount} ${FEE_POLICY.timing}. ${FEE_POLICY.exception}`,
  },
  {
    q: 'Can I apply only to public universities?',
    a: "Yes. Tell us in your profile review. We'll check how your ECTS credits match the public courses you want and tell you plainly how your chances look.",
  },
  {
    q: 'What support continues after I land?',
    a: (
      <>
        {`${HOUSING.arrival} ${HOUSING.preparation}`}
        <SourceNote source={SOURCES.housing} />
      </>
    ),
  },
  {
    q: 'Are you connected to any university?',
    a: "No. We study at German universities, but we don't represent any of them and none of them pay us. We recommend universities only on how well they fit your profile.",
  },
  {
    q: 'When do I get the terms in writing?',
    a: 'After your profile review and before any work starts. The written quote states the fee, what triggers payment and what your support includes. The fees section lists every point it covers.',
  },
  {
    q: 'Do I need dMAT for APS?',
    a: <DmatNote detail />,
  },
];
