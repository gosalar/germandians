import { useEffect, useState } from 'react';

import HomeSectionLink from '@/components/HomeSectionLink';
import { usePageChrome } from '@/contexts/PageChrome/usePageChrome';
import { CONTACT } from '@/utils/constants';
import { whatsapp } from '@/utils/siteConfig';

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
      <div className={styles.bar} data-visible={visible}>
        <HomeSectionLink href={whatsapp.href} target={whatsapp.target} rel="noopener" className={styles.whatsapp}>
          WhatsApp us
        </HomeSectionLink>
        <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className={styles.instagram}>
          Instagram
        </a>
      </div>
    </>
  );
}
