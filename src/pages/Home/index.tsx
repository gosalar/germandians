import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';

import Community from './Community';
import Contact from './Contact';
import Faq from './Faq';
import Fees from './Fees';
import Hero from './Hero';
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
      <Journey />
      <Universities />
      <Sop />
      <Mentors />
      <Faq />
      <Contact />
    </main>
  );
}
