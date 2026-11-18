import { Button } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

import CommunityBand from '@/components/CommunityBand';
import Contact from '@/components/Contact';
import MentoringOffer from '@/components/MentoringOffer';
import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { SECTIONS } from '@/utils/constants';
import { markSection } from '@/utils/dmat/marking';
import { sectionIdsFor, setIdFor, type SectionRun } from '@/utils/dmat/session';
import { earnedStamps } from '@/utils/dmat/stamps';
import type { Mode, SectionContent, SectionId, StartChoice } from '@/utils/dmat/types';

import Between from './Between';
import { PAGE_COPY } from './data';
import { fetchRun, fetchScreen, NOTHING_LOADED, quietly, runKey, type LazyScreen } from './screens';
import Start from './Start';
import styles from './styles.module.scss';
import { useSession } from './useSession';

/** Practising one kind of Core task shows only the tasks that carry its tag. */
const withTag = (content: SectionContent, tag: string | null): SectionContent =>
  tag && content.section !== 'academic'
    ? { section: content.section, tasks: content.tasks.filter((task) => task.tags.includes(tag)) }
    : content;

/**
 * /dmat/practice: composition only. The session hook holds the test and its clock; this file picks the
 * screen, loads the tasks that screen needs and hands them down. The start page is what is prerendered:
 * nothing here reads storage, the clock or the bank before mount.
 */
