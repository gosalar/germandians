import { Button } from '@mantine/core';
import type { CSSProperties } from 'react';

import PageHeader from '@/components/PageHeader';
import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { SECTIONS, hashLink } from '@/utils/constants';
import { REQUIREMENTS_ANCHORS } from '@/utils/requirements/topics';

import { TOPICS } from '../Guide/topics';
import { OPENING_COPY } from './data';
import styles from './styles.module.scss';

const ROUTE_TITLE_ID = 'route-title';

/** Two columns that read down: half the topics per column, rounded up. */
const ROUTE_ROWS = { '--route-rows': Math.ceil(TOPICS.length / 2) } as CSSProperties;

/**
 * The opening: who the page is for, the title, what it is for and the two ways in, beside "The route":
 * the topics as numbered links. On phones and tablets the route card is the guide's contents.
 */
export default function Opening() {
  // The phone action bar stays away while these buttons are on screen.
  const { heroCtaRef } = usePageChromeActions();

  return (
    <section id={SECTIONS.top} className={styles.opening}>
      <div className={styles.grid}>
        <PageHeader
          variant="regular"
          title={OPENING_COPY.title}
          introduction={OPENING_COPY.purpose}
          leading={<p className={styles.audience}>{OPENING_COPY.audience}</p>}
          meta={
            <>
              <div ref={heroCtaRef} className={styles.actions}>
                {/* Plain hash links: HomeSectionLink would send this page's own anchors to Home. */}
                <Button component="a" href={hashLink(REQUIREMENTS_ANCHORS.questions)} variant="yellow" size="lg">
                  {OPENING_COPY.questionsAction}
                </Button>
                <Button component="a" href={hashLink(REQUIREMENTS_ANCHORS.guide)} variant="ring" size="lg">
                  {OPENING_COPY.guideAction}
                </Button>
              </div>
              <p className={styles.actionsNote}>{OPENING_COPY.noLogin}</p>
            </>
          }
        />

        <nav id={REQUIREMENTS_ANCHORS.route} aria-labelledby={ROUTE_TITLE_ID} className={styles.route}>
          <h2 id={ROUTE_TITLE_ID} className={styles.routeTitle}>
            {OPENING_COPY.routeTitle}
          </h2>
          <p className={styles.routeIntro}>{OPENING_COPY.routeIntro}</p>
          <ol className={styles.routeList} style={ROUTE_ROWS}>
            {TOPICS.map((topic, index) => (
              <li key={topic.id}>
                <a href={hashLink(topic.id)} className={styles.routeLink}>
                  <span aria-hidden="true" className={styles.routeNumber}>
                    {index + 1}
                  </span>
                  <span>{topic.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
