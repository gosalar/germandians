import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/ux',
  outputDir: 'test-results/ux-tests',
  fullyParallel: true,
  workers: 3,
  reporter: 'list',
  timeout: 45_000,
  projects: [
    { name: 'endpoint', testIgnore: '**/email.spec.ts', use: { baseURL: 'http://127.0.0.1:5603' } },
    { name: 'email', testMatch: /(?:email|contact-common|metadata)\.spec\.ts/, use: { baseURL: 'http://127.0.0.1:5604' } },
  ],
  use: { baseURL: 'http://127.0.0.1:5603', channel: process.env.CI ? undefined : 'chrome', reducedMotion: 'reduce' },
  webServer: ['endpoint', 'email'].map((variant, index) => ({
    command: `node scripts/serve.mjs test-results/ux-builds/${variant}/client ${5603 + index}`,
    url: `http://127.0.0.1:${5603 + index}`,
    reuseExistingServer: false,
  })),
});
