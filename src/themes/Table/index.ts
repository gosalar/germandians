import type { Table } from '@mantine/core';

import styles from './styles.module.scss';

export const brandTable = {
  classNames: styles,
} satisfies Parameters<typeof Table.extend>[0];
