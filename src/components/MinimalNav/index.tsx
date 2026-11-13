import { Link } from 'react-router';

import BrandLink from '@/components/Brand';
import { ROUTES } from '@/utils/constants';

import styles from './styles.module.scss';

interface MinimalNavProps {
  /** Link on the right of the bar. Omit it when the bar is only the brand. */
  back?: {
    to: string;
    label: string;
  };
}

/** Brand bar for pages outside the site header. */
export default function MinimalNav({ back }: MinimalNavProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <BrandLink to={ROUTES.home} size="fixed" />
        {back ? (
          <Link to={back.to} className={styles.back}>
            {back.label}
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
