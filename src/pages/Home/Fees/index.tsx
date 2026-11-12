import { Button } from '@mantine/core';
import { Link } from 'react-router';

import SourceNote from '@/components/SourceNote';
import { EXTERNAL_COSTS } from '@/utils/applicationFacts';
import { FEE_POLICY, ROUTES, SECTIONS, hashLink } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import { FEES_COPY, QUOTE_TOPICS, feeCopy } from './data';
import Receipt from './Receipt';
import styles from './styles.module.scss';

export default function Fees() {
  const fee = feeCopy(siteConfig.feeAfterAdmission);

  return (
    <section id={SECTIONS.fees} data-screen-label="Fees" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.intro}>
          <h2 className={styles.title}>
            <span className={styles.titleBig}>{FEE_POLICY.amount}</span>
            <span className={styles.titleSmall}>{`${FEE_POLICY.timing}, ${FEE_POLICY.qualifier}.`}</span>
          </h2>
          <p className={styles.introBody}>{FEES_COPY.intro}</p>
        </div>

        <Receipt feeShort={fee.receipt} />

        <div className={styles.details}>
          <div className={styles.afterAdmission}>
            <h3 className={styles.detailTitle}>{FEES_COPY.quoteTitle}</h3>
            <p className={styles.detailBody}>{fee.text}</p>
            <p className={styles.detailBody}>{QUOTE_TOPICS.lead}</p>
            <ul className={styles.costList}>
              {QUOTE_TOPICS.items.map((item) => (
                <li key={item}>
                  <span className={styles.bullet} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.afterAdmission}>
            <h3 className={styles.detailTitle}>{FEES_COPY.paymentTitle}</h3>
            <p className={styles.detailBody}>{FEES_COPY.payment}</p>
          </div>
          <div className={styles.paidSeparately}>
            <h3 className={styles.detailTitle}>{FEES_COPY.separateTitle}</h3>
            <p className={styles.detailBody}>{FEES_COPY.separate}</p>
            {EXTERNAL_COSTS.map(({ group, items }) => (
              <div key={group}>
                <h4 className={styles.costHeading}>{group}</h4>
                <ul className={styles.costList}>
                  {items.map((item) => (
                    <li key={item.label}>
                      <span className={styles.bullet} />
                      <span>
                        <strong>{item.amount ? `${item.label} · ${item.amount}` : item.label}</strong>
                        <br />
                        {item.detail}
                        {item.source ? <SourceNote source={item.source} /> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={styles.ctas}>
            <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow-dark" size="lg">
              Get my profile reviewed
            </Button>
            <Button component={Link} to={ROUTES.check} variant="ring-dark" size="lg">
              Free German grade check
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
