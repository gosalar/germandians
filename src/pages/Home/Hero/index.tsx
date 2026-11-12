import { Badge, Button } from '@mantine/core';
import { Link } from 'react-router';
import flagPainting from '@/assets/images/flag-painting.jpg';
import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { FEE_POLICY, INTAKE_SEATS, ROUTES, SECTIONS, TRACK_RECORD, hashLink, type IntakeStatus } from '@/utils/constants';
import { INTAKE_READINESS, siteConfig } from '@/utils/siteConfig';

import styles from './styles.module.scss';

/** Badge colours per intake status ([background, ink]). "Not confirmed" shows no badge. */
const STATUS_COLORS: Partial<Record<IntakeStatus, [string, string]>> = {
  'Enquiries open': ['#e1f0e4', '#17692f'],
  'Waitlist only': ['#fdeedb', '#8f4700'],
  'Enquiries closed': ['#fbe4e1', '#a8221a'],
};

function IntakeStatusBadge() {
  const colors = STATUS_COLORS[siteConfig.intakeStatus];
  if (!colors) return null;
  const [background, ink] = colors;
  return (
    <Badge component="span" variant="intake" style={{ background, color: ink }}>
      {siteConfig.intakeStatus}
    </Badge>
  );
}

function Painting() {
  return (
    <div className={styles.art}>
      <img
        src={flagPainting}
        alt="Palette-knife painting of the German flag sweeping into the Indian tricolour"
        draggable={false}
        fetchPriority="high"
        className={styles.painting}
      />
    </div>
  );
}

export default function Hero() {
  const { heroCtaRef } = usePageChromeActions();

  return (
    <header id={SECTIONS.top} className={styles.hero}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Study in Germany with the people already there.</h1>
          <p className={styles.lede}>Six student mentors in Germany. Up to five students per mentor.</p>
          <a href={hashLink(SECTIONS.fees)} className={styles.feeBadge}>
            <span className={styles.feeAmount}>{FEE_POLICY.amount}</span>
            <span className={styles.feeText}>{`${FEE_POLICY.timing}, ${FEE_POLICY.qualifier}`}</span>
          </a>
          <p className={styles.summary}>We guide you from profile evaluation to your arrival in Germany.</p>
          <div ref={heroCtaRef} className={styles.ctas}>
            <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow" size="lg">
              Get my profile reviewed
            </Button>
            <Button component={Link} to={ROUTES.check} variant="ring" size="lg">
              Free grade check
            </Button>
          </div>
          <div className={styles.meta}>
            <div className={styles.intake}>
              <span className={styles.intakeLabel}>{`${siteConfig.intake} intake, ${INTAKE_SEATS} students`}</span>
              <IntakeStatusBadge />
            </div>
            <p className={styles.note}>{INTAKE_READINESS}</p>
            <p className={styles.note}>{TRACK_RECORD.sentence}</p>
          </div>
        </div>
        <Painting />
      </div>
    </header>
  );
}
