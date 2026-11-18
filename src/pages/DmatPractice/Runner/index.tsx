import { Button } from '@mantine/core';
import { useEffect, useRef, type RefObject } from 'react';

import { markTask } from '@/utils/dmat/marking';
import type { Phase, SectionRun, Session } from '@/utils/dmat/session';
import { TEXT_SIZES, type Answer, type CoreTask, type Passage, type SectionContent, type SectionId, type TextSize } from '@/utils/dmat/types';

import { SECTION_LABELS } from '../data';
import { INSTRUCTIONS, RUNNER_COPY } from './data';
import styles from './styles.module.scss';
import { Explanation, TaskView } from './tasks';
import PassageTask from './tasks/PassageTask';

export interface RunnerProps {
  session: Session;
  phase: Extract<Phase, { kind: 'section' }>;
  content: SectionContent;
  onAnswer(id: string, answer: Answer): void;
  /** Practice: lock the answer and show the explanation. */
  onCheck(id: string): void;
  onMark(id: string): void;
  onGoTo(index: number): void;
  onTextSize(size: TextSize): void;
  /** After the Runner's own confirmation. */
  onEndSection(): void;
  /** "Leave test", after the Runner's own confirmation. */
  onStopEarly(): void;
}

function Timer({ msLeft }: { msLeft: number }) {
  const live = useRef<HTMLSpanElement>(null);
  const announced = useRef(new Set<string>());
  useEffect(() => {
    const warnings = [
      { limit: 5 * 60_000, message: RUNNER_COPY.fiveMinutes },
      { limit: 60_000, message: RUNNER_COPY.oneMinute },
    ].filter(({ limit, message }) => msLeft < limit && !announced.current.has(message));
    if (warnings.length && live.current) {
      live.current.textContent = warnings.map(({ message }) => message).join('. ');
      warnings.forEach(({ message }) => announced.current.add(message));
    }
  }, [msLeft]);
  const seconds = Math.max(0, Math.ceil(msLeft / 1000));
  return <div className={styles.time} data-warning={msLeft < 5 * 60_000}>
    <span role="timer" aria-live="off">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span>
    {msLeft < 5 * 60_000 && <span className={styles.timeWarning}>{msLeft < 60_000 ? RUNNER_COPY.oneMinute : RUNNER_COPY.fiveMinutes}</span>}
    <span ref={live} className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true" />
  </div>;
}

function isAnswered(item: CoreTask | Passage, answers: Record<string, Answer>): boolean {
  if ('questions' in item) return item.questions.every((question) => answers[question.id]?.kind === 'question');
  const answer = answers[item.id];
  if (item.kind === 'figures') return answer?.kind === 'figures' && answer.picks.every((pick) => pick !== null);
  if (item.kind === 'equations') return answer?.kind === 'equations' && Object.keys(item.solution).every((letter) => answer.values[letter] != null);
  return answer?.kind === 'latin';
}

interface TopBarContentProps {
  sections: SectionRun[];
  section: SectionId;
  mock?: number;
  practice: boolean;
  hasNextPracticeSection: boolean;
  academic: boolean;
  onOpenEnd(): void;
  onOpenLeave(): void;
  onEndSection(): void;
  onStopEarly(): void;
}

function TopBarContent({
  sections,
  section,
  mock,
  practice,
  hasNextPracticeSection,
  academic,
  onOpenEnd,
  onOpenLeave,
  onEndSection,
  onStopEarly,
}: TopBarContentProps) {
  const labels = SECTION_LABELS[section];
  const moduleSections = sections.filter((entry) => SECTION_LABELS[entry.id].module === labels.module);
  const part = moduleSections.findIndex((entry) => entry.id === section) + 1;
  const endLabel = academic ? RUNNER_COPY.endModule : RUNNER_COPY.endSection;

  return (
    <>
      <div className={styles.heading}><h1 tabIndex={-1}>{labels.name}</h1><p>{RUNNER_COPY.part(labels.module, part, moduleSections.length, practice ? undefined : mock)}</p></div>
      <div className={styles.topActions}>
        {!practice && <Button variant="ring-dark" size="nav" onClick={onOpenEnd}>{endLabel}</Button>}
        {hasNextPracticeSection && <Button variant="ring-dark" size="nav" onClick={onEndSection}>{RUNNER_COPY.nextSection}</Button>}
        <Button variant="ring-dark" size="nav" onClick={() => practice ? onStopEarly() : onOpenLeave()}>{practice ? RUNNER_COPY.finish : RUNNER_COPY.leave}</Button>
      </div>
    </>
  );
}

