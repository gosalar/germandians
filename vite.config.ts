import { fileURLToPath } from 'node:url';

import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  // A machine-wide NODE_ENV (e.g. "localhost") would otherwise make Vite ship
  // React's development build. Builds are always production builds.
  if (command === 'build') process.env.NODE_ENV = 'production';

  return {
    envDir: 'config',
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
