import SourceNote from '@/components/SourceNote';
import { DMAT, SOURCES } from '@/utils/applicationFacts';

/**
 * The one-line dMAT rule with its source. Renders inline content, so it can sit inside a paragraph.
 * The full rule (fields, exemptions, earlier applications, order of steps, dates and fee) is the
 * APS and dMAT topic on /requirements.
 */
export default function DmatNote() {
  return (
    <>
      <span>{DMAT.summary}</span>
      <SourceNote source={SOURCES.dmat} />
    </>
  );
}
