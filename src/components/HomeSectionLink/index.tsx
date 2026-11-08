import type { ComponentProps } from 'react';
import { Link, useLocation } from 'react-router';

import { ROUTES, SECTIONS, hashLink } from '@/utils/constants';

type Props = ComponentProps<'a'> & { href: string };

const SHARED_HASHES = new Set<string>([
  hashLink(SECTIONS.contact),
  hashLink(SECTIONS.contactForm),
]);

/** Preserve native fragment scrolling when the target section is on the current page, and route otherwise. */
export default function HomeSectionLink({ href, ...props }: Props) {
  const { pathname } = useLocation();
  if (href.startsWith('/')) {
    return <Link to={href} {...props} />;
  }
  const hasSectionOnPage = pathname === ROUTES.home || (pathname === ROUTES.check && SHARED_HASHES.has(href));
  if (href.startsWith('#') && !hasSectionOnPage) {
    return <Link to={{ pathname: ROUTES.home, hash: href }} {...props} />;
  }
  return <a href={href} {...props} />;
}
