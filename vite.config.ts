import { fileURLToPath } from 'node:url';

import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  // A machine-wide NODE_ENV (e.g. "localhost") would otherwise make Vite ship
  // React's development build. Builds are always production builds.
  if (command === 'build') process.env.NODE_ENV = 'production';

  return {
    // The visual-test build ignores config/.env* so it always has the design's default settings.
    envDir: mode === 'visual' ? false : 'config',
    // Same alias as tsconfig "paths"; declared here too so Sass @use resolves it.
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    build: {
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
    },
  };
});
