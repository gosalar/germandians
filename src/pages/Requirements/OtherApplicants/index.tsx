import SourceNote from '@/components/SourceNote';
import { REQUIREMENTS_ANCHORS } from '@/utils/requirements/topics';

import pageStyles from '../styles.module.scss';
import { OTHER_APPLICANTS, OTHER_APPLICANTS_COPY } from './data';
import styles from './styles.module.scss';

/** Signposts for applicants the questions do not cover: one short block each, with its official page. */
export default function OtherApplicants() {
  return (
    <section id={REQUIREMENTS_ANCHORS.otherApplicants} className={pageStyles.band}>
      <div className={pageStyles.inner}>
        <div className={pageStyles.sectionHead}>
          <h2 className={pageStyles.sectionTitle}>{OTHER_APPLICANTS_COPY.heading}</h2>
          {OTHER_APPLICANTS_COPY.intro ? <p className={pageStyles.sectionIntro}>{OTHER_APPLICANTS_COPY.intro}</p> : null}
        </div>
        <ul className={styles.blocks}>
          {OTHER_APPLICANTS.map((group) => (
            <li key={group.id} className={styles.block}>
              <h3 className={styles.title}>{group.title}</h3>
              {group.body ? <p className={styles.body}>{group.body}</p> : null}
              {group.source ? <SourceNote source={group.source} /> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
