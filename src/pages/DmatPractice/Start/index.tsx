import { Button } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { SOURCES } from '@/utils/applicationFacts';
import { ROUTES } from '@/utils/constants';
import type { Session } from '@/utils/dmat/session';
import { MODES, SECTION_IDS, type Mode, type SectionId, type StartChoice } from '@/utils/dmat/types';

import { PRACTICE_PASSAGES } from '../bank';
import { MODE_LABELS, PAGE_COPY, SECTION_LABELS } from '../data';
import Confirmation from './Confirmation';
import { FORMAT_ROWS, FORMAT_SOURCES, MODE_DESCRIPTIONS, START_COPY, TIMED_MINUTES } from './data';
import styles from './styles.module.scss';

export interface StartProps {
  waiting: Session | null;
  storageFailed: boolean;
  /** The slip opens with this chosen (from a "Practise these" link). */
  preset?: { mode: Mode; choice: StartChoice };
  onPrepare?(mode: Mode, choice: StartChoice): void;
  onStart(mode: Mode, choice: StartChoice): void;
  onResume(): void;
  onDiscard(): void;
}

function ResumeBanner({ session, onResume, onDiscard }: { session: Session; onResume(): void; onDiscard(): void }) {
  const title = useId();
  const copy = START_COPY.backup;
  let message: string = copy[session.mode];
  if (session.finishedAt !== null) message = copy.record;
  else if (session.mode === 'full' && session.breakStartedAt !== null) message = copy.break;

  return (
    <section className={styles.banner} aria-labelledby={title}>
      <div>
        <h2 id={title}>{copy.title}</h2>
        <p>{message}</p>
      </div>
      <div className={styles.actions}>
        <Button variant="navy" size="md" onClick={onResume}>{copy.resume}</Button>
        <Confirmation trigger={copy.discard} copy={copy.confirm} onConfirm={onDiscard} />
      </div>
    </section>
  );
}

