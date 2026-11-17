import { Button } from '@mantine/core';

import CommunityBand from '@/components/CommunityBand';
import ContentContainer from '@/components/ContentContainer';
import MentoringOffer from '@/components/MentoringOffer';
import type { SectionResult } from '@/utils/dmat/marking';
import type { Session } from '@/utils/dmat/session';
import type { StampId } from '@/utils/dmat/stamps';
import type { SectionContent, SectionId } from '@/utils/dmat/types';

import { minutesAndSeconds } from '../Between/time';
import { MODE_LABELS, SECTION_LABELS } from '../data';
import Confirmation from '../Start/Confirmation';
import { RECORD_COPY as copy, STAMP_COPY, TAG_LABELS } from './data';
import { getMissedTags } from './logic';
import SectionReview from './SectionReview';
import styles from './styles.module.scss';

export interface RecordProps {
  session: Session;
  /** One per section of the session, in order. */
  contents: SectionContent[];
  /** From `markSection`, in the same order. */
  results: SectionResult[];
  stamps: StampId[];
  onPractise(section: SectionId, tag: string): void;
  onStartAnother(): void;
}

function Receipt({ session, results, stamps }: Pick<RecordProps, 'session' | 'results' | 'stamps'>) {
  return (
    <div className={styles.paperWrap}>
      <div className={styles.paper}>
        <header className={styles.paperHeader}>
          <p className={styles.paperName} lang="de">{copy.paper}</p>
          <h1 tabIndex={-1}>{copy.title}</h1>
          <p>{MODE_LABELS[session.mode].name}</p>
        </header>
        <h2 className={styles.right}>{copy.right}</h2>
        <dl className={styles.counts}>
          {results.map(({ section, right, total, msUsed }) => (
            <div className={styles.row} key={section}>
              <dt>{SECTION_LABELS[section].name}</dt>
              <dd>
                <strong>{copy.count(right, total)}</strong>
                {session.mode !== 'practice' && msUsed !== null && (
                  <span>{minutesAndSeconds(Math.floor(msUsed / 1000))}</span>
                )}
              </dd>
            </div>
          ))}
          <div className={styles.unanswered}>
            <dt>{copy.unanswered}</dt>
            <dd>{results.reduce((count, result) => count + result.unanswered, 0)}</dd>
          </div>
        </dl>
        {stamps.length > 0 && (
          <ul className={styles.stamps} aria-label={copy.stamps}>
            {stamps.map((stamp) => (
              <li key={stamp} className={styles.stamp} data-stamp={stamp}>
                <strong lang="de">{STAMP_COPY[stamp].de}</strong>
                <span>{STAMP_COPY[stamp].en}</span>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.notice}>{copy.notice}</p>
      </div>
    </div>
  );
}

function PracticeNext({ contents, results, onPractise }: Pick<RecordProps, 'contents' | 'results' | 'onPractise'>) {
  const groups = contents.map((content, index) => ({
    section: content.section,
    tags: getMissedTags(content, results[index]),
  })).filter(({ tags }) => tags.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className={styles.next}>
      <h2>{copy.next}</h2>
      {groups.map(({ section, tags }) => (
        <div className={styles.group} key={section}>
          <h3>{SECTION_LABELS[section].name}</h3>
          <ul>
            {tags.map(([tag, count]) => (
              <li key={tag}>
                <div><strong>{TAG_LABELS[tag]}</strong><span>{copy.missed(count)}</span></div>
                <Button type="button" variant="ring" size="md" onClick={() => onPractise(section, tag)}>{copy.practise}</Button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default function Record({ session, contents, results, stamps, onPractise, onStartAnother }: RecordProps) {
  return (
    <section className={styles.record}>
      <ContentContainer width="wide">
        <div className={styles.overview}>
          <Receipt session={session} results={results} stamps={stamps} />
          <PracticeNext contents={contents} results={results} onPractise={onPractise} />
        </div>
        <section className={styles.review}>
          <h2>{copy.review}</h2>
          <p>{copy.reviewDetails}</p>
          {contents.map((content) => (
            <SectionReview key={content.section} content={content} session={session} onPractise={onPractise} />
          ))}
        </section>
      </ContentContainer>
      <MentoringOffer />
      <CommunityBand />
      <ContentContainer width="wide">
        <div className={styles.another}>
          <Confirmation trigger={copy.another} copy={copy.confirm} onConfirm={onStartAnother} variant="yellow" />
        </div>
      </ContentContainer>
    </section>
  );
}
