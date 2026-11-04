import { createBrowserRouter } from 'react-router';

import RootLayout from '@/components/RootLayout';
import ErrorPage from '@/pages/ErrorPage';
import Home from '@/pages/Home';
import { ROUTES } from '@/utils/constants';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      { path: ROUTES.home, Component: Home },
      // The privacy note is rarely visited, so it ships as its own chunk.
      {
        path: ROUTES.privacy,
        lazy: async () => ({ Component: (await import('@/pages/Privacy')).default }),
      },
      { path: '*', element: <ErrorPage /> },
    ],
  },
]);
