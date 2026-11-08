import { CONTACT, SECTIONS } from '@/utils/constants';
import { whatsapp } from '@/utils/siteConfig';

import ProfileReviewForm from './ProfileReviewForm';
import styles from './styles.module.scss';

export default function Contact({ snapshot }: { snapshot?: string }) {
  return (
    <section id={SECTIONS.contact} data-screen-label="Contact" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.intro}>
          <h2 className={styles.title}>Get your profile reviewed</h2>
          <p className={styles.body}>
            Fill in the form and an admin will message you on WhatsApp. Or reach us directly:
          </p>
          <div className={styles.channels}>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className={styles.instagram}>
              <span className={styles.channelName}>Instagram</span>
              <span className={styles.channelValue}>{CONTACT.instagramHandle}</span>
            </a>
            <a href={whatsapp.href} target={whatsapp.target} rel="noopener" className={styles.channel}>
              <span className={styles.channelName}>WhatsApp</span>
              <span className={styles.channelValue}>{whatsapp.label}</span>
            </a>
            <a href={`mailto:${CONTACT.email}`} className={styles.channel}>
              <span className={styles.channelName}>Email</span>
              <span className={`${styles.channelValue} ${styles.channelEmail}`}>{CONTACT.email}</span>
            </a>
          </div>
        </div>
        <ProfileReviewForm snapshot={snapshot} />
      </div>
    </section>
  );
}
