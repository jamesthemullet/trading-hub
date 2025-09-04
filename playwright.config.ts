import { defineConfig, devices } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 4 : 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    channel: 'chromium',
    baseURL: process.env.E2E_TARGET_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    timezoneId: 'Europe/London',
  },
  webServer: [
    {
      command: 'npm run start',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'mock',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1080 },
        userAgent: 'mock-test-playwright',
      },
      testMatch: /tests\/.*\.spec\.ts/,
      testIgnore: /.*smoke.spec.ts/,
    },
    {
      name: 'category-tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1080 },
        userAgent: 'category-test-playwright',
      },
      testMatch: /tests\/category\/.*\.spec\.ts/,
      testIgnore: /.*smoke.spec.ts/,
    },
    {
      name: 'global-tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1080 },
        userAgent: 'global-test-playwright',
      },
      testMatch: /tests\/global\/.*\.spec\.ts/,
      testIgnore: /.*smoke.spec.ts/,
    },
    {
      name: 'search-tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1080 },
        userAgent: 'search-test-playwright',
      },
      testMatch: /tests\/search\/.*\.spec\.ts/,
      testIgnore: [/.*smoke.spec.ts/, /.*redirect.*\.spec\.ts/],
    },
    {
      name: 'redirect-tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1080 },
        userAgent: 'redirect-test-playwright',
      },
      testMatch: /tests\/.*redirect.*\.spec\.ts/,
      testIgnore: /.*smoke.spec.ts/,
    },
    {
      name: 'smoke',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1080 },
        userAgent: 'smoke-test-playwright',
      },
      testMatch: /dev\/.*smoke.spec.ts/,
    },
    {
      name: 'production',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1080 },
        baseURL: 'https://merchandising-hub.search.marksandspencer.app',
        userAgent: 'smoke-test-playwright',
      },
      testMatch: /prod\/.*smoke.spec.ts/,
    },
  ],
});
