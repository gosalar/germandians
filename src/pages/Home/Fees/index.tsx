import { Button } from '@mantine/core';
import { SECTIONS, hashLink } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import { PAID_SEPARATELY, feeCopy } from './data';
import Receipt from './Receipt';
import styles from './styles.module.scss';

export default function Fees() {
  const fee = feeCopy(siteConfig.feeAfterAdmission);

  return (
    <section id={SECTIONS.fees} data-screen-label="Fees" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.intro}>
          <h2 className={styles.title}>
            <span className={styles.titleBig}>Zero euros</span>
            <span className={styles.titleSmall}>service fee until you're admitted.</span>
          </h2>
          <p className={styles.introBody}>
            You pay Germandians nothing until a university admits you. Everything on the receipt is part of the service.
          </p>
        </div>

        <Receipt feeShort={fee.short} />

        <div className={styles.details}>
          <div className={styles.afterAdmission}>
            <h3 className={styles.detailTitle}>After you're admitted</h3>
            <p className={styles.detailBody}>{fee.text}</p>
          </div>
          <div className={styles.paidSeparately}>
            <h3 className={styles.detailTitle}>Paid separately, to other organisations</h3>
            <ul className={styles.costList}>
              {PAID_SEPARATELY.map((item) => (
                <li key={item}>
                  <span className={styles.bullet} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow-dark" size="lg" className={styles.cta}>
            Get my profile reviewed
          </Button>
        </div>
      </div>
    </section>
  );
}
