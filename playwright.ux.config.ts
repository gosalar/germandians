import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/ux',
  outputDir: 'test-results/ux-tests',
  fullyParallel: true,
  workers: 3,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5603', channel: process.env.CI ? undefined : 'chrome', reducedMotion: 'reduce' },
  webServer: {
    // Vite's first request can fail while it prepares dependencies, so the
    // suite serves the production build. That is ready before the first test,
    // and it is what visitors get.
    command: 'npm run build && node scripts/serve.mjs build/client 5603',
    url: 'http://127.0.0.1:5603',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
