import { ARRIVAL_SUPPORT, SECTIONS } from '@/utils/constants';

import { HOUSING_COPY, HOUSING_HELP, SETTLING_HELP } from './data';
import styles from './styles.module.scss';

export default function Housing() {
  return (
    <section id={SECTIONS.housing} data-screen-label="Housing" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>{HOUSING_COPY.title}</h2>
          <p className={styles.lede}>{HOUSING_COPY.lede}</p>
        </div>

        <div className={styles.cards}>
          <div data-testid="housing-offer" data-tone="housing" className={styles.card}>
            <p className={styles.when}>{HOUSING_HELP.when}</p>
            <h3 className={styles.cardTitle}>{HOUSING_HELP.title}</h3>
            <ul className={styles.points}>
              {HOUSING_HELP.points.map((point) => (
                <li key={point}>
                  <span aria-hidden="true" className={styles.bullet} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className={styles.availability}>
              {HOUSING_HELP.effort} <strong>{ARRIVAL_SUPPORT.availability}</strong>
            </p>
            <p className={styles.costs}>{HOUSING_HELP.costs}</p>
          </div>

          <div data-tone="settling" className={styles.card}>
            <p className={styles.when}>{SETTLING_HELP.when}</p>
            <h3 className={styles.cardTitle}>{SETTLING_HELP.title}</h3>
            <ul className={styles.points}>
              {SETTLING_HELP.points.map((point) => (
                <li key={point.term}>
                  <span aria-hidden="true" className={styles.bullet} />
                  <span>
                    <strong>{point.term}: </strong>
                    {point.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className={styles.quote}>
          <strong>{ARRIVAL_SUPPORT.complimentary}</strong> {ARRIVAL_SUPPORT.quote}
        </p>
      </div>
    </section>
  );
}
