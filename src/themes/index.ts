import { Accordion, createTheme, TextInput, type MantineColorsTuple } from '@mantine/core';

const navy: MantineColorsTuple = [
  '#eef0f6',
  '#d8dce8',
  '#aeb5cc',
  '#828db0',
  '#5d6b98',
  '#465589',
  '#394a83',
  '#2a3a6f',
  '#213264',
  '#10182e',
];

const yellow: MantineColorsTuple = [
  '#fff9db',
  '#fff1b3',
  '#ffe680',
  '#ffdb4d',
  '#ffd21f',
  '#ffcc00',
  '#f5c400',
  '#d9ad00',
  '#c09900',
  '#a68400',
];

/**
 * Brand theme. Mantine components render `unstyled` by default: Mantine
 * supplies behaviour and accessibility, and every visual comes from the
 * design's SCSS modules so the page matches the handoff exactly.
 */
export const germandiansTheme = createTheme({
  fontFamily: "'Hanken Grotesk Variable', 'Hanken Grotesk', sans-serif",
  headings: { fontFamily: "'Archivo Variable', 'Archivo', sans-serif" },
  colors: { navy, yellow },
  primaryColor: 'navy',
  primaryShade: 9,
  black: '#10182e',
  white: '#ffffff',
  components: {
    Accordion: Accordion.extend({ defaultProps: { unstyled: true } }),
    TextInput: TextInput.extend({ defaultProps: { unstyled: true } }),
  },
});
