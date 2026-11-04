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
  const visible = !heroCtaInView && !formInView && !menuOpen;

  return (
    <>
      <div aria-hidden="true" className={styles.spacer} />
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
