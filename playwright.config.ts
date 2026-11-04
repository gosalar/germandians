import { defineConfig } from '@playwright/test';

import { APP_PORT, REFERENCE_PORT } from './tests/visual/ports';

/**
 * Visual tests: render the Claude Design prototype and the built site side by
 * side in the same browser and require them to match pixel for pixel.
 */
export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'test-results/visual',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    // Locally, use the installed Chrome (no browser download). In CI, Playwright's own Chromium.
    channel: process.env.CI ? undefined : 'chrome',
    deviceScaleFactor: 1,
  },
  webServer: [
    {
      command: 'node tests/visual/serve-reference.mjs',
      port: REFERENCE_PORT,
      env: { PORT: String(REFERENCE_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      // Always a fresh production build with the design's default settings.
      command: `npm run build:visual && npx vite preview --mode visual --outDir .visual-build --port ${APP_PORT} --strictPort`,
      port: APP_PORT,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
