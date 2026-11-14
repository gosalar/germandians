import { Button } from '@mantine/core';
import { Link } from 'react-router';

import { COMMUNITY, DESTINATIONS, PAGE_LINKS, SECTIONS, destinationHref } from '@/utils/constants';

import { COMMUNITY_INTRO_COPY as COPY } from './data';
import styles from './styles.module.scss';

/** A short lead-in to the community page. It carries the audience figure; the Story section tells the origin. */
export default function CommunityIntro() {
  return (
    <section id={SECTIONS.community} data-screen-label="Community" className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.lead}>
          <h2 className={styles.title}>{COPY.title}</h2>
          <p className={styles.stat}>
            <span className={styles.statNumber}>{COMMUNITY.size}</span>
            <span aria-hidden="true" className={styles.flagBar} />
            <span className={styles.statLabel}>{COMMUNITY.label}</span>
          </p>
        </div>

        <div className={styles.copy}>
          <p className={styles.body}>{COPY.body}</p>
          <div className={styles.actions}>
            <Button component={Link} to={destinationHref(PAGE_LINKS.community.destination)} variant="outline" size="lg">
              {COPY.pageLink}
            </Button>
            <a
              href={DESTINATIONS.instagram.href}
              target={DESTINATIONS.instagram.target}
              rel={DESTINATIONS.instagram.rel}
              className={styles.instagram}
            >
              {COPY.instagram}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
