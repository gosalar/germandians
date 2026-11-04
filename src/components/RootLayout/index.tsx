import { Outlet, ScrollRestoration } from 'react-router';

/** App shell: restores scroll position and follows #hash links across routes. */
export default function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
