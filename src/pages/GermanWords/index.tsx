import { Button, TextInput } from '@mantine/core';
import { useRef, useState } from 'react';
import { Link } from 'react-router';

import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import { DESTINATIONS, NAV_CTA, ROUTES, SECTIONS, destinationHref } from '@/utils/constants';
import { requirementsHref } from '@/utils/requirements/topics';

import {
  AREA_LABELS,
  ARTICLE_GUIDE,
  CARD_COPY,
  EMPTY_COPY,
  FILTER_COPY,
  GERMAN_WORDS_ENTRIES,
  LIST_COPY,
  NEXT_COPY,
  PAGE_COPY,
  WORD_AREAS,
  entryHeadword,
  topicLinkLabel,
  type GlossaryEntry,
} from './data';
import { countByArea, filterEntries, type AreaFilter } from './filter';
import styles from './styles.module.scss';

const AREA_COUNTS = countByArea(GERMAN_WORDS_ENTRIES);
const TOTAL_COUNT = GERMAN_WORDS_ENTRIES.length;

function Kicker() {
  return (
    <p className={styles.kickerSticker}>
      <span lang="de">{PAGE_COPY.kicker.de}</span>
      <span className={styles.kickerEn}>{PAGE_COPY.kicker.en}</span>
    </p>
  );
}

function EntryCard({ entry }: { entry: GlossaryEntry }) {
  const articleKey = entry.article || 'particle';
  const badgeText = entry.article || CARD_COPY.particleBadge;
  const fullHeadword = entryHeadword(entry);
  const area = AREA_LABELS[entry.area];

  return (
    <li className={styles.entryCard} data-entry={entry.id} data-area={entry.area}>
      <div className={styles.entryTop}>
        <span
          lang={entry.article ? 'de' : undefined}
          className={styles.articleBadge}
          data-article={articleKey}
        >
          {badgeText}
        </span>
        <span className={styles.areaTag}>{area.en}</span>
      </div>

      <div className={styles.entryWordBlock}>
        <h3 lang="de" className={styles.entryHeading}>
          {fullHeadword}
        </h3>
        <p className={styles.entryForms}>{entry.forms}</p>
      </div>

      <p className={styles.entryMeaning}>{entry.meaning}</p>

      <div className={styles.exampleBox}>
        <p lang="de" className={styles.exampleDe}>
          „{entry.example.de}“
        </p>
        <p className={styles.exampleEn}>{entry.example.en}</p>
      </div>

      <div className={styles.whereBlock}>
        <p className={styles.whereLabel}>{CARD_COPY.whereLabel}</p>
        <p className={styles.whereText}>{entry.where}</p>
        {entry.topic ? (
          <Link to={requirementsHref(entry.topic)} className={styles.topicLink}>
            <span>{topicLinkLabel(entry.topic)}</span>
            <span aria-hidden="true">{CARD_COPY.linkArrow}</span>
          </Link>
        ) : null}
      </div>
    </li>
  );
}

