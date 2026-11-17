import { Button } from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router';

import { ROUTES } from '@/utils/constants';
import type { Phase } from '@/utils/dmat/session';
import { GERMAN_WORD_CARDS } from '@/utils/germanWords';

import { SECTION_LABELS } from '../data';
import Confirmation from '../Start/Confirmation';
import { BETWEEN_COPY as copy } from './data';
import styles from './styles.module.scss';
import { minutesAndSeconds } from './time';

export interface BetweenProps {
  phase: Extract<Phase, { kind: 'pause' | 'break' }>;
  onStartNext(): void;
  onStopEarly(): void;
}

function BreakWord() {
  const [index, setIndex] = useState(0);
  const [turned, setTurned] = useState(false);
  const word = GERMAN_WORD_CARDS[index];

  return (
    <div className={styles.wordDeck}>
      <p className={styles.wordLabel}>{copy.word}</p>
      <button className={styles.wordCard} type="button" aria-pressed={turned} onClick={() => setTurned(!turned)}>
        <span className={styles.front}>
          <span lang="de" className={styles.word}>{word.article ? `${word.article} ` : ''}{word.word}</span>
          <span aria-hidden="true">{copy.turn}</span>
        </span>
        <span className={styles.back}>
          <strong>{word.meaning}</strong>
          <span lang="de">{word.example.de}</span>
          <span>{word.example.en}</span>
        </span>
      </button>
      <div className={styles.wordLinks}>
        <Button
          type="button" variant="ring" size="md"
          onClick={() => {
            setIndex((current) => (current + 1) % GERMAN_WORD_CARDS.length);
            setTurned(false);
          }}
        >
          {copy.nextWord}
        </Button>
        <Link to={ROUTES.learnGerman} target="_blank" rel="noopener">{copy.learnGerman}</Link>
      </div>
    </div>
  );
}

export default function Between({ phase, onStartNext, onStopEarly }: BetweenProps) {
  const isBreak = phase.kind === 'break';
  const seconds = Math.max(0, Math.ceil(phase.msLeft / 1000));

  return (
    <section className={styles.between} data-break={isBreak || undefined}>
      <div className={styles.card}>
        {isBreak ? (
          <>
            <div className={styles.cup} aria-hidden="true"><span /></div>
            <h1 tabIndex={-1} className={styles.title}>
              <span lang="de">{copy.break.de}</span>{' '}
              <span className={styles.translation}>{copy.break.en}</span>
            </h1>
          </>
        ) : (
          <h1 tabIndex={-1} className={styles.title}>{copy.pauseTitle(SECTION_LABELS[phase.next].name)}</h1>
        )}
        <p className={styles.timer} role="timer">{minutesAndSeconds(seconds)}</p>
        {isBreak ? (
          <>
            <p role="status">{seconds === 0 ? copy.breakOver : copy.breakNext}</p>
            <BreakWord />
          </>
        ) : (
          <>
            <p>{copy.pauseNext}</p>
            <p>{copy.closed}</p>
          </>
        )}
        <div className={styles.actions}>
          <Button type="button" variant="yellow" size="md" onClick={onStartNext}>{isBreak ? copy.academic : copy.start}</Button>
          <Confirmation trigger={copy.leave} copy={copy.confirm} onConfirm={onStopEarly} />
        </div>
      </div>
    </section>
  );
}
