import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { loadEnv } from 'vite';

// The CLI imports React before Vite loads its config. Prerender and client
// must select the same production runtime even with a machine-wide NODE_ENV.
process.env.NODE_ENV = 'production';
const visual = process.argv.includes('--visual');

// Vite evaluates its config once per environment, so a warning there is repeated.
// This script is the production build, and it runs once.
if (!visual) {
  const fileEnv = loadEnv('production', 'config', 'VITE_');
  const read = (key) => (process.env[key] ?? fileEnv[key] ?? '').trim();
  const missing = ['NAMES', 'ADDRESS', 'HOSTING_PROVIDER', 'RETENTION', 'AUTHORITY'].filter(
    (name) => !read(`VITE_PRIVACY_${name}`),
  );
  if (read('VITE_FORM_ENDPOINT') && !read('VITE_PRIVACY_FORM_SERVICE')) missing.push('FORM_SERVICE');
  for (const name of missing) {
    console.warn(`[privacy] Missing VITE_PRIVACY_${name}; confirm this detail before publishing the privacy note.`);
  }
}
if (visual) {
  process.env.VISUAL_BUILD = 'true';
  process.env.SITE_BASE_PATH = '/';
}
const cli = createRequire(import.meta.url).resolve('@react-router/dev/package.json').replace(/package\.json$/, 'bin.cjs');
process.argv = [process.execPath, cli, 'build', ...(visual ? ['--mode', 'visual'] : [])];
await import(pathToFileURL(cli).href);
