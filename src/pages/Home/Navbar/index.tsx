import BrandLink from '@/components/Brand';
import { usePageChrome, usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { SECTIONS, hashLink } from '@/utils/constants';

import styles from './styles.module.scss';

const NAV_LINKS = [
  { id: SECTIONS.journey, label: 'Journey' },
  { id: SECTIONS.universities, label: 'Universities' },
  { id: SECTIONS.community, label: 'Why us' },
  { id: SECTIONS.contact, label: 'Contact' },
];

const CTA_LABEL = 'Get my profile reviewed';

export default function Navbar() {
  const { menuOpen } = usePageChrome();
  const { toggleMenu, closeMenu } = usePageChromeActions();

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <BrandLink to={hashLink(SECTIONS.top)} onClick={closeMenu} />

        <div className={styles.full}>
          <div className={styles.links}>
            {NAV_LINKS.map((link) => (
              <a key={link.id} href={hashLink(link.id)} className={styles.link}>
                {link.label}
              </a>
            ))}
          </div>
          <a href={hashLink(SECTIONS.contactForm)} className={styles.cta}>
            {CTA_LABEL}
          </a>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true" className={styles.burger} data-open={menuOpen}>
            <span />
            <span />
          </span>
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-menu" className={styles.menu}>
          {NAV_LINKS.map((link) => (
            <a key={link.id} href={hashLink(link.id)} onClick={closeMenu} className={styles.menuLink}>
              {link.label}
            </a>
          ))}
          <a href={hashLink(SECTIONS.contactForm)} onClick={closeMenu} className={styles.menuCta}>
            {CTA_LABEL}
          </a>
        </div>
      ) : null}
    </nav>
  );
}
