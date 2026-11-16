import Contact from '@/components/Contact';
import { useVisitAnswers } from '@/contexts/VisitAnswers/useVisitAnswers';
import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';
import type { EnquirySummary } from '@/services/profileReview';
import { markLines } from '@/utils/gradeConversion';
import { nextSteps, stampedTopics, summaryLines } from '@/utils/requirements/logic';

import CommonQuestions from './CommonQuestions';
import Guide from './Guide';
import NextSteps from './NextSteps';
import Opening from './Opening';
import OtherApplicants from './OtherApplicants';
import Questions from './Questions';
import styles from './styles.module.scss';

/**
 * /requirements: composition only, no copy. The answers come from the visit state; the steps, stamps
 * and enquiry summary are computed once here and passed down. Each section owns its own copy, styles
 * and anchor.
 */
export default function Requirements() {
  // Deep links to a topic settle after the fonts load.
  useSettleHashScroll();
  const { requirements, marks } = useVisitAnswers();
  const steps = nextSteps(requirements);
  const stamped = stampedTopics(steps);
  const answerLines = summaryLines(requirements);
  // The answers, then the grade line only when the marks give a valid conversion. No lines, no summary.
  const lines = [...answerLines, ...markLines(marks)];
  const summary: EnquirySummary | undefined = lines.length > 0 ? { source: 'requirements', lines } : undefined;

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <Opening />
      <Questions slip={<NextSteps steps={steps} answered={answerLines.length > 0} />} />
      <Guide stamped={stamped} />
      <CommonQuestions />
      <OtherApplicants />
      <Contact summary={summary} />
    </main>
  );
}
