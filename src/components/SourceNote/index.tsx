import type { OfficialSource } from '@/utils/applicationFacts';

import styles from './styles.module.scss';

/** A link to the official page a fact came from, with the date it was last read. */
export default function SourceNote({ source }: { source: OfficialSource }) {
  return (
    <span className={styles.note}>
      <a href={source.url} target="_blank" rel="noopener">
        {source.label}
      </a>
      {` · Last reviewed ${source.reviewed}`}
    </span>
  );
}
