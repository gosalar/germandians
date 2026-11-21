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
import { StrictMode, useEffect, useRef, type ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useNavigationType } from 'react-router';

import ErrorPage from '@/pages/ErrorPage';
import SkipLink from '@/components/SkipLink';
import { germandiansTheme } from '@/themes';

/** Match prerendered trailing slashes ("/budget/") with in-app paths ("/budget"). */
const normalizePathname = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

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
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const normalizedPathname = normalizePathname(pathname);
  const previousPathname = useRef(normalizedPathname);

  // Parent effects run after their children's, so this marks the moment the
  // prerendered page is hydrated and every page effect has run. The UX tests
  // wait for `html[data-hydrated]` before they measure or interact.
  useEffect(() => {
    document.documentElement.dataset.hydrated = '';
  }, []);

  // On PUSH/REPLACE to a different page without a hash fragment, move keyboard focus into the
  // new page's main landmark without scrolling over ScrollRestoration. Skip initial hydration,
  // same-page updates, Back/Forward (POP) and explicit fragment destinations.
  useEffect(() => {
    const previous = previousPathname.current;
    previousPathname.current = normalizedPathname;
    if (previous === normalizedPathname) return;
    if (navigationType !== 'PUSH' && navigationType !== 'REPLACE') return;
    if (hash) return;
    const main = document.getElementById('main-content');
    if (main instanceof HTMLElement) {
      main.focus({ preventScroll: true });
    }
  }, [normalizedPathname, hash, navigationType]);

  return <Outlet />;
}
