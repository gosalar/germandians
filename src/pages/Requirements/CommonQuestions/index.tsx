import SourceNote from '@/components/SourceNote';
import { hashLink } from '@/utils/constants';
import { REQUIREMENTS_ANCHORS } from '@/utils/requirements/topics';

import pageStyles from '../styles.module.scss';
import { TOPIC_BY_ID } from '../Guide/topics';
import { COMMON_QUESTIONS, COMMON_QUESTIONS_COPY } from './data';
import styles from './styles.module.scss';

/**
 * Common questions, each a native disclosure like a topic's "More detail", so every answer opens and is
 * in the page's HTML without JavaScript. Each answer ends with links to its topics in the guide. With
 * no questions the section is left out.
 */
export default function CommonQuestions() {
  if (COMMON_QUESTIONS.length === 0) return null;

  return (
    <section id={REQUIREMENTS_ANCHORS.commonQuestions} className={`${pageStyles.band} ${pageStyles.bandSand}`}>
      <div className={pageStyles.inner}>
        <div className={pageStyles.sectionHead}>
          <h2 className={pageStyles.sectionTitle}>{COMMON_QUESTIONS_COPY.heading}</h2>
        </div>
        <div className={styles.list}>
          {COMMON_QUESTIONS.map((item) => (
            <details key={item.question} className={styles.item}>
              <summary className={`${pageStyles.disclosureSummary} ${styles.question}`}>
                <span aria-hidden="true" className={pageStyles.disclosureIcon} />
                <span>{item.question}</span>
              </summary>
              <div className={styles.answer}>
                <p className={styles.answerText}>{item.answer}</p>
                {item.sources?.map((source) => <SourceNote key={source.url} source={source} />)}
                <ul className={styles.topicLinks}>
                  {item.topics.map((topic) => (
                    <li key={topic}>
                      {/* A plain hash link: HomeSectionLink would send this page's own anchors to Home. */}
                      <a href={hashLink(topic)}>{TOPIC_BY_ID[topic].title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
