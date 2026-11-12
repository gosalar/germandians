import { Accordion } from '@mantine/core';

import { CONTACT, SECTIONS } from '@/utils/constants';

import { QUESTIONS } from './data';
import styles from './styles.module.scss';

export default function Faq() {
  return (
    <section id={SECTIONS.faq} data-screen-label="FAQ" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.intro}>
          <h2 className={styles.title}>Before you send your details</h2>
          <p className={styles.body}>
            Answers to what students ask us first. Anything else,{' '}
            <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className={styles.inlineLink}>
              DM us on Instagram
            </a>
            .
          </p>
        </div>

        {/* Each answer opens independently; the first starts open. */}
        <Accordion multiple defaultValue={['0']}>
          {QUESTIONS.map((item, i) => (
            <Accordion.Item key={item.q} value={String(i)}>
              <Accordion.Control>{item.q}</Accordion.Control>
              <Accordion.Panel>
                <p className={styles.answer}>{item.a}</p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
