import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';

import Community from './Community';
import Contact from '@/components/Contact';
import Faq from './Faq';
import Fees from './Fees';
import Hero from './Hero';
import Housing from './Housing';
import Journey from './Journey';
import Mentors from './Mentors';
import Sop from './Sop';
import Universities from './Universities';

export default function Home() {
  useSettleHashScroll();

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <Community />
      <Fees />
      <Housing />
      <Journey />
      <Universities />
      <Sop />
      <Mentors />
      <Faq />
      <Contact />
    </main>
  );
}
