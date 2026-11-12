/** Where the site is public today. A custom domain replaces it through VITE_SITE_ORIGIN. */
export const DEFAULT_SITE_ORIGIN = 'https://gosalar.github.io';

/** A public HTTPS origin without a path, or undefined when the value isn't one. */
export function parseSiteOrigin(value: string | undefined): string | undefined {
  try {
    const url = new URL((value ?? '').trim());
    if (url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) return url.origin;
  } catch { /* Missing or malformed values fall back to the default. */ }
  return undefined;
}

export const toSiteOrigin = (value: string | undefined) => parseSiteOrigin(value) ?? DEFAULT_SITE_ORIGIN;

/** An absolute URL under the deployment path (the Vite base, such as /germandians/). */
export function publicUrl(origin: string, base: string, path = ''): string {
  return new URL(`${base}${path.replace(/^\/+/, '')}`, `${origin}/`).href;
}
