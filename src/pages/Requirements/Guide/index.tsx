import { hashLink } from '@/utils/constants';
import { REQUIREMENTS_ANCHORS, type RequirementTopicId } from '@/utils/requirements/topics';

import pageStyles from '../styles.module.scss';
import { GUIDE_COPY } from './data';
import styles from './styles.module.scss';
import TopicCard from './TopicCard';
import { TOPICS } from './topics';

export interface GuideProps {
  /** Topics a next step points to (any label but "Does not apply"). Empty with no answers. */
  stamped: ReadonlySet<RequirementTopicId>;
}

const CONTENTS_TITLE_ID = 'guide-contents-title';

/**
 * The guide: the topic cards in reading order, with a contents list beside them from 1024px that
 * stays in view and marks the topics the visitor's answers point to (a red dot, with text for screen readers).
 */
export default function Guide({ stamped }: GuideProps) {
  return (
    <section id={REQUIREMENTS_ANCHORS.guide} className={pageStyles.band}>
      <div className={pageStyles.inner}>
        <div className={pageStyles.sectionHead}>
          <h2 className={pageStyles.sectionTitle}>{GUIDE_COPY.heading}</h2>
          <p className={pageStyles.sectionIntro}>{GUIDE_COPY.intro}</p>
        </div>

        <div className={styles.layout}>
          <nav aria-labelledby={CONTENTS_TITLE_ID} className={styles.contents}>
            <p id={CONTENTS_TITLE_ID} className={styles.contentsTitle}>
              {GUIDE_COPY.contentsTitle}
            </p>
            <ol className={styles.contentsList}>
              {TOPICS.map((topic, index) => (
                <li key={topic.id}>
                  {/* Plain hash links: HomeSectionLink would send this page's own anchors to Home. */}
                  <a href={hashLink(topic.id)} className={styles.contentsLink}>
                    <span aria-hidden="true" className={styles.contentsNumber}>
                      {index + 1}
                    </span>
                    <span className={styles.contentsName}>{topic.title}</span>
                    {stamped.has(topic.id) ? (
                      <>
                        <span aria-hidden="true" className={styles.contentsDot} />
                        <span className={pageStyles.visuallyHidden}> {GUIDE_COPY.stampedHidden}</span>
                      </>
                    ) : null}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={styles.topics}>
            {TOPICS.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} number={index + 1} stamped={stamped.has(topic.id)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
