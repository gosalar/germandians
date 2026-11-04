import type { Anchor } from '@mantine/core';

import styles from './styles.module.scss';

export const brandAnchor = {
  defaultProps: { underline: 'never' },
  classNames: styles,
} satisfies Parameters<typeof Anchor.extend>[0];