export default function DmatPractice() {
  const {
    ready,
    session,
    phase,
    waiting,
    storageFailed,
    start: startSession,
    resume,
    discard,
    close,
    answer,
    check,
    mark,
    goTo,
    setTextSize,
    endSection,
    startNext,
    stopEarly,
  } = useSession();
  const { setImmersive } = usePageChromeActions();
  const [preset, setPreset] = useState<{ mode: Mode; choice: StartChoice }>();
  const [loaded, setLoaded] = useState(NOTHING_LOADED);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const main = useRef<HTMLElement>(null);
  const firstScreen = useRef(true);

  const phaseKind = ready && session && phase ? phase.kind : null;
  const screen = !phaseKind
    ? 'start'
    : phaseKind === 'section'
      ? 'runner'
      : phaseKind === 'finished'
        ? 'record'
        : 'between';
  const lazyScreen: LazyScreen | null = screen === 'runner' || screen === 'record' ? screen : null;

  // The site's header, footer and phone action bar step aside while a test, a pause or the break shows.
  const immersive = screen === 'runner' || screen === 'between';
  useEffect(() => {
    setImmersive(immersive);
    return () => setImmersive(false);
  }, [immersive, setImmersive]);

  // The test screen needs the section on screen; the record needs every section of the test.
  const onScreen = ready && session && phase?.kind === 'section' ? phase.section : null;
  const wanted: SectionRun[] = !ready || !session || !phaseKind
    ? []
    : screen === 'record'
      ? session.sections
      : session.sections.filter((run) => run.id === onScreen);
  const wantedKey = wanted.map(runKey).join('|');
  const attemptKey = `${lazyScreen}:${wantedKey}#${attempt}`;
  const practiceTag = session?.practiceTag ?? null;
  const contents = wanted.every((run) => loaded.sections[runKey(run)])
    ? wanted.map((run) => withTag(loaded.sections[runKey(run)], practiceTag))
    : null;
  const needsLoad = lazyScreen !== null && (!loaded.screens[lazyScreen] || contents === null);

  useEffect(() => {
    if (!needsLoad || !lazyScreen) return;
    let current = true;
    const runs = wantedKey ? wantedKey.split('|') : [];
    Promise.all([fetchScreen(setLoaded, lazyScreen), ...runs.map((key) => fetchRun(setLoaded, key))]).catch(() => {
      if (current) setFailedKey(attemptKey);
    });
    return () => {
      current = false;
    };
  }, [needsLoad, lazyScreen, wantedKey, attemptKey]);

  // Fetched ahead so the next screen shows at once: what a stored test resumes on, the record while a test
  // runs, and the section after a pause or the break.
  const resumable = ready && screen === 'start' ? waiting : null;
  const upcoming: SectionId | null = phase?.kind === 'pause' ? phase.next : phase?.kind === 'break' ? 'academic' : null;
  const aheadRuns: SectionRun[] = resumable
    ? resumable.finishedAt !== null
      ? resumable.sections
      : resumable.sections.filter((run) => run.startedAt !== null && run.endedAt === null)
    : session?.sections.filter((run) => run.id === upcoming) ?? [];
  const aheadScreen: LazyScreen | null = resumable
    ? resumable.finishedAt !== null ? 'record' : aheadRuns.length > 0 ? 'runner' : null
    : screen === 'runner' ? 'record' : upcoming ? 'runner' : null;
  const aheadKey = [aheadScreen ?? '', ...aheadRuns.map(runKey)].join('|');
  useEffect(() => {
    const [name, ...runs] = aheadKey.split('|');
    if (name) quietly(fetchScreen(setLoaded, name as LazyScreen));
    for (const key of runs) quietly(fetchRun(setLoaded, key));
  }, [aheadKey]);

  // A new screen starts at its top, with focus on its heading.
  const screenKey = [screen, onScreen, phaseKind, !needsLoad].join(':');
  useEffect(() => {
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heading = main.current?.querySelector('h1');
    if (!heading) return;
    // The shared page header's title carries no tabindex of its own.
    if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }, [screenKey]);

  /** The slip's stamp gives the first section a head start. */
  const prepare = (mode: Mode, choice: StartChoice) => {
    const [section] = sectionIdsFor(mode, choice);
    quietly(fetchScreen(setLoaded, 'runner'));
    quietly(fetchRun(setLoaded, runKey({ id: section, setId: setIdFor(mode, section, choice) })));
  };

  const start = (mode: Mode, choice: StartChoice) => {
    setPreset(undefined);
    startSession(mode, choice);
  };

  /** "Practise these" on the record. A passage mixes question types, so an academic type opens the slip instead. */
  const practise = (section: SectionId, tag: string) => {
    if (section === 'academic') {
      setPreset({ mode: 'practice', choice: { section } });
      close();
      return;
    }
    start('practice', { section, tag });
  };

  const pending = failedKey === attemptKey ? (
    <div className={styles.pending}>
      <p role="alert">{PAGE_COPY.loadFailed}</p>
      <Button variant="navy" size="md" onClick={() => setAttempt((count) => count + 1)}>
        {PAGE_COPY.retry}
      </Button>
    </div>
  ) : (
    <div className={styles.pending}>
      <p role="status">{PAGE_COPY.loading}</p>
    </div>
  );

  const RunnerView = loaded.screens.runner;
  const RecordView = loaded.screens.record;

  let body = (
    <>
      <div id={SECTIONS.top}>
        <Start
          waiting={waiting}
          storageFailed={storageFailed}
          preset={preset}
          onPrepare={prepare}
          onStart={start}
          onResume={resume}
          onDiscard={discard}
        />
      </div>
      <CommunityBand />
      <MentoringOffer />
      <Contact />
    </>
  );

  if (ready && session && phase) {
    if (phase.kind === 'section') {
      body = (
        <div id={SECTIONS.top}>
          {RunnerView && contents ? (
            <RunnerView
              session={session}
              phase={phase}
              content={contents[0]}
              onAnswer={answer}
              onCheck={check}
              onMark={mark}
              onGoTo={goTo}
              onTextSize={setTextSize}
              onEndSection={endSection}
              onStopEarly={stopEarly}
            />
          ) : pending}
        </div>
      );
    } else if (phase.kind === 'pause' || phase.kind === 'break') {
      body = (
        <div id={SECTIONS.top}>
          <Between phase={phase} onStartNext={startNext} onStopEarly={stopEarly} />
        </div>
      );
    } else {
      body = (
        <>
          <div id={SECTIONS.top}>
            {RecordView && contents ? (
              <RecordView
                session={session}
                contents={contents}
                results={contents.map((content, index) => markSection(session.sections[index], content, session.answers))}
                stamps={earnedStamps(session)}
                onPractise={practise}
                onStartAnother={discard}
              />
            ) : pending}
          </div>
          <Contact />
        </>
      );
    }
  }

  return (
    <main ref={main} id="main-content" tabIndex={-1} className={styles.page}>
      {body}
    </main>
  );
}
