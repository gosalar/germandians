import '@/utils/styles/fonts.scss';
import '@fontsource/barlow-semi-condensed/400.css';
import '@fontsource/barlow-semi-condensed/500.css';
import '@fontsource/barlow-semi-condensed/600.css';
import '@fontsource/barlow-semi-condensed/700.css';
import '@/utils/styles/global.scss';

import { MantineProvider } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { germandiansTheme } from '@/themes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={germandiansTheme} forceColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>,
);
