import PageChromeProvider from '@/contexts/PageChrome/PageChromeProvider';
import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';

import Community from './Community';
import Contact from './Contact';
import Faq from './Faq';
import Fees from './Fees';
import Footer from './Footer';
import Hero from './Hero';
import Journey from './Journey';
import Mentors from './Mentors';
import MobileActionBar from './MobileActionBar';
import Navbar from './Navbar';
import Sop from './Sop';
import Universities from './Universities';

export default function Home() {
  useSettleHashScroll();

  return (
    <PageChromeProvider>
      <Navbar />
      <Hero />
      <Community />
      <Fees />
      <Journey />
      <Universities />
      <Sop />
      <Mentors />
      <Faq />
      <Contact />
      <Footer />
      <MobileActionBar />
    </PageChromeProvider>
  );
}
