import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import CommunityBand from '@/components/CommunityBand';
import MentoringOffer from '@/components/MentoringOffer';
import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { loadSection } from '@/pages/DmatPractice/bank';
import Between from '@/pages/DmatPractice/Between';
import Record from '@/pages/DmatPractice/Record';
import Runner from '@/pages/DmatPractice/Runner';
import Start from '@/pages/DmatPractice/Start';
import { DMAT_FORMAT } from '@/utils/applicationFacts';
import { markSection } from '@/utils/dmat/marking';
import type { Phase, SectionRun, Session } from '@/utils/dmat/session';
import type { StampId } from '@/utils/dmat/stamps';
import { SECTION_IDS, type Answer, type CoreTask, type Mode, type PassageQuestion, type SectionContent, type SectionId } from '@/utils/dmat/types';

/**
 * Dev only (`/_dmat`, registered beside `/_theme`): every screen of the dMAT practice page from fixed
 * sample state, so a screen can be looked at before the logic that leads to it exists. No storage and no
 * clock; the callbacks update this page's own state, so answering, marking and moving work.
 */

export const meta = () => [{ name: 'robots', content: 'noindex' }];

const SCREENS = [
  'start', 'start-banner',
  'figures', 'equations', 'latin', 'academic',
  'practice-figures', 'practice-academic',
  'pause', 'break', 'record', 'blocks',
] as const;
type Screen = (typeof SCREENS)[number];
const isScreen = (value: string | null): value is Screen => (SCREENS as readonly string[]).includes(value ?? '');

const MINUTE = 60_000;
/** A fixed morning, so nothing here depends on the clock. */
const BEGAN = Date.UTC(2026, 10, 17, 4, 0, 0);
const STAMPS: StampId[] = ['geschafft', 'durchgehalten', 'puenktlich'];

const PRACTICE: Partial<Record<Screen, { section: SectionId; setId: string }>> = {
  'practice-figures': { section: 'figures', setId: 'practice' },
  'practice-academic': { section: 'academic', setId: 'p10' },
};
const sectionOf = (screen: Screen): SectionId | null =>
  PRACTICE[screen]?.section ?? ((SECTION_IDS as readonly string[]).includes(screen) ? (screen as SectionId) : null);
const limitOf = (section: SectionId) => (section === 'academic' ? DMAT_FORMAT.academicMinutes : DMAT_FORMAT.subtestMinutes) * MINUTE;

const itemsOf = (content: SectionContent): (CoreTask | PassageQuestion)[] =>
  content.section === 'academic' ? content.passages.flatMap((passage) => passage.questions) : content.tasks;
const screenIdsOf = (content: SectionContent) =>
  content.section === 'academic' ? content.passages.map((passage) => passage.id) : content.tasks.map((task) => task.id);

const HOW = ['right', 'wrong', 'partial', 'none'] as const;
function sampleAnswer(item: CoreTask | PassageQuestion, how: (typeof HOW)[number]): Answer | undefined {
  if (how === 'none') return undefined;
  if (!('kind' in item)) {
    const correct = item.options.findIndex((option) => option.correct);
    return { kind: 'question', option: how === 'right' ? correct : (correct + 1) % item.options.length };
  }
  switch (item.kind) {
    case 'figures': {
      const [fifth, sixth] = item.answer;
      if (how === 'right') return { kind: 'figures', picks: [fifth, sixth] };
      return { kind: 'figures', picks: how === 'partial' ? [fifth, (sixth + 1) % 3] : [(fifth + 1) % 3, (sixth + 2) % 3] };
    }
    case 'equations': {
      const letters = Object.keys(item.solution);
      const values = Object.fromEntries(letters.map((letter, index) => {
        if (how === 'right') return [letter, item.solution[letter]];
        if (how === 'partial') return [letter, index === 0 ? item.solution[letter] : null];
        return [letter, item.solution[letter] + 1];
      }));
      return { kind: 'equations', values };
    }
    case 'latin':
      return { kind: 'latin', letter: how === 'right' ? item.answer : item.answer === 'A' ? 'B' : 'A' };
  }
}

const run = (id: SectionId, setId: string, startedAt: number | null, endedAt: number | null, endedBy: SectionRun['endedBy']): SectionRun =>
  ({ id, setId, startedAt, endedAt, endedBy });

