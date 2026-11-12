import { Accordion } from '@mantine/core';
import { Link } from 'react-router';

import { CONTACT, ROUTES, SECTIONS } from '@/utils/constants';

import { FAQ_GROUPS } from './data';
import styles from './styles.module.scss';

/** Group and question position of the answer that starts open. */
const FIRST_OPEN = '0-0';

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

        <div className={styles.groups}>
          {FAQ_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className={styles.group}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              {group.note ? (
                <p className={styles.groupNote}>
                  {group.note.text}{' '}
                  <Link to={ROUTES.check} className={styles.inlineLink}>
                    {group.note.checkLink}
                  </Link>
                  .
                </p>
              ) : null}
              {/* Each answer opens independently; the first one on the page starts open.
                  Item values become element ids, so they are short codes, not the question text. */}
              <Accordion multiple defaultValue={[FIRST_OPEN]}>
                {group.questions.map((item, index) => (
                  <Accordion.Item key={item.q} value={`${groupIndex}-${index}`}>
                    <Accordion.Control>{item.q}</Accordion.Control>
                    <Accordion.Panel>
                      <p className={styles.answer}>{item.a}</p>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