function Slip({ preset, storageFailed, onPrepare, onStart }: Pick<StartProps, 'preset' | 'storageFailed' | 'onPrepare' | 'onStart'>) {
  const [mode, setMode] = useState<Mode>(preset?.mode ?? 'full');
  const [section, setSection] = useState<SectionId>(preset?.choice.section ?? SECTION_IDS[0]);
  const [passage, setPassage] = useState(preset?.choice.passage ?? PRACTICE_PASSAGES[0]?.id);
  const [stamped, setStamped] = useState(false);
  const timer = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const { heroCtaRef } = usePageChromeActions();
  const prefix = useId();
  const choosePassage = mode === 'practice' && section === 'academic';

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const start = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stamped || (choosePassage && !passage)) return;
    const choice: StartChoice = mode === 'full' ? {} : { section };
    if (choosePassage) choice.passage = passage;
    if (mode === 'practice' && section === preset?.choice.section && preset.choice.tag) {
      choice.tag = preset.choice.tag;
    }
    onPrepare?.(mode, choice);

    if (reducedMotion) {
      onStart(mode, choice);
      return;
    }
    setStamped(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setStamped(false);
      onStart(mode, choice);
    }, 450);
  };

  return (
    <div className={styles.paperWrap}>
      <form className={styles.slip} onSubmit={start}>
        <header className={styles.paperHeader}>
          <h2 lang="de">{START_COPY.paper.de}</h2>
          <p>{START_COPY.paper.en}</p>
        </header>
        <fieldset disabled={stamped}>
          <legend>{START_COPY.mode}</legend>
          {MODES.map((value) => (
            <label key={value} className={styles.choice} data-selected={mode === value}>
              <input
                type="radio" name={`${prefix}-mode`} value={value} checked={mode === value}
                onChange={() => setMode(value)}
                aria-label={MODE_LABELS[value].name} aria-describedby={`${prefix}-${value}`}
              />
              <span>
                <strong>{MODE_LABELS[value].name}</strong>
                <span id={`${prefix}-${value}`} className={styles.description}>{MODE_DESCRIPTIONS[value]}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {mode !== 'full' && (
          <fieldset disabled={stamped}>
            <legend>{START_COPY.sections}</legend>
            <div className={styles.options}>
              {SECTION_IDS.map((id) => (
                <label key={id} className={styles.option} data-selected={section === id}>
                  <input type="radio" name={`${prefix}-section`} value={id} checked={section === id} onChange={() => setSection(id)} />
                  {SECTION_LABELS[id].name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {choosePassage && (
          <fieldset disabled={stamped}>
            <legend>{START_COPY.subjects}</legend>
            <div className={styles.options}>
              {PRACTICE_PASSAGES.map(({ id, area }) => (
                <label key={id} className={styles.option} data-selected={passage === id}>
                  <input type="radio" name={`${prefix}-passage`} value={id} checked={passage === id} onChange={() => setPassage(id)} />
                  {area}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {mode !== 'practice' && (
          <fieldset disabled={stamped}>
            <legend>{START_COPY.reminders}</legend>
            {[
              ...START_COPY.checklist,
              START_COPY.setAside(TIMED_MINUTES[mode === 'full' ? 'full' : section === 'academic' ? 'academic' : 'core']),
            ].map((item) => (
              <label key={item} className={styles.reminder}>
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </fieldset>
        )}
        <div className={styles.slipFooter}>
          <Button ref={heroCtaRef} type="submit" variant="yellow" size="lg" disabled={stamped || (choosePassage && !passage)}>
            {MODE_LABELS[mode].start}
          </Button>
          {stamped && (
            <span className={styles.stamp}>
              <strong lang="de">{START_COPY.stamp.de}</strong>
              <span>{START_COPY.stamp.en}</span>
            </span>
          )}
        </div>
        {storageFailed && <p role="status">{START_COPY.storageFailed}</p>}
        <noscript><p>{START_COPY.javascript}</p></noscript>
      </form>
    </div>
  );
}

function TestNotes() {
  return (
    <div className={styles.notes}>
      <section>
        <h2>{START_COPY.format}</h2>
        <dl className={styles.facts}>
          {FORMAT_ROWS.map(({ time, description }) => (
            <div key={time}><dt>{time}</dt><dd>{description}</dd></div>
          ))}
        </dl>
        <ul className={styles.sources}>
          {FORMAT_SOURCES.map((source) => <li key={source.label}><SourceNote source={source} /></li>)}
        </ul>
        <ul className={styles.links}>
          <li><Link to={ROUTES.dmat}>{START_COPY.guide}</Link></li>
          <li><a href={SOURCES.dmatPreparation.url} target="_blank" rel="noopener">{START_COPY.preparation}</a></li>
        </ul>
      </section>
      <section>
        <h2>{START_COPY.about}</h2>
        <p>{START_COPY.independence}</p>
        <p>{START_COPY.questions}</p>
        <p>{START_COPY.difficulty}</p>
        <p>{START_COPY.academicSet}</p>
        <p>{START_COPY.figures}</p>
      </section>
    </div>
  );
}

export default function Start({ waiting, storageFailed, preset, onPrepare, onStart, onResume, onDiscard }: StartProps) {
  const presetKey = [preset?.mode, preset?.choice.section, preset?.choice.passage, preset?.choice.tag].join(':');

  return (
    <section className={styles.start}>
      <ContentContainer width="wide">
        <PageHeader variant="regular" title={PAGE_COPY.title} introduction={PAGE_COPY.introduction} />
        {waiting && <ResumeBanner session={waiting} onResume={onResume} onDiscard={onDiscard} />}
        <div className={styles.grid}>
          <Slip key={presetKey} preset={preset} storageFailed={storageFailed} onPrepare={onPrepare} onStart={onStart} />
          <TestNotes />
        </div>
        <p className={styles.privacy}>{START_COPY.privacy}{' '}<Link to={ROUTES.privacy}>{START_COPY.privacyLink}</Link></p>
      </ContentContainer>
    </section>
  );
}