const blank = (mode: Mode, sections: SectionRun[]): Session => ({
  version: 1, mode, sections, breakStartedAt: null, practiceTag: null,
  answers: {}, marked: [], checked: [], position: {}, timeOn: {}, shownAt: BEGAN,
  textSize: 0, createdAt: BEGAN, finishedAt: null, returning: false,
});

/** A full mock stopped in `section`: the sections before it are over, a few tasks are answered and one is marked. */
function running(section: SectionId, content: SectionContent, msLeft: number, at: number): Session {
  const index = SECTION_IDS.indexOf(section);
  const session = blank('full', SECTION_IDS.map((id, place) => {
    const began = BEGAN + place * 27 * MINUTE;
    if (place < index) return run(id, 'mock', began, began + limitOf(id), 'time');
    return place === index ? run(id, 'mock', began, null, null) : run(id, 'mock', null, null, null);
  }));
  const items = itemsOf(content);
  const answers: Record<string, Answer> = {};
  (['right', 'wrong', 'partial'] as const).forEach((how, place) => {
    const answer = items[place] && sampleAnswer(items[place], how);
    if (answer) answers[items[place].id] = answer;
  });
  const screens = screenIdsOf(content);
  return {
    ...session,
    answers,
    marked: [screens[Math.min(1, screens.length - 1)]],
    position: { [section]: Math.min(at, screens.length - 1) },
    shownAt: BEGAN + index * 27 * MINUTE + (limitOf(section) - msLeft),
  };
}

/** Practice on one section, the first task already checked (and answered wrongly, so the mistake shows). */
function practising(section: SectionId, setId: string, content: SectionContent, at: number): Session {
  const first = itemsOf(content)[0];
  const answer = sampleAnswer(first, 'wrong');
  return {
    ...blank('practice', [run(section, setId, BEGAN, null, null)]),
    answers: answer ? { [first.id]: answer } : {},
    checked: [first.id],
    position: { [section]: Math.min(at, screenIdsOf(content).length - 1) },
  };
}

/** A finished full mock: right, wrong, half-right and unanswered tasks in turn, and time on every screen. */
function finished(contents: SectionContent[]): Session {
  const answers: Record<string, Answer> = {};
  const timeOn: Record<string, number> = {};
  for (const content of contents) {
    itemsOf(content).forEach((item, place) => {
      const answer = sampleAnswer(item, HOW[place % HOW.length]);
      if (answer) answers[item.id] = answer;
    });
    screenIdsOf(content).forEach((id, place) => {
      timeOn[id] = (place % 5 === 3 ? 190 : 40 + place * 6) * 1000;
    });
  }
  const sections = SECTION_IDS.map((id, place) => {
    const began = BEGAN + place * 27 * MINUTE + (id === 'academic' ? 30 * MINUTE : 0);
    // The first subtest was ended early by the visitor; the rest ran out of time.
    return place === 0 ? run(id, 'mock', began, began + 21 * MINUTE, 'visitor') : run(id, 'mock', began, began + limitOf(id), 'time');
  });
  return {
    ...blank('full', sections),
    breakStartedAt: BEGAN + 81 * MINUTE,
    answers,
    timeOn,
    marked: contents.map((content) => screenIdsOf(content)[0]),
    shownAt: null,
    finishedAt: sections[3].endedAt,
  };
}

