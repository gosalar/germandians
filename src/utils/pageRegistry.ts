import { SECTIONS } from './sections.ts';

/** Public-page identity, also loaded directly by Node. */

export const SHELL_FILES = {
  site: 'routes/site-layout.tsx',
} as const;

export const PAGE_REGISTRY = [
  {
    key: 'home',
    path: '/',
    file: 'routes/home.tsx',
    shell: 'site',
    prerender: true,
    sitemap: true,
    sections: Object.values(SECTIONS),
  },
  {
    key: 'check',
    path: '/check',
    file: 'routes/check.tsx',
    shell: 'site',
    prerender: true,
    sitemap: true,
    sections: [SECTIONS.top, SECTIONS.contact, SECTIONS.contactForm],
  },
  {
    key: 'privacy',
    path: '/privacy',
    file: 'routes/privacy.tsx',
    shell: 'minimal',
    prerender: true,
    sitemap: true,
    sections: [],
  },
] as const;

type RegistryPage = (typeof PAGE_REGISTRY)[number];
export type PageKey = RegistryPage['key'];

export function pathFor<Key extends PageKey>(key: Key) {
  const found = PAGE_REGISTRY.find((entry) => entry.key === key);
  if (!found) throw new Error(`Unknown page: ${key}`);
  return found.path as Extract<RegistryPage, { key: Key }>['path'];
}
