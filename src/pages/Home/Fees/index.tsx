import { Button } from '@mantine/core';
import { Link } from 'react-router';

import { FEE_POLICY, ROUTES, SECTIONS, hashLink } from '@/utils/constants';
import { requirementsHref } from '@/utils/requirements/topics';
import { siteConfig } from '@/utils/siteConfig';

import { FEES_COPY, feeCopy } from './data';
import Receipt from './Receipt';
import styles from './styles.module.scss';

export default function Fees() {
  const fee = feeCopy(siteConfig.feeAfterAdmission);

  return (
    <section id={SECTIONS.fees} data-screen-label="Fees" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h2 className={styles.title}>
            <span className={styles.titleBig}>{FEE_POLICY.amount}</span>
            <span className={styles.titleSmall}>{`${FEE_POLICY.timing}, ${FEE_POLICY.qualifier}.`}</span>
          </h2>
          <p className={styles.introBody}>{FEES_COPY.intro}</p>

          {/* The quote terms, outside costs and budget planner live where they belong: the FAQ on this page,
              the costs topic on /requirements, and the planner at /budget. The FAQ group is on this page, so
              its link scrolls locally. */}
          <ul className={styles.links}>
            <li>
              <a href={hashLink(SECTIONS.faqFees)} className={styles.link}>
                <span>{FEES_COPY.quoteLink}</span>
                <span aria-hidden="true" className={styles.linkArrow}>↓</span>
              </a>
            </li>
            <li>
              <Link to={requirementsHref('costs')} className={styles.link}>
                <span>{FEES_COPY.costsLink}</span>
                <span aria-hidden="true" className={styles.linkArrow}>→</span>
              </Link>
            </li>
            <li>
              <Link to={ROUTES.budget} className={styles.link}>
                <span>{FEES_COPY.budgetLink}</span>
                <span aria-hidden="true" className={styles.linkArrow}>→</span>
              </Link>
            </li>
          </ul>

          <div className={styles.ctas}>
            <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow-dark" size="lg">
              Get my profile reviewed
            </Button>
            <Button component={Link} to={ROUTES.check} variant="ring-dark" size="lg">
              Free German grade check
            </Button>
          </div>
        </div>

        <Receipt feeShort={fee.receipt} />
      </div>
    </section>
  );
}
