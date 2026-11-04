import { Button } from '@mantine/core';

import styles from './styles.module.scss';

export const brandButton = Button.extend({
  defaultProps: { variant: 'navy', size: 'md' },
  classNames: styles,
});
