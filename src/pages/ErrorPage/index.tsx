import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import MinimalNav from '@/components/MinimalNav';
import PageHeader from '@/components/PageHeader';
import { ROUTES } from '@/utils/constants';

import { ERROR_PAGE_COPY } from './data';
import styles from './styles.module.scss';

/** 404 and route-error fallback. Not part of the design; built from its tokens. */
export default function ErrorPage() {
  const error = useRouteError();
  const notFound = !error || (isRouteErrorResponse(error) && error.status === 404);

  return (
    <>
      <MinimalNav />
      <main id="main-content" tabIndex={-1}>
        <ContentContainer width="inset">
          <PageHeader
            variant="loose"
            title={notFound ? ERROR_PAGE_COPY.notFoundTitle : ERROR_PAGE_COPY.errorTitle}
            introduction={notFound ? ERROR_PAGE_COPY.notFoundMessage : ERROR_PAGE_COPY.errorMessage}
            meta={(
              <Link to={ROUTES.home} className={styles.home}>
                {ERROR_PAGE_COPY.homeLabel}
              </Link>
            )}
          />
        </ContentContainer>
      </main>
    </>
  );
}
