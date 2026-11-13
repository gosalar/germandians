import { defineConfig } from '@playwright/test';

// Recheck an already-built site, including a deployment mounted at a subpath.

export default defineConfig({
  testDir: 'tests/ux',
  testMatch: /recheck\.spec\.ts/,
  outputDir: 'test-results/recheck',
  workers: 2,
  fullyParallel: true,
  reporter: 'list',
  projects: [{ name: 'subpath' }],
  use: {
    baseURL: process.env.RECHECK_BASE_URL ?? 'http://localhost:5611/germandians',
    channel: process.env.CI ? undefined : 'chrome',
  },
});
