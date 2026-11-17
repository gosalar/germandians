import { Button } from '@mantine/core';
import { useId } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import HomeSectionLink from '@/components/HomeSectionLink';
import { NAV_CTA, hashLink } from '@/utils/constants';

import { MENTORING_OFFER_COPY } from './data';
import styles from './styles.module.scss';

export default function MentoringOffer() {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={styles.offer}>
      <ContentContainer width="wide">
        <h2 id={titleId} className={styles.title}>{MENTORING_OFFER_COPY.title}</h2>
        <ol className={styles.steps} role="list">
          <li aria-current="step"><span>{MENTORING_OFFER_COPY.current}</span></li>
          {MENTORING_OFFER_COPY.links.map(({ label, href }) => (
            <li key={href}><Link to={href}>{label}</Link></li>
          ))}
        </ol>
        <div className={styles.layout}>
          <p className={styles.description}>{MENTORING_OFFER_COPY.description}</p>
          <ul className={styles.limits}>
            {MENTORING_OFFER_COPY.facts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
          <div className={styles.action}>
            <Button component={HomeSectionLink} href={hashLink(NAV_CTA.id)} variant="yellow" size="lg">
              {NAV_CTA.label}
            </Button>
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
