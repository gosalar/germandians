const path = (process.env.SITE_BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');
if (path && !path.split('/').every(segment => /^[\w-][\w.-]*$/.test(segment))) {
  throw new Error('SITE_BASE_PATH must contain URL path segments, e.g. /germandians/');
}
export const siteBase = path ? `/${path}/` : '/';
