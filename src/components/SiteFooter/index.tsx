import { Link } from 'react-router';

import { CONTACT, INTAKE_SEATS, ROUTES, SECTIONS, hashLink } from '@/utils/constants';
import { buildYear, businessOperator, siteConfig } from '@/utils/siteConfig';

import styles from './styles.module.scss';

export default function SiteFooter() {
  return (
    <>
      <div aria-hidden="true" className={styles.flagBand} />
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.top}>
            <p className={styles.tagline}>
              Guidance for Indian students heading to Germany, from students who are already there.
            </p>
            <div className={styles.links}>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className={styles.link}>
                Instagram
              </a>
              <a href={`mailto:${CONTACT.email}`} className={`${styles.link} ${styles.email}`}>
                {CONTACT.email}
              </a>
              <Link to={ROUTES.check} className={styles.link}>
                Grade check
              </Link>
              <Link to={ROUTES.privacy} className={styles.link}>
                Privacy
              </Link>
              <a href={hashLink(SECTIONS.top)} className={styles.link}>
                Back to top
              </a>
            </div>
          </div>
          <div className={styles.bottom}>
            <span>{`© ${buildYear} Germandians`}</span>
            {businessOperator ? <span data-testid="business-operator">{`Operated by ${businessOperator}`}</span> : null}
            {siteConfig.showSeatCount ? (
              <span>
                {siteConfig.intake}: {siteConfig.seatsLeft} of {INTAKE_SEATS} places open
              </span>
            ) : null}
          </div>
        </div>
      </footer>
    </>
  );
}
