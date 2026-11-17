import { DMAT_FORMAT } from '../applicationFacts.ts';
import type { Session } from './session';

/**
 * The stamps on the practice record. Each is earned by how a test was taken, never by how many answers
 * were right. Their words and translations are copy and live with the record.
 */

export const STAMP_IDS = ['geschafft', 'durchgehalten', 'puenktlich', 'ohnePause', 'nachteule', 'fruehaufsteher', 'wiederDa'] as const;
export type StampId = (typeof STAMP_IDS)[number];

const completedTimed = (session: Session) => session.mode !== 'practice' && session.finishedAt !== null &&
  session.sections.every((run) => run.endedAt !== null && run.endedBy !== 'stop');

const rules: Record<StampId, (session: Session) => boolean> = {
  geschafft: completedTimed,
  durchgehalten: (session) => session.mode === 'full' && completedTimed(session),
  puenktlich: (session) => session.mode !== 'practice' && session.sections.some((run) =>
    run.endedBy === 'visitor' && run.startedAt !== null && run.endedAt !== null &&
    run.endedAt - run.startedAt < (run.id === 'academic' ? DMAT_FORMAT.academicMinutes : DMAT_FORMAT.subtestMinutes) * 60_000),
  ohnePause: (session) => {
    const started = session.sections.find((run) => run.id === 'academic')?.startedAt;
    return session.mode === 'full' && session.breakStartedAt !== null && started != null &&
      started >= session.breakStartedAt && started - session.breakStartedAt < 60_000;
  },
  nachteule: (session) => new Date(session.createdAt).getHours() >= 22,
  fruehaufsteher: (session) => new Date(session.createdAt).getHours() < 6,
  wiederDa: (session) => session.returning,
};

export function earnedStamps(session: Session): StampId[] {
  return STAMP_IDS.filter((id) => rules[id](session));
}