function Preview({ screen, seconds, task }: { screen: Screen; seconds: number; task: number }) {
  const { setImmersive } = usePageChromeActions();
  const [session, setSession] = useState<Session | null>(null);
  const [contents, setContents] = useState<SectionContent[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [last, setLast] = useState('none yet');
  const section = sectionOf(screen);
  const practice = PRACTICE[screen];
  const bare = section !== null || screen === 'pause' || screen === 'break';

  useEffect(() => {
    setImmersive(bare);
    return () => setImmersive(false);
  }, [bare, setImmersive]);

  useEffect(() => {
    let current = true;
    const wanted: [SectionId, string][] = screen === 'record'
      ? SECTION_IDS.map((id) => [id, 'mock'])
      : section ? [[section, practice?.setId ?? 'mock']] : [];
    if (wanted.length === 0) return;
    Promise.all(wanted.map(([id, setId]) => loadSection(id, setId))).then(
      (loaded) => {
        if (!current) return;
        setContents(loaded);
        if (screen === 'record') setSession(finished(loaded));
        else if (section && practice) setSession(practising(section, practice.setId, loaded[0], task));
        else if (section) setSession(running(section, loaded[0], seconds * 1000, task));
      },
      () => {
        if (current) setFailed(true);
      },
    );
    return () => {
      current = false;
    };
  }, [screen, section, practice, seconds, task]);

  const change = (name: string, next: (session: Session) => Session) => {
    setLast(name);
    setSession((held) => (held ? next(held) : held));
  };
  const called = (name: string) => () => setLast(name);

  let body = <p>{failed ? 'The sample bank did not load.' : 'Loading the sample bank.'}</p>;
  if (screen === 'start' || screen === 'start-banner') {
    const waiting = screen === 'start-banner'
      ? { ...blank('full', SECTION_IDS.map((id, place) => run(id, 'mock', BEGAN + place * 27 * MINUTE, BEGAN + place * 27 * MINUTE + limitOf(id), 'time'))), finishedAt: BEGAN + 200 * MINUTE }
      : null;
    body = (
      <Start
        waiting={waiting}
        storageFailed={false}
        onStart={(mode, choice) => setLast(`onStart(${mode}, ${JSON.stringify(choice)})`)}
        onResume={called('onResume')}
        onDiscard={called('onDiscard')}
      />
    );
  } else if (screen === 'pause' || screen === 'break') {
    const phase: Extract<Phase, { kind: 'pause' | 'break' }> = screen === 'pause'
      ? { kind: 'pause', next: 'equations', msLeft: 95_000 }
      : { kind: 'break', msLeft: seconds * 1000 };
    body = <Between phase={phase} onStartNext={called('onStartNext')} onStopEarly={called('onStopEarly')} />;
  } else if (screen === 'blocks') {
    body = (
      <>
        <CommunityBand />
        <MentoringOffer />
      </>
    );
  } else if (screen === 'record' && session && contents) {
    body = (
      <Record
        session={session}
        contents={contents}
        results={contents.map((content, index) => markSection(session.sections[index], content, session.answers))}
        stamps={STAMPS}
        onPractise={(id, tag) => setLast(`onPractise(${id}, ${tag})`)}
        onStartAnother={called('onStartAnother')}
      />
    );
  } else if (section && session && contents) {
    body = (
      <Runner
        session={session}
        phase={{ kind: 'section', section, msLeft: practice ? null : seconds * 1000 }}
        content={contents[0]}
        onAnswer={(id, answer) => change(`onAnswer(${id})`, (held) => (held.checked.includes(id) ? held : { ...held, answers: { ...held.answers, [id]: answer } }))}
        onCheck={(id) => change(`onCheck(${id})`, (held) => (held.checked.includes(id) ? held : { ...held, checked: [...held.checked, id] }))}
        onMark={(id) => change(`onMark(${id})`, (held) => ({ ...held, marked: held.marked.includes(id) ? held.marked.filter((marked) => marked !== id) : [...held.marked, id] }))}
        onGoTo={(index) => change(`onGoTo(${index})`, (held) => ({ ...held, position: { ...held.position, [section]: index } }))}
        onTextSize={(size) => change(`onTextSize(${size})`, (held) => ({ ...held, textSize: size }))}
        onEndSection={called('onEndSection')}
        onStopEarly={called('onStopEarly')}
      />
    );
  }

  return (
    <>
      {body}
      <p data-testid="preview-last" style={{ margin: 0, padding: '8px 24px', font: '14px monospace', background: '#eee' }}>
        Preview of “{screen}”. Last callback: {last}
      </p>
    </>
  );
}

export default function DmatPreview() {
  const [params] = useSearchParams();
  const value = params.get('screen');
  const screen = isScreen(value) ? value : null;
  // `left` is seconds on the clock (18:40 unless given; the break defaults to the same); `task` is the screen to open on.
  const seconds = Number(params.get('left') ?? 1120) || 0;
  const task = Number(params.get('task') ?? 0) || 0;

  return (
    <main id="main-content" tabIndex={-1}>
      {screen ? <Preview key={`${screen}:${seconds}:${task}`} screen={screen} seconds={seconds} task={task} /> : <h1 style={{ padding: 24 }}>dMAT practice preview</h1>}
      <nav aria-label="Preview screens" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '12px 24px', font: '14px monospace' }}>
        {SCREENS.map((name) => (
          <Link key={name} to={`?screen=${name}`}>{name}</Link>
        ))}
      </nav>
    </main>
  );
}
