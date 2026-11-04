import { Accordion } from '@mantine/core';

import { CONTACT, SECTIONS } from '@/utils/constants';

import styles from './styles.module.scss';

const QUESTIONS = [
  {
    q: 'Can you guarantee admission?',
    a: 'No. Universities make every admission decision themselves. What we can promise is the payment model: if no university admits you, you owe us no service fee.',
  },
  {
    q: "What do I owe if I don't get an offer?",
    a: "Nothing to Germandians. Fees you pay to other organisations along the way, such as university or uni-assist application fees, the APS fee and the IELTS test fee, go to them directly, so we can't refund those.",
  },
  {
    q: 'Can I apply only to public universities?',
    a: "Yes. Tell us in your profile review. We'll check how your ECTS credits match the public courses you want and tell you plainly how your chances look.",
  },
  {
    q: 'Who writes and reviews my SOP?',
    a: "A mentor writes it with you by hand over several weeks, from your own story and documents. Nothing is submitted until you've approved the final version.",
  },
  {
    q: 'What support continues after I land?',
    a: 'We help with your student dorm applications, take you through city registration (Anmeldung) and opening a bank account, and introduce you to seniors at your university.',
  },
  {
    q: 'Are you connected to any university?',
    a: "No. We study at German universities, but we don't represent any of them and none of them pay us. We recommend universities only on how well they fit your profile.",
  },
  {
    q: 'When do I get the terms in writing?',
    a: "After your profile review and before any work starts. The written terms state the fee, when it becomes due and exactly what's included.",
  },
];

const ACCORDION_CLASSES = {
  root: styles.list,
  item: styles.item,
  control: styles.control,
  chevron: styles.chevron,
  icon: styles.icon,
};

const plusIcon = <span aria-hidden="true">+</span>;

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
        <Accordion multiple defaultValue={['0']} transitionDuration={0} classNames={ACCORDION_CLASSES}>
          {QUESTIONS.map((item, i) => (
            <Accordion.Item key={item.q} value={String(i)}>
              <Accordion.Control icon={plusIcon}>{item.q}</Accordion.Control>
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
