import { Button } from '@mantine/core';
import { useId } from 'react';

import ContentContainer from '@/components/ContentContainer';
import { CHANNELS } from '@/utils/communityChannels';
import { COMMUNITY, MENTORING } from '@/utils/constants';

import { COMMUNITY_BAND_COPY } from './data';
import styles from './styles.module.scss';

export default function CommunityBand() {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={styles.band}>
      <ContentContainer width="wide">
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{COMMUNITY.size}</p>
            <p className={styles.audience}>{COMMUNITY.label}</p>
          </div>
          <div>
            <h2 id={titleId} className={styles.title}>{COMMUNITY_BAND_COPY.title}</h2>
            <p className={styles.description}>{COMMUNITY.description}</p>
            <div className={styles.actions}>
              {CHANNELS.map(({ action, emphasis, href, tone }) => (
                <Button
                  key={tone}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener"
                  variant={emphasis === 'primary' ? 'yellow-dark' : 'ring-dark'}
                  size="md"
                  className={styles.button}
                >
                  {action}
                </Button>
              ))}
            </div>
            <p className={styles.note}>{MENTORING.community}</p>
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
