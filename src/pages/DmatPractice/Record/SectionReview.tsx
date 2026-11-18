import { Button } from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router';

import { CONTACT, ROUTES } from '@/utils/constants';
import type { Session } from '@/utils/dmat/session';
import type { SectionContent, SectionId } from '@/utils/dmat/types';

import { SECTION_LABELS } from '../data';
import { Explanation, PassageView, TaskView } from '../Runner/tasks';
import { RECORD_COPY as copy, TAG_LABELS } from './data';
import { longestScreens } from './logic';
import styles from './styles.module.scss';

interface SectionReviewProps {
  content: SectionContent;
  session: Session;
  onPractise(section: SectionId, tag: string): void;
}

function ReviewLinks({ id, onPractise }: { id: string; onPractise?: () => void }) {
  return (
    <div className={styles.reviewLinks}>
      <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(copy.reportSubject(id))}`}>{copy.report}</a>
      <Link to={ROUTES.community} target="_blank" rel="noopener">{copy.community}</Link>
      {onPractise && <Button type="button" variant="ring" size="md" onClick={onPractise}>{copy.similar}</Button>}
    </div>
  );
}

function Flags({ marked, longest }: { marked: boolean; longest?: boolean }) {
  if (!marked && !longest) return null;
  return (
    <ul className={styles.flags}>
      {marked && <li>{copy.marked}</li>}
      {longest && <li>{copy.longest}</li>}
    </ul>
  );
}

function Tasks({ content, session, onPractise }: SectionReviewProps) {
  const longest = longestScreens(content, session.timeOn);
  const marked = new Set(session.marked);

  if (content.section === 'academic') {
    return content.passages.map((passage) => (
      <article className={styles.reviewItem} key={passage.id}>
        <Flags marked={marked.has(passage.id)} longest={longest.has(passage.id)} />
        <PassageView
          passage={passage}
          answers={session.answers}
          mode="review"
          reviewActions={(question) => (
            <ReviewLinks id={question.id} onPractise={() => onPractise(content.section, question.type)} />
          )}
        />
      </article>
    ));
  }

  return content.tasks.map((task, index) => {
    const tag = task.tags.find((value) => Object.hasOwn(TAG_LABELS, value));
    return (
      <article className={styles.reviewItem} key={task.id}>
        <h3>{copy.task(index + 1)}</h3>
        <Flags marked={marked.has(task.id)} longest={longest.has(task.id)} />
        <TaskView task={task} answer={session.answers[task.id]} mode="review" />
        <Explanation task={task} answer={session.answers[task.id]} />
        <ReviewLinks id={task.id} onPractise={tag ? () => onPractise(content.section, tag) : undefined} />
      </article>
    );
  });
}

export default function SectionReview(props: SectionReviewProps) {
  const [rendered, setRendered] = useState(false);

  return (
    <details
      className={styles.disclosure}
      onToggle={(event) => {
        if (event.currentTarget.open && !rendered) setRendered(true);
      }}
    >
      <summary>{SECTION_LABELS[props.content.section].name}</summary>
      {rendered && <Tasks {...props} />}
    </details>
  );
}
