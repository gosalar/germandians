import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import BrandLink from '@/components/Brand';
import { ROUTES } from '@/utils/constants';

import styles from './styles.module.scss';

/** 404 and route-error fallback. Not part of the design; built from its tokens. */
export default function ErrorPage() {
  const error = useRouteError();
  const notFound = !error || (isRouteErrorResponse(error) && error.status === 404);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <BrandLink to={ROUTES.home} size="fixed" />
        </div>
      </nav>
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <h1 className={styles.title}>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
        <p className={styles.text}>
          {notFound ? "This page doesn't exist or has moved." : 'Please reload the page or try again later.'}
        </p>
        <Link to={ROUTES.home} className={styles.home}>
          Back to the site
        </Link>
      </main>
    </>
  );
}
