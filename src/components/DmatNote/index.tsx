import SourceNote from '@/components/SourceNote';
import { DMAT, DMAT_LABELS, SOURCES } from '@/utils/applicationFacts';

interface DmatNoteProps {
  /** Adds the exemptions, transitional rule, order of steps, test dates and fee to the one-line summary. */
  detail?: boolean;
  /** Lists the affected degree fields. Turn off where the fields are already shown beside the note. */
  fields?: boolean;
}

/** The dMAT rule from one source. Renders inline content, so it can sit inside a paragraph. */
export default function DmatNote({ detail = false, fields = true }: DmatNoteProps) {
  if (!detail) {
    return (
      <>
        <span>{DMAT.summary}</span>
        <SourceNote source={SOURCES.dmat} />
      </>
    );
  }

  const parts = [
    ...(fields ? [{ label: DMAT_LABELS.fields, text: DMAT.fields }] : []),
    { label: DMAT_LABELS.exemptions, text: DMAT.exemptions },
    { label: DMAT_LABELS.transition, text: `${DMAT.completed} ${DMAT.transition}` },
    { label: DMAT_LABELS.sequence, text: DMAT.sequence },
  ];

  return (
    <>
      <span>{DMAT.summary}</span>
      {parts.map(({ label, text }) => (
        <span key={label}>
          <br />
          <strong>{label}: </strong>
          {text}
        </span>
      ))}
      <SourceNote source={SOURCES.dmat} />
      <span>
        <br />
        <strong>{DMAT_LABELS.windows}: </strong>
        {`${DMAT.windows
          .map((window) => `${window.test} (register by ${window.deadline}; results on ${window.results})`)
          .join(' and ')}.`}
      </span>
      <span>
        <br />
        <strong>{DMAT_LABELS.fee}: </strong>
        {`${DMAT.fee}, paid to g.a.s.t. when you register.`}
      </span>
      <SourceNote source={SOURCES.test} />
    </>
  );
}
