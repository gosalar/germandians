import { useState } from 'react';

import { WORDS } from './data';
import styles from './styles.module.scss';

type Word = (typeof WORDS.cards)[number];

/**
 * One flip card. Both faces stay in the accessibility tree, so a screen reader hears the word, its
 * meaning and the example at once; turning the card over is visual, and its state is `aria-pressed`.
 */
function WordCard({ word }: { word: Word }) {
  const [turned, setTurned] = useState(false);

  return (
    <li className={styles.wordItem}>
      <button
        type="button"
        aria-pressed={turned}
        className={styles.wordCard}
        data-word={word.id}
        onClick={() => setTurned((value) => !value)}
      >
        <span className={styles.wordInner}>
          <span className={styles.wordFront}>
            {word.article ? (
              <span lang="de" className={styles.wordArticle}>
                {word.article}
              </span>
            ) : null}
            <span lang="de" className={styles.wordTerm}>
              {word.word}
            </span>
            <span aria-hidden="true" className={styles.wordHint}>
              {WORDS.hint}
            </span>
          </span>
          <span className={styles.wordBack}>
            <span className={styles.wordMeaning}>{word.meaning}</span>
            <span lang="de" className={styles.wordExample}>
              „{word.example.de}“
            </span>
            <span className={styles.wordExampleEn}>{word.example.en}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

/** A small deck of everyday words, turned over one at a time. */
export default function WordDeck() {
  return (
    <section aria-labelledby="learn-german-words" className={styles.words}>
      <div className={styles.wordsInner}>
        <div className={styles.wordsHead}>
          <p className={styles.kicker}>
            <span lang="de">{WORDS.kicker.de}</span>
            <span className={styles.kickerEn}>{WORDS.kicker.en}</span>
          </p>
          <h2 id="learn-german-words" className={styles.wordsTitle}>
            {WORDS.title}
          </h2>
          <p className={styles.wordsLede}>{WORDS.lede}</p>
        </div>
        <ul className={styles.deck}>
          {WORDS.cards.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </ul>
      </div>
    </section>
  );
}
