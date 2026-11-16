import { Link } from 'react-router';

import SourceNote from '@/components/SourceNote';
import { hashLink } from '@/utils/constants';
import { REQUIREMENTS_ANCHORS } from '@/utils/requirements/topics';

import pageStyles from '../styles.module.scss';
import CostsTable from './CostsTable';
import { TOPIC_CARD_COPY } from './data';
import DetailTableView from './DetailTableView';
import Stamp from './Stamp';
import styles from './styles.module.scss';
import type { Topic } from './types';

interface TopicCardProps {
  topic: Topic;
  /** The topic's place in the guide, from 1. */
  number: number;
  /** The visitor's answers point to this topic. */
  stamped: boolean;
}

/** The three panels every topic has. Each one is skipped when its data is empty. */
function Panels({ topic }: { topic: Topic }) {
  const { need, steps, link } = topic;
  if (!need && steps.length === 0 && topic.sources.length === 0) return null;

  return (
    <div className={styles.panels}>
      {need ? (
        <div className={styles.panel} data-part="need">
          <h4 className={styles.panelTitle}>{TOPIC_CARD_COPY.need}</h4>
          <p className={styles.panelText}>{need}</p>
        </div>
      ) : null}
      {steps.length > 0 ? (
        <div className={styles.panel} data-part="steps">
          <h4 className={styles.panelTitle}>{TOPIC_CARD_COPY.steps}</h4>
          <ul className={styles.todo}>
            {steps.map((step) => (
              <li key={step} className={styles.todoItem}>
                <span aria-hidden="true" className={styles.tickBox} />
                <span>{step}</span>
              </li>
            ))}
          </ul>
          {link ? (
            <p className={styles.panelLink}>
              <Link to={link.to}>{link.label}</Link>
            </p>
          ) : null}
        </div>
      ) : null}
      {topic.sources.length > 0 ? (
        <div className={styles.panel} data-part="sources">
          <h4 className={styles.panelTitle}>{TOPIC_CARD_COPY.sources}</h4>
          <ul className={styles.sourceList}>
            {topic.sources.map((source) => (
              <li key={source.url}>
                <SourceNote source={source} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * One topic: number, title and word sticker; the summary; for costs, the table; the three panels;
 * "More detail" as a native disclosure; and, on phones and tablets, a link back to the route card.
 * Every part is skipped when its data is empty, so a short topic still looks finished.
 */
export default function TopicCard({ topic, number, stamped }: TopicCardProps) {
  const titleId = `${topic.id}-title`;

  return (
    <article id={topic.id} aria-labelledby={titleId} className={styles.card} data-stamped={stamped || undefined}>
      <header className={styles.cardHead}>
        <span aria-hidden="true" className={styles.cardNumber}>
          {number}
        </span>
        <h3 id={titleId} className={styles.cardTitle}>
          {topic.title}
        </h3>
        <p className={styles.word}>
          <span lang="de" className={styles.wordGerman}>
            {topic.german.word}
          </span>
          <span className={pageStyles.visuallyHidden}>, </span>
          <span className={styles.wordMeaning}>{topic.german.meaning}</span>
        </p>
      </header>

      {stamped ? <Stamp /> : null}

      {topic.summary ? <p className={styles.summary}>{topic.summary}</p> : null}

      {topic.kind === 'costs' ? <CostsTable costs={topic.costs} labelledBy={titleId} /> : null}

      <Panels topic={topic} />

      {topic.detail.length > 0 ? (
        <details className={styles.more}>
          <summary className={`${pageStyles.disclosureSummary} ${styles.moreSummary}`}>
            <span aria-hidden="true" className={pageStyles.disclosureIcon} />
            {TOPIC_CARD_COPY.moreDetail}
          </summary>
          <div className={styles.moreBody}>
            {topic.detail.map((part, index) => {
              const headingId = `${topic.id}-detail-${index + 1}`;
              // Consecutive parts that rest on the same page show its source once, after the last of them.
              const showSource = part.source && part.source.url !== topic.detail[index + 1]?.source?.url;
              return (
                <div key={part.heading} className={styles.detailPart}>
                  <h4 id={headingId} className={styles.detailHeading}>
                    {part.heading}
                  </h4>
                  {part.body ? <p className={styles.detailBody}>{part.body}</p> : null}
                  {part.list ? (
                    <ul className={styles.detailList}>
                      {part.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {part.table ? <DetailTableView table={part.table} labelledBy={headingId} /> : null}
                  {part.link ? (
                    <p className={styles.detailLink}>
                      <Link to={part.link.to}>{part.link.label}</Link>
                    </p>
                  ) : null}
                  {showSource && part.source ? <SourceNote source={part.source} /> : null}
                </div>
              );
            })}
          </div>
        </details>
      ) : null}

      <p className={styles.allTopics}>
        <a href={hashLink(REQUIREMENTS_ANCHORS.route)}>{TOPIC_CARD_COPY.allTopics}</a>
      </p>
    </article>
  );
}
