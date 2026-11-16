import { Outlet } from 'react-router';

import MobileActionBar from '@/components/MobileActionBar';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import PageChromeProvider from '@/contexts/PageChrome/PageChromeProvider';
import VisitAnswersProvider from '@/contexts/VisitAnswers/VisitAnswersProvider';

export default function SiteLayout() {
  return (
    <PageChromeProvider>
      <VisitAnswersProvider>
        <SiteHeader />
        <Outlet />
        <SiteFooter />
        <MobileActionBar />
      </VisitAnswersProvider>
    </PageChromeProvider>
  );
}
