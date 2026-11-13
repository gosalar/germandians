import type { ReactNode } from 'react';

import styles from './styles.module.scss';

interface PageHeaderProps {
  title: string;
  introduction: string;
  /** `compact` is the tool-page scale. `regular` and `loose` share the long-page scale and differ in stack spacing. */
  variant: 'compact' | 'regular' | 'loose';
  /** Content before the title, such as badges. */
  leading?: ReactNode;
  /** Content after the introduction: a metadata line or a page action. */
  meta?: ReactNode;
}

/** Title and introduction for a utility page. One page-level heading. */
export default function PageHeader({ title, introduction, variant, leading, meta }: PageHeaderProps) {
  return (
    <header className={styles.header} data-variant={variant}>
      {leading}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.introduction}>{introduction}</p>
      {meta}
    </header>
  );
}
