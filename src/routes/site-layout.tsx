import { Outlet } from 'react-router';

import MobileActionBar from '@/components/MobileActionBar';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import PageChromeProvider from '@/contexts/PageChrome/PageChromeProvider';

export default function SiteLayout() {
  return (
    <PageChromeProvider>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <MobileActionBar />
    </PageChromeProvider>
  );
}
