import { Button } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

import CommunityBand from '@/components/CommunityBand';
import Contact from '@/components/Contact';
import MentoringOffer from '@/components/MentoringOffer';
import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { SECTIONS } from '@/utils/constants';
import { markSection } from '@/utils/dmat/marking';
import type { SectionRun } from '@/utils/dmat/session';
import { earnedStamps } from '@/utils/dmat/stamps';
import type { Mode, SectionContent, SectionId, StartChoice } from '@/utils/dmat/types';

import { loadSection } from './bank';
import Between from './Between';
import { PAGE_COPY } from './data';
import Record from './Record';
import Runner from './Runner';
import Start from './Start';
import styles from './styles.module.scss';
import { useSession } from './useSession';

const runKey = (run: SectionRun) => `${run.id}:${run.setId}`;

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
  const api = useSession();
  const { ready, session, phase } = api;
  const { setImmersive } = usePageChromeActions();
  const [preset, setPreset] = useState<{ mode: Mode; choice: StartChoice }>();
  const [loaded, setLoaded] = useState<{ key: string; contents: SectionContent[] } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const main = useRef<HTMLElement>(null);
  const firstScreen = useRef(true);

  const active = ready && session && phase ? { session, phase } : null;
  const screen = !active ? 'start' : active.phase.kind === 'section' ? 'runner' : active.phase.kind === 'finished' ? 'record' : 'between';

  // The site's header, footer and phone action bar step aside while a test, a pause or the break shows.
  const immersive = screen === 'runner' || screen === 'between';
  useEffect(() => {
    setImmersive(immersive);
    return () => setImmersive(false);
  }, [immersive, setImmersive]);

  // The test screen needs the section on screen; the record needs every section of the test.
  const onScreen = active?.phase.kind === 'section' ? active.phase.section : null;
  const wanted = !active ? [] : screen === 'record' ? active.session.sections : active.session.sections.filter((run) => run.id === onScreen);
  const wantedKey = wanted.map(runKey).join('|');
  const attemptKey = `${wantedKey}#${attempt}`;
  useEffect(() => {
    if (!wantedKey) return;
    let current = true;
    const runs = wantedKey.split('|').map((key) => key.split(':') as [SectionId, string]);
    Promise.all(runs.map(([section, setId]) => loadSection(section, setId))).then(
      (contents) => {
        if (current) setLoaded({ key: wantedKey, contents });
      },
      () => {
        if (current) setFailedKey(attemptKey);
      },
    );
    return () => {
      current = false;
    };
  }, [wantedKey, attemptKey]);
  const contents = active && wantedKey && loaded?.key === wantedKey
    ? loaded.contents.map((content) => withTag(content, active.session.practiceTag))
    : null;

  // A new screen starts at its top, with focus on its heading.
  const screenKey = [screen, onScreen, active?.phase.kind, contents !== null].join(':');
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

  const start = (mode: Mode, choice: StartChoice) => {
    setPreset(undefined);
    api.start(mode, choice);
  };

  /** "Practise these" on the record. A passage mixes question types, so an academic type opens the slip instead. */
  const practise = (section: SectionId, tag: string) => {
    if (section === 'academic') {
      setPreset({ mode: 'practice', choice: { section } });
      api.close();
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

  let body = (
    <>
      <div id={SECTIONS.top}>
        <Start
          waiting={api.waiting}
          storageFailed={api.storageFailed}
          preset={preset}
          onStart={start}
          onResume={api.resume}
          onDiscard={api.discard}
        />
      </div>
      <CommunityBand />
      <MentoringOffer />
      <Contact />
    </>
  );

  if (active && active.phase.kind === 'section') {
    body = (
      <div id={SECTIONS.top}>
        {contents ? (
          <Runner
            session={active.session}
            phase={active.phase}
            content={contents[0]}
            onAnswer={api.answer}
            onCheck={api.check}
            onMark={api.mark}
            onGoTo={api.goTo}
            onTextSize={api.setTextSize}
            onEndSection={api.endSection}
            onStopEarly={api.stopEarly}
          />
        ) : pending}
      </div>
    );
  } else if (active && (active.phase.kind === 'pause' || active.phase.kind === 'break')) {
    body = (
      <div id={SECTIONS.top}>
        <Between phase={active.phase} onStartNext={api.startNext} onStopEarly={api.stopEarly} />
      </div>
    );
  } else if (active) {
    body = (
      <>
        <div id={SECTIONS.top}>
          {contents ? (
            <Record
              session={active.session}
              contents={contents}
              results={contents.map((content, index) => markSection(active.session.sections[index], content, active.session.answers))}
              stamps={earnedStamps(active.session)}
              onPractise={practise}
              onStartAnother={api.discard}
            />
          ) : pending}
        </div>
        <Contact />
      </>
    );
  }

  return (
    <main ref={main} id="main-content" tabIndex={-1} className={styles.page}>
      {body}
    </main>
  );
}
