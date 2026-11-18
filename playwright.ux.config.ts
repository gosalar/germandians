import { defineConfig } from '@playwright/test';

const parsedPort = Number(process.env.UX_PORT_BASE);
const portBase = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65535 ? parsedPort : 5603;

export default defineConfig({
  testDir: 'tests/ux',
  outputDir: 'test-results/ux-tests',
  fullyParallel: true,
  workers: 3,
  reporter: 'list',
  timeout: 45_000,
  projects: [
    { name: 'endpoint', testIgnore: '**/email.spec.ts', use: { baseURL: `http://127.0.0.1:${portBase}` } },
    { name: 'email', testMatch: /(?:email|contact-common|metadata)\.spec\.ts/, use: { baseURL: `http://127.0.0.1:${portBase + 1}` } },
  ],
  use: { baseURL: `http://127.0.0.1:${portBase}`, channel: process.env.CI ? undefined : 'chrome', reducedMotion: 'reduce' },
  webServer: ['endpoint', 'email'].map((variant, index) => ({
    command: `node scripts/serve.mjs test-results/ux-builds/${variant}/client ${portBase + index}`,
    url: `http://127.0.0.1:${portBase + index}`,
    reuseExistingServer: false,
  })),
});
