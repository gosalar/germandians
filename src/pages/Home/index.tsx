import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';

import CommunityIntro from './CommunityIntro';
import Contact from '@/components/Contact';
import Faq from './Faq';
import Fees from './Fees';
import Hero from './Hero';
import Housing from './Housing';
import Journey from './Journey';
import LearnGermanIntro from './LearnGermanIntro';
import Mentors from './Mentors';
import Sop from './Sop';
import Story from './Story';

export default function Home() {
  useSettleHashScroll();

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <Story />
      <Fees />
      <Housing />
      <Journey />
      <CommunityIntro />
      <LearnGermanIntro />
      <Sop />
      <Mentors />
      <Faq />
      <Contact />
    </main>
  );
}
