import { Button } from '@mantine/core';
import { Link } from 'react-router';

import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import { COMMUNITY, DESTINATIONS, PAGE_LINKS, SECTIONS, destinationHref } from '@/utils/constants';

import { CHANNELS, CHANNELS_COPY, MENTORING_COPY, ORIGIN_COPY, PAGE_COPY, type ChannelTone } from './data';
import styles from './styles.module.scss';

/** The audience figure as a round badge, with exactly the shared label and a note on what it counts. */
function AudienceFigure() {
  return (
    <div className={styles.audience}>
      <div className={styles.badgeWrap}>
        <span aria-hidden="true" className={styles.bubble} data-bubble="question">?</span>
        <span aria-hidden="true" className={styles.bubble} data-bubble="answer">!</span>
        <span aria-hidden="true" className={styles.bubble} data-bubble="heart" />
        <p className={styles.badge}>
          <span className={styles.statNumber}>{COMMUNITY.size}</span>
          <span className={styles.statLabel}>{COMMUNITY.label}</span>
        </p>
      </div>
      <p className={styles.audienceNote}>{PAGE_COPY.audienceNote}</p>
    </div>
  );
}

/** A simple outline glyph for each channel, drawn here so nothing loads from the platforms. */
function ChannelGlyph({ tone }: { tone: ChannelTone }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className={styles.glyph}>
      {tone === 'instagram' ? (
        <>
          <rect x="6" y="6" width="36" height="36" rx="11" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="24" cy="24" r="8.5" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="34.5" cy="13.5" r="2.6" fill="currentColor" />
        </>
      ) : (
        <>
          <path
            d="M24 6C14 6 6 13.4 6 22.6c0 4.6 2 8.7 5.2 11.7L9 42l8.6-3.6c2 .7 4.2 1 6.4 1 10 0 18-7.4 18-16.6S34 6 24 6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="16.5" cy="23" r="2.6" fill="currentColor" />
          <circle cx="24" cy="23" r="2.6" fill="currentColor" />
          <circle cx="31.5" cy="23" r="2.6" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

/** Each channel as a phone screen: the app's colour bar on top, what it is and one action below. */
function Channels() {
  return (
    <section className={styles.channelsSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{CHANNELS_COPY.title}</h2>
        <ul className={styles.channels}>
          {CHANNELS.map((channel) => (
            <li key={channel.tone} className={styles.channel} data-tone={channel.tone}>
              <div className={styles.screenBar}>
                <span aria-hidden="true" className={styles.notch} />
                <ChannelGlyph tone={channel.tone} />
                <p className={styles.platform}>{channel.platform}</p>
              </div>
              <div className={styles.channelBody}>
                <h3 className={styles.channelTitle}>{channel.title}</h3>
                <p className={styles.channelText}>{channel.body}</p>
                <Button
                  component="a"
                  href={channel.href}
                  target="_blank"
                  rel="noopener"
                  variant={channel.emphasis === 'primary' ? 'navy' : 'ring'}
                  size="lg"
                  className={styles.channelAction}
                >
                  {channel.action}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** From the first questions to the mentoring, as three speech bubbles. */
function Origin() {
  return (
    <section className={styles.originSection}>
      <div className={styles.container}>
        <div className={styles.originHead}>
          <h2 className={styles.sectionTitle}>{ORIGIN_COPY.title}</h2>
          <p className={styles.originLede}>{ORIGIN_COPY.lede}</p>
        </div>
        <ol className={styles.flow}>
          {ORIGIN_COPY.steps.map((step) => (
            <li key={step.id} className={styles.flowStep} data-step={step.id}>
              <span aria-hidden="true" className={styles.flowMark}>
                {step.mark}
              </span>
              <h3 className={styles.flowTitle}>{step.title}</h3>
              <p className={styles.flowText}>{step.text}</p>
            </li>
          ))}
        </ol>
        <Link to={destinationHref(PAGE_LINKS.about.destination)} className={styles.originLink}>
          {ORIGIN_COPY.aboutLink}
        </Link>
      </div>
    </section>
  );
}

/** The community and the paid mentoring as two tickets, so the difference reads at a glance. */
function Mentoring() {
  return (
    <section className={styles.mentoringSection}>
      <div className={styles.container}>
        <h2 className={styles.mentoringTitle}>{MENTORING_COPY.title}</h2>
        <div className={styles.tickets}>
          <div className={styles.ticket} data-ticket="community">
            <p className={styles.ticketKicker}>
              <span lang="de">{MENTORING_COPY.communityTitle.de}</span>
              <span className={styles.ticketKickerEn}>{MENTORING_COPY.communityTitle.en}</span>
            </p>
            <h3 className={styles.ticketTitle}>{MENTORING_COPY.communityPoint}</h3>
            <p className={styles.ticketText}>{MENTORING_COPY.community}</p>
            <span aria-hidden="true" className={styles.ticketStamp}>
              <span lang="de">{MENTORING_COPY.communityStamp.de}</span>
              <span>{MENTORING_COPY.communityStamp.en}</span>
            </span>
          </div>

          <div className={styles.ticket} data-ticket="mentoring">
            <p className={styles.ticketKicker}>
              <span lang="de">Mentoring</span>
              <span className={styles.ticketKickerEn}>Paid service</span>
            </p>
            <h3 className={styles.ticketTitle}>{MENTORING_COPY.mentoringTitle}</h3>
            <p className={styles.ticketText}>{MENTORING_COPY.mentoring}</p>
            <ul className={styles.facts}>
              {MENTORING_COPY.facts.map((fact) => (
                <li key={fact}>
                  <span aria-hidden="true" className={styles.factBullet} />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
            <div className={styles.ticketActions}>
              <Button
                component={HomeSectionLink}
                href={destinationHref(DESTINATIONS.profileReview)}
                variant="navy"
                size="lg"
              >
                {MENTORING_COPY.profileReview}
              </Button>
              <Button component={Link} to={destinationHref(PAGE_LINKS.gradeCheck.destination)} variant="ring" size="lg">
                {MENTORING_COPY.gradeCheck}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** What the community is, where to find it, and how it relates to the paid mentoring. */
export default function Community() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section id={SECTIONS.top} className={styles.top}>
        <div className={`${styles.container} ${styles.topGrid}`}>
          <div className={styles.heading}>
            <PageHeader variant="loose" title={PAGE_COPY.title} introduction={PAGE_COPY.introduction} />
          </div>
          <AudienceFigure />
        </div>
      </section>
      <Channels />
      <Origin />
      <Mentoring />
    </main>
  );
}
