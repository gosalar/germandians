import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { loadEnv } from 'vite';
import { toFormEndpoint, toWhatsAppCommunityUrl, toWhatsAppNumber } from '../src/utils/contactSettings.ts';
import { DEFAULT_SITE_ORIGIN, parseSiteOrigin } from '../src/utils/publicSite.ts';

// The CLI imports React before Vite loads its config. Prerender and client
// must select the same production runtime even with a machine-wide NODE_ENV.
process.env.NODE_ENV = 'production';

// Vite evaluates its config once per environment, so a warning there is repeated.
// This script is the production build, and it runs once.
const fileEnv = loadEnv('production', 'config', 'VITE_');
const read = (key) => (process.env[key] ?? fileEnv[key] ?? '').trim();
const missing = ['NAMES', 'ADDRESS', 'HOSTING_PROVIDER', 'RETENTION', 'AUTHORITY'].filter(
  (name) => !read(`VITE_PRIVACY_${name}`),
);
if (toFormEndpoint(read('VITE_FORM_ENDPOINT')) && !read('VITE_PRIVACY_FORM_SERVICE')) missing.push('FORM_SERVICE');
if (!toWhatsAppNumber(read('VITE_WHATSAPP_NUMBER'))) {
  console.warn('[contact] Missing or invalid VITE_WHATSAPP_NUMBER; contact actions open the review form.');
}
if (read('VITE_WHATSAPP_COMMUNITY_URL') && !toWhatsAppCommunityUrl(read('VITE_WHATSAPP_COMMUNITY_URL'))) {
  console.warn('[contact] Invalid VITE_WHATSAPP_COMMUNITY_URL; the community page shows no join link. Supply an https://chat.whatsapp.com/ or https://whatsapp.com/channel/ link.');
}
// The team data imports photos, so it can't be loaded here; count the stand-in entries in its source.
const standIns = readFileSync(new URL('../src/pages/About/data.ts', import.meta.url), 'utf8').match(/^\s*standIn\(\d+, '\w+'\),?$/gm)?.length ?? 0;
if (standIns > 0) {
  console.warn(`[about] ${standIns} team profiles on the About page are stand-ins; replace them with the owners' approved profiles before launch.`);
}
if (read('VITE_SITE_ORIGIN') && !parseSiteOrigin(read('VITE_SITE_ORIGIN'))) {
  console.warn(`[site] Invalid VITE_SITE_ORIGIN; canonical, sharing and sitemap URLs use ${DEFAULT_SITE_ORIGIN}. Supply an HTTPS origin without a path.`);
}
if (read('VITE_FORM_ENDPOINT') && !toFormEndpoint(read('VITE_FORM_ENDPOINT'))) {
  console.warn('[contact] Invalid VITE_FORM_ENDPOINT; using the email-app handoff. Supply a public HTTPS endpoint.');
}
for (const name of missing) {
  console.warn(`[privacy] Missing VITE_PRIVACY_${name}; confirm this detail before publishing the privacy note.`);
}
if (!read('VITE_PRIVACY_NAMES')) {
  console.warn('[identity] Missing VITE_PRIVACY_NAMES; the footer cannot name the business responsible for the site.');
} else if (!read('VITE_PRIVACY_ADDRESS')) {
  console.warn('[identity] Missing VITE_PRIVACY_ADDRESS; the footer names the business without its address.');
}
// One year for the server and client builds, even if the build runs across New Year.
process.env.BUILD_YEAR ??= String(new Date().getFullYear());
const cli = createRequire(import.meta.url).resolve('@react-router/dev/package.json').replace(/package\.json$/, 'bin.cjs');
process.argv = [process.execPath, cli, 'build'];
await import(pathToFileURL(cli).href);