/** Everyday study, paperwork, housing, money and daily-life German with articles, plurals and examples. */
export default function GermanWords() {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<AreaFilter>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = filterEntries(GERMAN_WORDS_ENTRIES, query, area);
  const isFiltered = query.trim().length > 0 || area !== 'all';

  const clearFilters = () => {
    setQuery('');
    setArea('all');
    searchInputRef.current?.focus();
  };

  const statusText =
    filtered.length === 0
      ? FILTER_COPY.showingNone(query.trim())
      : isFiltered
        ? FILTER_COPY.showingFiltered(filtered.length, TOTAL_COUNT)
        : FILTER_COPY.showingAll(TOTAL_COUNT);

  return (
    <main id="main-content" tabIndex={-1}>
      <section id={SECTIONS.top} className={styles.top}>
        <div className={styles.topGrid}>
          <PageHeader
            variant="regular"
            title={PAGE_COPY.title}
            introduction={PAGE_COPY.introduction}
            leading={<Kicker />}
          />

          <aside aria-labelledby="german-words-guide" className={styles.guideCard}>
            <h2 id="german-words-guide" className={styles.guideTitle}>
              <span lang="de">{ARTICLE_GUIDE.title.de}</span>
              <span className={styles.guideTitleEn}>{ARTICLE_GUIDE.title.en}</span>
            </h2>
            <p className={styles.guideBody}>{ARTICLE_GUIDE.body}</p>
            <ul className={styles.articleLegend}>
              {ARTICLE_GUIDE.articles.map((item) => (
                <li key={item.article} className={styles.articleLegendRow}>
                  <span lang="de" className={styles.articleBadge} data-article={item.article}>
                    {item.article}
                  </span>
                  <span>{item.note}</span>
                </li>
              ))}
            </ul>
            <p className={styles.guideDisclaimer}>{ARTICLE_GUIDE.disclaimer}</p>
          </aside>
        </div>
      </section>

      <section aria-labelledby="german-words-filter-heading" className={styles.controlsBand}>
        <div className={styles.controlsInner}>
          <div className={styles.controlsCard}>
            <div className={styles.controlsHead}>
              <h2 id="german-words-filter-heading" className={styles.controlsTitle}>
                {FILTER_COPY.heading}
              </h2>
              <p role="status" aria-live="polite" className={styles.resultStatus}>
                {statusText}
              </p>
            </div>

            <div className={styles.searchRow}>
              <TextInput
                ref={searchInputRef}
                id="german-words-search"
                type="text"
                inputMode="search"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                label={FILTER_COPY.searchLabel}
                placeholder={FILTER_COPY.searchPlaceholder}
                className={styles.searchInput}
              />
              {isFiltered ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={clearFilters}
                  className={styles.clearButton}
                >
                  {FILTER_COPY.clear}
                </Button>
              ) : null}
            </div>

            <div role="group" aria-label={FILTER_COPY.areasLabel} className={styles.areaChips}>
              <button
                type="button"
                aria-pressed={area === 'all'}
                onClick={() => setArea('all')}
                className={styles.areaChip}
              >
                {FILTER_COPY.areaChip(FILTER_COPY.allAreas, TOTAL_COUNT)}
              </button>
              {WORD_AREAS.map((areaId) => (
                <button
                  key={areaId}
                  type="button"
                  aria-pressed={area === areaId}
                  onClick={() => setArea(areaId)}
                  className={styles.areaChip}
                >
                  {FILTER_COPY.areaChip(AREA_LABELS[areaId].en, AREA_COUNTS[areaId])}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="german-words-list-heading" className={styles.glossaryBand}>
        <div className={styles.glossaryInner}>
          <h2 id="german-words-list-heading" className={styles.srOnly}>
            {LIST_COPY.heading}
          </h2>

          {filtered.length > 0 ? (
            <ul className={styles.grid} data-testid="german-words-list">
              {filtered.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState} data-testid="german-words-empty">
              <h3 className={styles.emptyTitle}>{EMPTY_COPY.title}</h3>
              <p className={styles.emptyBody}>{EMPTY_COPY.body}</p>
              <Button type="button" variant="navy" size="md" onClick={clearFilters}>
                {EMPTY_COPY.reset}
              </Button>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="german-words-next-heading" className={styles.nextBand}>
        <div className={styles.nextInner}>
          <div className={styles.nextCard}>
            <div className={styles.nextCopy}>
              <h2 id="german-words-next-heading" className={styles.nextTitle}>
                {NEXT_COPY.title}
              </h2>
              <p className={styles.nextBody}>{NEXT_COPY.body}</p>
            </div>
            <div className={styles.nextActions}>
              <Button
                component={HomeSectionLink}
                href={destinationHref(DESTINATIONS.profileReview)}
                variant="yellow-dark"
                size="lg"
              >
                {NAV_CTA.label}
              </Button>
              <Button component={Link} to={ROUTES.requirements} variant="ring-dark" size="lg">
                {NEXT_COPY.requirementsAction}
              </Button>
              <Button component={Link} to={ROUTES.learnGerman} variant="ring-dark" size="lg">
                {NEXT_COPY.learnGermanAction}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
