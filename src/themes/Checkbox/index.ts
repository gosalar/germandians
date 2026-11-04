import type { Checkbox } from '@mantine/core';

import styles from './styles.module.scss';

export const brandCheckbox = {
  defaultProps: { color: 'navy.9' },
  classNames: styles,
} satisfies Parameters<typeof Checkbox.extend>[0];