interface RunnerBodyProps {
  session: Session;
  section: SectionId;
  practice: boolean;
  hasNextPracticeSection: boolean;
  content: SectionContent;
  onAnswer(id: string, answer: Answer): void;
  onCheck(id: string): void;
  onMark(id: string): void;
  onGoTo(index: number): void;
  onTextSize(size: TextSize): void;
  onEndSection(): void;
}

function RunnerBody({
  session,
  section,
  practice,
  hasNextPracticeSection,
  content,
  onAnswer,
  onCheck,
  onMark,
  onGoTo,
  onTextSize,
  onEndSection,
}: RunnerBodyProps) {
  const taskArea = useRef<HTMLDivElement>(null);
  const numbers = useRef<HTMLDivElement>(null);
  const academic = content.section === 'academic';
  const items = academic ? content.passages : content.tasks;
  const position = Math.max(0, Math.min(session.position[section] ?? 0, items.length - 1));
  const item = items[position];
  const checkedSet = new Set(session.checked);
  const markedSet = new Set(session.marked);
  const checked = item ? checkedSet.has(item.id) : false;
  const marked = item ? markedSet.has(item.id) : false;

  let right = 0;
  if (practice && checkedSet.size > 0) {
    const allTasks = content.section === 'academic'
      ? content.passages.flatMap((passage) => passage.questions)
      : content.tasks;
    for (const task of allTasks) {
      if (checkedSet.has(task.id) && markTask(task, session.answers[task.id]).verdict === 'right') {
        right += 1;
      }
    }
  }

  useEffect(() => {
    taskArea.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [item?.id]);

  // Keeps the current number in view in the scrolling strip, with half a number of its neighbours showing.
  useEffect(() => {
    const bar = numbers.current;
    const active = bar?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!bar || !active) return;
    const view = bar.getBoundingClientRect();
    const box = active.getBoundingClientRect();
    const margin = box.width / 2;
    if (box.left < view.left) bar.scrollLeft -= view.left - box.left + margin;
    else if (box.right > view.right) bar.scrollLeft += box.right - view.right + margin;
  }, [position]);

  return (
    <>
      <div className={styles.instructions}>
        <p>{INSTRUCTIONS[section]}</p>
        <div className={styles.textSizes} role="group" aria-label={RUNNER_COPY.textSize}>
          {TEXT_SIZES.map((size) => <Button key={size} variant={session.textSize === size ? 'navy' : 'ring'} size="nav" aria-label={RUNNER_COPY.textSizes[size]} aria-pressed={session.textSize === size} onClick={() => onTextSize(size)}>A{size > 0 ? '+'.repeat(size) : ''}</Button>)}
        </div>
      </div>
      <div ref={taskArea} className={styles.taskArea} data-academic={academic}>
        {item && ('questions' in item ? (
          <PassageTask key={item.id} passage={item} answers={session.answers} mode="answer" onAnswer={onAnswer} checked={practice ? session.checked : undefined} onCheck={practice ? onCheck : undefined} immersive />
        ) : (
          <div className={styles.coreTask}>
            <h2 className={practice ? styles.srOnly : styles.taskTitle}>{RUNNER_COPY.position(false, position + 1, items.length)}</h2>
            <TaskView key={item.id} task={item} answer={session.answers[item.id]} mode={practice && checked ? 'review' : 'answer'} onAnswer={(answer) => onAnswer(item.id, answer)} />
            {section === 'figures' && <p className={styles.accessNote}>{RUNNER_COPY.figuresAccess}</p>}
            {practice && <div className={styles.practiceActions}>
              {checked && <Explanation task={item} answer={session.answers[item.id]} />}
              <Button
                variant="navy"
                size="md"
                disabled={checked && position === items.length - 1 && !hasNextPracticeSection}
                onClick={() => {
                  if (!checked) onCheck(item.id);
                  else if (position < items.length - 1) onGoTo(position + 1);
                  else onEndSection();
                }}
              >
                {!checked ? RUNNER_COPY.check : position < items.length - 1 ? RUNNER_COPY.nextTask : hasNextPracticeSection ? RUNNER_COPY.nextSection : RUNNER_COPY.nextTask}
              </Button>
            </div>}
          </div>
        ))}
      </div>
      <div className={styles.bottomBar}>
        <Button variant="ring" size="nav" disabled={position === 0} onClick={() => onGoTo(position - 1)}>{RUNNER_COPY.back}</Button>
        {practice ? <p className={styles.practiceProgress}>{RUNNER_COPY.position(academic, position + 1, items.length)}<span>{RUNNER_COPY.rightCount(right)}</span></p> : <div ref={numbers} className={styles.numbers} role="group" aria-label={RUNNER_COPY.tasks}>
          {items.map((screen, index) => {
            const answered = isAnswered(screen, session.answers);
            const screenMarked = markedSet.has(screen.id);
            const current = index === position;
            const name = [RUNNER_COPY.screen(academic, index + 1), current && RUNNER_COPY.current, answered && RUNNER_COPY.answered, screenMarked && RUNNER_COPY.marked].filter(Boolean).join(', ');
            return <Button key={screen.id} variant={current ? 'navy' : 'ring'} size="nav" aria-label={name} aria-current={current ? 'step' : undefined} onClick={() => onGoTo(index)}>
              <span className={styles.numberContent}><span>{index + 1}</span><span className={styles.numberStates} aria-hidden="true">{current ? '→' : ''}{answered ? '✓' : ''}{screenMarked ? '◆' : ''}</span></span>
            </Button>;
          })}
        </div>}
        <Button variant={marked ? 'navy' : 'ring'} size="nav" aria-pressed={marked} onClick={() => item && onMark(item.id)}>{RUNNER_COPY.mark}</Button>
        <Button variant="navy" size="nav" disabled={position >= items.length - 1} onClick={() => onGoTo(position + 1)}>{RUNNER_COPY.next}</Button>
        {!practice && <p className={styles.legend}>{RUNNER_COPY.legend}</p>}
      </div>
    </>
  );
}

