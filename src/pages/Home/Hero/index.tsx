import { Badge, Button } from '@mantine/core';
import flagPainting from '@/assets/images/flag-painting.jpg';
import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { CONTACT, SECTIONS, hashLink, type IntakeStatus } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import styles from './styles.module.scss';
import { usePaintCanvas } from './usePaintCanvas';

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
  const { wrapRef, canvasRef, wiped, restoring, wipe, onPointerMove, onPointerDown, onPointerLeave } = usePaintCanvas();

  return (
    <div className={styles.art}>
      <div
        ref={wrapRef}
        className={styles.canvasWrap}
        data-wiped={wiped}
        data-restoring={restoring}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerLeave}
        onPointerCancel={onPointerLeave}
        onPointerLeave={onPointerLeave}
      >
        <img
          src={flagPainting}
          alt="Palette-knife painting of the German flag sweeping into the Indian tricolour"
          draggable={false}
          fetchPriority="high"
          className={styles.painting}
        />
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      {siteConfig.allowRepaint ? (
        <div className={styles.repaint}>
          <span>
            {wiped ? 'Move your pointer or finger to paint. It restores when you stop.' : 'Wipe the canvas and paint the flag back in.'}
          </span>
          <button type="button" onClick={wipe} className={styles.wipeButton}>
            Wipe and repaint
          </button>
        </div>
      ) : null}
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
            <span className={styles.feeAmount}>€0</span>
            <span className={styles.feeText}>service fee until you're admitted</span>
          </a>
          <p className={styles.summary}>We guide you from profile evaluation to your first week in Germany.</p>
          <div ref={heroCtaRef} className={styles.ctas}>
            <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow" size="lg">
              Get my profile reviewed
            </Button>
            <Button component="a" href={CONTACT.instagramUrl} target="_blank" rel="noopener" variant="ring" size="lg">
              DM us on Instagram
            </Button>
          </div>
          <div className={styles.meta}>
            <div className={styles.intake}>
              <span className={styles.intakeLabel}>{siteConfig.intake} intake, 30 students</span>
              <IntakeStatusBadge />
            </div>
            <p className={styles.community}>Run by the team behind a 22,000-member student community.</p>
          </div>
        </div>
        <Painting />
      </div>
    </header>
  );
}
