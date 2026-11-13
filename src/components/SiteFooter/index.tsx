import { Link } from 'react-router';

import { INTAKE_SEATS, ROUTES, destinationHref } from '@/utils/constants';
import { buildYear, businessOperator, siteConfig } from '@/utils/siteConfig';

import { FOOTER_COPY, FOOTER_LINKS } from './data';
import styles from './styles.module.scss';

function FooterLink({
  destination,
  label,
}: {
  destination: (typeof FOOTER_LINKS)[number]['destination'];
  label: string;
}) {
  if (destination.kind === 'page') {
    return (
      <Link to={ROUTES[destination.page]} className={styles.link}>
        {label}
      </Link>
    );
  }
  const className = destination.kind === 'external' && destination.href.startsWith('mailto:')
    ? `${styles.link} ${styles.email}`
    : styles.link;
  return (
    <a
      href={destinationHref(destination)}
      target={destination.kind === 'external' ? destination.target : undefined}
      rel={destination.kind === 'external' ? destination.rel : undefined}
      className={className}
    >
      {label}
    </a>
  );
}

export default function SiteFooter() {
  return (
    <>
      <div aria-hidden="true" className={styles.flagBand} />
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.top}>
            <p className={styles.tagline}>{FOOTER_COPY.tagline}</p>
            <div className={styles.links}>
              {FOOTER_LINKS.map((link) => (
                <FooterLink key={link.label} destination={link.destination} label={link.label} />
              ))}
            </div>
          </div>
          <div className={styles.bottom}>
            <span>{FOOTER_COPY.copyright(buildYear)}</span>
            {businessOperator ? <span data-testid="business-operator">{FOOTER_COPY.operatedBy(businessOperator)}</span> : null}
            {siteConfig.showSeatCount ? (
              <span>{FOOTER_COPY.placesOpen(siteConfig.intake, siteConfig.seatsLeft, INTAKE_SEATS)}</span>
            ) : null}
          </div>
        </div>
      </footer>
    </>
  );
}
