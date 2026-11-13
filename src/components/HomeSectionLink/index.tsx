import type { ComponentProps } from 'react';
import { Link, useLocation } from 'react-router';

import { ROUTES } from '@/utils/constants';
import { PAGE_REGISTRY } from '@/utils/pageRegistry';

type Props = ComponentProps<'a'> & { href: string };

/** Scroll locally when the current page lists the section, and open it on Home otherwise. */
export default function HomeSectionLink({ href, ...props }: Props) {
  const { pathname } = useLocation();
  if (href.startsWith('/')) {
    return <Link to={href} {...props} />;
  }
  // Static hosts and the prerender report "/check/"; in-app navigation reports "/check".
  const currentPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const sections = (PAGE_REGISTRY.find((page) => page.path === currentPath)?.sections ?? []) as readonly string[];
  const sectionId = href.startsWith('#') ? href.slice(1) : '';
  if (href.startsWith('#') && !sections.includes(sectionId)) {
    return <Link to={{ pathname: ROUTES.home, hash: href }} {...props} />;
  }
  return <a href={href} {...props} />;
}