interface RunnerDialogsProps {
  academic: boolean;
  endDialog: RefObject<HTMLDialogElement | null>;
  leaveDialog: RefObject<HTMLDialogElement | null>;
  onEndSection(): void;
  onStopEarly(): void;
}

function RunnerDialogs({ academic, endDialog, leaveDialog, onEndSection, onStopEarly }: RunnerDialogsProps) {
  const endLabel = academic ? RUNNER_COPY.endModule : RUNNER_COPY.endSection;
  return (
    <>
      <dialog ref={endDialog} className={styles.dialog} aria-labelledby="dmat-end-title" aria-describedby="dmat-end-warning">
        <h2 id="dmat-end-title">{endLabel}</h2><p id="dmat-end-warning">{RUNNER_COPY.endWarning}</p>
        <div><Button variant="ring" size="md" onClick={() => endDialog.current?.close()}>{RUNNER_COPY.keepWorking}</Button><Button variant="navy" size="md" onClick={() => { endDialog.current?.close(); onEndSection(); }}>{endLabel}</Button></div>
      </dialog>
      <dialog ref={leaveDialog} className={styles.dialog} aria-labelledby="dmat-leave-title" aria-describedby="dmat-leave-warning">
        <h2 id="dmat-leave-title">{RUNNER_COPY.leave}</h2><p id="dmat-leave-warning">{RUNNER_COPY.leaveWarning}</p>
        <div><Button variant="ring" size="md" onClick={() => leaveDialog.current?.close()}>{RUNNER_COPY.keepWorking}</Button><Button variant="navy" size="md" onClick={() => { leaveDialog.current?.close(); onStopEarly(); }}>{RUNNER_COPY.leaveConfirm}</Button></div>
      </dialog>
    </>
  );
}

export default function Runner({ session, phase, content, onAnswer, onCheck, onMark, onGoTo, onTextSize, onEndSection, onStopEarly }: RunnerProps) {
  const endDialog = useRef<HTMLDialogElement>(null);
  const leaveDialog = useRef<HTMLDialogElement>(null);
  const practice = phase.msLeft === null;
  const hasNextPracticeSection = practice && session.sections.some((entry) => entry.startedAt === null);
  const section = phase.section;
  const academic = content.section === 'academic';

  return (
    <section className={styles.runner} data-text-size={session.textSize}>
      <header className={styles.topBar}>
        {phase.msLeft !== null && <Timer key={`${session.createdAt}-${section}`} msLeft={phase.msLeft} />}
        <TopBarContent
          sections={session.sections}
          section={section}
          mock={session.mock}
          practice={practice}
          hasNextPracticeSection={hasNextPracticeSection}
          academic={academic}
          onOpenEnd={() => endDialog.current?.showModal()}
          onOpenLeave={() => leaveDialog.current?.showModal()}
          onEndSection={onEndSection}
          onStopEarly={onStopEarly}
        />
      </header>
      <RunnerBody
        session={session}
        section={section}
        practice={practice}
        hasNextPracticeSection={hasNextPracticeSection}
        content={content}
        onAnswer={onAnswer}
        onCheck={onCheck}
        onMark={onMark}
        onGoTo={onGoTo}
        onTextSize={onTextSize}
        onEndSection={onEndSection}
      />
      <RunnerDialogs
        academic={academic}
        endDialog={endDialog}
        leaveDialog={leaveDialog}
        onEndSection={onEndSection}
        onStopEarly={onStopEarly}
      />
    </section>
  );
}
