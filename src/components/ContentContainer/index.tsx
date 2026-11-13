import type { ReactNode } from 'react';

import styles from './styles.module.scss';

const WIDTHS = {
  wide: styles.wide,
  prose: styles.prose,
  inset: styles.inset,
} as const;

interface ContentContainerProps {
  /** `wide` is the tool column. `prose` is the reading column. `inset` is that column with its padding inside the measure. */
  width: keyof typeof WIDTHS;
  children: ReactNode;
}

/** The content widths the utility pages already use. */
export default function ContentContainer({ width, children }: ContentContainerProps) {
  return <div className={WIDTHS[width]}>{children}</div>;
}
