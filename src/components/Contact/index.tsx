import { CONTACT, SECTIONS } from '@/utils/constants';
import { whatsapp } from '@/utils/siteConfig';

import { CONTACT_COPY } from './data';
import ProfileReviewForm from './ProfileReviewForm';
import styles from './styles.module.scss';

export default function Contact({ snapshot }: { snapshot?: string }) {
  return (
    <section id={SECTIONS.contact} data-screen-label={CONTACT_COPY.screenLabel} className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.intro}>
          <h2 className={styles.title}>{CONTACT_COPY.title}</h2>
          <p className={styles.body}>{CONTACT_COPY.body}</p>
          <div className={styles.channels}>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className={styles.instagram}>
              <span className={styles.channelName}>{CONTACT_COPY.instagram}</span>
              <span className={styles.channelValue}>{CONTACT.instagramHandle}</span>
            </a>
            <a href={whatsapp.href} target={whatsapp.target} rel="noopener" className={styles.channel}>
              <span className={styles.channelName}>{whatsapp.channelName}</span>
              <span className={styles.channelValue}>{whatsapp.label}</span>
            </a>
            <a href={`mailto:${CONTACT.email}`} className={styles.channel}>
              <span className={styles.channelName}>{CONTACT_COPY.emailLabel}</span>
              <span className={`${styles.channelValue} ${styles.channelEmail}`}>{CONTACT.email}</span>
            </a>
          </div>
        </div>
        <ProfileReviewForm snapshot={snapshot} />
      </div>
    </section>
  );
}
