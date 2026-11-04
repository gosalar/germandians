import type { MantineColorsTuple } from '@mantine/core';

// Keep the brand stops in sync with src/utils/styles/_tokens.scss.
export const colors = {
  navy: ['#eef0f6', '#d8dce8', '#aeb5cc', '#828db0', '#5d6b98', '#465589', '#394a83', '#2a3a6f', '#213264', '#10182e'],
  yellow: ['#fff9db', '#fff1b3', '#ffe680', '#ffdb4d', '#ffd21f', '#ffcc00', '#f5c400', '#d9ad00', '#c09900', '#a68400'],
  red: ['#fff2ef', '#fbe4e1', '#f9c6c0', '#f29c93', '#e9675a', '#dc493c', '#d42b1f', '#c4261b', '#a8221a', '#851c16'],
  green: ['#f0f9f1', '#e1f0e4', '#badfc4', '#8fc99f', '#63ad78', '#43975c', '#2b8749', '#1d7a3d', '#17692f', '#105025'],
  orange: ['#fff7ec', '#fdeedb', '#fbdbb2', '#f8c685', '#f5b160', '#f19c3e', '#ef8a21', '#d77916', '#b85d06', '#8f4700'],
} satisfies Record<string, MantineColorsTuple>;
