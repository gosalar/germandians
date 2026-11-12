import '@/themes/mantine-styles';
import '@/utils/styles/fonts.scss';
import '@fontsource/barlow-semi-condensed/400.css';
import '@fontsource/barlow-semi-condensed/500.css';
import '@fontsource/barlow-semi-condensed/600.css';
import '@fontsource/barlow-semi-condensed/700.css';
import '@fontsource/barlow-semi-condensed/800.css';
import '@/utils/styles/global.scss';

import archivoLatin from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2?url';
import hankenLatin from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { StrictMode, useEffect, type ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import ErrorPage from '@/pages/ErrorPage';
import SkipLink from '@/components/SkipLink';
import { germandiansTheme } from '@/themes';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preload" href={archivoLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={hankenLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Tints the browser toolbar on Android phones and tablets to the nav's paper colour. */}
        <meta name="theme-color" content="#f7f5ef" />
        <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
        <Meta />
        <Links />
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <StrictMode>
          <MantineProvider theme={germandiansTheme} forceColorScheme="light">
            <SkipLink />
            {children}
          </MantineProvider>
        </StrictMode>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() { return null; }
export { ErrorPage as ErrorBoundary };
export default function App() {
  // Parent effects run after their children's, so this marks the moment the
  // prerendered page is hydrated and every page effect has run. The visual
  // tests wait for it before measuring or interacting.
  useEffect(() => {
    document.documentElement.dataset.hydrated = '';
  }, []);

  return <Outlet />;
}
