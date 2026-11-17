import { Button } from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import CommunityBand from '@/components/CommunityBand';
import Contact from '@/components/Contact';
import ContentContainer from '@/components/ContentContainer';
import MentoringOffer from '@/components/MentoringOffer';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { DMAT_EXAM, SOURCES, type OfficialSource } from '@/utils/applicationFacts';
import { SECTIONS } from '@/utils/constants';

import { GUIDE, PAGE_COPY } from './data';
import styles from './styles.module.scss';

interface GuidePart {
  id: string;
  title: string;
  sources: readonly OfficialSource[];
  action?: { label: string; href: string };
}

function GuideSection({ part, children }: { part: GuidePart; children: ReactNode }) {
  const { id, title, sources, action } = part;
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={styles.section}>
      <h2 id={titleId}>{title}</h2>
      <div className={styles.sectionBody}>
        {children}
        <ul className={styles.sources}>
          {sources.map((source) => <li key={source.label}><SourceNote source={source} /></li>)}
        </ul>
        {action && (
          <p className={styles.action}>
            {action.href.startsWith('https://') ? (
              <a href={action.href} target="_blank" rel="noopener">{action.label}</a>
            ) : action.href.startsWith('#') ? (
              <a href={action.href}>{action.label}</a>
            ) : (
              <Link to={action.href}>{action.label}</Link>
            )}
          </p>
        )}
      </div>
    </section>
  );
}

function Paragraphs({ lines }: { lines: readonly string[] }) {
  return lines.map((line) => <p key={line}>{line}</p>);
}

export default function Dmat() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section id={SECTIONS.top} className={styles.opening}>
        <ContentContainer width="wide">
          <div className={styles.openingGrid}>
            <PageHeader
              variant="regular"
              title={PAGE_COPY.title}
              introduction={PAGE_COPY.introduction}
              meta={
                <div className={styles.openingMeta}>
                  <p>{DMAT_EXAM.organiser}</p>
                  <SourceNote source={SOURCES.dmat} />
                </div>
              }
            />
            <nav className={styles.guideNav} aria-label={PAGE_COPY.guideNav}>
              <p>{PAGE_COPY.guideNav}</p>
              <ul>
                {Object.values(GUIDE).map(({ id, title }) => (
                  <li key={id}><a href={`#${id}`}>{title}</a></li>
                ))}
              </ul>
            </nav>
          </div>
        </ContentContainer>
      </section>
      <div className={styles.guideContent}>
        <ContentContainer width="wide">
          <div className={styles.guide}>
            <GuideSection part={GUIDE.need}><Paragraphs lines={GUIDE.need.paragraphs} /></GuideSection>
            <GuideSection part={GUIDE.format}>
              <Paragraphs lines={GUIDE.format.paragraphs} />
              <dl className={styles.puzzles}>
                {GUIDE.format.puzzles.map(({ name, task }) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{task}</dd>
                  </div>
                ))}
              </dl>
              <Paragraphs lines={GUIDE.format.timing} />
              <Paragraphs lines={GUIDE.format.academic} />
            </GuideSection>
            <GuideSection part={GUIDE.registration}>
              <ol className={styles.registration}>
                {GUIDE.registration.paragraphs.map((line) => <li key={line}>{line}</li>)}
              </ol>
            </GuideSection>
            <GuideSection part={GUIDE.dates}>
              <table className={styles.dates} aria-labelledby={`${GUIDE.dates.id}-title`}>
                <thead>
                  <tr>{GUIDE.dates.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr>
                </thead>
                <tbody>
                  {GUIDE.dates.windows.map(({ test, deadline, results }) => (
                    <tr key={test}>
                      <th scope="row">{test}</th>
                      <td>{deadline}</td>
                      <td>{results}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>{GUIDE.dates.fee}</p>
            </GuideSection>
            <GuideSection part={GUIDE.day}><Paragraphs lines={GUIDE.day.paragraphs} /></GuideSection>
            <GuideSection part={GUIDE.results}><Paragraphs lines={GUIDE.results.paragraphs} /></GuideSection>
            <GuideSection part={GUIDE.prepare}><Paragraphs lines={GUIDE.prepare.paragraphs} /></GuideSection>
          </div>
          <section className={styles.practice} aria-labelledby="dmat-practice-title">
            <div>
              <h2 id="dmat-practice-title">{PAGE_COPY.practice.title}</h2>
              <p>{PAGE_COPY.practice.introduction}</p>
            </div>
            <Button component={Link} to={PAGE_COPY.practice.href} variant="navy" size="lg">
              {PAGE_COPY.practice.action}
            </Button>
          </section>
        </ContentContainer>
      </div>
      <CommunityBand />
      <MentoringOffer />
      <Contact />
    </main>
  );
}
