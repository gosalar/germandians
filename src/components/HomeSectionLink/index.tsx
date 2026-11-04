import type { ComponentProps } from 'react';
import { Link, useLocation } from 'react-router';

import { ROUTES } from '@/utils/constants';

type Props = ComponentProps<'a'> & { href: string };

/** Preserve native fragment scrolling on home and route back to it from other pages. */
export default function HomeSectionLink({ href, ...props }: Props) {
  const { pathname } = useLocation();
  if (href.startsWith('#') && pathname !== ROUTES.home) {
    return <Link to={{ pathname: ROUTES.home, hash: href }} {...props} />;
  }
  return <a href={href} {...props} />;
}
