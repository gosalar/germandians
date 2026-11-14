import { Button } from '@mantine/core';
import { Link } from 'react-router';

import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import { DESTINATIONS, NAV_CTA, PAGE_LINKS, SECTIONS, destinationHref } from '@/utils/constants';

import { ABOUT_COPY, HERO_STICKERS, MEANING_POINTS, MILESTONES, TEAM } from './data';
import ExperienceRecord from './ExperienceRecord';
import styles from './styles.module.scss';
import TeamGallery from './TeamGallery';

/** "Hallo!" in a speech bubble above the title, with the English for visitors who need it. */
function Greeting() {
  return (
    <p className={styles.greeting}>
      <span lang="de" className={styles.greetingBubble}>
        {ABOUT_COPY.greeting.de}
      </span>
      <span className={styles.greetingEnglish}>{ABOUT_COPY.greeting.en}</span>
    </p>
  );
}

function Stickers() {
  return (
    <ul className={styles.stickers}>
      {HERO_STICKERS.map((sticker) => (
        <li key={sticker.id} className={styles.sticker} data-sticker={sticker.id}>
          <strong>{sticker.strong}</strong> <span>{sticker.text}</span>
        </li>
      ))}
    </ul>
  );
}

function Story() {
  return (
    <section aria-labelledby="about-story" className={styles.story}>
      <div className={styles.container}>
        <h2 id="about-story" className={styles.storyTitle}>
          {ABOUT_COPY.storyTitle}
        </h2>
        <ol className={styles.milestones}>
          {MILESTONES.map((milestone, index) => (
            <li key={milestone.id} className={styles.milestone}>
              <span aria-hidden="true" className={styles.milestoneNumber}>
                {index + 1}
              </span>
              <p className={styles.milestoneWhen}>
                <span lang="de">{milestone.when.de}</span>
                <span className={styles.milestoneWhenEn}>{milestone.when.en}</span>
              </p>
              <h3 className={styles.milestoneTitle}>{milestone.title}</h3>
              <p className={styles.milestoneText}>{milestone.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Rendered whenever `TEAM` has entries, stand-ins included. No count is written anywhere. */
function Team() {
  return (
    <section aria-labelledby="about-team" className={styles.team}>
      <div className={styles.container}>
        <div className={styles.teamHead}>
          <h2 id="about-team" className={styles.teamTitle}>
            {ABOUT_COPY.teamTitle}
          </h2>
          <p className={styles.teamLede}>{ABOUT_COPY.teamLede}</p>
        </div>
        <TeamGallery team={TEAM} />
      </div>
    </section>
  );
}

/** The company, the people behind it, what they went through, and why that helps an applicant. */
export default function About() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section id={SECTIONS.top} className={styles.top}>
        <div className={styles.topGrid}>
          <PageHeader
            variant="regular"
            title={ABOUT_COPY.title}
            introduction={ABOUT_COPY.introduction}
            leading={<Greeting />}
            meta={<Stickers />}
          />
          <ExperienceRecord />
        </div>
      </section>

      <Story />

      {TEAM.length > 0 ? <Team /> : null}

      <section aria-labelledby="about-meaning" className={styles.meaning}>
        <div className={styles.container}>
          <h2 id="about-meaning" className={styles.meaningTitle}>
            {ABOUT_COPY.meaningTitle}
          </h2>
          <ul className={styles.meaningPoints}>
            {MEANING_POINTS.map((point) => (
              <li key={point.title} className={styles.meaningPoint}>
                <h3 className={styles.meaningPointTitle}>{point.title}</h3>
                <p className={styles.meaningPointText}>{point.text}</p>
              </li>
            ))}
          </ul>

          <div className={styles.next}>
            <div className={styles.nextCopy}>
              <h3 className={styles.nextTitle}>{ABOUT_COPY.nextTitle}</h3>
              <p className={styles.nextBody}>{ABOUT_COPY.nextBody}</p>
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
              <Button component={Link} to={destinationHref(PAGE_LINKS.community.destination)} variant="ring-dark" size="lg">
                {ABOUT_COPY.communityAction}
              </Button>
              <Link to={destinationHref(PAGE_LINKS.gradeCheck.destination)} className={styles.nextLink}>
                {ABOUT_COPY.gradeCheckAction}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
