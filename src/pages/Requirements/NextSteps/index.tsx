import { Button } from '@mantine/core';
import { useId, useState } from 'react';

import HomeSectionLink from '@/components/HomeSectionLink';
import SourceNote from '@/components/SourceNote';
import { DESTINATIONS, NAV_CTA, destinationHref, hashLink } from '@/utils/constants';
import type { NextStep } from '@/utils/requirements/logic';
import { REQUIREMENT_TOPIC_IDS, REQUIREMENTS_ANCHORS, type RequirementTopicId } from '@/utils/requirements/topics';

import { TOPIC_BY_ID } from '../Guide/topics';
import { NEXT_STEPS_COPY, STEP_COPY, STEP_LABEL_TEXT, stepLine, stepsAsText, topicLinkText } from './data';
import styles from './styles.module.scss';

export interface NextStepsProps {
  /** The visitor's steps, in order, from `nextSteps(answers)`. Empty with no answers. */
  steps: readonly NextStep[];
  /** Whether any question is answered: with answers but no steps, the slip says the answers add none yet. */
  answered: boolean;
}

type CopyStatus = 'copied' | 'unavailable' | 'empty' | 'no-steps';

const COPY_MESSAGE: { readonly [Status in CopyStatus]: string } = {
  copied: NEXT_STEPS_COPY.copied,
  unavailable: NEXT_STEPS_COPY.copyUnavailable,
  empty: NEXT_STEPS_COPY.copyEmpty,
  'no-steps': NEXT_STEPS_COPY.copyNoSteps,
};

const topicText = (topic: RequirementTopicId) => topicLinkText(REQUIREMENT_TOPIC_IDS.indexOf(topic) + 1, TOPIC_BY_ID[topic].title);

/**
 * The Laufzettel: the visitor's next steps on receipt paper. Changes are announced politely without
 * moving focus. From $bp-content-columns it stays in view beside the questions; a long list of steps
 * scrolls inside the slip while its title and buttons stay in view.
 */
export default function NextSteps({ steps, answered }: NextStepsProps) {
  const headingId = useId();
  // A copy message belongs to the steps it copied; once the steps change it no longer shows.
  const [copy, setCopy] = useState<{ status: CopyStatus; steps: string } | null>(null);
  const signature = steps.map((step) => step.id).join(' ');
  const message = copy && copy.steps === signature ? COPY_MESSAGE[copy.status] : '';

  const copySteps = async () => {
    if (steps.length === 0) {
      setCopy({ status: answered ? 'no-steps' : 'empty', steps: signature });
      return;
    }
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(
        stepsAsText(steps.map((step) => ({ label: step.label, id: step.id, topicText: topicText(step.topic) }))),
      );
      setCopy({ status: 'copied', steps: signature });
    } catch {
      setCopy({ status: 'unavailable', steps: signature });
    }
  };

  return (
    <aside id={REQUIREMENTS_ANCHORS.nextSteps} tabIndex={-1} className={styles.slip} aria-labelledby={headingId}>
      <div className={styles.paper}>
        <h3 id={headingId} className={styles.title}>
          <span lang="de" className={styles.name}>
            {NEXT_STEPS_COPY.paperTitle}
          </span>{' '}
          <span className={styles.subtitle}>{NEXT_STEPS_COPY.heading}</span>
        </h3>
        <div className={styles.rule} />

        <div aria-live="polite" className={styles.region}>
          {steps.length > 0 ? (
            <ol className={styles.steps}>
              {steps.map((step) => {
                const wording = STEP_COPY[step.id];
                return (
                  <li key={step.id} className={styles.step}>
                    <span className={styles.box} aria-hidden="true" />
                    <div className={styles.stepBody}>
                      <span className={styles.label} data-label={step.label}>
                        {STEP_LABEL_TEXT[step.label]}
                      </span>
                      <p className={styles.text}>{stepLine(wording)}</p>
                      <a href={hashLink(step.topic)} className={styles.topicLink}>
                        {topicText(step.topic)}
                      </a>
                      {wording.source ? <SourceNote source={wording.source} /> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className={styles.empty}>{answered ? NEXT_STEPS_COPY.noSteps : NEXT_STEPS_COPY.empty}</p>
          )}
        </div>

        <div className={styles.rule} />
        <div className={styles.footer}>
          <Button type="button" variant="ring" size="lg" fullWidth onClick={copySteps}>
            {NEXT_STEPS_COPY.copy}
          </Button>
          <p role="status" className={styles.status}>
            {message}
          </p>
          <Button component={HomeSectionLink} href={destinationHref(DESTINATIONS.profileReview)} variant="yellow" size="lg" fullWidth>
            {NAV_CTA.label}
          </Button>
        </div>
      </div>
      <div className={styles.tearEdge} aria-hidden="true" />
    </aside>
  );
}
