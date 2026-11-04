import { Accordion } from '@mantine/core';

import styles from './styles.module.scss';

// Decorative: hidden so each question's accessible name is just its text.
const plusIcon = <span aria-hidden="true">+</span>;

export const brandAccordion = Accordion.extend({
  defaultProps: { transitionDuration: 0, chevron: plusIcon },
  classNames: styles,
});
