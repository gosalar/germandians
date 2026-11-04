import { createTheme } from '@mantine/core';

import { brandAccordion } from './Accordion';
import { brandAnchor } from './Anchor';
import { brandBadge } from './Badge';
import { brandButton } from './Button';
import { brandCheckbox } from './Checkbox';
import { colors } from './colors';
import { brandInput } from './Input';
import { brandTable } from './Table';
import { brandTextInput } from './TextInput';
import styles from './styles.module.scss';

export const germandiansTheme = createTheme({
  colors,
  primaryColor: 'navy',
  primaryShade: 9,
  black: colors.navy[9],
  fontFamily: "'Hanken Grotesk Variable', 'Hanken Grotesk', sans-serif",
  headings: { fontFamily: "'Archivo Variable', 'Archivo', sans-serif" },
  radius: { xs: '4px', sm: '8px', md: '12px', lg: '18px', xl: '24px' },
  defaultRadius: 'md',
  activeClassName: '',
  focusClassName: styles.focus,
  respectReducedMotion: true,
  cursorType: 'pointer',
  components: {
    Anchor: brandAnchor,
    Badge: brandBadge,
    Button: brandButton,
    Checkbox: brandCheckbox,
    Table: brandTable,
    Accordion: brandAccordion,
    Input: brandInput,
    TextInput: brandTextInput,
  },
});
