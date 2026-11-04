import { Link } from 'react-router';

import styles from './styles.module.scss';

interface BrandLinkProps {
  /** An in-page anchor ("#top") or an app route ("/"). */
  to: string;
  /** `fluid` scales with the viewport (home nav); `fixed` stays full size (privacy nav). */
  size?: 'fluid' | 'fixed';
  onClick?: () => void;
}

/** Round flag-painting badge plus the Germandians wordmark. */
export default function BrandLink({ to, size = 'fluid', onClick }: BrandLinkProps) {
  const children = (
    <>
      <span className={styles.badge} data-size={size} />
      <span className={styles.wordmark} data-size={size}>
        Germandians
      </span>
    </>
  );

  return to.startsWith('#') ? (
    <a href={to} onClick={onClick} className={styles.link} data-size={size}>
      {children}
    </a>
  ) : (
    <Link to={to} onClick={onClick} className={styles.link} data-size={size}>
      {children}
    </Link>
  );
}
