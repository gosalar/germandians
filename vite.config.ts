import { fileURLToPath } from 'node:url';

import babel from '@rolldown/plugin-babel';
import { reactRouter } from '@react-router/dev/vite';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { siteBase } from './scripts/site-base.ts';

/** The UX suite's stand-in enquiry endpoints as a `define` value: `null` outside a UX build. */
function uxEnquiryEndpoints(): string {
  if (process.env.UX_BUILD !== 'endpoint' && process.env.UX_BUILD !== 'email') return 'null';
  const { profileReview = '', germanLessons = '' } = JSON.parse(process.env.UX_ENQUIRY_ENDPOINTS ?? '{}');
  return JSON.stringify({ profileReview: String(profileReview), germanLessons: String(germanLessons) });
}

export default defineConfig(({ command }) => {
  // A machine-wide NODE_ENV (e.g. "localhost") would otherwise make Vite ship
  // React's development build. Builds are always production builds.
  if (command === 'build') process.env.NODE_ENV = 'production';

  return {
    base: siteBase,
    // The copyright year is fixed here so the prerendered HTML and the browser agree.
    // scripts/build.mjs sets BUILD_YEAR once for both build environments.
    define: {
      __BUILD_YEAR__: JSON.stringify(process.env.BUILD_YEAR ?? String(new Date().getFullYear())),
      // The UX suite's builds (UX_BUILD, see react-router.config.ts) send enquiries to fictitious web
      // apps, or none, never to the real sheets in ENQUIRY_ENDPOINTS. Every other build ignores it.
      __UX_ENQUIRY_ENDPOINTS__: uxEnquiryEndpoints(),
    },
    envDir: 'config',
    // Same alias as tsconfig "paths"; declared here too so Sass @use resolves it.
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    plugins: [reactRouter(), babel({ presets: [reactCompilerPreset()] })],
    environments: { client: { build: {
      rolldownOptions: {
        output: {
          // Vendor code changes rarely; separate chunks stay cached across site updates.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 3 },
              { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 2 },
              { name: 'mantine', test: /node_modules[\\/]@mantine[\\/]/, priority: 1 },
            ],
          },
        },
      },
    } } },
  };
});
