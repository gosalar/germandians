import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// The CLI imports React before Vite loads its config. Prerender and client
// must select the same production runtime even with a machine-wide NODE_ENV.
process.env.NODE_ENV = 'production';
const visual = process.argv.includes('--visual');
if (visual) {
  process.env.VISUAL_BUILD = 'true';
  process.env.SITE_BASE_PATH = '/';
}
const cli = createRequire(import.meta.url).resolve('@react-router/dev/package.json').replace(/package\.json$/, 'bin.cjs');
process.argv = [process.execPath, cli, 'build', ...(visual ? ['--mode', 'visual'] : [])];
await import(pathToFileURL(cli).href);
