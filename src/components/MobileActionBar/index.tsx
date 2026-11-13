import { useEffect, useState } from 'react';

import HomeSectionLink from '@/components/HomeSectionLink';
import { usePageChrome } from '@/contexts/PageChrome/usePageChrome';
import { DESTINATIONS } from '@/utils/constants';
import { whatsapp } from '@/utils/siteConfig';

import { ACTION_BAR_COPY } from './data';
import styles from './styles.module.scss';

/**
 * Phone-only bar with the two quickest ways to reach us. It slides in once the
 * hero buttons have scrolled away and hides again while the form is on screen.
 */
export default function MobileActionBar() {
  const { heroCtaInView, formInView, menuOpen } = usePageChrome();
  const [footerInView, setFooterInView] = useState(false);
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting), {
      rootMargin: '0px 0px 84px 0px',
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  const visible = !heroCtaInView && !formInView && !menuOpen && !footerInView;

  return (
    <>
      <aside aria-label={ACTION_BAR_COPY.label} className={styles.bar} data-visible={visible}>
        <HomeSectionLink href={whatsapp.href} target={whatsapp.target} rel="noopener" className={styles.whatsapp}>
          {whatsapp.actionLabel}
        </HomeSectionLink>
        <a href={DESTINATIONS.instagram.href} target={DESTINATIONS.instagram.target} rel={DESTINATIONS.instagram.rel} className={styles.instagram}>
          {ACTION_BAR_COPY.instagram}
        </a>
      </aside>
    </>
  );
}
