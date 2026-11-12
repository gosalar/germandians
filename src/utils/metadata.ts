import type { MetaDescriptor } from 'react-router';
import { PUBLIC_PAGES } from './publicPages';
import { publicUrl } from './publicSite';
import { siteConfig } from './siteConfig';

export function pageMetadata(path: (typeof PUBLIC_PAGES)[number]['path']): MetaDescriptor[] {
  const page = PUBLIC_PAGES.find(page => page.path === path)!;
  const absolute = (path: string) => publicUrl(siteConfig.publicOrigin, import.meta.env.BASE_URL, path);
  const url = absolute(path === '/' ? '' : `${path}/`);
  const image = absolute(page.image);
  return [
    { title: page.title },
    { name: 'description', content: page.description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Germandians' },
    { property: 'og:locale', content: 'en_GB' },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: page.imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: page.imageAlt },
  ];
}
